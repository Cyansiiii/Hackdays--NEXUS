import google.generativeai as genai
import json
import re
import tempfile
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

ANALYSIS_PROMPT = """
You are NEXUS, an expert question paper analyzer for university and board exams.

Analyze ALL the uploaded question paper PDFs for the subject: {subject}
Years provided: {years}

Your task:
1. Find questions that appear EXACTLY or near-exactly across multiple years.
2. Find semantic matches — same topic, different wording (e.g. integration by parts phrased differently in 2021 vs 2023).
3. Count how often each major topic appears per year.
4. Identify trending, declining, new, and consistent topics.
5. Give 3-5 concrete study recommendations.
6. Predict the top 5 most likely questions for the next exam based on patterns.

Return ONLY a valid JSON object. No explanation, no markdown fences, no extra text.
Strictly follow this schema:

{{
  "subject": "{subject}",
  "years_analyzed": [{years_json}],
  "total_questions_analyzed": 45,

  "exact_matches": [
    {{
      "question": "Full question text here",
      "years": ["2021", "2023"],
      "frequency": 2
    }}
  ],

  "semantic_matches": [
    {{
      "pattern": "Topic or theme name, e.g. Integration by parts",
      "similarity_score": 0.85,
      "variations": {{
        "2021": "exact question from 2021 paper",
        "2022": "exact question from 2022 paper"
      }}
    }}
  ],

  "topic_frequency": [
    {{
      "topic": "Calculus",
      "by_year": {{
        "2021": 5,
        "2022": 6,
        "2023": 4
      }},
      "total": 15
    }}
  ],

  "evolution_patterns": {{
    "trending": ["topic1", "topic2"],
    "declining": ["topic3"],
    "new_topics": ["topic4"],
    "consistent": ["topic5", "topic6"]
  }},

  "recommendations": [
    "Focus on Calculus - appears 15 times across all years",
    "Practice Integration by parts variations",
    "New topic: Neural Networks appeared in 2023 only"
  ],

  "predicted_questions": [
    "Most likely question 1 based on pattern",
    "Most likely question 2 based on pattern",
    "Most likely question 3 based on pattern",
    "Most likely question 4 based on pattern",
    "Most likely question 5 based on pattern"
  ]
}}
"""


async def analyze_papers(subject: str, file_data_list: list[tuple[bytes, str]]) -> dict:
    """
    file_data_list: list of (file_bytes, year_label) tuples
    Returns parsed JSON analysis dict.
    """
    uploaded_refs = []
    years = []
    tmp_paths = []

    try:
        for file_bytes, year in file_data_list:
            # Write to a named temp file — Gemini SDK needs a path or file-like object
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            tmp_paths.append(tmp_path)

            uploaded = genai.upload_file(
                path=tmp_path,
                mime_type="application/pdf",
                display_name=f"{subject}_{year}",
            )
            uploaded_refs.append(uploaded)
            years.append(year)

        years_json = ", ".join(f'"{y}"' for y in years)
        prompt = ANALYSIS_PROMPT.format(
            subject=subject,
            years=", ".join(years),
            years_json=years_json,
        )

        content_parts = [prompt] + uploaded_refs
        response = model.generate_content(content_parts)

        raw = response.text.strip()
        # Strip markdown fences if Gemini adds them despite instructions
        raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
        raw = re.sub(r"```\s*$", "", raw, flags=re.MULTILINE)
        raw = raw.strip()

        return json.loads(raw)

    finally:
        # Clean up temp files
        for p in tmp_paths:
            try:
                os.unlink(p)
            except OSError:
                pass
