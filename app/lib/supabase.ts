import { createClient } from '@supabase/supabase-js';

// Load variables from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using mock client.');

    // Mock client to prevent crash and allow UI testing
    supabaseClient = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async ({ email, password }: any) => {
                console.log('Mock Login:', email);
                // Simulate success for testing
                return {
                    data: {
                        user: {
                            id: 'mock-user-id',
                            email,
                            user_metadata: { full_name: 'Mock User' }
                        },
                        session: { access_token: 'mock-token' }
                    },
                    error: null
                };
            },
            signUp: async ({ email, options }: any) => {
                console.log('Mock SignUp:', email);
                return {
                    data: {
                        user: {
                            id: 'mock-user-id',
                            email,
                            user_metadata: { full_name: options?.data?.full_name || 'Mock User' }
                        },
                        session: { access_token: 'mock-token' }
                    },
                    error: null
                };
            },
            signOut: async () => ({ error: null }),
            updateUser: async (data: any) => {
                console.log('Mock Update User:', data);
                return { data: { user: { ...data } }, error: null };
            }
        },
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: null }),
                    order: () => ({ data: [], error: null })
                }),
                order: () => ({ data: [], error: null }),
                data: [],
                error: null
            }),
            insert: async () => ({ data: null, error: null }),
            update: () => ({ eq: async () => ({ data: null, error: null }) }),
        })
    } as any;
} else {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
