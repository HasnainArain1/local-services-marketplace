# Local Services Marketplace — AI Engine

> **Qodex Software Internship Group Project — Owner 4: AI Developer**
> Standalone AI microservice built with FastAPI and Google Gemini AI.

---

## Overview

This is the AI Engine microservice for the Local Services Marketplace platform. It exposes 4 REST API endpoints that the backend team can call to power AI features across the app.

---

## 4 AI Features

| Endpoint | Method | Description |
|---|---|---|
| `/ai/match` | POST | Matches a customer's free-text request to the best service category using local embeddings and cosine similarity |
| `/ai/generate-bio` | POST | Auto-generates a professional 2-paragraph biography for a provider from their raw intake form data |
| `/ai/summarize-reviews` | POST | Reads all reviews for a provider and extracts structured Strengths and Weaknesses as JSON |
| `/ai/chat` | POST | RAG-powered support chatbot that answers customer questions using the platform FAQ |

---

## Tech Stack

- **FastAPI** — Web API framework
- **Google Gemini 3.5 Flash** — Text generation (bio, summarizer, chatbot)
- **SentenceTransformers (`all-MiniLM-L6-v2`)** — Local embedding model for semantic search
- **Cosine Similarity (NumPy)** — Vector matching for matching engine and RAG

---

## Run Locally

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Set your API key
Create a `.env.local` file:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the server
```bash
uvicorn main:app --reload
```

Open the interactive API docs at: `http://localhost:8000/docs`

### 4. Run the test script
```bash
python test.py
```

---

## Sample API Requests

### Match a customer request
```json
POST /ai/match
{
  "customer_request": "My kitchen sink is leaking everywhere"
}
```
**Response:**
```json
{
  "status": "success",
  "matched_category_id": "cat_01",
  "matched_category_name": "Plumbing",
  "confidence_score": 0.53
}
```

### Generate a provider bio
```json
POST /ai/generate-bio
{
  "provider_name": "Sarah Jenkins",
  "skills": ["deep cleaning", "window washing", "organization"],
  "years_experience": 8,
  "tone": "Professional"
}
```

### Summarize reviews
```json
POST /ai/summarize-reviews
{
  "reviews": [
    "She was amazing, my house has never been cleaner!",
    "Arrived 20 minutes late, but did great work.",
    "A bit expensive but worth the quality."
  ]
}
```

### Chat with support bot
```json
POST /ai/chat
{
  "user_message": "What happens if my cleaner never shows up?"
}
```
**Response:**
```json
{
  "status": "success",
  "response": "If your provider does not show up, you will automatically receive a full 100% refund."
}
```

---

## Architecture Note

This service is **fully independent**. It uses only dummy categories and a local FAQ document. When the backend team is ready, they simply swap dummy data for real database records and point their API calls to these endpoints — no changes to the AI logic required.
