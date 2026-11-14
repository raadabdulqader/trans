import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // تحقق سريع من اتصال قاعدة البيانات
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error?.message || 'Database connection error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
