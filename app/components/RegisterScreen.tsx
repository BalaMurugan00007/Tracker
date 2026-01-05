"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

export default function RegisterScreen({ onRegister, onNavigate }: { onRegister: () => void, onNavigate?: (page: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { checkSession } = useStore();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: 'https://tracker-alpha-kohl.vercel.app/',
                },
            });

            if (error) throw error;

            if (data?.user && !data?.session) {
                // User created but session is null -> Email confirmation required
                setSuccessMessage("Registration successful! Please check your email to confirm your account.");
            } else {
                // Session exists -> Auto login (if email confirm is disabled)
                await checkSession();
                onRegister();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    if (successMessage) {
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
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    padding: '32px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(0, 230, 118, 0.1)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '2rem'
                    }}>
                        ✉️
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Check Your Email</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5' }}>
                        {successMessage}
                    </p>
                    <button
                        onClick={() => onNavigate?.('Login')}
                        className="btn"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

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

                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Create Account</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Start your journey to your dream job</p>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account?{' '}
                    <button
                        onClick={() => onNavigate?.('Login')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
}
