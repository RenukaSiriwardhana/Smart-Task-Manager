import os
from google import genai
from datetime import datetime

# Get the API key securely from environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
client = genai.Client(api_key=GEMINI_API_KEY)

def get_smart_description(new_task_title: str, due_date: str, due_time: str, past_tasks: str) -> str:
    """
    Analyzes new task context against current timeline and existing incomplete items.
    Prepends '🚨 WARNING:' if a high-priority structural or time conflict is detected.
    """
    try:
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        prompt = (
            f"Current Date and Time: {current_time}\n"
            f"User's pending tasks: [{past_tasks}]\n"
            f"New task to add: '{new_task_title}' (Due: {due_date} at {due_time})\n\n"
            "Act as a strict, smart time-management assistant. Rules:\n"
            "1. Check if the 'New task' conflicts with urgent pending tasks, or if its own deadline is unrealistic given the current time.\n"
            "2. If it is a bad idea (e.g. going shopping right before an exam), your FIRST step MUST be a warning. This warning line MUST start exactly with '🚨 WARNING:'.\n"
            "3. If there's no conflict, provide standard smart steps.\n"
            "4. Provide exactly 3 short, actionable steps. No introductory or concluding text.\n"
            "Keep the response strictly under 50 words."
        )
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
        
    except Exception as e:
        print(f"AI Generation Error: {e}")
        return "Smart description unavailable. Please add your own steps."