"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

export default function LoginScreen({ onLogin, onNavigate }: { onLogin: () => void, onNavigate?: (page: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { checkSession } = useStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            await checkSession(); // Update store
            onLogin();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-app)',
            padding: '24px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent-blue))',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 32px rgba(0, 230, 118, 0.2)'
                }} />

                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Sign in to continue tracking your success</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(255, 82, 82, 0.1)',
                            border: '1px solid var(--danger)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--danger)',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn"
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            padding: '16px',
                            fontSize: '1rem',
                            marginTop: '8px',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Don't have an account?{' '}
                    <button
                        onClick={() => onNavigate?.('Register')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
}
