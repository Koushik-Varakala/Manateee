# Deploying Menti-Support (Free Tier)

This guide shows you how to deploy the Menti-Support application (Frontend + Backend + Moodist) to **Render.com** with a **Neon** Postgres database for free.

## Prerequisites
1.  **GitHub Account**: You need to push this code to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **Neon Account**: Sign up at [neon.tech](https://neon.tech) (for the database).

## Step 1: Push to GitHub
If you haven't already:
1.  Create a new repository on GitHub.
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <your-repo-url>
    git push -u origin main
    ```

## Step 2: Set up Database (Neon)
1.  Log in to [Neon Console](https://console.neon.tech).
2.  Create a new Project (e.g., `menti-db`).
3.  Copy the **Connection String** (e.g., `postgres://user:pass@...`).
    *   *Note: Select "Pooled connection" if available, but direct is fine for low traffic.*

## Step 3: Deploy to Render
1.  Log in to the [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `menti-support`
    *   **Region**: Closest to you (e.g., Oregon, Frankfurt).
    *   **Branch**: `main`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
        *   *Note: Our updated build script handles the client, server, and moodist components.*
    *   **Start Command**: `npm start`
    *   **Instance Type**: `Free`

5.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these:
    *   `DATABASE_URL`: Paste your Neon connection string here.
    *   `SESSION_SECRET`: Any long random string (e.g., `super_secret_key_123`).
    *   `NODE_ENV`: `production`

6.  Click **Create Web Service**.

## Step 4: Verify
Render will start the build. It may take a few minutes (installing dependencies for root and moodist, then building everything).
Once it says "Live", click the URL (e.g., `https://menti-support.onrender.com`).

*   **Home**: Your main app.
*   **Moodist**: `https://your-app.onrender.com/moodist`

## Troubleshooting
*   **Build Failures**: Check the logs. If `moodist-main` fails to install, ensure the folder exists in your repo.
*   **Database Errors**: specific connection errors usually mean the `DATABASE_URL` is wrong or the IP is blocked (Neon allows all IPs by default).

