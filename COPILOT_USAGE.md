# GitHub Copilot Usage Journey: FoundryForge

This document details how **GitHub Copilot** was utilized during the development of **FoundryForge** for the *Agents League Hackathon – Creative Apps* track.

## 🚀 Accelerating Frontend UI Development
FoundryForge is built with a highly polished React + Vite + Tailwind CSS frontend. Copilot was critical in speeding up the development of complex interactive UI components:
*   **Swiper Carousel Slider Integration:** In the landing page, we wanted to showcase the "AI Architecture Pipeline" steps dynamically rather than in a static grid. Copilot helped write the breakpoints, autoplay configurations, and layout styling to fit perfectly with Tailwind.
*   **Framer Motion Animations:** Copilot assisted in creating fluid, elegant entry and exit animations for our workspace views, making the transition between pages feel premium and modern.
*   **Aesthetic Styling:** Guided by design suggestions from Copilot, we chose HSL color palettes and modern glassmorphic overlays to create a cohesive dark mode theme.

---

## 🛠️ Building the Stateless MCP Server
One of the most complex parts of the project was designing and implementing the Model Context Protocol (MCP) server for Vercel Serverless Functions.
*   **JSON-RPC Protocol Design:** Copilot was used to write the stateless HTTP JSON-RPC 2.0 router in `api/mcp.ts`. It helped implement validation for the `initialize`, `tools/list`, and `tools/call` methods without introducing bloated external dependencies.
*   **Vercel Routing Adaptations:** When deploying to Vercel, the default edge runtime timed out due to Node-specific network libraries. We used Copilot Chat to debug the bundler errors and transition the API handler to a standard Node.js serverless runner using Express-like `(req, res)` adapter endpoints.

---

## 💡 Collaborative Problem Solving & Debugging
Throughout the coding process, Copilot acted as an interactive partner:
*   **Firebase Connection State Handling:** Copilot assisted in refactoring the auth state management so that the application is fully usable without logging in, saving prompt history locally in `localStorage` when offline or unauthenticated, and syncing to Firestore only when the user is signed in.
*   **Clean Architecture and Types:** Generated precise TypeScript interfaces for the pipeline stages, history items, and message payloads, ensuring strict type-safety across stores (Zustand) and views.
