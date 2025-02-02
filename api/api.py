# main.py
import uuid
import io
import contextlib
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import openai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import random
import os
import json
app = FastAPI(title="Code Rearrangement Checker")

import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# In-memory store for challenges.
# Each challenge is stored as a dict with the original task, generated code, and expected output.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Pydantic Models
# -----------------------------
class GenerationRequest(BaseModel):
    concept: str


class GenerationResponse(BaseModel):
    challenge_id: str
    task: str
    code_lines: list[str]
    explanation: str


class CheckRequest(BaseModel):
    challenge_id: str
    code_lines: List[str]


class CheckResponse(BaseModel):
    code_lines: list[int] # binary list

# -----------------------------
# Utility Functions
# -----------------------------
# -----------------------------
# API Endpoints
# -----------------------------

@app.post("/generate", response_model=GenerationResponse)
async def generate(request: GenerationRequest):
    """
    Generates a coding task and a corresponding code snippet based on the given CS concept.
    The code is executed to capture the expected output. The code is then split into lines,
    each returned as an object with an id, label, and the code.
    A challenge ID is generated and the expected output is stored in an in-memory store.
    """
    # Generate task description and code (replace with OpenAI API call if needed)
    api_key = os.getenv("OPENAI_API_KEY")
    client = openai.Client(api_key=api_key)
    
    system_prompt = (
        "You are tasked with coming up with python coding exercises "
        "(think leetcodes of specified difficulty by user) to help students learn a concept. "
        "1. Come up with a question for the concept and provide inputs to the function. "
        "2. Come up with a brief explanation of the topic the user is interested in and that explains the code in the solution without giving away the answer."
        "3. Code a Python solution which is never greater than 25 lines of the specified difficulty. "
        "4. Return the name of the function verbatim e.g. foo_bar"
        "5. State a single test input (not output).\n\n"
        "Your output format should be valid JSON:\n\n"
        "{\n"
        "  \"explanation\": str,\n"        
        "  \"question_desc\": str,\n"
        "  \"solution_function\": str (must be valid python syntax so can be exec()),\n"
        "  \"function_name\": str (must match name of function in solution_function)"
        "  \"test_case\": example_test_input this is a LIST of args, e.g. if the function takes list[int],str then this should be of form [[1,2,3],\"hello\"], if it takes 2 ints then [4,5] if it takes a list of strings then [[list of strings]]))\n"
        "}"
    )
    
    user_prompt = f"The topic is {request.concept}"
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
    except:
        response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
            ]
        )
        try:
            result = json.loads(response.choices[0].message.content)
        except:
            return GenerationResponse(challenge_id="NULL",task="NULL",code_lines=[])
            

    desc = result["question_desc"]
    code = result["solution_function"]
    function_name = result["function_name"]
    test_case = result["test_case"]
    explanation = result["explanation"]

    lines = code.split("\n")  # Split text into lines
    non_empty_lines = [line for line in lines if line.strip()]  # Remove lines that contain only whitespace
    cleaned_lines="\n".join(non_empty_lines)  # Reconstruct the string

    
    # Generate a unique challenge ID and store the challenge details
    challenge_id = str(uuid.uuid4())
    challenge = {
        "challenge_id": challenge_id,
        "task": desc,
        "code": cleaned_lines,  # original, correct code
        "function_name": function_name,
        "test_case": test_case,
        "explanation": explanation
    }

    with open("realdatabase", "a+", encoding="utf-8") as f:
        json.dump(challenge, f)  # Convert dict to JSON string
        f.write("\n")  # Add newline to separate JSON objects
    
    code_lines = cleaned_lines.split("\n")
    random.shuffle(code_lines)
    # return shuffled lines of code and uuid
    return GenerationResponse(
        challenge_id=challenge_id,
        task=desc,
        code_lines=code_lines,
        explanation=explanation
    )


@app.post("/check", response_model=CheckResponse)
async def check(request: CheckRequest):
    """
    Accepts the rearranged code lines from the frontend along with the challenge ID.
    The backend reconstructs the code, executes it, and compares the output with the expected output.
    Returns success if the outputs match, or an error message otherwise.
    """
    data = []
    with open("realdatabase", "r", encoding="utf-8") as file:
        data = [json.loads(line) for line in file]
    

    # Reconstruct the code from the provided lines (assumes the list is in the user–provided order)
    reconstructed_code = "".join(line + "\n" for line in request.code_lines)
    function_name = ""
    for d in data:
        if d["challenge_id"] == request.challenge_id:
            function_name = d["function_name"]
    result = None
    case = d["test_case"]
    failed = False
    actual_failed = False
    try:
        exec(reconstructed_code)
        func = locals()[function_name]
        result = func(*case)
    except:
        result = None 
        failed = True
    try:
        exec(d["code"])
        func = locals()[function_name]
        actual_result = func(*case)
    except:
        actual_result = None
        actual_failed = True
    if actual_result == result and not failed and not actual_failed:
        return CheckResponse(code_lines = ([1]*len(request.code_lines)))
    else:
        output = []
        real_code_lines = d["code"].split("\n")
        logger.debug(real_code_lines)
        logger.debug(request.code_lines)
        for i,line in enumerate(request.code_lines):
            if line == real_code_lines[i]:
                output.append(1)
            else:
                output.append(0)
    

    return CheckResponse(code_lines=output)

# -----------------------------
# Main entry point
# -----------------------------

if __name__ == "__main__":
    # Run the app with: python main.py
    uvicorn.run(app, host="0.0.0.0", port=8000)
