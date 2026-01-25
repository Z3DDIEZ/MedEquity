# MedEquity: Federated Healthcare Triage Assistant

**Status**: Phase 0 Complete / Phase 1 (Centralized Prototype) In Progress
**Author**: Zawadi MC Nyachiya  
**Version**: 0.2.0

---

## 🏥 Mission
MedEquity is a **federated healthcare triage assistant** designed to route patients to appropriate care levels (Emergency, Urgent Care, Self-Care) while actively measuring and reducing health disparities. 

It uses a **Privacy-First** architecture where patient data NEVER leaves the local clinic node.

---

## 🏗️ Architecture (The A.N.T. System)
MedEquity follows the **3-Layer B.L.A.S.T.** protocol:

### 1. **Regional Nodes (The Edge)**
*   **Tech**: .NET 8 Web API + PostgreSQL
*   **Role**: Hosts patient data, runs local Triage Engine.
*   **Privacy**: Data retention < 7 days. No PII stored.

### 2. **Central Coordinator (The Brain)**
*   **Tech**: Python + Flower (Federated Learning)
*   **Role**: Aggregates encrypted model parameters from nodes to improve global intelligence without seeing patient data.

### 3. **Governance Layer (The Conscience)**
*   **Tech**: Multi-Stakeholder Agent Voting (.NET)
*   **Role**: Automated agents (Patient, Provider, Public Health) vote on all model updates based on fairness metrics.

---

## 🚀 Getting Started

### Prerequisites
*   **Docker Desktop** (Required for local simulation)
*   **.NET 9 SDK**
*   **Python 3.11+**
*   **Gemini API Key**: You need a Google Gemini API key for the centralized prototype capabilities.

### Installation
1.  **Clone the Architecture**:
    ```bash
    git clone <repo>
    cd MedEquity
    ```

2.  **Configure Environment**:
    Create a `.env` file in the `MedEquity` root directory (same level as `docker-compose.yml`) and add your API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Start the Simulation Environment**:
    > **Note:** Ensure Docker Desktop is running!
    ```bash
    docker-compose up --build
    ```
    This spins up:
    *   `api`: .NET Gateway (Port 5000)
    *   `ml_service`: Python Triage Engine (Port 8000)
    *   `postgres`: Local Database
    *   `redis`: Cache

3.  **Verify the Link**:
    Navigate to `http://localhost:5000/test-link`.
    You should see:
    ```json
    {
      "status": "Connected",
      "reply": {
        "care_level": "primary_care",
        "explanation": "System Link Verified. Hello from Python!"
      }
    }
    ```

---

## 📂 Project Structure
```
MedEquity/
├── src/
│   ├── MedEquity.Api/        # .NET 9 API Gateway & Node Logic
│   ├── MedEquity.Core/       # Shared Domain Models
│   ├── MedEquity.Governance/ # Stakeholder Voting Agents
│   ├── MedEquity.ML/         # Python Service (Federated Learning)
│   └── Protos/               # gRPC Contracts (triage.proto)
├── docs/                     # Architectural Documentation
├── docker-compose.yml        # Orchestration
└── README.md                 # You are here
```

## 📜 License
Private Research Project for Portfolio.
