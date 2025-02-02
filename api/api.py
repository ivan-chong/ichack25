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

# In-memory store for challenges.
# Each challenge is stored as a dict with the original task, generated code, and expected output.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app's default port
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


class CheckRequest(BaseModel):
    challenge_id: str
    code_lines: List[str]


class CheckResponse(BaseModel):
    success: bool
    message: str


# -----------------------------
# Utility Functions
# -----------------------------

def run_code(code: str):
    """
    Executes the given Python code and captures its standard output.
    Returns a tuple: (output, error)
    If execution succeeds, error is None. If an exception is raised, output is None.
    """
    local_vars = {}
    stdout_capture = io.StringIO()
    try:
        with contextlib.redirect_stdout(stdout_capture):
            exec(code, {}, local_vars)
    except Exception as e:
        return None, str(e)
    output = stdout_capture.getvalue()
    return output, None

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
        "You are tasked with coming up with simple python coding exercises "
        "(think very easy Leetcodes) to help students learn a concept. "
        "1. Come up with a basic question for the concept and provide inputs to the function. "
        "2. Code a simple Python solution. "
        "3. State a single test input (not output).\n\n"
        "Your output format should be valid JSON:\n\n"
        "{\n"
        "  \"question_desc\": str,\n"
        "  \"solution_function\": str (must be valid python syntax so can be exec()),\n"
        "  \"test_case\": example_test_input (list or number or string)\n"
        "}"
    )
    
    user_prompt = f"The topic is {request.concept}"
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    
    result = json.loads(response.choices[0].message.content)
    desc = result["question_desc"]
    code = result["solution_function"]
    test_case = result["test_case"]
    
    # Generate a unique challenge ID and store the challenge details
    challenge_id = str(uuid.uuid4())
    challenge = {
        "challenge_id": challenge_id,
        "task": desc,
        "code": code,  # original, correct code
        "test_case": test_case 
    }

    with open("realdatabase", "a", encoding="utf-8") as f:
        json.dump(challenge, f)  # Convert dict to JSON string
        f.write("\n")  # Add newline to separate JSON objects
    
    code_lines = code.split("\n")
    random.shuffle(code_lines)
    # return shuffled lines of code and uuid
    return GenerationResponse(
        challenge_id=challenge_id,
        task=desc,
        code_lines=code_lines
    )


@app.post("/check", response_model=CheckResponse)
async def check(request: CheckRequest):
    """
    Accepts the rearranged code lines from the frontend along with the challenge ID.
    The backend reconstructs the code, executes it, and compares the output with the expected output.
    Returns success if the outputs match, or an error message otherwise.
    """
    filejson = None
    with open("realdatabase" , "r", encoding="utf-8") as f:
        filejson = json.loads(f)
    if not filejson:
        raise HTTPException(status_code=500, detail="Server issue")
    if request.
    
    # Reconstruct the code from the provided lines (assumes the list is in the user–provided order)
    reconstructed_code = "\n".join(line.code for line in request.code_lines)
    
    # Execute the reconstructed code and capture its output
    output, error = run_code(reconstructed_code)
    if error:
        return CheckResponse(success=False, message=f"Code execution error: {error}")
    
    # Compare the output with the expected output from the challenge
    if output == challenge["expected_output"]:
        return CheckResponse(success=True, message="Success: Code output is correct.")
    else:
        return CheckResponse(
            success=False,
            message=(
                "Failure: The output does not match the expected output.\n"
                f"Expected:\n{challenge['expected_output']}\n"
                f"Got:\n{output}"
            )
        )


# -----------------------------
# Main entry point
# -----------------------------

if __name__ == "__main__":
    # Run the app with: python main.py
    uvicorn.run(app, host="0.0.0.0", port=8000)
