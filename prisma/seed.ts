import { PrismaClient } from '@prisma/client';
import {
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_CARRIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_RECEIPTS,
  INITIAL_TREASURY,
  INITIAL_ATTACHMENTS,
} from '../src/utils/initialData';
import { buildInitialAuditLogs, DEFAULT_EXCHANGE_RATE } from '../src/utils/storage';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 بدء استيراد البيانات الأولية إلى PostgreSQL...');

  // 1. استيراد المستخدمين
  console.log('👤 استيراد المستخدمين...');
  for (const user of INITIAL_USERS) {
    await prisma.appUser.upsert({
      where: { username: user.username },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        username: user.username,
        password: user.password,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleTitle: user.roleTitle,
        avatar: user.avatar,
        status: user.status || 'active',
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        permissions: (user.permissions as any) || {},
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      },
    });
  }

  // 2. استيراد الزبائن
  console.log('🏢 استيراد الزبائن...');
  for (const cust of INITIAL_CUSTOMERS) {
    await prisma.customer.upsert({
      where: { id: cust.id },
      update: {},
      create: {
        id: cust.id,
        name: cust.name,
        regNo: cust.regNo,
        contact: cust.contact,
        phone: cust.phone,
        email: cust.email,
        address: cust.address,
        companyId: cust.companyId || 'both',
        notes: cust.notes,
        createdAt: cust.createdAt ? new Date(cust.createdAt) : new Date(),
      },
    });
  }

  // 3. استيراد الموظفين والمخلصين
  console.log('👷 استيراد الموظفين والمخلصين...');
  for (const emp of INITIAL_EMPLOYEES) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        id: emp.id,
        name: emp.name,
        phone: emp.phone,
        idNo: emp.idNo,
        joinDate: emp.joinDate,
        notes: emp.notes,
        category: emp.category || 'broker',
        jobTitle: emp.jobTitle,
        baseSalary: emp.baseSalary || 0,
        department: emp.department,
      },
    });
  }

  // 4. استيراد شركات النقل
  console.log('🚚 استيراد شركات النقل...');
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

  // 5. استيراد البوالص والمعاملات ونقلاتها
  console.log('📋 استيراد البوالص والمعاملات...');
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

  // 6. استيراد السندات والوصولات
  console.log('🧾 استيراد السندات والوصولات...');
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

  // 7. استيراد حركات الصندوق والخزينة
  console.log('💰 استيراد حركات الصندوق...');
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

  // 8. استيراد المرفقات والأرشيف
  console.log('📁 استيراد الأرشيف والمرفقات...');
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

  // 9. استيراد سجل التدقيق الأولي
  console.log('🛡️ استيراد سجل التدقيق...');
  const auditLogs = buildInitialAuditLogs(
    INITIAL_TRANSACTIONS,
    INITIAL_RECEIPTS,
    INITIAL_TREASURY,
    INITIAL_USERS
  );
  for (const log of auditLogs) {
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

  // 10. إعداد سعر الصرف وسر النظام
  console.log('💵 استيراد الإعدادات وسعر الصرف...');
  await prisma.systemSetting.upsert({
    where: { key: 'exchange_rate' },
    update: { value: DEFAULT_EXCHANGE_RATE },
    create: {
      key: 'exchange_rate',
      value: DEFAULT_EXCHANGE_RATE,
    },
  });

  console.log('✅ تم الانتهاء بنجاح من إعداد وتهيئة قاعدة البيانات في PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ أثناء ملء قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
