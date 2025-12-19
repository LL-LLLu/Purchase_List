# Purchase Tracker

A full-stack Next.js application for tracking personal purchases, based on a provided template.

## Features

- **Store-like Listing**: View purchases in a grid with filters for Category, Year, and Store.
- **Detail View**: Click any item to see full details and user reviews.
- **Admin Dashboard**: Manage your inventory at `/admin` (Settings).
  - Add new purchases.
  - Create new Categories, Stores, and Years.
  - Delete items.
  - **Password Protected**: Requires login. Default password is `secret_password`.
- **Database**: Uses Prisma with SQLite (local development).

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Initialize Database**:
    ```bash
    npx prisma migrate dev --name init
    npx tsx prisma/seed.ts
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open Browser**:
    Visit [http://localhost:3000](http://localhost:3000).

## Configuration

- **Admin Password**: Set `ADMIN_PASSWORD` in `.env`. Default is `admin` if not set (or `secret_password` in provided `.env`).

## Deployment to Vercel

This project is configured for local development using SQLite. To deploy to Vercel, you should switch to Vercel Postgres:

1.  Create a Vercel Postgres database.
2.  Update `.env` with the Vercel Postgres connection string (`POSTGRES_PRISMA_URL` etc.).
3.  Update `prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url = env("POSTGRES_PRISMA_URL") // or similar
    }
    ```
4.  Run `prisma migrate deploy` during build or via Vercel dashboard integration.
