# AI Research Funding & Innovation Platform

A full-stack research funding and innovation intelligence platform for researchers, universities, startups, and R&D teams. The application combines a React frontend with a FastAPI backend to support user authentication, profile management, funding discovery, research trend analysis, patent intelligence, AI-guided innovation insights, dashboard analytics, and report generation.

## Features

- User registration and login with JWT authentication
- Protected application routes and profile management
- Funding discovery and recommendation workflows
- Research trend and intelligence views
- Patent discovery and analytics
- Gemini-powered innovation analysis and scoring
- Dashboard summaries and PDF-style report generation
- Responsive frontend experience for desktop and tablet use

## Tech Stack

- Frontend: React, Vite, React Router, Chart.js, Lucide icons
- Backend: Python, FastAPI, SQLAlchemy, Pydantic, JWT auth
- Data: SQLite for local development and PostgreSQL-ready configuration for production
- AI: Google Gemini integration via the official Python SDK

## Project Structure

- backend/app: FastAPI application modules, routers, schemas, services, and database configuration
- frontend/src: React pages, components, context providers, and API integration
- requirements.txt: Python backend dependencies
- frontend/package.json: Frontend dependencies and scripts

## Environment Variables

Copy .env.example to .env and update the values before running the app locally.

Required variables:
- PORT: Backend port (default: 5001)
- JWT_SECRET: Secret key for JWT creation and validation
- DATABASE_URL: PostgreSQL connection string for production or local testing
- GEMINI_API_KEY: Optional Gemini API key for AI features
- VITE_API_BASE_URL: Frontend API base URL

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python backend/app/seed.py
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 5001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173 and the backend at http://localhost:5001.

## Notes for GitHub and Deployment

- Keep secrets out of the repository; use .env locally and add it to your ignore rules.
- The project is organized to support deployment on a variety of hosting platforms later without introducing platform-specific deployment files.
- The current configuration is suitable for local development and can be adapted to production environments via environment variables.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
