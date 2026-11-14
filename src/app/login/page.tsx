'use client';

import React from 'react';
import { LoginPage } from '../../components/auth/LoginPage';
import { loadData } from '../../utils/storage';

export default function NextLoginPage() {
  const [users, setUsers] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      const data = loadData();
      if (data && data.users && data.users.length > 0) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    // Save current user to localStorage and redirect
    if (typeof window !== 'undefined') {
      localStorage.setItem('customs_current_user_v4', JSON.stringify(user));
      window.location.href = '/';
    }
  };

  return (
    <LoginPage
      users={users.length > 0 ? users : undefined}
      onLoginSuccess={handleLoginSuccess}
      onCancel={() => {
        window.location.href = '/';
      }}
    />
  );
}
