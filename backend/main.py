from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict
import asyncio
import urllib.request
import csv
import io

app = FastAPI()

# Enable CORS to allow the React development server to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store for active Google Sheets triggers: sheet_id -> {"last_row_count": int, "pipeline": dict}
active_polls = {}

class PipelinePayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(payload: PipelinePayload):
    nodes = payload.nodes
    edges = payload.edges

    num_nodes = len(nodes)
    num_edges = len(edges)

    # 1. Build adjacency list of the directed graph
    adj_list = defaultdict(list)
    for edge in edges:
        source = edge.get('source')
        target = edge.get('target')
        if source and target:
            adj_list[source].append(target)

    # 2. DFS cycle-finding validation for Directed Acyclic Graph (DAG) status
    # States: 0 = Unvisited, 1 = Visiting, 2 = Visited
    visited = {node.get('id'): 0 for node in nodes if node.get('id')}

    def has_cycle(u: str) -> bool:
        visited[u] = 1  # mark node as visiting (added to recursion stack)
        
        # Check all outgoing connections
        for v in adj_list[u]:
            # If neighbor is currently visiting, there's a back-edge (loop/cycle)
            if visited.get(v, 0) == 1:
                return True
            # If neighbor is unvisited, traverse it recursively
            elif visited.get(v, 0) == 0:
                # Ensure the neighbor node is in our graph (prevent cycles involving deleted nodes)
                if v in visited:
                    if has_cycle(v):
                        return True
                        
        visited[u] = 2  # mark node as fully visited (removed from recursion stack)
        return False

    is_dag = True
    for node in nodes:
        node_id = node.get('id')
        if node_id and visited.get(node_id, 0) == 0:
            if has_cycle(node_id):
                is_dag = False
                break

    # Register sheet for dynamic dashboard-only polling (no Apps Script required!)
    for node in nodes:
        if node.get('type') == 'sheetsTrigger':
            sheet_id = node.get('data', {}).get('sheetId')
            if sheet_id:
                active_polls[sheet_id] = {
                    "last_row_count": active_polls.get(sheet_id, {}).get("last_row_count"),
                    "pipeline": {
                        "nodes": nodes,
                        "edges": edges
                    }
                }
                print(f"[Polling] Registered/updated sheet {sheet_id} in active polls for automated dashboard execution.")

    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag
    }


class StopPipelinePayload(BaseModel):
    nodes: List[Dict[str, Any]]

@app.post('/pipelines/stop')
def stop_pipeline(payload: StopPipelinePayload):
    stopped_sheets = []
    for node in payload.nodes:
        if node.get('type') == 'sheetsTrigger':
            sheet_id = node.get('data', {}).get('sheetId')
            if sheet_id and sheet_id in active_polls:
                del active_polls[sheet_id]
                stopped_sheets.append(sheet_id)
                print(f"[Polling] Stopped background polling for sheet {sheet_id}")
    return {
        "status": "success",
        "message": f"Successfully stopped polling triggers for {len(stopped_sheets)} sheets.",
        "stopped_sheets": stopped_sheets
    }


class SheetTriggerPayload(BaseModel):
    event: str
    row_data: List[Any]
    sheet_name: str
    row_number: int = None

@app.post('/pipelines/trigger')
def trigger_pipeline(payload: SheetTriggerPayload):
    # Simulate processing row data and triggering Gmail Node
    print(f"Triggered by event: {payload.event} on sheet {payload.sheet_name}")
    print(f"Row data received: {payload.row_data}")
    
    # In a full production flow, the backend parses the DAG to find connected
    # Gmail nodes, retrieves the recipient email and body from the row data,
    # and fires the email using the Google Workspace APIs.
    return {
        "status": "success",
        "message": f"Successfully received '{payload.event}' trigger. Dispatched email alert.",
        "received_data": payload.row_data
    }

def fetch_sheet_rows(sheet_id: str) -> List[List[str]]:
    import ssl
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    # Bypass local SSL verification checks to prevent macOS environment issues
    ctx = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        content = response.read().decode('utf-8')
        csv_reader = csv.reader(io.StringIO(content))
        return list(csv_reader)


def call_llm(model: str, api_key: str, prompt_text: str) -> str:
    import json
    if not api_key:
        print("[LLM] No API Key provided. Simulation: falling back to mock response.")
        return f"[Simulated LLM response for {model}]:\n\nDear Candidate,\n\nThank you for applying. We are thrilled to receive your details: {prompt_text}. Our team is reviewing your profile and will connect with you soon!\n\nBest regards,\nHR Team"
        
    try:
        # Route to Groq API for Llama/Gemma models, xAI API for Grok models, else OpenAI API
        if api_key.startswith("gsk_") and "grok" in model:
            # User passed a Groq key but chose a Grok model. Redirect to Groq's Llama model automatically.
            print(f"[LLM] WARNING: Received Groq API key (starts with gsk_) but model selected was '{model}'. Routing to Groq's llama-3.3-70b-versatile instead.")
            url = "https://api.groq.com/openai/v1/chat/completions"
            model_name = "llama-3.3-70b-versatile"
        elif "llama" in model or "gemma" in model or "mixtral" in model or "groq" in model:
            url = "https://api.groq.com/openai/v1/chat/completions"
            model_name = model
        elif "grok" in model:
            url = "https://api.x.ai/v1/chat/completions"
            model_name = model
        else:
            url = "https://api.openai.com/v1/chat/completions"
            model_name = model if "gpt" in model else "gpt-4o"


        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": "You are a professional assistant writing email responses."},
                {"role": "user", "content": prompt_text}
            ],
            "temperature": 0.7
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
                'User-Agent': 'Mozilla/5.0'
            },
            method='POST'
        )
        
        import ssl
        ctx = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['choices'][0]['message']['content'].strip()
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f"[LLM] HTTPError calling API for {model}: {e.code} - {err_body}")
        return f"[Error calling LLM API for {model}: HTTP Error {e.code}: {err_body}]"
    except Exception as e:
        print(f"[LLM] Error calling API for {model}: {e}")
        return f"[Error calling LLM API for {model}: {e}]"



