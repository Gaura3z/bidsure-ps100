export * from '../db/schema.ts';

export type ActiveTab =
  | 'LANDING'
  | 'LOGIN'
  | 'DASHBOARD'
  | 'TENDERS'
  | 'EVALUATION'
  | 'COMPLIANCE_MATRIX'
  | 'AUDIT_TRAIL'
  | 'SOURCE_GATEWAY';
