"use client";

import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import Dashboard from './components/Dashboard';
import Applications from './components/Applications';
import AddApplication from './components/AddApplication';
import Resumes from './components/Resumes';
import Settings from './components/Settings';
import { useStore } from './lib/store';

export default function Home() {
  const [view, setView] = useState<'splash' | 'login' | 'register' | 'dashboard' | 'applications' | 'add-application' | 'resumes' | 'settings'>('splash');
  const { checkSession, user, isLoading } = useStore();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    // Redirect logic based on auth state
    if (!isLoading) {
      if (user && (view === 'login' || view === 'register')) {
        setView('dashboard');
      } else if (!user && view !== 'splash' && view !== 'login' && view !== 'register') {
        // setView('login'); // Optional: Force login if not authenticated
      }
    }
  }, [user, isLoading, view]);

  const handleSplashFinish = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('login');
    }
  };

  const handleLogin = () => {
    setView('dashboard');
  };

  const handleNavigate = (page: string) => {
    if (page === 'Login') setView('login');
    if (page === 'Register') setView('register');
    if (page === 'Dashboard') setView('dashboard');
    if (page === 'Applications') setView('applications');
    if (page === 'AddApplication') setView('add-application');
    if (page === 'Resumes') setView('resumes');
    if (page === 'Settings') setView('settings');
  };

  return (
    <>
      {view === 'splash' && <SplashScreen onFinish={handleSplashFinish} />}
      {view === 'login' && <LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />}
      {view === 'register' && <RegisterScreen onRegister={handleLogin} onNavigate={handleNavigate} />}
      {view === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {view === 'applications' && <Applications onNavigate={handleNavigate} />}
      {view === 'add-application' && <AddApplication onNavigate={handleNavigate} />}
      {view === 'resumes' && <Resumes onNavigate={handleNavigate} />}
      {view === 'settings' && <Settings onNavigate={handleNavigate} />}
    </>
  );
}
