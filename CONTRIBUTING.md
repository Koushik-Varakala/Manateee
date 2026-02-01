# Contributing to Manateee 🧜‍♂️💙

First off, thank you for considering contributing to Manateee! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (or a connection string to a remote DB like Neon)

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/Koushik-Varakala/Manateee.git
    cd Manateee
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env` (or create one) and add your database URL:
    ```env
    DATABASE_URL=postgresql://user:pass@host/dbname
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    This starts the Express server, Vite frontend, and Astro submodule concurrently.

### 🏗️ Project Structure
Manateee is a monorepo-style application:
- **`/client`**: React frontend (Vite)
- **`/server`**: Express backend (Node.js)
- **`/moodist-main`**: Astro sub-application for ambient sounds
- **`/shared`**: Shared TypeScript schemas and types

## 🤝 How to Contribute

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'feat: Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

## 🧩 Style Guide

- **Commits**: We use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `docs:`).
- **Code Style**: Please ensure your code matches the existing style (Tailwind for CSS, functional components for React).
- **Linting**: Run `npm run check` before pushing to ensure no type errors.

## 🐛 Reporting Bugs

If you find a bug, please open an issue describing:
1.  What happened.
2.  What you expected to happen.
3.  Steps to reproduce.

---
**Thank you for helping us create a safe harbor for mental health support!** 💙
