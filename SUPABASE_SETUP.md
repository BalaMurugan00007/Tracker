# Supabase Setup

To enable the full backend functionality, you need to connect your Supabase project.

1.  Create a `.env.local` file in the root of your project (`d:\PERSONAL\Job tracker V1\job_tracker\.env.local`).
2.  Add your Supabase URL and Anon Key:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3.  Restart the development server:
    ```bash
    npm run dev
    ```

The application is currently running in **Mock Mode** to prevent crashes. Once you add the keys, it will automatically switch to the live database.
