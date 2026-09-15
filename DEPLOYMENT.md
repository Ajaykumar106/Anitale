# Deployment Checklist

This document contains the step-by-step instructions to deploy Anitale to a production environment (such as Vercel, Railway, or AWS).

## 1. Prerequisites

Before deploying, ensure you have the following third-party credentials:
- **TMDB API Key** (for fetching Movies/Anime/Shows metadata)
- **GitHub OAuth Credentials** (for NextAuth)
- **Google OAuth Credentials** (for NextAuth)
- **PostgreSQL Database URL** (e.g., Supabase, Neon, AWS RDS, Railway)

## 2. Environment Variables

Set the following environment variables in your production hosting platform:

```env
# Core Next.js / NextAuth
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate_a_random_32_char_string

# Database
DATABASE_URL=postgres://user:password@host:port/database

# TMDB Provider
TMDB_API_KEY=your_tmdb_api_key

# OAuth Providers
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

# Internal Security
CRON_SECRET=generate_a_secure_token_for_cron_jobs
```

## 3. Database Migration

During the deployment build step, or manually against your production database, you must run the Prisma migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

> **Note**: Do not use `prisma db push` in production. Always use `migrate deploy`.

## 4. Cron Jobs (Background Workers)

Anitale utilizes an asynchronous queue for synchronizing releases and processing analytics. 

If deploying to Vercel, `vercel.json` supports native cron jobs. Otherwise, set up an external ping (e.g., GitHub Actions, AWS EventBridge, or cron-job.org) to hit the following endpoint every 5 minutes:

- **URL**: `https://your-domain.com/api/cron/process-jobs`
- **Method**: GET
- **Header**: `Authorization: Bearer <CRON_SECRET>`

## 5. Security & First Admin

Once deployed, the first user to log in will be granted the `USER` role. To grant yourself administrative privileges:
1. Log into your database (via pgAdmin, psql, or Supabase UI).
2. Find your user record in the `User` table.
3. Update your `role` column to `SUPER_ADMIN`.
4. Log out and log back in to access the `/admin` dashboard.

## 6. Smoke Testing

Run the health check endpoint to verify production systems are online:

```bash
curl -I https://your-domain.com/api/health
```

Check the Admin Dashboard `System Health` tab to verify Database latency and Node.js environment variables.
