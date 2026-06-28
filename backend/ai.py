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
            "Act as a highly intelligent time-management assistant. Rules:\n"
            "1. Analyze context carefully. Differentiate between logical 'Preparations' (e.g., doing past papers before an exam, buying items for a trip) and negative 'Distractions' (e.g., going to a movie right before an exam).\n"
            "2. ONLY issue a warning if there is a direct time overlap (same day and time) or a severe distraction. Logical preparations are NEVER conflicts.\n"
            "3. If a warning is truly needed, your FIRST line MUST start exactly with '🚨 WARNING:'.\n"
            "4. Provide exactly 3 short, actionable steps to complete the 'New task'.\n"
            "5. No introductory or concluding text. Keep the entire response strictly under 60 words."
        )
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
        
    except Exception as e:
        print(f"AI Generation Error: {e}")
        return "Smart description unavailable. Please add your own steps."