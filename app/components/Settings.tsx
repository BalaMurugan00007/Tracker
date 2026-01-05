"use client";

import React, { useState, useEffect } from 'react';
import { Menu, User, Moon, Sun, LogOut, Shield, Mail, Camera } from 'lucide-react';
import Sidebar from './Sidebar';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export default function Settings({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, theme, toggleTheme, signOut, checkSession } = useStore();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (user?.full_name) {
            setFullName(user.full_name);
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user) return;

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;

            setIsEditing(false);
            checkSession(); // Refresh store
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleLogout = async () => {
        await signOut();
        onNavigate?.('Login'); // Assuming 'Login' is the view name for login screen
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activePage="Settings"
                onNavigate={onNavigate}
            />

            <main style={{
                marginLeft: 'var(--sidebar-width, 0px)',
                padding: '24px',
                paddingBottom: '100px',
                transition: 'margin 0.3s ease'
            }} className="main-content">
                <style jsx global>{`
          @media (min-width: 769px) {
            .main-content { margin-left: 260px !important; }
          }
          @media (max-width: 768px) {
            .main-content { margin-left: 0 !important; padding: 16px !important; padding-bottom: 100px !important; }
          }
          .settings-section {
            margin-bottom: 32px;
          }
          .settings-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 16px;
            color: var(--text-main);
          }
          .setting-item {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }
        `}</style>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <button
                        className="mobile-only"
                        onClick={() => setIsSidebarOpen(true)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', padding: 0 }}
                    >
                        <Menu size={24} />
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Settings</h1>
                </div>

                {/* Profile Section */}
                <div className="settings-section">
                    <h2 className="settings-title">Profile</h2>
                    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary), var(--accent-blue))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem'
                                }}>
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
                                    )}
                                </div>
                                <button style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '50%',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: 'var(--text-main)'
                                }}>
                                    <Camera size={14} />
                                </button>
                            </div>

                            <div style={{ flex: 1 }}>
                                {isEditing ? (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            style={{
                                                background: 'var(--bg-app)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-main)',
                                                padding: '8px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="btn"
                                            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {fullName || 'User'}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--primary)',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                marginTop: '8px',
                                                padding: 0
                                            }}
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="settings-section">
                    <h2 className="settings-title">Appearance</h2>
                    <div className="setting-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {theme === 'dark' ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--warning)" />}
                            <div>
                                <h4 style={{ fontWeight: '600' }}>Theme</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'var(--bg-app)',
                                border: '1px solid var(--border)',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-full)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}
                        >
                            Toggle
                        </button>
                    </div>
                </div>

                {/* Account Section */}
                <div className="settings-section">
                    <h2 className="settings-title">Account</h2>

                    <div className="setting-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Shield size={20} color="var(--text-secondary)" />
                            <div>
                                <h4 style={{ fontWeight: '600' }}>Security</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password and authentication</p>
                            </div>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>→</button>
                    </div>

                    <div className="setting-item" style={{ borderColor: 'rgba(255, 82, 82, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <LogOut size={20} color="var(--danger)" />
                            <div>
                                <h4 style={{ fontWeight: '600', color: 'var(--danger)' }}>Log Out</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign out of your account</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'rgba(255, 82, 82, 0.1)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-full)',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
