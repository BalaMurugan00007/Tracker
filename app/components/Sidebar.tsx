import React from 'react';
import { LayoutDashboard, Briefcase, FileText, Settings, Plus, X } from 'lucide-react';
import { useStore } from '../lib/store';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    activePage?: string;
    onNavigate?: (page: string) => void;
}

export default function Sidebar({ isOpen = false, onClose, activePage = 'Dashboard', onNavigate }: SidebarProps) {
    const { user } = useStore();
    const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay desktop-only-hide"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 40,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
                paddingTop: 'calc(24px + var(--safe-top))',
                paddingBottom: 'calc(24px + var(--safe-bottom))'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent-blue))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            overflow: 'hidden'
                        }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>JobTracker</h2>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{displayName}</span>
                        </div>
                    </div>

                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={onClose}
                        className="sidebar-close-btn"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activePage === 'Dashboard'}
                        onClick={() => onNavigate?.('Dashboard')}
                    />
                    <NavItem
                        icon={<Briefcase size={20} />}
                        label="Applications"
                        active={activePage === 'Applications'}
                        onClick={() => onNavigate?.('Applications')}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="Resumes"
                        active={activePage === 'Resumes'}
                        onClick={() => onNavigate?.('Resumes')}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label="Settings"
                        active={activePage === 'Settings'}
                        onClick={() => onNavigate?.('Settings')}
                    />
                </nav>

                <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                    <Plus size={18} /> Track New App
                </button>
            </aside>

            <style jsx>{`
        @media (min-width: 769px) {
          .sidebar-close-btn { display: none; }
          .desktop-only-hide { display: none; }
        }
        @media (max-width: 768px) {
           /* Ensure overlay is visible on mobile when open */
        }
      `}</style>
        </>
    );
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: active ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
            }}
        >
            {icon}
            <span style={{ fontWeight: 500 }}>{label}</span>
        </div>
    );
}