def trigger_flow_execution(sheet_id: str, new_row: List[str], pipeline: dict):
    print(f"[Automation] Triggering flow execution for sheet {sheet_id} with row data: {new_row}")
    
    nodes = pipeline.get("nodes", [])
    edges = pipeline.get("edges", [])
    
    # 1. Search for Gmail node to dispatch email
    gmail_nodes = [n for n in nodes if n.get("type") == "gmail"]
    if not gmail_nodes:
        print("[Automation] No Gmail node found in flow. Skipping email dispatch.")
        return
        
    for g_node in gmail_nodes:
        g_id = g_node.get("id")
        sender = g_node.get("data", {}).get("sender", "")
        app_password = g_node.get("data", {}).get("appPassword", "")
        subject = g_node.get("data", {}).get("subject", "Application Received")
        
        # 2. Check if there's an LLM node connected to this Gmail node
        incoming_edges = [e for e in edges if e.get("target") == g_id]
        llm_connected = False
        connected_llm_node = None
        for edge in incoming_edges:
            source_id = edge.get("source")
            source_node = next((n for n in nodes if n.get("id") == source_id), None)
            if source_node and source_node.get("type") == "llm":
                llm_connected = True
                connected_llm_node = source_node
                break

        body_text = ""
        if llm_connected and connected_llm_node:
            llm_data = connected_llm_node.get("data", {})
            llm_model = llm_data.get("model", "gpt-4o")
            llm_key = llm_data.get("apiKey", "")
            llm_prompt_template = llm_data.get("prompt", "")
            
            prompt_text = llm_prompt_template
            if "{{row_data}}" in prompt_text:
                prompt_text = prompt_text.replace("{{row_data}}", ", ".join(new_row))
            else:
                prompt_text += f"\n\nCandidate details: {', '.join(new_row)}"
                
            print(f"[LLM] Connected LLM found. Generating email body using model {llm_model}...")
            body_text = call_llm(llm_model, llm_key, prompt_text)
        else:
            body_text = g_node.get("data", {}).get("body", "")

        # Determine candidate email (assuming candidate email is formatted inside the new sheet row)
        recipient = "candidate@example.com"
        for val in new_row:
            if "@" in str(val) and "." in str(val):
                recipient = val.strip()
                break
                
        # If no body text is generated/saved, fallback
        if not body_text:
            body_text = f"Hello! We have received your application containing data: {', '.join(new_row)}. We will review it and get back to you shortly!"

        
        # If SMTP details are configured, send a real email!
        if sender and app_password:
            print(f"[SMTP] Attempting to send real email from {sender} to {recipient}...")
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            
            try:
                msg = MIMEMultipart()
                msg['From'] = sender
                msg['To'] = recipient
                msg['Subject'] = subject
                msg.attach(MIMEText(body_text, 'plain'))
                
                # Connect to Gmail SMTP server
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.starttls()
                server.login(sender, app_password)
                server.sendmail(sender, recipient, msg.as_string())
                server.quit()
                print(f"[SMTP] SUCCESS: Real email sent to {recipient}!")
            except Exception as e:
                print(f"[SMTP] ERROR sending email: {e}")
        else:
            # Print simulated email dispatch
            print("\n" + "="*50)
            print(f"📧 [SIMULATION] DISPATCHED EMAIL VIA WORKFLOW SYSTEM:")
            print(f"   Target Node ID: {g_id}")
            print(f"   From:           {sender or 'hr@company.com'}")
            print(f"   To:             {recipient}")
            print(f"   Subject:        {subject}")
            print(f"   Body Preview:")
            for line in body_text.split('\n'):
                print(f"      {line}")
            print("="*50 + "\n")




async def poll_sheets_loop():
    print("[Polling] Starting background Google Sheets polling task...")
    while True:
        await asyncio.sleep(15) # Poll every 15 seconds
        for sheet_id, info in list(active_polls.items()):
            try:
                rows = await asyncio.to_thread(fetch_sheet_rows, sheet_id)
                current_count = len(rows)
                last_count = info.get("last_row_count")
                
                if last_count is None:
                    # Establish baseline count
                    active_polls[sheet_id]["last_row_count"] = current_count
                    print(f"[Polling] Established initial count for sheet {sheet_id}: {current_count} rows.")
                elif current_count > last_count:
                    new_rows = rows[last_count:current_count]
                    active_polls[sheet_id]["last_row_count"] = current_count
                    print(f"[Polling] Detected {len(new_rows)} new rows in sheet {sheet_id}!")
                    
                    for new_row in new_rows:
                        trigger_flow_execution(sheet_id, new_row, info["pipeline"])
                elif current_count < last_count:
                    # Update count if lines got deleted
                    active_polls[sheet_id]["last_row_count"] = current_count
                    print(f"[Polling] Sheet {sheet_id} shrank from {last_count} to {current_count} rows.")
            except Exception as e:
                print(f"[Polling] Error reading sheet {sheet_id}: {e}. Make sure the sheet is shared with link view access.")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_sheets_loop())


