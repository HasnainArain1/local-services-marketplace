from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import numpy as np

load_dotenv(".env.local")
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

app = FastAPI(title="Local Services AI Engine")

# ── Embedding Model ────────────────────────────────────────────────────────────
print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ── Service Categories ─────────────────────────────────────────────────────────
CATEGORIES = [
    {"id": "cat_01", "name": "Plumbing",           "desc": "Fixing leaks, installing pipes, repairing toilets, and unblocking drains."},
    {"id": "cat_02", "name": "House Cleaning",      "desc": "General home cleaning, dusting, mopping, vacuuming, and deep cleaning."},
    {"id": "cat_03", "name": "Tutoring",            "desc": "Private academic tutoring for math, science, languages, and test preparation."},
    {"id": "cat_04", "name": "Landscaping",         "desc": "Lawn care, gardening, tree trimming, planting, and outdoor maintenance."},
    {"id": "cat_05", "name": "Electrical",          "desc": "Wiring, installing light fixtures, repairing outlets, and panel upgrades."},
    {"id": "cat_06", "name": "Moving Services",     "desc": "Packing, loading, transporting furniture, and full house relocation."},
    {"id": "cat_07", "name": "Personal Training",   "desc": "Fitness coaching, workout plans, weight loss guidance, and strength training."},
    {"id": "cat_08", "name": "Pet Sitting",         "desc": "Dog walking, pet feeding, overnight pet care, and animal boarding."},
    {"id": "cat_09", "name": "Photography",         "desc": "Event photography, portraits, wedding shoots, and professional photo editing."},
    {"id": "cat_10", "name": "Web Development",     "desc": "Building websites, coding, debugging software, and creating online apps."},
    {"id": "cat_11", "name": "AC Repair",           "desc": "Air conditioner installation, gas refill, cooling problems, compressor repair, and AC servicing."},
    {"id": "cat_12", "name": "Painting",            "desc": "Interior and exterior wall painting, wood painting, waterproofing, and surface finishing."},
    {"id": "cat_13", "name": "Carpentry",           "desc": "Furniture repair, door fixing, custom woodwork, cabinet making, and wood installations."},
    {"id": "cat_14", "name": "Home Security",       "desc": "CCTV camera installation, alarm systems, door lock repair, and home security setup."},
    {"id": "cat_15", "name": "Cooking & Catering",  "desc": "Home cooking, event catering, meal preparation, birthday food, and food delivery services."},

    # Added service categories
    {"id": "cat_16", "name": "Appliance Repair",    "desc": "Repairing and servicing refrigerators, washing machines, ovens, microwaves, and other home appliances."},
    {"id": "cat_17", "name": "Pest Control",        "desc": "Removing insects, rodents, termites, cockroaches, ants, and other household pests."},
    {"id": "cat_18", "name": "Car Wash & Detailing","desc": "Car washing, interior cleaning, exterior detailing, polishing, waxing, and vehicle care."},
    {"id": "cat_19", "name": "Computer Repair",     "desc": "Computer troubleshooting, hardware repair, software installation, virus removal, and technical support."},
    {"id": "cat_20", "name": "Plastering & Tiling",  "desc": "Wall plastering, floor tiling, bathroom tiling, tile replacement, grouting, and surface repair."},
]

print("Pre-computing category embeddings...")
for cat in CATEGORIES:
    cat["embedding"] = embedder.encode(cat["name"] + ": " + cat["desc"])

# ── FAQ for Chatbot ────────────────────────────────────────────────────────────
FAQ_DOC = [
    "Refund and No-Show Policy: If a provider does not show up, fails to arrive, misses the appointment, or cancels last-minute, the customer will receive a full 100% automatic refund. Refunds are processed within 2-3 business days.",
    "How AI Matching Works: When you submit a service request, our AI instantly analyzes your description and matches you to the best service category. Local verified providers in that category are then notified and can accept or bid on your job.",
    "Payments and Billing: All payments are processed securely through the app using a credit card, debit card, or digital wallet. Never pay a service provider directly in cash as cash payments are not covered by our buyer protection policy.",
    "Customer Support and Help: If you have an urgent problem, need help, have a complaint, or face any issue on the platform, please call our support hotline at 1-800-LOCAL-SVC or use the in-app live chat available 24/7.",
    "How to Request a Service: To request a service, go to the home screen, tap Browse Categories or use the search bar, describe your problem in your own words, and submit. Our AI will match you instantly.",
    "Provider Verification and Trust: All service providers on our platform are background-checked, identity-verified, and rated by previous customers. You can view their ratings, reviews, and bio before accepting.",
    "How to Cancel a Booking: You can cancel a booking up to 2 hours before the scheduled time for a full refund. Cancellations made less than 2 hours before may incur a small cancellation fee.",
    "How Ratings and Reviews Work: After every completed job, customers are asked to leave a star rating and written review. Provider ratings are calculated as an average of all reviews. Reviews cannot be deleted.",
    "How to Become a Provider: To join as a service provider, download the provider app, complete the signup form with your skills and experience, upload your ID for verification, and wait for approval which takes 1-3 business days.",
    "Service Guarantee and Disputes: If you are not satisfied with the work done, you can open a dispute within 24 hours of job completion. Our team will review the case and may offer a partial or full refund.",
    "How Chat with Provider Works: Once a provider accepts your request, you can chat with them directly through the in-app chat. Sharing contact details outside the app is not recommended for your safety.",
    "Pricing and Quotes: Providers set their own rates. After matching, you will receive quotes from available providers and can compare before choosing. There are no hidden platform fees for customers.",
    "How long does matching take? Matching is instant. Providers are notified within seconds of your request submission and can accept your job immediately.",
    "Can I choose my preferred provider? Yes, after AI matching you will see a list of available verified providers with their ratings and bios. You can pick whichever you prefer.",
    "Is my personal data safe on the platform? Yes, all personal data is fully encrypted using industry-standard security. We never share your information with third parties.",

    # Added FAQ entries
    "How can I reschedule my booking? You can request to reschedule an upcoming booking through the app before the scheduled appointment time. Availability depends on the provider, and you will be notified once the new time is confirmed.",
    "What happens if the provider arrives late? If your provider is running late, you can contact them through the in-app chat to check their estimated arrival time. If the delay causes a serious issue, you can contact customer support for assistance.",
    "Can I edit my service request after submitting it? You can update the details of your service request before a provider accepts the job. Make sure the description accurately explains the work you need so providers can provide suitable quotes.",
    "How do I choose between provider quotes? Compare provider ratings, reviews, experience, bios, availability, and quoted prices before selecting the provider that best fits your needs.",
    "What if I am not satisfied with a provider's work? If you are not satisfied with the completed service, you can open a dispute within 24 hours of job completion. Our support team will review the issue and determine whether a partial or full refund is appropriate.",
]

