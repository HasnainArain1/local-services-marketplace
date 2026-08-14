import asyncio
from main import app, MatchRequest, BioRequest, ChatRequest, SummarizeRequest, match_category, generate_bio, support_chat, summarize_reviews

async def run_tests():
    print("\n--- 1. Testing Matching Engine ---")
    req1 = MatchRequest(customer_request="My kitchen sink is leaking everywhere and I need someone to fix the pipes.")
    res1 = await match_category(req1)
    print("Request: My kitchen sink is leaking everywhere...")
    print("Result:", res1)
    
    print("\n--- 2. Testing Bio Generator ---")
    req2 = BioRequest(
        provider_name="Sarah Jenkins",
        skills=["deep cleaning", "window washing", "organization"],
        years_experience=8,
        tone="Professional"
    )
    res2 = await generate_bio(req2)
    print("Result Bio:", res2.get("bio", res2))
    
    print("\n--- 3. Testing Review Summarizer ---")
    req3 = SummarizeRequest(
        reviews=[
            "Sarah was amazing, my house has never been cleaner!",
            "She arrived 20 minutes late which was annoying, but did a good job.",
            "Very thorough cleaning, highly recommend.",
            "A bit expensive compared to others, but worth the quality."
        ]
    )
    res3 = await summarize_reviews(req3)
    print("Result Summary:", res3.get("summary", res3))
    
    print("\n--- 4. Testing Support Chatbot (RAG) ---")
    req4 = ChatRequest(user_message="What happens if my cleaner never shows up?")
    res4 = await support_chat(req4)
    print("Question: What happens if my cleaner never shows up?")
    print("Full Result:", res4)

if __name__ == "__main__":
    asyncio.run(run_tests())
