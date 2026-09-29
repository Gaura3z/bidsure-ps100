FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends tesseract-ocr clamav ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /var/lib/clamav /app/data/uploads

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV OCR_PROVIDER=local
ENV DOCUMENT_STORAGE=supabase
ENV PORT=10000

EXPOSE 10000
CMD ["npm", "start"]
