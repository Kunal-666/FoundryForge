# FF-022: Portfolio Website Blueprint

This document defines the standard architecture, page requirements, and page lists for personal and professional portfolio websites built on the FoundryForge platform.

## Standard Page List Requirements
A standard, high-converting portfolio website must consist of the following pages:

1.  **Home Page (Landing):**
    *   **Hero Section:** A strong hook introducing who you are, your title, and a call-to-action (CTA) to "View Work" or "Contact Me".
    *   **Value Statement:** A brief summary of your core skills and what you bring to the table.
    *   **Featured Projects:** A preview grid of your top 2-3 projects.
    *   **Testimonials / Client Quotes:** Social proof validating your skills.

2.  **About Page:**
    *   **Biography:** A professional story explaining your background, journey, and passion.
    *   **Core Capabilities:** Bulleted breakdown of your technical skills, tools, and methodologies.
    *   **Certifications / Education:** List of qualifications and achievements.

3.  **Projects Page (Portfolio Gallery):**
    *   **Filterable Grid:** A list of projects filterable by category (e.g., frontend, full-stack, design).
    *   **Project Details View:** Case studies detailing the problem, solution, tech stack, and your role for each project.

4.  **Resume / Experience Page:**
    *   **Interactive Timeline:** Chronological list of work experience and roles.
    *   **Downloadable PDF Link:** A clear button to download a printer-friendly resume.

5.  **Contact Page:**
    *   **Contact Form:** A secure form validating inputs before sending.
    *   **Alternative Contact Info:** Links to email, GitHub, LinkedIn, and Twitter/X.

---

## Technical Stack Selection Guide
For portfolio websites, the recommended architecture is:
-   **Frontend:** React, Next.js (SSG/ISR for fast loading and SEO), or Vite.
-   **Styling:** Tailwind CSS or Vanilla CSS.
-   **Hosting:** Vercel, Netlify, or Firebase Hosting.
-   **Forms:** Formspree, Web3Forms, or serverless API routes.
