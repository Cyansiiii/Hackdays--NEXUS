# ✦ NEXUS — AI-Powered Exam Question Analyzer

> **MLH Hackathon Project** · Built with Gemini 2.0 Flash + FastAPI + React

NEXUS (also called **Quin v2**) is a full-stack AI tool that analyzes previous year question papers (PYQs) and returns:

- 🎯 **Exact matches** — questions repeated verbatim across years
- 🔗 **Semantic matches** — same topic, different wording
- 📊 **Topic frequency heatmap** — which chapters appear most per year
- 🔄 **Evolution patterns** — trending, declining, and new topics
- 💡 **Study recommendations** — priority order to maximize marks
- 🔮 **Predicted questions** — most likely questions for the next exam

---

## 🚀 How It Works

```
Upload PDFs (2021, 2022, 2023, 2024)
        ↓
FastAPI uploads each to Gemini File API
        ↓
Single Gemini 2.0 Flash call reads ALL PDFs natively
        ↓
Returns structured JSON analysis
        ↓
React dashboard renders 6-tab results
```

**Old approach:** 7 separate AI tools → 7 API calls → many failure points  
**NEXUS approach:** 1 Gemini call → instant structured output ✅

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Framer Motion |
| Backend | FastAPI (Python) |
| AI Engine | Gemini 2.0 Flash via Google AI SDK |
| PDF Layer | Gemini File API (native PDF understanding) |
| Storage | In-memory (stateless) |

---

## 📁 Folder Structure

```
quin-v2/
├── backend/
│   ├── main.py            ← FastAPI app (/analyze endpoint)
│   ├── gemini.py          ← Gemini File API + prompt logic
│   ├── requirements.txt   ← Python dependencies
│   └── .env               ← GEMINI_API_KEY (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← 3-phase state machine
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx   ← Drag & drop PDF upload
│   │   │   ├── LoadingPage.jsx  ← Animated progress
│   │   │   └── ResultsPage.jsx  ← 6-tab results dashboard
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   └── index.css            ← Dark premium design system
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚙️ Setup & Run

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

---

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at → **http://localhost:8000**  
Swagger docs → **http://localhost:8000/docs**

---

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

## 🔌 API Reference

### `POST /analyze`

Accepts multipart form data.

| Field | Type | Description |
|---|---|---|
| `subject` | string | Exam subject name |
| `years` | JSON string | Array of year labels e.g. `["2021","2022"]` |
| `files` | PDF files | One file per year, same order as `years` |

**Response:** Structured JSON with all 6 analysis sections.

### `GET /health`

Returns `{"status": "ok", "version": "2.0.0"}`

---

## 📊 Output JSON Schema

```json
{
  "subject": "Engineering Mathematics",
  "years_analyzed": ["2021", "2022", "2023"],
  "total_questions_analyzed": 45,
  "exact_matches": [...],
  "semantic_matches": [...],
  "topic_frequency": [...],
  "evolution_patterns": {
    "trending": [...],
    "declining": [...],
    "new_topics": [...],
    "consistent": [...]
  },
  "recommendations": [...],
  "predicted_questions": [...]
}
```

---

## 🎨 UI Screens

| Screen | Description |
|---|---|
| **Upload** | Drag & drop up to 8 PDFs, assign year to each |
| **Loading** | Animated step-by-step progress while Gemini analyzes |
| **Results** | 6-tab dashboard with all insights |

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google AI Studio API key |

Get a key at: https://aistudio.google.com/apikey

> **Note:** Enable billing on your key to avoid free-tier rate limits during demos. Gemini 2.0 Flash costs ~$0.075/1M tokens.

---

## 👥 Team

Built at **MLH Hackathon** — NEXUS / Hackdays

---

## 📄 License

MIT
