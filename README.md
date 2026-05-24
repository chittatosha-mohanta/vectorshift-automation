# VectorShift Workflow Automation Platform

This project is a premium, interactive workflow builder that allows users to design, save, load, and execute automated pipelines. It combines a drag-and-drop React Flow canvas with a FastAPI backend that executes cycle checks (DAG validation) and automates Google Sheets triggers to generate LLM responses and send Gmail alerts.

---

## 🚀 Getting Started

To run the application locally, open two separate terminal tabs from the project root directory and follow the instructions below:

### 1. Start the Backend (FastAPI)
Activate the virtual environment, install dependencies, and run the server on port `8000`:
```bash
cd backend
source ../.venv/bin/activate
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend (React)
Install node modules and start the development server (runs on `http://localhost:3000`):
```bash
cd frontend
npm install
npm start
```

---

## 🛠️ Project Architecture

```
.
├── backend/                   # FastAPI Web Server
│   └── main.py                # Core application routes, LLM connectors & background polling
├── frontend/                  # React Application
│   ├── public/                # Static assets and index.html
│   └── src/                   # React components & hooks
│       ├── nodes/             # Custom drag-and-drop workflow nodes
│       ├── App.js             # Layout, routing and UI shell
│       └── store.js           # Zustand global state management
├── requirements.txt           # Backend python dependencies
└── README.md                  # Setup and feature documentation
```

---

## ✨ Features & Capabilities

### 1. Advanced Custom Nodes
- **Sheets Trigger (`sheetsTrigger`)**: Polls a Google Sheet (CSV export link) every 15 seconds. If a new row is added, it triggers the down-stream nodes automatically.
- **LLM Node (`llm`)**: Configurable prompt template supporting variable replacement (e.g. `{{row_data}}`). Supports **OpenAI (GPT-4o)**, **Groq (Llama, Gemma)**, and **xAI (Grok)**.
- **Gmail Node (`gmail`)**: Dispatches automated emails. Supports SMTP integration via sender email and App Passwords, falling back to visually simulated emails in logs if SMTP is omitted.
- **Text Node (`text`)**: Auto-expanding text area that dynamically generates inputs handles whenever you type variables wrapped in curly braces (e.g., `{{variable}}`).
- **Additional Utility Nodes**: Includes Input, Output, API Request, Code (JS/Python), Database Query, and JSON Parse nodes.

### 2. Graph Engine & Topology Analysis
- Submitting a pipeline executes a **DFS Cycle Detection Algorithm** on the backend to verify if your workflow is a valid **Directed Acyclic Graph (DAG)**.
- Analyzes total node count, connections, and shows status updates in a responsive UI modal.

### 3. State Management & Offline Mode
- Save, clear, and load multiple named pipeline configurations.
- All layouts are preserved locally in `localStorage` for seamless recovery across page refreshes.

---

## ⚙️ Configuration & Environment Setup

### Google Sheets Integration
To use the automated Sheets Trigger node:
1. Open your Google Sheet.
2. Click **Share** -> Change general access to **"Anyone with the link can view"**.
3. Copy the Google Sheet ID from the URL (`https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit...`).
4. Paste the Sheet ID into the **Sheets Trigger** node in the frontend and click **Submit Pipeline** to register the polling thread.

### SMTP Gmail Setup
To send real emails using the Gmail node:
1. Enable **2-Step Verification** on your Google Account.
2. Generate an **App Password** (Google Account -> Security -> App Passwords).
3. Insert your Gmail and the 16-character App Password into the Gmail Node in the workspace.
