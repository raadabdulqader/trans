# ==============================================================================
# مرحلة 1: الصورة الأساسية مع Node 22 و pnpm
# ==============================================================================
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate
WORKDIR /app

# ==============================================================================
# مرحلة 2: تثبيت الاعتماديات
# ==============================================================================
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

# ==============================================================================
# مرحلة 3: بناء التطبيق
# ==============================================================================
FROM base AS builder
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# متغيرات بيئة افتراضية أثناء مرحلة البناء
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nakah?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# توليد Prisma Client وبناء Next.js
RUN pnpm prisma:generate
RUN pnpm build

# ==============================================================================
# مرحلة 4: صورة التشغيل الإنتاجية (Production Runner)
# ==============================================================================
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# نسخ ملفات التطبيق والاعتماديات المبنية
COPY --from=builder /app ./

# إعداد سكربت نقطة الدخول (Entrypoint)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["pnpm", "start"]
