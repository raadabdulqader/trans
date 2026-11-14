import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_CARRIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_RECEIPTS,
  INITIAL_TREASURY,
  INITIAL_ATTACHMENTS,
} from '@/utils/initialData';
import { buildInitialAuditLogs, DEFAULT_EXCHANGE_RATE } from '@/utils/storage';

export const dynamic = 'force-dynamic';

let isDbAvailable: boolean | null = null;
let lastCheckTime = 0;

async function checkDbConnection(): Promise<boolean> {
  const now = Date.now();
  if (isDbAvailable !== null && now - lastCheckTime < 60000) {
    return isDbAvailable;
  }
  try {
    const connectPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB Timeout')), 1000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    isDbAvailable = true;
  } catch {
    isDbAvailable = false;
  }
  lastCheckTime = now;
  return isDbAvailable;
}

export async function GET() {
  const dbOk = await checkDbConnection();
  if (!dbOk) {
    return NextResponse.json(
      { offline: true, message: 'Database unreachable, operating in client-local mode' },
      { status: 200 }
    );
  }

  try {
    // 1. التحقق إن كانت قاعدة البيانات جديدة وفارغة (التهيئة التلقائية)
    const usersCount = await prisma.appUser.count();
    if (usersCount === 0) {
      // ملء أولي تلقائي
      for (const u of INITIAL_USERS) {
        await prisma.appUser.upsert({
          where: { username: u.username },
          update: {},
          create: {
            id: u.id,
            name: u.name,
            username: u.username,
            password: u.password,
            email: u.email,
            phone: u.phone,
            role: u.role,
            roleTitle: u.roleTitle,
            avatar: u.avatar,
            status: u.status || 'active',
            lastLogin: u.lastLogin ? new Date(u.lastLogin) : null,
            permissions: (u.permissions as any) || {},
            createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          },
        });
      }

      for (const c of INITIAL_CUSTOMERS) {
        await prisma.customer.upsert({
          where: { id: c.id },
          update: {},
          create: {
            id: c.id,
            name: c.name,
            regNo: c.regNo,
            contact: c.contact,
            phone: c.phone,
            email: c.email,
            address: c.address,
            companyId: c.companyId || 'both',
            notes: c.notes,
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
          },
        });
      }

      for (const e of INITIAL_EMPLOYEES) {
        await prisma.employee.upsert({
          where: { id: e.id },
          update: {},
          create: {
            id: e.id,
            name: e.name,
            phone: e.phone,
            idNo: e.idNo,
            joinDate: e.joinDate,
            notes: e.notes,
            category: e.category || 'broker',
            jobTitle: e.jobTitle,
            baseSalary: e.baseSalary || 0,
            department: e.department,
          },
        });
      }

      for (const car of INITIAL_CARRIERS) {
        await prisma.transportCompany.upsert({
          where: { id: car.id },
          update: {},
          create: {
            id: car.id,
            name: car.name,
            contactPerson: car.contactPerson,
            phone: car.phone,
            address: car.address,
            notes: car.notes,
            createdAt: car.createdAt ? new Date(car.createdAt) : new Date(),
          },
        });
      }

      for (const tx of INITIAL_TRANSACTIONS) {
        await prisma.transaction.upsert({
          where: { billNo: tx.billNo },
          update: {},
          create: {
            id: tx.id,
            billNo: tx.billNo,
            companyId: tx.companyId || 'naqaa_basra',
            customerId: tx.customerId,
            employeeId: tx.employeeId,
            date: tx.date ? new Date(tx.date) : new Date(),
            goodsType: tx.goodsType,
            status: tx.status,
            currency: tx.currency || 'IQD',
            exchangeRate: tx.exchangeRate || 1500,
            totalAmount: tx.totalAmount,
            initialPaid: tx.initialPaid,
            isMixedCurrency: tx.isMixedCurrency || false,
            totalAmountUSD: tx.totalAmountUSD || 0,
            initialPaidUSD: tx.initialPaidUSD || 0,
            notes: tx.notes,
            containers: (tx.containers as any) || [],
            agencyDocument: (tx.agencyDocument as any) || null,
            hasTransport: tx.hasTransport || false,
            transportDocument: (tx.transportDocument as any) || null,
            cancelledAt: tx.cancelledAt ? new Date(tx.cancelledAt) : null,
            cancelledBy: tx.cancelledBy,
            cancelReason: tx.cancelReason,
            createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
          },
        });

        if (tx.transportTrips && tx.transportTrips.length > 0) {
          for (const trip of tx.transportTrips) {
            await prisma.billTransportTrip.upsert({
              where: { id: trip.id },
              update: {},
              create: {
                id: trip.id,
                transactionId: tx.id,
                carrierId: trip.carrierId,
                carrierName: trip.carrierName,
                destination: trip.destination,
                truckCount: trip.truckCount,
                driverName: trip.driverName,
                truckPlateNo: trip.truckPlateNo,
                driverPhone: trip.driverPhone,
                currency: trip.currency,
                carrierCost: trip.carrierCost,
                customerCharge: trip.customerCharge || 0,
                notes: trip.notes,
                transportDocument: (trip.transportDocument as any) || null,
              },
            });
          }
        }
      }

      for (const rcpt of INITIAL_RECEIPTS) {
        await prisma.receipt.upsert({
          where: { receiptNo: rcpt.receiptNo },
          update: {},
          create: {
            id: rcpt.id,
            receiptNo: rcpt.receiptNo,
            type: rcpt.type,
            billId: rcpt.billId,
            companyId: rcpt.companyId || 'naqaa_basra',
            customerId: rcpt.customerId,
            employeeId: rcpt.employeeId,
            currency: rcpt.currency || 'IQD',
            exchangeRate: rcpt.exchangeRate || 1500,
            amount: rcpt.amount,
            date: rcpt.date ? new Date(rcpt.date) : new Date(),
            notes: rcpt.notes,
            status: rcpt.status || 'active',
            cancelledAt: rcpt.cancelledAt ? new Date(rcpt.cancelledAt) : null,
            cancelledBy: rcpt.cancelledBy,
            cancelReason: rcpt.cancelReason,
            attachment: (rcpt.attachment as any) || null,
            hasCommission: rcpt.hasCommission || false,
            commissionAmount: rcpt.commissionAmount || 0,
            commissionCurrency: rcpt.commissionCurrency || 'IQD',
            commissionBearer: rcpt.commissionBearer || 'company',
            createdAt: rcpt.createdAt ? new Date(rcpt.createdAt) : new Date(),
          },
        });
      }

      for (const vch of INITIAL_TREASURY) {
        await prisma.treasuryTransaction.upsert({
          where: { voucherNo: vch.voucherNo },
          update: {},
          create: {
            id: vch.id,
            voucherNo: vch.voucherNo,
            companyId: vch.companyId || 'naqaa_basra',
            type: vch.type,
            category: vch.category,
            currency: vch.currency || 'IQD',
            exchangeRate: vch.exchangeRate || 1500,
            amount: vch.amount,
            swapTargetCurrency: vch.swapTargetCurrency,
            swapTargetAmount: vch.swapTargetAmount,
            date: vch.date ? new Date(vch.date) : new Date(),
            partyName: vch.partyName || '',
            description: vch.description || '',
            relatedBillNo: vch.relatedBillNo,
            carrierId: vch.carrierId,
            tripId: vch.tripId,
            hasCommission: vch.hasCommission || false,
            commissionAmount: vch.commissionAmount || 0,
            commissionCurrency: vch.commissionCurrency || 'IQD',
            commissionBearer: vch.commissionBearer || 'company',
            subAccount: vch.subAccount,
            period: vch.period,
            recordedBy: vch.recordedBy || '',
            status: vch.status || 'active',
            cancelledAt: vch.cancelledAt ? new Date(vch.cancelledAt) : null,
            cancelledBy: vch.cancelledBy,
            cancelReason: vch.cancelReason,
            attachment: (vch.attachment as any) || null,
            createdAt: vch.createdAt ? new Date(vch.createdAt) : new Date(),
          },
        });
      }

      for (const att of INITIAL_ATTACHMENTS) {
        await prisma.attachment.upsert({
          where: { id: att.id },
          update: {},
          create: {
            id: att.id,
            entityType: att.entityType,
            entityId: att.entityId,
            name: att.name,
            size: att.size,
            type: att.type,
            dataUrl: att.dataUrl,
            date: att.date ? new Date(att.date) : new Date(),
          },
        });
      }

      const initialLogs = buildInitialAuditLogs(
        INITIAL_TRANSACTIONS,
        INITIAL_RECEIPTS,
        INITIAL_TREASURY,
        INITIAL_USERS
      );
      for (const log of initialLogs) {
        await prisma.auditLogEntry.upsert({
          where: { id: log.id },
          update: {},
          create: {
            id: log.id,
            timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
            userId: log.userId,
            userName: log.userName,
            userRole: log.userRole,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId || '',
            entityReference: log.entityReference,
            title: log.title,
            details: log.details,
            cancelReason: log.cancelReason,
            financialImpact: (log.financialImpact as any) || null,
            severity: (log as any).severity || 'info',
            ipAddress: log.ipAddress,
            metadata: (log.metadata as any) || null,
          },
        });
      }

      await prisma.systemSetting.upsert({
        where: { key: 'exchange_rate' },
        update: { value: DEFAULT_EXCHANGE_RATE },
        create: {
          key: 'exchange_rate',
          value: DEFAULT_EXCHANGE_RATE,
        },
      });
    }

    // 2. جلب كافة السجلات من قاعدة البيانات
    const [
      users,
      customers,
      employees,
      carriers,
      transactionsRaw,
      receiptsRaw,
      treasuryRaw,
      attachmentsRaw,
      auditLogsRaw,
      settingRate,
    ] = await Promise.all([
      prisma.appUser.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.customer.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.employee.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.transportCompany.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.transaction.findMany({
        include: { transportTrips: true },
        orderBy: { date: 'desc' },
      }),
      prisma.receipt.findMany({ orderBy: { date: 'desc' } }),
      prisma.treasuryTransaction.findMany({ orderBy: { date: 'desc' } }),
      prisma.attachment.findMany({ orderBy: { date: 'desc' } }),
      prisma.auditLogEntry.findMany({ orderBy: { timestamp: 'desc' }, take: 200 }),
      prisma.systemSetting.findUnique({ where: { key: 'exchange_rate' } }),
    ]);

    // تحويل التواريخ والأنواع للتوافق التام مع واجهة النظام الأمامية
    const transactions = transactionsRaw.map((tx) => ({
      ...tx,
      date: tx.date.toISOString().slice(0, 10),
      createdAt: tx.createdAt.toISOString().slice(0, 10),
      cancelledAt: tx.cancelledAt ? tx.cancelledAt.toISOString() : undefined,
      containers: (tx.containers as string[]) || [],
      transportTrips: tx.transportTrips.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
    }));

    const receipts = receiptsRaw.map((r) => ({
      ...r,
      date: r.date.toISOString().slice(0, 10),
      createdAt: r.createdAt.toISOString().slice(0, 10),
      cancelledAt: r.cancelledAt ? r.cancelledAt.toISOString() : undefined,
    }));

    const treasury = treasuryRaw.map((v) => ({
      ...v,
      date: v.date.toISOString().slice(0, 10),
      createdAt: v.createdAt.toISOString().slice(0, 10),
      cancelledAt: v.cancelledAt ? v.cancelledAt.toISOString() : undefined,
    }));

    const attachments = attachmentsRaw.map((a) => ({
      ...a,
      date: a.date.toISOString().slice(0, 10),
    }));

    const auditLogs = auditLogsRaw.map((l) => ({
      ...l,
      timestamp: l.timestamp.toISOString(),
    }));

    const exchangeRate = Number(settingRate?.value) || DEFAULT_EXCHANGE_RATE;

    return NextResponse.json({
      customers,
      employees,
      carriers,
      transactions,
      receipts,
      users,
      currentUser: users[0] || INITIAL_USERS[0],
      attachments,
      treasury,
      auditLogs,
      exchangeRate,
    });
  } catch (error: any) {
    // If PostgreSQL is unreachable, respond with offline status gracefully
    return NextResponse.json(
      { offline: true, message: 'PostgreSQL offline, using client storage' },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  const dbOk = await checkDbConnection();
  if (!dbOk) {
    return NextResponse.json(
      { success: true, offline: true, message: 'Database unreachable, operating in client-local mode' },
      { status: 200 }
    );
  }

  try {
    const body = await req.json();
    const { action, payload } = body;

    // دعم تحديثات مرنة
    if (action === 'update_exchange_rate' && typeof payload?.exchangeRate === 'number') {
      await prisma.systemSetting.upsert({
        where: { key: 'exchange_rate' },
        update: { value: payload.exchangeRate },
        create: { key: 'exchange_rate', value: payload.exchangeRate },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'add_audit_log' && payload?.log) {
      const log = payload.log;
      await prisma.auditLogEntry.create({
        data: {
          id: log.id,
          timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
          userId: log.userId,
          userName: log.userName,
          userRole: log.userRole,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          entityReference: log.entityReference,
          title: log.title,
          details: log.details,
          cancelReason: log.cancelReason,
          financialImpact: log.financialImpact || null,
          severity: log.severity || 'info',
          ipAddress: log.ipAddress,
          metadata: log.metadata || null,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Graceful offline fallback
    return NextResponse.json(
      { success: false, offline: true, message: 'PostgreSQL offline, state stored in browser' },
      { status: 200 }
    );
  }
}
