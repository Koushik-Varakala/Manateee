# Manateee 🧜‍♂️💙
### *Find Comfort. Find Community. Find Yourself.*

> **"A safe harbor in the vast ocean of life."**  
> Manateee is a comprehensive peer-to-peer mental health support platform designed to connect people who need to talk with those willing to listen.

---

## 🌟 Overview

**Manateee** (formerly Menti Support) solves the problem of accessible, immediate, and anonymous emotional support. In a world where professional therapy can be expensive or unavailable, and loneliness is an epidemic, Manateee provides a bridge for human connection.

It is a **real-time, full-stack web application** that combines:
1.  **Anonymous Peer Support**: Instant matching for 1-on-1 confidential chats.
2.  **Recovery Tools**: A dedicated dashboard for sobriety tracking, milestones, and 12-step programs.
3.  **Community**: Group sessions and safe spaces for shared experiences.
4.  **Moodist Integration**: Built-in ambient soundscapes to reduce anxiety and aid focus.

---

## ✨ Key Features

### 🗣️ 1-on-1 Anonymous Chat
*   **Intent-Based Matching**: Users select their role—*"I want to talk", "I want to listen", or "Both"*.
*   **Real-Time**: Powered by **Socket.IO** for instant, latency-free messaging.
*   **Privacy First**: No identities revealed. Just human connection.
*   **Service Ratings**: Listeners are rated to ensure quality support.

### 🛡️ Recovery Dashboard
*   **Sobriety Clock**: Visual tracking of recovery progress (Years, Months, Days).
*   **Milestones & Badges**: Gamified achievements (e.g., "Recovery Anchor", "Willing Heart") to celebrate consistency.
*   **12-Step Tracker**: integrated digital journal for the 12-step recovery program.
*   **Service Stats**: Tracks the impact user's have on others via listening.

### 👥 Group Support Rooms
*   **Topic-Based Rooms**: Join or host sessions on specific topics (Anxiety, Depression, General Chat).
*   **Live Participation**: Multiple users in a shared, moderated environment.

### 🍃 Moodist Integration (Ambient Focus)
*   Integrated full access to **Moodist**, an ambient noise generator.
*   **Soundscapes**: Rain, Forest, Cafe, Plane, and more.
*   **Focus Tools**: Pomodoro timer and breathing exercises built-in.

### 🚨 SOS Emergency Support
*   One-click access to immediate crisis resources.
*   Priority queueing for users in distress.

---

## 🛠️ Technical Stack

Manateee is built as a robust **Monorepo** application.

### **Frontend**
*   **Framework**: [React](https://react.dev/) (v18) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: 
    *   **Tailwind CSS**: For utility-first responsive design.
    *   **Shadcn UI** & **Radix UI**: For accessible, high-quality component primitives.
    *   **Framer Motion**: For smooth UI transitions and animations.
*   **Routing**: `wouter` for lightweight, flexible client-side routing.
*   **State Management**: `TanStack Query` (Server state) & `Zustand` (Client state).

### **Backend**
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (managed by Neon.tech).
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions.
*   **Real-Time Engine**: [Socket.IO](https://socket.io/) for bidirectional event-based communication.
*   **Authentication**: `Passport.js` (Local Strategy) + `express-session` with Postgres backing.

### **Sub-Module: Moodist**
*   **Framework**: [Astro](https://astro.build/) (for high-performance static content).
*   **Audio**: `Howler.js` for web audio management.

---

## 🏗️ Architecture & Deployment

The project follows a modern Feature-First architecture:

```
/
├── client/              # React Frontend
│   ├── src/components   # Shadcn + Custom Components
│   └── src/pages        # Route Views (Home, Chat, Recovery)
├── server/              # Express Backend
│   ├── routes.ts        # API & Socket Definitions
│   └── storage.ts       # Database access layer (Drizzle)
└── moodist-main/        # Integrated Astro Sub-application
```

*   **Deployment**: Hosted on **Render**.
*   **Build Pipeline**: Custom build script (`script/build.ts`) that orchestrates the concurrent building of the React client, Astro submodule, and Node server into a single optimized artifact.

---

## 📸 Gallery

*(Screenshots of the new Manateee Dashboard, Recovery Page, and Chat Interface)*

*   **Dashboard**: Featuring a clean, 3-column layout "Manatee" aesthetic with soft greens and rounded interfaces.
*   **Mobile Experience**: Fully responsive design ensuring help is available on any device.

---

## 🚀 Getting Started

To run Manateee locally:

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
    Create a `.env` file with your Database URL:
    ```env
    DATABASE_URL=postgresql://user:pass@host/dbname
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 🤝 Contribution & Contact

Developed by **Koushik Varakala**.  
Passionate about using technology to solve human problems.

[LinkedIn]([https://linkedin.com/in/koushik-varakala](https://www.linkedin.com/in/koushik-varakala-8a0a1725b/)) | [GitHub](https://github.com/Koushik-Varakala)
