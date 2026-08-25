# Local Services Marketplace — Backend API

FastAPI backend for the Local Services Marketplace. Connects customers with local service providers via AI-powered request classification, quoting, and reviews.

## Tech Stack

- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** JWT (python-jose) + bcrypt password hashing
- **Validation:** Pydantic v2
- **AI Integration:** httpx calls to an external AI microservice

## Prerequisites

- Python 3.11+
- PostgreSQL database (`marketplace_db`) with tables already created
- (Optional) The AI microservice running at `AI_SERVICE_URL`

## Setup

```bash
# 1. Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your real DATABASE_URL and SECRET_KEY

# 4. Stamp existing database (tables are pre-created)
alembic stamp head

# 5. Run the server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

## API Endpoints Overview

### Auth
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register (customer/provider/admin) |
| POST | `/api/v1/auth/login` | Public | Login → JWT |
| GET | `/api/v1/auth/me` | Auth | Current user info |
| PUT | `/api/v1/auth/me` | Auth | Update current user |

### Categories
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/categories` | Public | List all |
| GET | `/api/v1/categories/{id}` | Public | Get one |
| POST | `/api/v1/categories` | Admin | Create |
| PUT | `/api/v1/categories/{id}` | Admin | Update |
| DELETE | `/api/v1/categories/{id}` | Admin | Delete |

### Providers
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/providers` | Provider | Create profile |
| GET | `/api/v1/providers` | Public | List (filter by category/location) |
| GET | `/api/v1/providers/{id}` | Public | Full profile |
| PUT | `/api/v1/providers/{id}` | Provider (owner) | Update profile |
| POST | `/api/v1/providers/{id}/generate-bio` | Provider (owner) | AI bio generation |
| PATCH | `/api/v1/providers/{id}/status` | Admin | Approve/suspend |
| GET | `/api/v1/providers/{id}/reviews` | Public | Provider reviews |
| POST | `/api/v1/providers/{id}/summarize-reviews` | Provider (owner) | AI review summary |

### Service Requests
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/requests` | Customer | Create (AI matching) |
| GET | `/api/v1/requests/{id}` | Customer/Provider | Get (if participant) |
| GET | `/api/v1/requests?customer_id=` | Customer | My requests |
| GET | `/api/v1/requests?provider_id=` | Provider | My incoming |
| PATCH | `/api/v1/requests/{id}/status` | Customer/Provider | Status transition |
| POST | `/api/v1/requests/{id}/quote` | Provider (matched) | Submit quote |

### Messages
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/requests/{id}/messages` | Customer/Provider | Send message |
| GET | `/api/v1/requests/{id}/messages` | Customer/Provider | Get chat history |

### Reviews
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/reviews` | Customer | Review completed request |

### Admin
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/admin/overview` | Admin | Dashboard counts |
| GET | `/api/v1/admin/requests` | Admin | All requests |
| GET | `/api/v1/admin/providers` | Admin | All providers |

### Support
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/support/chat` | Public | AI support chatbot |

## Status Flow

```
submitted → matched → quoted → accepted → in_progress → completed
                                                         ↑
cancelled ← submitted | matched | quoted | accepted      (not from completed)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `ALGORITHM` | JWT algorithm (default: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (default: 1440) |
| `AI_SERVICE_URL` | URL of the AI microservice |

## Project Structure

```
backend/
├── app/
│   ├── api/           # Route handlers
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic & AI client
│   ├── core/          # Config, DB, security
│   └── main.py        # FastAPI entrypoint
├── alembic/           # Database migrations
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```
