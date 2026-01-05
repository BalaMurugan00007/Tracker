"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Search, Filter, Plus, MoreHorizontal, MapPin, DollarSign, Building2, Calendar, Edit2, Check, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

export default function Applications({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [filter, setFilter] = useState('All');
    const { user } = useStore();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, [user, filter]);

    const fetchApplications = async () => {
        if (!user) return;
        setLoading(true);

        let query = supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (filter !== 'All') {
            if (filter === 'Active') {
                query = query.in('status', ['Applied', 'Interview']);
            } else {
                query = query.eq('status', filter);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching applications:', error);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setApplications(apps => apps.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));
            setEditingId(null);
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    // Calculate stats dynamically
    const stats = [
        { label: 'Total Applied', value: applications.length.toString(), change: '', color: 'var(--text-main)' },
        { label: 'Interviews', value: applications.filter(a => a.status === 'Interview').length.toString(), change: '', color: 'var(--text-main)' },
        { label: 'Offers', value: applications.filter(a => a.status === 'Offer').length.toString(), change: '', color: 'var(--text-main)' },
        { label: 'Ghosted', value: applications.filter(a => a.status === 'Ghosted').length.toString(), change: '', color: 'var(--text-main)' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activePage="Applications"
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
        `}</style>

                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="mobile-only"
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', padding: 0 }}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>My Feed</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Manage your job application pipeline</p>
                        </div>
                    </div>
                    <button
                        className="btn desktop-only"
                        onClick={() => onNavigate?.('AddApplication')}
                    >
                        <Plus size={18} /> New Application
                    </button>
                    <button
                        className="btn mobile-only"
                        style={{ padding: '8px', borderRadius: '50%' }}
                        onClick={() => onNavigate?.('AddApplication')}
                    >
                        <Plus size={24} />
                    </button>
                </header>

                {/* Stats Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card">
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{stat.label}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{
                            flex: 1,
                            minWidth: '280px',
                            position: 'relative',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 12px'
                        }}>
                            <Search size={18} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder="Search companies or roles..."
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    padding: '12px',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                            {['All', 'Active', 'Interviews', 'Rejected', 'Ghosted'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-full)',
                                        border: 'none',
                                        background: filter === f ? 'var(--primary)' : 'var(--bg-card)',
                                        color: filter === f ? '#000' : 'var(--text-secondary)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Applications Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No applications found. Start by adding one!
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px'
                    }}>
                        {applications.map((app) => (
                            <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '8px',
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            <img
                                                src={`https://logo.clearbit.com/${app.company_name.replace(/\s+/g, '').toLowerCase()}.com`}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=' + app.company_name[0] }}
                                                alt={app.company_name}
                                                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{app.company_name}</h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{app.job_role}</p>
                                        </div>
                                    </div>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Calendar size={14} />
                                    Applied {new Date(app.date_applied).toLocaleDateString()}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    {editingId === app.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                                style={{
                                                    background: 'var(--bg-app)',
                                                    color: 'var(--text-main)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '4px',
                                                    padding: '4px',
                                                    fontSize: '0.75rem'
                                                }}
                                                autoFocus
                                                onBlur={() => setEditingId(null)}
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Applied">Applied</option>
                                                <option value="Interview">Interview</option>
                                                <option value="Offer">Offer</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Ghosted">Ghosted</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div onClick={() => setEditingId(app.id)} style={{ cursor: 'pointer' }}>
                                            <StatusBadge status={app.status} />
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {app.location}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    let bg = 'rgba(255,255,255,0.1)';
    let color = 'var(--text-secondary)';
    let icon = null;

    if (status === 'Interview') {
        bg = 'rgba(0, 230, 118, 0.1)';
        color = 'var(--primary)';
        icon = <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginRight: '6px' }} />;
    } else if (status === 'Rejected') {
        bg = 'rgba(255, 82, 82, 0.1)';
        color = 'var(--danger)';
        icon = <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', marginRight: '6px' }} />;
    } else if (status === 'Ghosted') {
        bg = 'rgba(255, 255, 255, 0.05)';
        color = 'var(--text-muted)';
        icon = <span style={{ marginRight: '6px' }}>?</span>;
    } else if (status === 'Offer') {
        bg = 'rgba(255, 215, 0, 0.1)';
        color = '#FFD700';
        icon = <span style={{ marginRight: '6px' }}>🎉</span>;
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '4px',
            background: bg,
            color: color,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            {icon}
            {status}
        </div>
    );
}
