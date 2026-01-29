# ✈️ SkyHigh Airlines Chatbot (Multi-Agent System)

A state-of-the-art **Multi-Agent Chatbot** built with **Node.js**, **React**, and **LangChain**. It uses an intelligent router to orchestrate specialized agents for searching flights, booking tickets, and answering policy questions via RAG.

## 🏗️ Architecture

The system follows a **Hub-and-Spoke** architecture where a central **Router Agent** analyzes user intent and dispatches tasks to specialized agents. We use a centralized `AgentRunner` to standardize tool execution loops.

```mermaid
graph TD
    User[User] <--> Frontend[React Chat UI]
    Frontend <-->|API /api/chat| Backend[Node.js Express Server]
    
    subgraph "Agent Orchestration Layer"
        Backend --> Router["Reference Router Agent"]
        
        Router -->|Intent: SEARCH| SearchAg["Search Agent"]
        Router -->|Intent: BOOKING| BookAg["Booking Agent"]
        Router -->|Intent: FAQ| FaqAg["FAQ Agent (RAG)"]
        Router -->|Intent: GENERAL| Gen["General Chat"]
    end

    subgraph "Services & Tools"
        SearchAg -->|Tool: search_flights| MockAPI["Mock Airline API"]
        
        BookAg -->|Tool: search_flights| MockAPI
        BookAg -->|Tool: book_flight| MockAPI
        
        FaqAg -->|Reads| PolicyDB["policies.md (RAG Source)"]
        
        Runner["Agent Runner"] -->|Standardizes Execution| AllAgents["All Agents"]
        Services["Prompt Service"] -->|Injects Date & History| AllAgents
    end

    subgraph "AI Provider"
        AllAgents <-->|LangChain| Azure[Azure OpenAI (GPT-4)]
    end
```

## 🚀 Key Features

- **🧠 Context-Aware Routing**: The Router analyzes conversation history (not just the last message) to correctly classify follow-up answers (e.g., providing a name) as part of the ongoing flow.
- **🔄 Universal Agent Runner**: A specialized `AgentRunner` service eliminates code duplication by handling the LLM-Tool-Response execution loop for all agents.
- **🛠️ Smart Booking Agent**: The Booking Agent is capable of **implicit search**. If you say "Book a flight to London", it will search for flights first, present options, and then proceed to booking.
- **📚 RAG (Retrieval-Augmented Generation)**: The FAQ Agent reads from a `policies.md` file to give grounded, accurate answers about baggage and rules.
- **📅 Dynamic Context**: The system automatically injects the current date (`today`) into all prompts, making relative dates like "next Friday" work naturally.
- **📝 Templated Prompts**: All system prompts are managed as **Nunjucks (.j2)** templates in `backend/prompts/` for easy engineering.
- **🎨 Glassmorphism UI**: A stunning, modern React frontend.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, CSS (Glassmorphism)
- **Backend**: Node.js, Express
- **AI/LLM**: LangChain.js, Azure OpenAI (GPT-4o)
- **Templating**: Nunjucks (Jinja2 for Node)

## 📂 Project Structure

```bash
AirlineChatBot/
├── backend/
│   ├── agents/           # Agent Logic (router, search, booking, faq)
│   ├── data/             # Data sources (policies.md)
│   ├── prompts/          # Nunjucks Prompt Templates (.j2)
│   ├── services/         # Shared Services
│   │   ├── agentRunner.js  # Standardized Agent Execution Loop
│   │   ├── llmService.js   # LangChain / Azure OpenAI Integration
│   │   ├── mockApi.js      # Mock Flight Data & Tools
│   │   └── promptService.js # Template Rendering
│   └── server.js         # Express App
├── frontend/             # React App
└── README.md
```

## ⚡ Getting Started

### 1. Prerequisites
- Node.js installed.
- **Azure OpenAI** credentials.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Azure OpenAI keys
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```
