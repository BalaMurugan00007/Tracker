"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Trophy, Send, TrendingUp, Download, Edit2, FileText, Star, Archive, Upload, Plus, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

export default function Resumes({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useStore();
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [versionName, setVersionName] = useState('');

    useEffect(() => {
        fetchResumes();
    }, [user]);

    const fetchResumes = async () => {
        if (!user) return;
        setLoading(true);

        // Fetch resumes
        const { data: resumeData, error: resumeError } = await supabase
            .from('resume_versions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (resumeError) {
            console.error('Error fetching resumes:', resumeError);
            setLoading(false);
            return;
        }

        // Fetch stats for each resume
        const resumesWithStats = await Promise.all(resumeData.map(async (resume) => {
            const { count: totalApps } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('resume_version_id', resume.id);

            const { count: interviews } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('resume_version_id', resume.id)
                .eq('status', 'Interview');

            const rate = totalApps ? ((interviews || 0) / totalApps * 100).toFixed(1) : '0.0';

            return {
                ...resume,
                applications: totalApps || 0,
                rate: `${rate}%`,
                isBest: false
            };
        }));

        // Determine best resume
        if (resumesWithStats.length > 0) {
            const best = resumesWithStats.reduce((prev, current) =>
                parseFloat(current.rate) > parseFloat(prev.rate) ? current : prev
            );
            if (parseFloat(best.rate) > 0) {
                best.isBest = true;
            }
        }

        setResumes(resumesWithStats);
        setLoading(false);
    };

    const handleAddResume = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !versionName) return;

        setUploading(true);

        try {
            // Insert into Database with custom name (no file)
            const { error: dbError } = await supabase
                .from('resume_versions')
                .insert({
                    user_id: user.id,
                    name: versionName
                });

            if (dbError) throw dbError;

            // Reset and Refresh
            setIsModalOpen(false);
            setVersionName('');
            await fetchResumes();

        } catch (err: any) {
            console.error('Error adding resume:', err.message);
            alert('Failed to add resume: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (path: string) => {
        if (!path) return;
        try {
            const { data, error } = await supabase.storage.from('resumes').createSignedUrl(path, 60);
            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (err) {
            console.error('Download error:', err);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activePage="Resumes"
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
            .desktop-only-flex { display: block !important; }
          }
          @media (max-width: 768px) {
            .main-content { margin-left: 0 !important; padding: 16px !important; padding-bottom: 100px !important; }
          }
        `}</style>

                {/* Header */}
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="mobile-only"
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', padding: 0 }}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Resume Performance</h1>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.5' }}>
                                Compare A/B tests and track interview rates across versions.
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn"
                        >
                            <Plus size={18} /> Add Resume
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Top Performer */}
                    <div className="card" style={{ background: 'linear-gradient(145deg, var(--bg-card), rgba(0, 230, 118, 0.05))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Top Performer</span>
                            <Trophy size={16} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>
                            {resumes.find(r => r.isBest)?.name || 'N/A'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(0, 230, 118, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {resumes.find(r => r.isBest)?.rate || '0%'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>interview rate</span>
                        </div>
                    </div>

                    {/* Total Resumes */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Versions</span>
                            <FileText size={16} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>{resumes.length}</h3>
                    </div>
                </div>

                {/* Resume List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading resumes...</div>
                    ) : resumes.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                            No resumes added yet. Add one to get started!
                        </div>
                    ) : (
                        resumes.map((resume) => (
                            <div key={resume.id} className="card" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px',
                                borderLeft: resume.isBest ? '4px solid var(--primary)' : '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '8px',
                                        background: resume.isBest ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {resume.isBest ? <Star size={20} color="var(--primary)" fill="var(--primary)" /> :
                                            <FileText size={20} color="var(--text-secondary)" />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{resume.name}</h3>
                                            {resume.isBest && <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>BEST</span>}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Created {new Date(resume.created_at).toLocaleDateString()} • {resume.applications} Applications
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                    <div style={{ textAlign: 'right', display: 'none' }} className="desktop-only-flex">
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>INTERVIEW RATE</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: resume.isBest ? 'var(--primary)' : 'var(--text-main)' }}>{resume.rate}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {resume.file_path && (
                                            <button
                                                onClick={() => handleDownload(resume.file_path)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
                                                title="Download"
                                            >
                                                <Download size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Add Resume Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        width: '90%',
                        maxWidth: '500px',
                        padding: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Add New Resume</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddResume} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Version Name (e.g., "Product Manager V1")
                                </label>
                                <input
                                    type="text"
                                    value={versionName}
                                    onChange={(e) => setVersionName(e.target.value)}
                                    placeholder="Enter version name..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--bg-app)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-main)',
                                        outline: 'none'
                                    }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !versionName}
                                className="btn"
                                style={{
                                    justifyContent: 'center',
                                    padding: '12px',
                                    marginTop: '8px',
                                    opacity: (uploading || !versionName) ? 0.7 : 1
                                }}
                            >
                                {uploading ? 'Saving...' : 'Save Resume Version'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
