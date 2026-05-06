<div align="center">
  <img src="frontend/public/favicon.svg" alt="TalentMatch logo" width="80" />
  <h1>TalentMatch AI</h1>
  <p><strong>Enterprise-Grade AI Recruitment & Technical Screening Platform</strong></p>

  <!-- Badges -->
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.0-blue?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-Backend-black?style=flat-square&logo=flask" alt="Flask" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" /></a>
  <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/AI_Engine-Gemini_2.5-8B5CF6?style=flat-square&logo=google" alt="Gemini" /></a>
</div>

<br />

TalentMatch is an advanced recruitment automation platform built for modern hiring teams. It utilizes specialized Natural Language Processing (NLP) to parse candidate resumes, calculate technical proficiency, and autonomously conduct structured technical interviews.

By eliminating human bias during initial screening, TalentMatch identifies the top candidates based objectively on data and metrics.

## ✨ Core Features

*   **Intelligent CV Parsing (Zero-API):** Extracts, categorizes, and scores technical skills directly from PDFs and DOCX files using local `spaCy` NLP pipelines.
*   **Adaptive AI Interviews:** Seamless integration with **Gemini 2.5 Flash** generates dynamic, personalized technical questions based on the candidate's specific background and the job requirements.
*   **Anti-Cheat Heuristics:** Employs advanced local token analysis to automatically detect and flag LLM-generated (ChatGPT) interview responses, penalizing unauthentic submissions.
*   **Vague Answer Follow-Ups:** Intelligent dialog branching detects "fluff" or overly short answers, automatically requesting the candidate to elaborate on technical specifics.
*   **Enterprise Dashboard:** A beautiful, JWT-protected dashboard featuring a sleek "Atelier Noir" dark mode. It provides HR with real-time application pipelines, ranked top picks, and full interview transcripts.

---

## 🛠 Tech Stack

### Frontend Architecture
*   **Framework:** React 18 / TypeScript
*   **Build Tool:** Vite
*   **Styling:** TailwindCSS + Framer Motion (Glassmorphism & Parallax animations)
*   **Routing:** React Router DOM

### Backend Architecture
*   **API:** Python & Flask
*   **AI Engine:** Google Gemini SDK (`gemini-2.5-flash`)
*   **NLP / Scoring:** `spaCy` (`en_core_web_sm`), `scikit-learn` (TF-IDF Similarity)
*   **Database:** Persistent SQLite (Ephemeral-safe structure)

---

## 🚀 Getting Started

### 1. Backend Setup

The backend handles the AI models and the SQLite database. Ensure you have Python 3.10+ installed.

```bash
cd backend

# Create a virtual environment and install dependencies
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Download the required NLP model
python -m spacy download en_core_web_sm
```

Configure your environment variables inside the `.env` file at the root:

```ini
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=secureAdmin2026
```

For production frontend builds, also set the API base URL in Vercel:

```bash
VITE_API_URL=https://your-huggingface-space-url.hf.space
```

or

```bash
VITE_API_BASE_URL=https://your-huggingface-space-url.hf.space
```

Start the Flask server:
```bash
python -m flask --app app run --port 5000 --debug
```

### 2. Frontend Setup

The frontend runs an ultra-fast Vite dev server.

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Admin Access

By default, the dashboard relies on the environment variables defined in your `.env`. If none are provided, the platform defaults to fallback credentials. Navigate to the top-right of the Landing Page and click **Recruiter Access** to view candidate pipelines and transcripts.

---

## 📦 Deployment Guide

To deploy this project to production, the recommended architecture is:

1.  **Frontend:** Hosted on [Vercel](https://vercel.com) (via GitHub integration).
2.  **Backend:** Hosted on [Hugging Face Spaces](https://huggingface.co/spaces) or another persistent Python host.
    *   *Recommended:* use `VITE_API_URL` or `VITE_API_BASE_URL` on Vercel to point the frontend to your backend URL.
    *   *Note on Serverless:* Vercel's backend functions are stateless and reset constantly. You **cannot** use Vercel for the Python backend if you need persistent SQLite storage, because the file may be wiped.

## 📄 License
This project is licensed under the MIT License.

<div align="center">
  <br />
  Built with ❤️ for better hiring experiences.
</div>
