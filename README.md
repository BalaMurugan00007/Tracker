# Job Application Intelligence System (PWA)

A mobile-first Progressive Web App to track job applications, analyze performance, and improve results with brutally honest feedback.

## Features

- **Job Application Tracker**: Track company, role, status, and dates.
- **Resume Version Management**: Compare performance of different resume versions.
- **Ghosting Detection**: Automatically flags applications with no response.
- **Analytics**: Daily activity, outcome distribution, and resume performance.
- **PWA**: Installable on mobile and desktop.

## Tech Stack

- **Frontend**: Next + TypeScript + Vite
- **Styling**: Vanilla CSS (Variables based theme)
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Charts**: Recharts

## Setup Instructions

1.  **Supabase Setup**:
    *   Create a new project on [Supabase](https://supabase.com/).
    *   Go to the SQL Editor and run the contents of `supabase_schema.sql` to create the tables and security policies.
    *   Go to Project Settings -> API and copy the `Project URL` and `anon` public key.

2.  **Environment Variables**:
    *   Rename `.env.example` to `.env` (or create `.env` if not exists).
    *   Add your Supabase credentials:
        ```
        VITE_SUPABASE_URL=your_project_url
        VITE_SUPABASE_ANON_KEY=your_anon_key
        ```

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## PWA

The app is configured as a PWA. To test the installability, build the app and serve it, or use the dev server (Vite PWA plugin is configured for dev too, but works best in build).

## Project Structure

- `src/components`: Reusable UI components (Layout, etc.)
- `src/pages`: Application pages (Dashboard, Applications, etc.)
- `src/lib`: Supabase client and API service.
- `src/types`: TypeScript definitions.
- `src/index.css`: Global styles and theme variables.
