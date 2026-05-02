import os
import json
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from gemini import analyze_papers

load_dotenv()

app = FastAPI(title="NEXUS — Question Paper Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@app.post("/analyze")
async def analyze(
    subject: str = Form(...),
    years: str = Form(...),          # JSON array string, e.g. '["2021","2022","2023"]'
    files: list[UploadFile] = File(...),
):
    """
    Accepts multiple PDF uploads, calls Gemini with all of them, returns structured analysis JSON.
    - subject: exam subject name
    - years: JSON array of year labels matching the order of uploaded files
    - files: the PDF files
    """
    try:
        year_list = json.loads(years)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="'years' must be a JSON array string")

    if len(files) != len(year_list):
        raise HTTPException(
            status_code=400,
            detail=f"Number of files ({len(files)}) must match number of years ({len(year_list)})",
        )

    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Upload at least 2 question papers for meaningful analysis")

    # Read all file bytes
    file_data = []
    for upload, year in zip(files, year_list):
        if upload.content_type not in ("application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail=f"File '{upload.filename}' must be a PDF")
        data = await upload.read()
        file_data.append((data, str(year)))

    try:
        result = await analyze_papers(subject=subject, file_data_list=file_data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Gemini returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result
