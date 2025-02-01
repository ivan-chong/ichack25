# main.py
import uuid
import io
import contextlib
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Code Rearrangement Checker")

# In-memory store for challenges.
# Each challenge is stored as a dict with the original task, generated code, and expected output.
challenges = {}

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

class CodeLine(BaseModel):
    id: str
    code: str


class GenerationRequest(BaseModel):
    concept: str


class GenerationResponse(BaseModel):
    challenge_id: str
    task: str
    code_lines: List[CodeLine]


class CheckRequest(BaseModel):
    challenge_id: str
    code_lines: List[CodeLine]


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


def generate_task_and_code(concept: str):
    """
    Simulates generating a task and corresponding code.
    In a real implementation you might call the OpenAI API here.
    For demonstration purposes, we return a hardcoded task and code snippet.
    """
    concept_lower = concept.lower().strip()
    if concept_lower in ["for loop", "for-loop", "loop"]:
        task = "Write a for loop to print numbers from 1 to 10."
        code = (
            "for i in range(1, 11):\n"
            "    print(i)"
        )
    elif concept_lower in ["if statement", "if"]:
        task = "Write an if statement that prints 'Positive' if a number is greater than 0."
        code = (
            "num = 5\n"
            "if num > 0:\n"
            "    print('Positive')"
        )
    else:
        task = f"Write a simple program that demonstrates {concept}."
        code = f"print('This is a demonstration of {concept}')"
    return task, code


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
    task, code = generate_task_and_code(request.concept)
    
    # Run the generated code to capture its expected output
    expected_output, error = run_code(code)
    if error:
        raise HTTPException(status_code=500, detail=f"Error in generated code: {error}")
    
    # Split the code into lines
    code_lines = []
    for idx, line in enumerate(code.splitlines(), start=1):
        code_line = CodeLine(
            id=str(idx),
            # label=f"Line {idx}",
            code=line
        )
        code_lines.append(code_line)
    
    # Generate a unique challenge ID and store the challenge details
    challenge_id = str(uuid.uuid4())
    challenges[challenge_id] = {
        "task": task,
        "code": code,  # original, correct code
        "expected_output": expected_output
    }
    
    return GenerationResponse(
        challenge_id=challenge_id,
        task=task,
        code_lines=code_lines
    )


@app.post("/check", response_model=CheckResponse)
async def check(request: CheckRequest):
    """
    Accepts the rearranged code lines from the frontend along with the challenge ID.
    The backend reconstructs the code, executes it, and compares the output with the expected output.
    Returns success if the outputs match, or an error message otherwise.
    """
    # Retrieve the challenge data using the challenge ID
    challenge = challenges.get(request.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    
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
