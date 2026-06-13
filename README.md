# FoundryForge 🛠️
### *AI-Powered Software Architect & Design Planner*

**FoundryForge** is an innovative, creative developer tool built for the **Agents League Hackathon – Creative Apps** track. It serves as an **Idea Brainstormer & Design Assistant** that helps software developers collaboratively plan, structure, and compliance-check their software ideas before writing code. 

Instead of jumping straight to code generation, FoundryForge guides users through a structured, multi-step **8-Stage Reasoning Pipeline** (Requirements -> Clarification -> Design -> Database -> Folder Structure -> Security -> Development Roadmap -> Boilerplate Generation).

---

## ✨ Core Features

*   **8-Stage Architectural Pipeline:** Standardized steps loaded dynamically in an interactive, equal-height **Swiper Carousel** view.
*   **Grounded Knowledge (Foundry IQ):** Connects to **Microsoft Azure AI Foundry / Azure AI Search** to query grounded compliance data and design patterns, preventing AI hallucinations.
*   **Stateless Serverless MCP Server:** A built-in Model Context Protocol (MCP) server deployed on Vercel Node runtime. It exposes a `query_foundry_iq` tool to **GitHub Copilot Chat** and **Codex Desktop** clients.
*   **Out-of-Scope Query Filtering:** The MCP server automatically intercepts general knowledge queries (like geography) that are outside the software scope, informing the client instead of providing false matches.
*   **No-Login Guest Mode:** Full offline capability. Users can brainstorm and save all session history to `localStorage` without authenticating.
*   **Cloud Synchronization:** Optional authentication via **Firebase Auth** to automatically sync local session history to a **Cloud Firestore** database.

---

## 🛠️ Technology Stack

*   **Frontend:** React, Vite, Tailwind CSS, Zustand (State Management), Framer Motion (Animations), Swiper (Carousel Slider).
*   **APIs / Serverless:** Vercel Serverless Functions (Node.js runtime).
*   **Database & Auth:** Firebase Auth & Cloud Firestore.
*   **AI & Search (Microsoft IQ):** Microsoft Azure AI Foundry Agent (Foundry IQ) & Azure AI Search index (`foundryforgesrch`).

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd FoundryForge
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```
*Note: Set your Azure AI Foundry client credentials (`AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `FOUNDRY_ENDPOINT`) in your local `.env` for testing, and configure them securely in your Vercel Project Dashboard for production.*

### 3. Run the App
To run the Vite frontend only:
```bash
npm run dev
```

To run both the frontend and compile the `/api` serverless functions (required for testing the MCP server locally):
```bash
npm install -g vercel
vercel dev
```

---

## 🔌 Connecting GitHub Copilot to FoundryForge MCP

You can query your FoundryForge architectural index directly inside VS Code's Copilot Chat.

1. Open your VS Code `settings.json`.
2. Add the `github.copilot.mcp` block:
```json
"github.copilot.mcp": {
    "foundryforge-mcp": {
        "type": "sse",
        "url": "https://<your-vercel-domain>.vercel.app/api/mcp/sse"
      }
}
```
*(Or use `http://localhost:3000/api/mcp/sse` when running `vercel dev` locally).*

3. Chat with Copilot:
> *"Use the foundryforge-mcp tool to query React coding standards"*

---


