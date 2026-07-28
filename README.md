# Webmine Media

High-velocity web design and cloud hosting infrastructure. A premium, modern responsive web application built with HTML, Tailwind CSS, and a Node.js/Express backend. Ready to host.

## Features
*   **Responsive UI**: Modern, dark-themed responsive website. Automatically adjusts layouts, typography, and menus between mobile and desktop viewport sizes.
*   **Premium Interactive Components**: Integrates clean grid services, mac-style browser decorators, glassmorphism, and custom hover states.
*   **Onboarding Portal**: Dedicated `/get-started` page that securely validates and transmits project inquiry inputs.
*   **Express Backend**: Minimalist Node.js API with custom persistence to local database structure (`submissions.json`).
*   **Zero-Dependency Form Handling**: Forms are transmitted asynchronously using modern `fetch` APIs without page reloads.

## Project Structure
```
├── public/
│   ├── index.html        # Responsive unified homepage
│   ├── get-started.html  # Onboarding inquiry form
│   └── styles.css        # Custom premium utilities and design styles
├── server.js             # Express.js backend and routing API
├── package.json          # Dependency and startup script configs
└── submissions.json      # Local persistent submissions store (JSON database)
```

## Local Development
1. Clone the repository and navigate to the root directory:
   ```bash
   git clone <repo-url>
   cd WebMineMedia
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. Open your browser and head to **[http://localhost:3000/](http://localhost:3000/)** to preview the site.

## Deployment & Hosting
This project is configured to read from `process.env.PORT` and serve static assets out of the box. It is ready for hosting on Vercel, Render, Heroku, or digital private servers.
