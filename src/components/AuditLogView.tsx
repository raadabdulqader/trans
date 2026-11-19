'use client';

import React, { useState, useMemo } from 'react';
import { AuditLogEntry, AppUser } from '../types/customs';
import { AuditLogHeader } from './audit/AuditLogHeader';
import { AuditLogFilters } from './audit/AuditLogFilters';
import { AuditLogList } from './audit/AuditLogList';
import { AuditInspectModal } from './audit/AuditInspectModal';
import { AuditPrintModal } from './audit/AuditPrintModal';

export interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
  currentUser: AppUser;
  users: AppUser[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs = [],
  currentUser,
  users = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [inspectEntry, setInspectEntry] = useState<AuditLogEntry | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesRef = log.entityReference?.toLowerCase().includes(q);
        const matchesTitle = log.title?.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q);
        const matchesUser = log.userName?.toLowerCase().includes(q);
        const matchesReason = log.cancelReason?.toLowerCase().includes(q);
        if (!matchesRef && !matchesTitle && !matchesDetails && !matchesUser && !matchesReason) {
          return false;
        }
      }

      // Action Filter
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false;
      }

      // Entity Filter
      if (selectedEntity !== 'all' && log.entityType !== selectedEntity) {
        return false;
      }

      // User Filter
      if (selectedUser !== 'all' && log.userId !== selectedUser && log.userName !== selectedUser) {
        return false;
      }

      // Date Range Filter
      if (startDate) {
        const logDate = log.timestamp.split('T')[0];
        if (logDate < startDate) return false;
      }
      if (endDate) {
        const logDate = log.timestamp.split('T')[0];
        if (logDate > endDate) return false;
      }

      return true;
    });
  }, [auditLogs, searchTerm, selectedAction, selectedEntity, selectedUser, startDate, endDate]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const voidCount = auditLogs.filter((l) => l.action === 'void').length;
    const financialCount = auditLogs.filter(
      (l) => l.entityType === 'receipt' || l.entityType === 'treasury' || l.entityType === 'account_expense'
    ).length;
    const securityCount = auditLogs.filter(
      (l) => l.entityType === 'user' || l.entityType === 'system' || l.action === 'auth'
    ).length;

    return { total, voidCount, financialCount, securityCount };
  }, [auditLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'المعرف',
      'التاريخ والوقت',
      'المستخدم',
      'الرتبة',
      'نوع العملية',
      'الجهة',
      'المرجع',
      'العنوان',
      'التفاصيل',
      'سبب الإلغاء',
    ];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString('ar-IQ'),
      l.userName,
      l.userRole,
      l.action,
      l.entityType,
      l.entityReference || '-',
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.cancelReason || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `audit_log_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <AuditLogHeader
        stats={stats}
        onOpenPrintReport={() => setIsPrintReportOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Filter and Search Controls */}
      <AuditLogFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedAction={selectedAction}
        setSelectedAction={setSelectedAction}
        selectedEntity={selectedEntity}
        setSelectedEntity={setSelectedEntity}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        users={users}
        matchCount={filteredLogs.length}
      />

      {/* Audit Log Entries List */}
      <AuditLogList
        filteredLogs={filteredLogs}
        onInspect={(log) => setInspectEntry(log)}
      />

      {/* Inspect Modal */}
      <AuditInspectModal
        inspectEntry={inspectEntry}
        onClose={() => setInspectEntry(null)}
      />

      {/* Print Report Modal */}
      <AuditPrintModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        filteredLogs={filteredLogs}
        currentUser={currentUser}
        stats={stats}
      />
    </div>
  );
};
