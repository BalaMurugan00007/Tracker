"use client";

import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft, Calendar, FileText, Save, Info, Link as LinkIcon, MapPin, Building2, Briefcase } from 'lucide-react';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

export default function AddApplication({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');
    const [source, setSource] = useState('LinkedIn');
    const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [resumes, setResumes] = useState<any[]>([]);

    useEffect(() => {
        // Fetch resumes for the dropdown
        const fetchResumes = async () => {
            if (!user) return;
            const { data } = await supabase.from('resume_versions').select('id, name').eq('user_id', user.id);
            if (data) {
                setResumes(data);
                if (data.length > 0) setResumeId(data[0].id);
            }
        };
        fetchResumes();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.from('applications').insert({
                user_id: user.id,
                company_name: companyName,
                job_role: jobTitle,
                location: location,
                job_source: source,
                date_applied: dateApplied,
                resume_version_id: resumeId,
                // We'll store notes in 'improvement_notes' for now or add a 'notes' column later if needed.
                // Based on schema, let's put it in 'improvement_notes' as a temporary placeholder or just omit if not in schema.
                // Schema has: hr_name, interview_questions, feedback, personal_mistakes, improvement_notes.
                // Let's assume 'improvement_notes' can hold general notes for now.
                improvement_notes: notes,
                status: 'Applied'
            });

            if (error) throw error;

            onNavigate?.('Applications');
        } catch (err: any) {
            console.error('Error adding application:', err);
            setError(err.message || 'Failed to save application');
        } finally {
            setLoading(false);
        }
    };

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
          .form-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 12px;
            color: var(--text-main);
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
          }
          .form-input:focus {
            border-color: var(--primary);
          }
          .form-label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }
          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1rem;
            font-weight: bold;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
          }
        `}</style>

                {/* Header */}
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <button
                            className="mobile-only"
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', padding: 0 }}
                        >
                            <Menu size={24} />
                        </button>
                        <button
                            onClick={() => onNavigate?.('Applications')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            <ArrowLeft size={16} /> Back to Applications
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>New Job Application</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Track a new opportunity in your job search pipeline.</p>
                        </div>
                        <button className="desktop-only" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                            Import from URL
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '12px',
                                background: 'rgba(255, 82, 82, 0.1)',
                                border: '1px solid var(--danger)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--danger)',
                                marginBottom: '24px',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* The Basics */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="section-title" style={{ color: 'var(--primary)' }}>
                                <Building2 size={20} /> The Basics
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label className="form-label">Company Name <span style={{ color: 'var(--primary)' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Acme Corp"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                <div>
                                    <label className="form-label">Job Title <span style={{ color: 'var(--primary)' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ paddingLeft: '36px' }}
                                            placeholder="e.g. Senior Product Designer"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Location</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ paddingLeft: '36px' }}
                                            placeholder="e.g. Remote, San Francisco"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="section-title" style={{ color: 'var(--success)' }}>
                                <FileText size={20} /> Application Details
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label className="form-label">Source</label>
                                    <select
                                        className="form-input"
                                        style={{ appearance: 'none' }}
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                    >
                                        <option>LinkedIn</option>
                                        <option>Indeed</option>
                                        <option>Company Website</option>
                                        <option>Referral</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Date Applied</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            className="form-input"
                                            style={{ paddingLeft: '36px' }}
                                            value={dateApplied}
                                            onChange={(e) => setDateApplied(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Resume Used</label>
                                    <select
                                        className="form-input"
                                        style={{ appearance: 'none' }}
                                        value={resumeId || ''}
                                        onChange={(e) => setResumeId(e.target.value)}
                                    >
                                        <option value="">Select a resume...</option>
                                        {resumes.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Quick Notes <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Optional)</span></label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    placeholder="Paste the job description URL or add key requirements here..."
                                    style={{ resize: 'vertical' }}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', marginBottom: '40px' }}>
                            <button
                                type="button"
                                onClick={() => onNavigate?.('Applications')}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn"
                                disabled={loading}
                                style={{ opacity: loading ? 0.7 : 1 }}
                            >
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Application'}
                            </button>
                        </div>
                    </form>

                    {/* Pro Tip */}
                    <div style={{
                        background: 'rgba(0, 230, 118, 0.05)',
                        border: '1px solid rgba(0, 230, 118, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px'
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
                        <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Pro Tip:</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                You can also use our Chrome Extension to auto-fill this form directly from LinkedIn, Indeed, and major job boards. <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Install Extension</span>
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
