'use client';

import React, { useState } from 'react';
import { AppUser } from '../../types/customs';
import { INITIAL_USERS } from '../../utils/initialData';
import { LoginBrandingCol } from './LoginBrandingCol';
import { LoginFormCol } from './LoginFormCol';
import { LoginSupportModals } from './LoginSupportModals';

export interface LoginPageProps {
  users?: AppUser[];
  onLoginSuccess?: (user: AppUser, branch?: string) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users = INITIAL_USERS,
  onLoginSuccess,
  onCancel,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'naqaa_basra' | 'sawt_aljanoob'>('all');
  const [selectedRolePill, setSelectedRolePill] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<AppUser | null>(null);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Quick fill demo user credentials
  const handleSelectDemoUser = (user: AppUser) => {
    setUsernameOrEmail(user.username);
    setPassword(user.password || 'admin123');
    setSelectedRolePill(user.id);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedIdentifier = usernameOrEmail.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedIdentifier) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }

    if (!trimmedPass) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const foundUser = users.find(
        (u) =>
          u.username.toLowerCase() === trimmedIdentifier ||
          (u.email && u.email.toLowerCase() === trimmedIdentifier)
      );

      if (!foundUser) {
        setIsLoading(false);
        setErrorMessage('اسم المستخدم أو البريد الإلكتروني غير مسجل في النظام');
        return;
      }

      if (foundUser.status === 'suspended') {
        setIsLoading(false);
        setErrorMessage('هذا الحساب معطل حالياً من قبل الإدارة. يرجى مراجعة المدير العام.');
        return;
      }

      if (foundUser.password && foundUser.password !== trimmedPass) {
        setIsLoading(false);
        setErrorMessage('كلمة المرور غير صحيحة، يرجى التحقق وإعادة المحاولة.');
        return;
      }

      // Success
      setIsLoading(false);
      setSuccessUser(foundUser);

      if (typeof window !== 'undefined' && rememberMe) {
        localStorage.setItem('customs_remember_user', foundUser.username);
      }

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(foundUser, selectedBranch);
        } else {
          window.location.href = '/';
        }
      }, 700);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-hidden" dir="rtl">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          
          {/* COLUMN 1: Visual, Branding & Feature Showcase */}
          <LoginBrandingCol />

          {/* COLUMN 2: Interactive Authentication Form */}
          <LoginFormCol
            onCancel={onCancel}
            users={users}
            selectedRolePill={selectedRolePill}
            onSelectDemoUser={handleSelectDemoUser}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            successUser={successUser}
            usernameOrEmail={usernameOrEmail}
            setUsernameOrEmail={setUsernameOrEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onOpenForgot={() => setShowForgotModal(true)}
            onOpenSupport={() => setShowSupportModal(true)}
          />

        </div>
      </div>

      {/* Modals */}
      <LoginSupportModals
        showForgotModal={showForgotModal}
        setShowForgotModal={setShowForgotModal}
        showSupportModal={showSupportModal}
        setShowSupportModal={setShowSupportModal}
      />

    </div>
  );
};