print("Pre-computing FAQ embeddings...")
faq_embeddings = [{"text": faq, "vector": embedder.encode(faq)} for faq in FAQ_DOC]
print("AI Engine ready.")

def cosine_sim(v1, v2):
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

# ── HTML Frontend ──────────────────────────────────────────────────────────────
HTML = open("frontend.html", encoding="utf-8").read()

@app.get("/", response_class=HTMLResponse)
async def home():
    return HTML

# ── 1. Matching Engine ─────────────────────────────────────────────────────────
class MatchRequest(BaseModel):
    customer_request: str

@app.post("/ai/match")
async def match_category(req: MatchRequest):
    user_vec = embedder.encode(req.customer_request)
    best, score = max(
        ((cat, cosine_sim(user_vec, cat["embedding"])) for cat in CATEGORIES),
        key=lambda x: x[1]
    )
    if score >= 0.40:
        return {"status": "success", "matched_category_id": best["id"],
                "matched_category_name": best["name"], "confidence_score": score}
    return {"status": "fallback", "matched_category_id": "manual",
            "message": "Confidence too low. Manual selection required.", "confidence_score": score}

# ── 2. Bio Generator ───────────────────────────────────────────────────────────
class BioRequest(BaseModel):
    provider_name: str
    skills: list[str]
    years_experience: int
    tone: str

@app.post("/ai/generate-bio")
async def generate_bio(req: BioRequest):
    model = genai.GenerativeModel("gemini-3.5-flash")
    prompt = f"""Write a 2-paragraph professional biography for a local service provider.
Name: {req.provider_name}
Skills: {', '.join(req.skills)}
Experience: {req.years_experience} years
Tone: {req.tone}
Rules: Return ONLY the biography text. No markdown. Sound human and trustworthy."""
    try:
        response = model.generate_content(prompt)
        return {"status": "success", "bio": response.text.strip()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ── 3. Support Chatbot ─────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    user_message: str

@app.post("/ai/chat")
async def support_chat(req: ChatRequest):
    user_vec = embedder.encode(req.user_message)
    best_faq = max(faq_embeddings, key=lambda f: cosine_sim(user_vec, f["vector"]))
    model = genai.GenerativeModel("gemini-3.5-flash")
    prompt = f"""You are a friendly and helpful customer support chatbot for a Local Services Marketplace app.
Your job is to answer the user's question clearly and conversationally using the FAQ information provided.
Always give a direct, helpful answer. Do not say "I don't have that information" if the FAQ context is related.
If the FAQ context is completely unrelated, politely say: "For this specific question, please contact our support team at 1-800-LOCAL-SVC."

FAQ Context: "{best_faq['text']}"
User Question: "{req.user_message}"

Give a warm, clear, 1-3 sentence answer:"""
    try:
        response = model.generate_content(prompt)
        return {"status": "success", "response": response.text.strip()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ── 4. Review Summarizer ───────────────────────────────────────────────────────
class SummarizeRequest(BaseModel):
    reviews: list[str]

@app.post("/ai/summarize-reviews")
async def summarize_reviews(req: SummarizeRequest):
    model = genai.GenerativeModel(
        "gemini-3.5-flash",
        generation_config={"response_mime_type": "application/json"}
    )
    reviews_text = "\n".join([f"- {r}" for r in req.reviews])
    prompt = f"""Analyze these customer reviews for a service provider.
Return ONLY this JSON with no extra text:
{{
    "strengths": ["2-3 key strengths based on the reviews"],
    "weaknesses": ["1-2 key weaknesses, empty list if none"],
    "average_rating": 4.2,
    "overall_sentiment": "Positive"
}}
Rules:
- average_rating must be a realistic float between 1.0 and 5.0 based on review tone.
- overall_sentiment must be exactly one of: Positive, Mixed, or Negative.

Reviews:
{reviews_text}"""
    try:
        response = model.generate_content(prompt)
        return {"status": "success", "summary": json.loads(response.text)}
    except Exception as e:
        return {"status": "error", "message": str(e)}