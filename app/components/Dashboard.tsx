"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, EyeOff, TrendingUp, TrendingDown, Plus, Trophy, FileText, AlertTriangle, Menu, Bell, HelpCircle, User } from 'lucide-react';
import Sidebar from './Sidebar';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export default function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useStore();
    const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

    // State for dynamic stats
    const [stats, setStats] = useState({
        appsToday: 0,
        pendingFollowUps: 0,
        ghosted: 0,
        totalApplications: 0,
        totalInterviews: 0,
        totalRejections: 0,
        interviewRate: '0%'
    });
    const [resumeLeaderboard, setResumeLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);

            // 1. Fetch Applications for Stats
            const { data: apps, error } = await supabase
                .from('applications')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
                return;
            }

            // Calculate Stats
            const today = new Date().toISOString().split('T')[0];
            const appsToday = apps.filter(a => a.date_applied === today).length;
            const pendingFollowUps = apps.filter(a => a.follow_up_date && new Date(a.follow_up_date) <= new Date() && a.status !== 'Rejected' && a.status !== 'Ghosted').length;
            const ghosted = apps.filter(a => a.status === 'Ghosted').length;
            const totalApplications = apps.length;
            const totalInterviews = apps.filter(a => a.status === 'Interview' || a.status === 'Offer').length;
            const totalRejections = apps.filter(a => a.status === 'Rejected').length;
            const interviewRate = totalApplications > 0 ? ((totalInterviews / totalApplications) * 100).toFixed(0) + '%' : '0%';

            setStats({
                appsToday,
                pendingFollowUps,
                ghosted,
                totalApplications,
                totalInterviews,
                totalRejections,
                interviewRate
            });

            // 2. Fetch Resume Leaderboard
            // We need to group applications by resume_version_id and calculate success rate
            const { data: resumes } = await supabase
                .from('resume_versions')
                .select('id, name')
                .eq('user_id', user.id);

            if (resumes) {
                const leaderboard = resumes.map(resume => {
                    const resumeApps = apps.filter(a => a.resume_version_id === resume.id);
                    const count = resumeApps.length;
                    const interviews = resumeApps.filter(a => a.status === 'Interview' || a.status === 'Offer').length;
                    const score = count > 0 ? ((interviews / count) * 100).toFixed(0) : '0';

                    return {
                        id: resume.id,
                        name: resume.name,
                        count,
                        score: `${score}%`,
                        trend: 'neutral' // Placeholder for trend logic
                    };
                }).sort((a, b) => parseFloat(b.score) - parseFloat(a.score)).slice(0, 3); // Top 3

                setResumeLeaderboard(leaderboard);
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activePage="Dashboard"
                onNavigate={onNavigate}
            />

            <main style={{
                marginLeft: 'var(--sidebar-width, 0px)',
                padding: '24px',
                paddingBottom: '100px', // Space for mobile nav
                transition: 'margin 0.3s ease'
            }} className="main-content">
                <style jsx global>{`
          @media (min-width: 769px) {
            .main-content { margin-left: 260px !important; }
            .mobile-only { display: none !important; }
            .desktop-only { display: block !important; }
          }
          @media (max-width: 768px) {
            .main-content { margin-left: 0 !important; padding: 16px !important; padding-bottom: 100px !important; }
            .mobile-only { display: block !important; }
            .desktop-only { display: none !important; }
          }
        `}</style>

                {/* Desktop Header */}
                <header className="desktop-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 16px',
                        width: '400px',
                        color: 'var(--text-muted)'
                    }}>
                        Search applications, companies...
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Bell size={20} color="var(--text-secondary)" />
                        <HelpCircle size={20} color="var(--text-secondary)" />
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{displayName}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro Plan</p>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={24} color="#666" />
                            )}
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="mobile-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)' }}>
                            <Menu size={24} />
                        </button>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent-blue))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{displayName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span style={{ fontWeight: 'bold' }}>JobTracker</span>
                    </div>
                    <button
                        onClick={() => onNavigate?.('AddApplication')}
                        style={{
                            background: 'var(--primary)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000'
                        }}>
                        <Plus size={20} />
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">

                    {/* Apps Today */}
                    <div className="card stats-card-main" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, var(--bg-card), rgba(0, 230, 118, 0.05))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(41, 121, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={18} color="var(--accent-blue)" />
                            </div>
                            <div style={{ background: '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                                Goal: 10
                            </div>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.appsToday}</span>
                            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}> / 10</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Apps Today</p>
                        <div style={{ height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min((stats.appsToday / 10) * 100, 100)}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '3px' }}></div>
                        </div>
                    </div>

                    {/* Pending Follow-ups */}
                    <div className="card">
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 183, 77, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Clock size={18} color="var(--warning)" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px' }}>{stats.pendingFollowUps}</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--warning)', lineHeight: '1.2' }}>Pending Follow-ups</p>
                    </div>

                    {/* Ghosted Count */}
                    <div className="card">
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <EyeOff size={18} color="var(--text-muted)" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px' }}>{stats.ghosted}</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>Ghosted</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    {/* Conversion Reality */}
                    <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Conversion Reality</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Interview vs. Rejection Rate</p>
                            </div>
                            <span style={{ fontSize: '0.75rem', background: '#333', padding: '4px 8px', borderRadius: '4px' }}>All Time</span>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{stats.interviewRate}</span>
                            <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Interview Rate</span>
                        </div>

                        <div style={{ flex: 1, minHeight: '100px' }}>
                            {/* Simple CSS Bar Chart for robustness */}
                            <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                                <div style={{ width: `${parseFloat(stats.interviewRate)}%`, background: 'var(--accent-blue)' }}></div>
                                <div style={{ width: `${100 - parseFloat(stats.interviewRate)}%`, background: 'var(--danger)' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div>
                                    Interviews ({stats.totalInterviews})
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                                    Rejections ({stats.totalRejections})
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resume Leaderboard */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Resume Leaderboard</h3>
                            <TrendingUp size={20} color="var(--text-muted)" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {resumeLeaderboard.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No resume data yet.</p>
                            ) : (
                                resumeLeaderboard.map((resume: any) => (
                                    <ResumeItem
                                        key={resume.id}
                                        name={resume.name}
                                        sub={`${resume.count} Applications`}
                                        score={resume.score}
                                        trend={resume.trend}
                                        icon={<Trophy size={18} color="#00e676" />}
                                        iconBg="rgba(0, 230, 118, 0.1)"
                                    />
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => onNavigate?.('Resumes')}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                marginTop: '24px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                            VIEW ALL RESUMES
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ResumeItem({ name, sub, score, trend, icon, iconBg }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', display: 'block' }}>{score}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>success</span>
            </div>
        </div>
    );
}
