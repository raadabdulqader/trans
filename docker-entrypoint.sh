#!/bin/sh
set -e

echo "🚀 [النظام] التحقق من الاتصال بقاعدة بيانات PostgreSQL وتحديث الهيكل..."
if [ -n "$DATABASE_URL" ]; then
  pnpm prisma db push --skip-generate || echo "⚠️ [تنبيه] لم يتمكن من الاتصال بقاعدة البيانات حالياً، سيتم المحاولة عند بدء الطلبات."
fi

echo "🌐 [النظام] تشغيل خادم Next.js 15 على المنفذ $PORT..."
exec "$@"
