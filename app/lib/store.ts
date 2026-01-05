import { create } from 'zustand';
import { supabase } from './supabase';

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

interface AppState {
    user: UserProfile | null;
    theme: 'dark' | 'light';
    isLoading: boolean;

    // Actions
    setUser: (user: UserProfile | null) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    toggleTheme: () => void;
    checkSession: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    user: null,
    theme: 'dark', // Default to dark
    isLoading: true,

    setUser: (user) => set({ user }),

    setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    },

    toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
    },

    checkSession: async () => {
        set({ isLoading: true });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.user_metadata?.full_name,
                        avatar_url: session.user.user_metadata?.avatar_url
                    }
                });
            } else {
                set({ user: null });
            }
        } catch (error) {
            console.error('Session check failed:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
    }
}));
