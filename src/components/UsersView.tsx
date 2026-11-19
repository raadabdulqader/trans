'use client';

import React, { useState, useMemo } from 'react';
import { AppUser } from '../types/customs';
import { UsersHeader } from './users/UsersHeader';
import { UsersFilters } from './users/UsersFilters';
import { UsersTable } from './users/UsersTable';
import { UserPermissionsDetailModal } from './users/UserPermissionsDetailModal';

interface UsersViewProps {
  users: AppUser[];
  currentUser: AppUser;
  onAddUser: () => void;
  onEditUser: (user: AppUser) => void;
  onDeleteUser: (user: AppUser) => void;
  onSwitchUser: (user: AppUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users = [],
  currentUser,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPermsUser, setViewingPermsUser] = useState<AppUser | null>(null);

  const countAllowedTabs = (u: AppUser) => {
    if (u.role === 'admin') return 10;
    const p = u.permissions;
    let count = 0;
    if (p.viewDashboard !== false) count++;
    if (p.viewTreasury !== false) count++;
    if (p.viewAccounts !== false) count++;
    if (p.viewCustomers !== false) count++;
    if (p.viewTransactions !== false) count++;
    if (p.viewEmployees !== false) count++;
    if (p.viewReceipts !== false) count++;
    if (p.viewReports !== false) count++;
    if (p.viewAuditLog !== false) count++;
    if (p.viewUsers !== false) count++;
    return count;
  };

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyCredentials = (usr: AppUser) => {
    const text = `اسم المستخدم: ${usr.username}\nكلمة المرور: ${usr.password || 'غير معينة'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(usr.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesUsername = u.username?.toLowerCase().includes(q);
        const matchesRole = u.roleTitle?.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        if (!matchesName && !matchesUsername && !matchesRole && !matchesPhone && !matchesEmail) {
          return false;
        }
      }

      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== 'all') {
        const userStatus = u.status || 'active';
        if (userStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const accountants = users.filter(u => u.role === 'accountant').length;
    const active = users.filter(u => (u.status || 'active') === 'active').length;

    return { total, admins, accountants, active };
  }, [users]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <UsersHeader
        currentUser={currentUser}
        onAddUser={onAddUser}
        stats={stats}
      />

      <UsersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <UsersTable
        users={filteredUsers}
        currentUser={currentUser}
        revealedPasswords={revealedPasswords}
        toggleRevealPassword={toggleRevealPassword}
        handleCopyCredentials={handleCopyCredentials}
        copiedId={copiedId}
        setViewingPermsUser={setViewingPermsUser}
        countAllowedTabs={countAllowedTabs}
        onSwitchUser={onSwitchUser}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
      />

      <UserPermissionsDetailModal
        user={viewingPermsUser}
        onClose={() => setViewingPermsUser(null)}
        onEditUser={onEditUser}
      />
    </div>
  );
};
