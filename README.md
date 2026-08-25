# Local Services Marketplace & AI Ecosystem

A full-stack, AI-powered platform for connecting local service providers with customers.

## Project Structure

- `web-frontend/`: React + Vite web dashboard for Customers, Providers, and Administrators.
- `mobile-app/`: React Native (Expo) cross-platform mobile application.
- `backend/`: FastAPI Python REST API & database service.
- `ai-services/`: Python microservice (Groq LLM + SentenceTransformers RAG FAQ matching engine).


## How to Run Each Service

### 1. AI Microservice (`ai-services`)
cd ai-services
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --reload --port 8001

### 2. Backend API (`backend`)
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --port 8000

### 3. Web Frontend (`web-frontend`)
cd web-frontend
npm install
cp .env.example .env
npm run dev

### 4. Mobile App (`mobile-app`)
cd mobile-app
npm install
cp .env.example .env
npm run web

