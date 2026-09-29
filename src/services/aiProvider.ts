/**
 * BIDSure - Resilient multi-provider AI engine with instant failover
 * Implements Section 8: API KEY FAILOVER SYSTEM
 * OpenAI -> Gemini primary/secondary -> Controlled Deterministic Fallback
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export interface KeyProviderSlot {
  label: 'OPENAI' | 'OPENAI_SECONDARY' | 'OPENAI_TERTIARY' | 'PRIMARY' | 'SECONDARY' | 'LEGACY';
  kind: 'OPENAI' | 'GEMINI';
  apiKey: string;
  masked: string;
  client?: GoogleGenAI;
  model: string;
  failureCount: number;
  lastUsedAt?: string;
  lastError?: string;
}

export interface ProviderDiagnostic {
  configured: boolean;
  model: string;
  activeProvider: string;
  primaryConfigured: boolean;
  secondaryConfigured: boolean;
  primaryMasked: string | null;
  secondaryMasked: string | null;
  failoverReady: boolean;
  mode: 'LIVE_GEMINI_AI' | 'DETERMINISTIC_GROUNDED_FALLBACK' | 'FAILOVER_ACTIVE';
  latencyMs?: number;
  message: string;
}

function maskKey(key?: string): string {
  if (!key || key.length < 8) return '****';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`AI provider timeout after ${timeoutMs}ms`)), timeoutMs);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
  });
}

function readOpenAIOutputText(payload: any): string {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  const parts = Array.isArray(payload?.output)
    ? payload.output.flatMap((item: any) => Array.isArray(item?.content) ? item.content : [])
    : [];
  return parts
    .filter((part: any) => part?.type === 'output_text' && typeof part?.text === 'string')
    .map((part: any) => part.text)
    .join('\n');
}

class ResilientAIProvider {
  private model: string;
  private openAIModel: string;
  private providers: KeyProviderSlot[] = [];
  private activeIndex: number = 0;

  constructor() {
    // The supplied Gemini documentation uses the Interactions-era model name.
    // Keep it configurable so a deployment can pin another supported model.
    this.model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    this.openAIModel = process.env.OPENAI_MODEL || 'gpt-6-luna';
    this.initProviders();
  }

  public initProviders() {
    this.providers = [];
    const openAIKeys = [
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_SECONDARY_API_KEY,
      process.env.OPENAI_TERTIARY_API_KEY,
    ].map((key) => key?.trim()).filter((key): key is string => Boolean(key));
    const primary = process.env.PRIMARY_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    const secondary = process.env.SECONDARY_API_KEY?.trim();
    const legacy = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();

    openAIKeys.forEach((apiKey, index) => {
      this.providers.push({
        label: index === 0 ? 'OPENAI' : index === 1 ? 'OPENAI_SECONDARY' : 'OPENAI_TERTIARY',
        kind: 'OPENAI',
        apiKey,
        masked: maskKey(apiKey),
        model: this.openAIModel,
        failureCount: 0,
      });
    });

    if (primary) {
      this.providers.push({
        label: 'PRIMARY',
        kind: 'GEMINI',
        apiKey: primary,
        masked: maskKey(primary),
        model: this.model,
        client: new GoogleGenAI({
          apiKey: primary,
          httpOptions: { headers: { 'User-Agent': 'bidsure-compliance-engine-p1' } },
        }),
        failureCount: 0,
      });
    }

    if (secondary && secondary !== primary) {
      this.providers.push({
        label: 'SECONDARY',
        kind: 'GEMINI',
        apiKey: secondary,
        masked: maskKey(secondary),
        model: this.model,
        client: new GoogleGenAI({
          apiKey: secondary,
          httpOptions: { headers: { 'User-Agent': 'bidsure-compliance-engine-p2' } },
        }),
        failureCount: 0,
      });
    } else if (legacy && legacy !== primary && legacy !== secondary) {
      this.providers.push({
        label: 'LEGACY',
        kind: 'GEMINI',
        apiKey: legacy,
        masked: maskKey(legacy),
        model: this.model,
        client: new GoogleGenAI({
          apiKey: legacy,
          httpOptions: { headers: { 'User-Agent': 'bidsure-compliance-engine-legacy' } },
        }),
        failureCount: 0,
      });
    }
  }

  public async generateContent(
    contents: string,
    config?: Record<string, unknown>,
    forceFailPrimary: boolean = false
  ): Promise<{ text: string; providerUsed: string; failoverOccurred: boolean }> {
    if (this.providers.length === 0) {
      throw new Error('NO_KEYS_CONFIGURED: No OpenAI or Gemini API keys found in environment.');
    }

    let failoverOccurred = false;
    let lastError: any = null;

    for (let i = 0; i < this.providers.length; i++) {
      const slot = this.providers[i];

      // Support QA test simulation of primary key failure
      if (i === 0 && forceFailPrimary) {
        console.warn(`[AI Failover Test] Simulating primary key (${slot.masked}) failure...`);
        slot.failureCount++;
        failoverOccurred = true;
        continue;
      }

      try {
        if (slot.kind === 'OPENAI') {
          const response = await withTimeout(fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${slot.apiKey}`,
            },
            body: JSON.stringify({
              model: slot.model,
              input: contents,
              store: false,
            }),
          }), 15000);
          const payload: any = await response.json().catch(() => ({}));
          if (!response.ok) {
            const error: any = new Error(payload?.error?.message || `OpenAI request failed (${response.status})`);
            error.status = response.status;
            throw error;
          }
          slot.lastUsedAt = new Date().toISOString();
          this.activeIndex = i;
          return {
            text: readOpenAIOutputText(payload),
            providerUsed: slot.label,
            failoverOccurred: i > 0,
          };
        }

        // Authorization keys documented by Google AI Studio use the Interactions API.
        // Map the small provider config used by the app to the SDK's interaction fields.
        const interactionParams: Record<string, unknown> = {
          model: this.model,
          input: contents,
        };
        if (config && typeof config.responseMimeType === 'string') {
          interactionParams.response_format = [{
            type: 'text',
            mime_type: config.responseMimeType,
          }];
        }
        const response = await withTimeout(slot.client!.interactions.create(interactionParams as any), 15000);

        slot.lastUsedAt = new Date().toISOString();
        this.activeIndex = i;

        return {
          text: response.output_text || '',
          providerUsed: slot.label,
          failoverOccurred: i > 0 || failoverOccurred,
        };
      } catch (err: any) {
        slot.failureCount++;
        slot.lastError = err?.message || String(err);
        lastError = err;
        failoverOccurred = true;

        const status = Number(err?.status || err?.error?.code || 0);
        // Do not rotate keys for malformed prompts or other client validation errors.
        if (status >= 400 && status < 500 && status !== 401 && status !== 403 && status !== 429) {
          break;
        }

        console.warn(
          `[AI Failover] Provider ${slot.label} (${slot.masked}) request failed: ${err?.status || err?.message || 'Unknown error'}. Attempting next configured provider...`
        );
      }
    }

    throw lastError || new Error('All configured AI API key providers failed.');
  }

  public async checkHealth(): Promise<ProviderDiagnostic> {
    const primarySlot = this.providers.find((p) => p.kind === 'OPENAI');
    const secondarySlot = this.providers.find((p) => p.label === 'SECONDARY');

    if (this.providers.length === 0) {
      return {
        configured: false,
        model: this.openAIModel,
        activeProvider: 'NONE',
        primaryConfigured: false,
        secondaryConfigured: false,
        primaryMasked: null,
        secondaryMasked: null,
        failoverReady: false,
        mode: 'DETERMINISTIC_GROUNDED_FALLBACK',
        message: 'No OpenAI or Gemini provider key configured. Platform is running in 100% deterministic rule verification mode.',
      };
    }

    try {
      const start = Date.now();
      const res = await this.generateContent(
        'Respond with "ACTIVE" if you are operating normally for Indian GeM procurement compliance verification.'
      );
      const latency = Date.now() - start;

      return {
        configured: true,
        model: this.model,
        activeProvider: res.providerUsed,
        primaryConfigured: Boolean(primarySlot),
        secondaryConfigured: Boolean(secondarySlot),
        primaryMasked: primarySlot?.masked || null,
        secondaryMasked: secondarySlot?.masked || null,
        failoverReady: this.providers.length > 1,
        mode: res.failoverOccurred ? 'FAILOVER_ACTIVE' : 'LIVE_GEMINI_AI',
        latencyMs: latency,
        message: `${res.providerUsed} is operational. Failover ready: ${this.providers.length > 1 ? 'YES' : 'NO'}.`,
      };
    } catch (err: any) {
      return {
        configured: true,
        model: this.model,
        activeProvider: 'FALLBACK',
        primaryConfigured: Boolean(primarySlot),
        secondaryConfigured: Boolean(secondarySlot),
        primaryMasked: primarySlot?.masked || null,
        secondaryMasked: secondarySlot?.masked || null,
        failoverReady: this.providers.length > 1,
        mode: 'DETERMINISTIC_GROUNDED_FALLBACK',
        message: 'Configured AI providers are currently unavailable. Deterministic compliance rule engine is active.',
      };
    }
  }

  public getModelName(): string {
    return this.model;
  }

  public getConfigurationSnapshot(): ProviderDiagnostic {
    const primarySlot = this.providers.find((p) => p.kind === 'OPENAI');
    const secondarySlot = this.providers.find((p) => p.label === 'SECONDARY');
    const configured = this.providers.length > 0;
    return {
      configured,
      model: this.model,
      activeProvider: configured ? this.providers[this.activeIndex]?.label || 'OPENAI' : 'NONE',
      primaryConfigured: Boolean(primarySlot),
      secondaryConfigured: Boolean(secondarySlot),
      primaryMasked: primarySlot?.masked || null,
      secondaryMasked: secondarySlot?.masked || null,
      failoverReady: this.providers.length > 1,
      mode: configured ? 'LIVE_GEMINI_AI' : 'DETERMINISTIC_GROUNDED_FALLBACK',
      message: configured
        ? `AI fallback chain is configured. Live availability is checked only when an AI operation runs.`
        : 'No OpenAI or Gemini provider key configured. Deterministic compliance rules are active.',
    };
  }
}

export const aiProvider = new ResilientAIProvider();
