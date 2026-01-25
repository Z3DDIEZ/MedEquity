
**Version**: 1.0  
**Status**: Locked for Phase 1 Implementation  
**Author**: Zawadi MC Nyachiya  
**Date**: January 2026  
**Commitment Level**: 2-year production system

---

## Executive Summary

### System Purpose

**One-sentence definition:**
> MedEquity is a federated healthcare triage assistant that routes patients to appropriate care levels while actively measuring and reducing health disparities through privacy-preserving AI and multi-stakeholder governance.

### Architectural Pattern

- **Federation**: Patient data never leaves clinic nodes, only encrypted model parameters aggregated
- **Event-Driven**: Asynchronous processing with audit logging at every decision point
- **Multi-Stakeholder Governance**: Research-backed agent voting system for all system changes
- **Privacy-First**: Differential privacy, data minimization, automatic deletion

### Scale Targets (18-Month Horizon)

| Metric | Phase 1 (M6) | Phase 2 (M12) | Phase 3 (M18) |
|--------|--------------|---------------|---------------|
| Clinic Nodes | 1 (simulated) | 2-3 (Gauteng) | 4-5 (urban+rural) |
| Patients Served | 0 (synthetic) | 500 (synthetic) | 2000+ (real pilot) |
| Triage Accuracy | 85% (Gemini) | 80% (local model) | 85% (federated LLM) |
| Fairness (DI Ratio) | >0.8 | >0.85 | >0.9 |

### Cost Model (Monthly, Fully Deployed)

**Phase 1 (Centralized Gemini):**
- Cloud infrastructure: $50-100 (single node)
- Gemini API: $20-50 (quota-limited)
- **Total**: ~$100/month

**Phase 2 (Local Models):**
- Cloud infrastructure: $150-200 (3 nodes)
- No external AI costs
- **Total**: ~$200/month

**Phase 3 (Federated LLM):**
- Cloud infrastructure: $200-300 (5 nodes)
- GPU compute (federated training): $100-200
- **Total**: ~$400/month

---

## System Architecture Overview

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE LAYER                              │
│  Multi-Stakeholder Agent Voting System (.NET)                   │
│  ├─ Patient Agent (accessibility, privacy, transparency)        │
│  ├─ Provider Agent (accuracy, liability, workflow)              │
│  └─ Public Health Agent (equity, cost-effectiveness)            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Governance Proposals
                       │ (model updates, feature changes, policies)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│              CENTRAL COORDINATION LAYER                          │
│  ├─ API Gateway (.NET Core)                                     │
│  ├─ Federated Learning Coordinator (Python/Flower)              │
│  ├─ Analytics Aggregator (differential privacy)                 │
│  ├─ Audit Logger (immutable decision records)                   │
│  └─ Smart Contract Executor (governance decisions)              │
└──────────────────────┬──────────────────────────────────────────┘
                       │ gRPC (encrypted parameter exchange)
                       │ NEVER transmits patient data
                       │
         ┌─────────────┴─────────────┬─────────────────────┐
         │                           │                     │
    ┌────▼────┐                 ┌────▼────┐          ┌────▼────┐
    │Regional │                 │Regional │          │Regional │
    │ Node A  │                 │ Node B  │          │ Node C  │
    │(Clinic) │                 │(Clinic) │          │(Rural)  │
    └────┬────┘                 └────┬────┘          └────┬────┘
         │                           │                     │
    ┌────▼────────────┐         ┌────▼────────┐      ┌────▼────────┐
    │ LOCAL SERVICES  │         │ LOCAL       │      │ LOCAL       │
    │ - Triage Engine │         │ SERVICES    │      │ SERVICES    │
    │ - Nurse Review  │         │ (same)      │      │ (same)      │
    │ - Local Storage │         │             │      │ + SMS       │
    │ - Federated     │         │             │      │   Fallback  │
    │   Trainer       │         │             │      │             │
    └────┬────────────┘         └─────────────┘      └─────────────┘
         │
    ┌────▼────────┐
    │ PATIENT     │
    │ INTERFACE   │
    │ - Web App   │
    │ - SMS (opt) │
    └─────────────┘
```

---

## Component Architecture (Detailed)

### 1. Patient Interface Layer (Untrusted Boundary)

**Technology**: React + TypeScript, Progressive Web App (PWA)

**Capabilities:**
- Symptom intake form (multi-language: English, isiZulu, Afrikaans, Sesotho)
- Vital signs input (optional: temperature, blood pressure, heart rate)
- Care recommendation display with explanation
- Nurse chat interface (if human review required)

**Security Constraints:**
- **NO patient identifiers transmitted** (only ephemeral session IDs)
- All data encrypted in transit (TLS 1.3)
- Session expires after 30 minutes of inactivity
- Local storage cleared on session end

**Trust Level**: **UNTRUSTED** (assume hostile client)

---

### 2. Regional Node (Semi-Trusted Boundary)

**Technology**: .NET 8 + ASP.NET Core + Entity Framework Core

**Components:**

#### A. Triage Engine

**Phase 1 (Months 2-6): Gemini API Integration**
```csharp
public class GeminiTriageService : ITriageService
{
    public async Task<TriageResult> AnalyzeSymptoms(SymptomSet symptoms)
    {
        // Prompt engineering: symptoms → care level
        var prompt = BuildTriagePrompt(symptoms);
        
        // Call Gemini API with retry logic
        var response = await _gemini.GenerateContentAsync(prompt);
        
        // Validate JSON schema strictly
        var result = ValidateAndParse(response);
        
        // Store in local database (patient data NEVER leaves node)
        await _db.TriageResults.AddAsync(result);
        await _db.SaveChangesAsync();
        
        return result;
    }
}
```

**Phase 2 (Months 9-12): Local Decision Tree Model**
```python
# Python service called via gRPC from .NET
class LocalTriageModel:
    def __init__(self):
        self.model = DecisionTreeClassifier()
        self.explainer = TreeExplainer(self.model)
    
    def predict(self, symptoms: SymptomVector) -> TriageResult:
        # Predict care level
        care_level = self.model.predict(symptoms)
        
        # Extract decision path for explanation
        explanation = self.explainer.explain(symptoms)
        
        return TriageResult(
            care_level=care_level,
            confidence=self.model.predict_proba(symptoms),
            explanation=explanation
        )
```

**Phase 3 (Months 18-24): Federated LLM**
```python
# Federated learning client (Flower framework)
class ClinicFederatedClient(fl.client.NumPyClient):
    def __init__(self, model, local_data):
        self.model = model  # Llama 3.1 fine-tuned
        self.local_data = local_data  # NEVER transmitted
    
    def fit(self, parameters, config):
        # Train on local data ONLY
        self.model.set_weights(parameters)
        self.model.train(self.local_data)
        
        # Return ONLY model parameters (not data)
        return self.model.get_weights(), len(self.local_data), {}
```

#### B. Nurse Review Dashboard

**Technology**: Blazor Server (real-time updates)

**Features:**
- Real-time triage queue (prioritized by urgency)
- Override mechanism with rationale capture
- Patient chat interface
- Outcome logging (for model improvement)

**Workflow:**
```
High-stakes case detected
  → Queue for human review
  → Nurse sees: symptoms, AI recommendation, explanation
  → Nurse approves/overrides with rationale
  → Decision logged (for fairness analysis)
  → Patient notified of final recommendation
```

#### C. Local Database

**Technology**: PostgreSQL 16

**Schema:**
```sql
-- Patient sessions (auto-delete after 7 days)
CREATE TABLE patient_sessions (
    session_id UUID PRIMARY KEY,
    age_range VARCHAR(10),  -- "20-30", "30-40" (bucketed)
    sex VARCHAR(10),        -- Clinical necessity only
    geography VARCHAR(50),  -- District (not precise address)
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

-- Symptoms (no patient identifiers)
CREATE TABLE symptoms (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES patient_sessions(session_id),
    symptom_code VARCHAR(50),  -- SNOMED CT codes
    severity INT,              -- 1-10 scale
    duration_hours INT
);

-- Triage results (immutable)
CREATE TABLE triage_results (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES patient_sessions(session_id),
    care_level VARCHAR(50),   -- "emergency", "urgent_care", "primary_care", "telemedicine", "self_care"
    confidence DECIMAL(3,2),  -- 0.00-1.00
    explanation JSONB,        -- Structured explanation
    model_version VARCHAR(50),
    human_override BOOLEAN DEFAULT FALSE,
    nurse_rationale TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fairness metrics (aggregated, no individual linking)
CREATE TABLE fairness_metrics (
    id UUID PRIMARY KEY,
    date DATE,
    demographic_group VARCHAR(100),
    care_level VARCHAR(50),
    count INT,
    avg_confidence DECIMAL(3,2),
    disparate_impact DECIMAL(3,2)
);
```

**Retention Policy (POPIA Compliance):**
```sql
-- Auto-delete patient sessions after 7 days
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM patient_sessions WHERE expires_at < NOW();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_delete_sessions
AFTER INSERT ON patient_sessions
EXECUTE FUNCTION delete_expired_sessions();
```

#### D. Federated Learning Trainer

**Technology**: Python + Flower framework

**Training Workflow:**
```
1. Central server broadcasts model parameters
2. Each clinic node trains on LOCAL data (never shared)
3. Nodes send ONLY updated parameters back (encrypted)
4. Central server aggregates parameters (secure aggregation)
5. New global model distributed to all nodes
```

**Privacy Preservation:**
- **Secure Aggregation**: Individual node parameters never visible to central server
- **Differential Privacy**: Add calibrated noise to parameters (ε=0.1)
- **Federated Averaging**: Only aggregated parameters used

---

### 3. Central Coordination Layer (Trusted Boundary)

**Technology**: .NET 8 + Python (gRPC communication)

**Components:**

#### A. API Gateway (.NET Core)

**Responsibilities:**
- Route requests to appropriate regional nodes
- Authentication and session management
- Rate limiting and DDoS protection
- Audit logging (every request logged)

**Security:**
```csharp
[Authorize]
[ServiceFilter(typeof(RateLimitFilter))]
public class TriageController : ControllerBase
{
    [HttpPost("analyze")]
    public async Task<ActionResult<TriageResult>> Analyze(
        [FromBody] SymptomRequest request)
    {
        // Validate request schema
        if (!ModelState.IsValid)
            return BadRequest("Invalid symptom data");
        
        // Determine appropriate regional node (geo-routing)
        var node = await _nodeSelector.SelectNode(request.Geography);
        
        // Forward to regional node (patient data stays there)
        var result = await _nodeClient.ForwardRequest(node, request);
        
        // Log decision (audit trail)
        await _auditLog.LogTriageDecision(request, result);
        
        return Ok(result);
    }
}
```

#### B. Federated Learning Coordinator (Python/Flower)

**Responsibilities:**
- Orchestrate federated training rounds
- Aggregate model parameters from nodes
- Validate global model fairness
- Trigger governance voting on model updates

**Workflow:**
```python
class FederatedCoordinator:
    def __init__(self, strategy):
        self.strategy = FairFedAvg()  # Custom fairness-aware aggregation
    
    def orchestrate_training_round(self):
        # Step 1: Broadcast current model to all nodes
        global_model = self.get_current_model()
        
        # Step 2: Nodes train locally (in parallel)
        client_updates = []
        for node in self.active_nodes:
            update = await node.train_on_local_data(global_model)
            client_updates.append(update)
        
        # Step 3: Aggregate parameters (secure aggregation)
        aggregated_params = self.strategy.aggregate(client_updates)
        
        # Step 4: Validate fairness of new model
        fairness_metrics = self.evaluate_fairness(aggregated_params)
        
        if fairness_metrics.disparate_impact < 0.8:
            # REJECT unfair model update
            self.log_fairness_violation(fairness_metrics)
            return self.get_current_model()  # Keep old model
        
        # Step 5: Propose model update to governance
        proposal = GovernanceProposal(
            type="model_update",
            new_params=aggregated_params,
            fairness_metrics=fairness_metrics
        )
        
        governance_decision = await self.governance.vote(proposal)
        
        if governance_decision.approved:
            self.update_global_model(aggregated_params)
            return aggregated_params
        else:
            self.log_governance_rejection(proposal, governance_decision)
            return self.get_current_model()
```

#### C. Analytics Aggregator (Differential Privacy)

**Responsibilities:**
- Aggregate fairness metrics across nodes
- Publish public transparency dashboard
- Ensure differential privacy (ε=0.1)

**Privacy-Preserving Aggregation:**
```python
class DifferentialPrivacyAggregator:
    def __init__(self, epsilon=0.1):
        self.epsilon = epsilon
    
    def aggregate_fairness_metrics(self, node_metrics):
        # Aggregate counts across nodes
        aggregated = sum(node_metrics, axis=0)
        
        # Add Laplace noise for differential privacy
        sensitivity = 1  # Max change from one patient
        scale = sensitivity / self.epsilon
        noise = np.random.laplace(0, scale, aggregated.shape)
        
        noisy_aggregated = aggregated + noise
        
        # Ensure non-negative (clip)
        return np.maximum(noisy_aggregated, 0)
```

#### D. Audit Logger (Immutable Records)

**Technology**: Append-only log (PostgreSQL + write-once storage)

**Schema:**
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    event_type VARCHAR(50),  -- "triage_decision", "nurse_override", "governance_vote"
    actor VARCHAR(100),       -- "patient_session_id", "nurse_id", "agent_name"
    action TEXT,              -- JSON of what happened
    outcome TEXT,             -- JSON of result
    node_id VARCHAR(50)       -- Which regional node
);

-- Immutability: No updates or deletes allowed
REVOKE UPDATE, DELETE ON audit_log FROM ALL;
```

---

### 4. Governance Layer (Verifiable Boundary)

**Technology**: .NET 8 (smart contract-like logic)

**Stakeholder Agent System:**

```csharp
public interface IStakeholderAgent
{
    string AgentType { get; } // "Patient", "Provider", "PublicHealth"
    
    Vote EvaluateProposal(GovernanceProposal proposal);
    
    string GetRationale();
}

// Patient Agent (40% voting weight)
public class PatientAgent : IStakeholderAgent
{
    private readonly PatientPriorities _priorities;
    
    public PatientAgent(PatientPriorities priorities)
    {
        // Priorities based on healthcare AI patient research:
        // - Accessibility (can low-income patients access?)
        // - Privacy (is patient data protected?)
        // - Transparency (can patients understand decisions?)
        // - Cost (does this increase patient costs?)
        _priorities = priorities;
    }
    
    public Vote EvaluateProposal(GovernanceProposal proposal)
    {
        // Proposal: Reduce explanation detail to improve speed
        
        if (proposal.Type == "reduce_transparency")
        {
            return Vote.Against(
                "Transparency reduction harms patient autonomy. " +
                "Patients need detailed explanations to make informed decisions. " +
                "Research shows low-literacy patients particularly benefit from detailed explanations."
            );
        }
        
        if (proposal.Type == "model_update")
        {
            var fairnessChange = proposal.NewFairness - proposal.CurrentFairness;
            
            if (fairnessChange < 0)
            {
                return Vote.Against(
                    $"Model update worsens fairness by {fairnessChange:P}. " +
                    "This disproportionately harms vulnerable patient populations."
                );
            }
            
            if (proposal.ImprovesAccessibility())
            {
                return Vote.For(
                    "Model update improves accessibility for underserved communities."
                );
            }
        }
        
        return Vote.Abstain("No significant patient interest.");
    }
}

// Provider Agent (35% voting weight)
public class ProviderAgent : IStakeholderAgent
{
    public Vote EvaluateProposal(GovernanceProposal proposal)
    {
        // Priorities: clinical accuracy, liability protection, workflow efficiency
        
        if (proposal.Type == "model_update")
        {
            if (proposal.ClinicalAccuracy < 0.80)
            {
                return Vote.Against(
                    "Clinical accuracy below acceptable threshold (80%). " +
                    "Risks patient harm and provider liability."
                );
            }
            
            if (!proposal.ClinicallyValidated)
            {
                return Vote.Against(
                    "Model update not clinically validated by licensed professionals. " +
                    "Cannot approve without validation."
                );
            }
        }
        
        if (proposal.Type == "workflow_change")
        {
            if (proposal.IncreasesProviderBurden())
            {
                return Vote.Against(
                    "Workflow change increases provider burden without clinical benefit. " +
                    "Will reduce system adoption."
                );
            }
        }
        
        return Vote.For("Meets clinical and workflow standards.");
    }
}

// Public Health Agent (25% voting weight)
public class PublicHealthAgent : IStakeholderAgent
{
    public Vote EvaluateProposal(GovernanceProposal proposal)
    {
        // Priorities: equity, population coverage, cost-effectiveness
        
        if (proposal.Type == "model_update")
        {
            var equityMetrics = proposal.EquityAnalysis;
            
            if (equityMetrics.DisparateImpact > 0.2)
            {
                return Vote.Against(
                    $"Model update creates disparate impact of {equityMetrics.DisparateImpact:P}. " +
                    "Violates equity principles."
                );
            }
            
            if (equityMetrics.RuralAccessImprovement > 0)
            {
                return Vote.For(
                    "Model update improves rural healthcare access."
                );
            }
        }
        
        if (proposal.Type == "feature_addition")
        {
            if (!proposal.ScalesAcrossInfrastructure())
            {
                return Vote.Against(
                    "Feature requires infrastructure unavailable to underserved clinics. " +
                    "Creates two-tier system."
                );
            }
        }
        
        return Vote.Abstain("No significant population health impact.");
    }
}

// Governance Voting System
public class GovernanceSystem
{
    private readonly List<IStakeholderAgent> _agents;
    private readonly Dictionary<string, decimal> _votingWeights;
    
    public GovernanceSystem()
    {
        _agents = new List<IStakeholderAgent>
        {
            new PatientAgent(researchBackedPriorities),
            new ProviderAgent(),
            new PublicHealthAgent()
        };
        
        _votingWeights = new Dictionary<string, decimal>
        {
            { "Patient", 0.40m },
            { "Provider", 0.35m },
            { "PublicHealth", 0.25m }
        };
    }
    
    public async Task<GovernanceDecision> EvaluateProposal(GovernanceProposal proposal)
    {
        var votes = new List<StakeholderVote>();
        
        foreach (var agent in _agents)
        {
            var vote = agent.EvaluateProposal(proposal);
            var rationale = agent.GetRationale();
            
            votes.Add(new StakeholderVote
            {
                Agent = agent.AgentType,
                Vote = vote,
                Rationale = rationale,
                Weight = _votingWeights[agent.AgentType]
            });
        }
        
        // Calculate weighted outcome
        var weightedSupport = votes
            .Where(v => v.Vote == Vote.For)
            .Sum(v => v.Weight);
        
        var weightedOpposition = votes
            .Where(v => v.Vote == Vote.Against)
            .Sum(v => v.Weight);
        
        var approved = weightedSupport > weightedOpposition;
        
        // Log full governance decision (transparency)
        var decision = new GovernanceDecision
        {
            ProposalId = proposal.Id,
            Votes = votes,
            WeightedSupport = weightedSupport,
            WeightedOpposition = weightedOpposition,
            Approved = approved,
            Timestamp = DateTime.UtcNow
        };
        
        await _auditLog.LogGovernanceDecision(decision);
        await _publicDashboard.PublishDecision(decision);  // Transparency
        
        return decision;
    }
}
```

---

## Data Flow Architecture

### Flow 1: Patient Triage (Normal Case)

```
1. Patient → Web Interface (symptom input)
   └─> POST /api/triage/analyze
       {
         "symptoms": ["fever", "cough", "shortness_of_breath"],
         "severity": [8, 6, 9],
         "age_range": "30-40",
         "geography": "Johannesburg"
       }

2. API Gateway → Regional Node Selection
   └─> Geo-routing based on patient location
   └─> Forward to Clinic Node A

3. Clinic Node A → Triage Engine
   └─> Phase 1: Call Gemini API
   └─> Phase 2: Local decision tree inference
   └─> Phase 3: Federated LLM inference

4. Triage Engine → Result Generation
   └─> {
         "care_level": "emergency",
         "confidence": 0.92,
         "explanation": {
           "primary_concern": "Respiratory distress symptoms",
           "red_flags": ["shortness_of_breath", "high_fever"],
           "recommendation": "Seek emergency care immediately"
         }
       }

5. Stakes Assessment → Human Review Decision
   └─> IF care_level == "emergency" AND confidence < 0.95:
       └─> Queue for nurse review (human-in-loop)
   └─> ELSE:
       └─> Return result to patient (automated with alert)

6. Nurse Review (if triggered)
   └─> Nurse sees: symptoms, AI recommendation, explanation
   └─> Nurse approves/overrides
   └─> Decision logged with rationale

7. Result → Patient Interface
   └─> Display care recommendation
   └─> Show explanation (causal chain)
   └─> Provide counterfactual ("If you also had X, recommendation would be Y")
   └─> Offer nearest appropriate facility (map + directions)

8. Audit Logging
   └─> Log: session_id, symptoms, result, nurse_override, timestamp
   └─> Store locally (never centralized)
   └─> Aggregate fairness metrics (differential privacy)
```

### Flow 2: Federated Model Training

```
1. Training Schedule Trigger (weekly)
   └─> Central coordinator broadcasts training request

2. Each Regional Node
   └─> Load local patient data (last week's triage results)
   └─> Train model on LOCAL data ONLY
   └─> Compute model parameter updates
   └─> Encrypt parameters
   └─> Send ONLY parameters to central server (not data)

3. Central Coordinator
   └─> Receive encrypted parameters from all nodes
   └─> Secure aggregation (federated averaging)
   └─> Compute global model update

4. Fairness Validation
   └─> Test global model on held-out diverse dataset
   └─> Measure disparate impact across demographics
   └─> IF fairness violations detected:
       └─> REJECT model update
       └─> Log fairness violation
       └─> Investigate bias source

5. Governance Voting
   └─> Create proposal: "New model with fairness metrics X, accuracy Y"
   └─> Patient Agent evaluates (fairness focus)
   └─> Provider Agent evaluates (accuracy focus)
   └─> Public Health Agent evaluates (equity focus)
   └─> Weighted vote resolution

6. Deployment (if approved)
   └─> Distribute new global model to all nodes
   └─> Log governance decision (transparency)
   └─> Update public dashboard with new model metrics

7. Monitoring
   └─> Track model performance in production
   └─> Alert if fairness degrades
   └─> Schedule next training round
```

### Flow 3: Governance Proposal (Feature Change)

```
1. Proposal Creation
   └─> Type: "Reduce explanation detail to improve response time"
   └─> Expected impact:
       - Response time: 10s → 4s (60% reduction)
       - Explanation detail: High → Medium
       - User comprehension: Est. 80% → 65%

2. Patient Agent Evaluation
   └─> Priority check: Transparency
   └─> Decision: AGAINST
   └─> Rationale: "Reduced explanations harm informed consent. Research shows patients with lower health literacy require detailed explanations."

3. Provider Agent Evaluation
   └─> Priority check: Workflow efficiency
   └─> Decision: FOR
   └─> Rationale: "60% speed improvement significantly enhances clinic workflow. Faster triage enables seeing more patients."

4. Public Health Agent Evaluation
   └─> Priority check: Equity
   └─> Decision: AGAINST
   └─> Rationale: "Reduced explanations disproportionately harm low-literacy patients, typically from underserved communities. Increases health disparities."

5. Weighted Vote Calculation
   └─> Support: 0.35 (Provider only)
   └─> Opposition: 0.65 (Patient 0.40 + Public Health 0.25)
   └─> RESULT: REJECTED

6. Alternative Resolution
   └─> System proposes: "Implement async explanation generation"
       - Keep detailed explanations
       - Load incrementally (faster initial response)
       - Full explanation available within 2s
   └─> Re-vote: APPROVED (all agents support)

7. Audit & Transparency
   └─> Log full vote record with rationales
   └─> Publish to public governance dashboard
   └─> Implement approved alternative
```


```csharp
// Patient data export (must happen within 7-day retention)
public class PatientDataExportService
{
    public async Task<ExportPackage> ExportSessionData(Guid sessionId)
    {
        var session = await _db.PatientSessions
            .Include(s => s.Symptoms)
            .Include(s => s.TriageResults)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);
        
        if (session == null || session.ExpiresAt < DateTime.UtcNow)
            throw new DataExpiredException("Session data no longer available");
        
        return new ExportPackage
        {
            Format = ExportFormat.JSON, // or PDF, CSV
            Data = new
            {
                session.Symptoms,
                session.TriageResults,
                ExportedAt = DateTime.UtcNow,
                ExpiresAt = session.ExpiresAt
            }
        };
    }
}
```
---
```

```
## Technology Stack (Detailed)

### Backend (.NET Components)

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **API Gateway** | ASP.NET Core 8 | Production-grade, high-performance, your expertise |
| **Governance Engine** | .NET 8 | Type-safe contracts, testable agent logic |
| **Data Access** | Entity Framework Core 8 | Type-safe ORM, migration management |
| **Real-Time Comms** | SignalR | Nurse dashboard live updates |
| **Caching** | Redis | Session state, rate limiting |
| **Authentication** | ASP.NET Identity + JWT | Industry standard, POPIA-compliant |

### ML Pipeline (Python Components)

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Federated Learning** | Flower 1.7+ | Purpose-built for federated ML |
| **Model Training** | scikit-learn (Phase 2), transformers (Phase 3) | Decision trees → LLMs progression |
| **Explainability** | SHAP, LIME | Model-agnostic explanations |
| **Privacy** | Opacus (differential privacy) | PyTorch privacy library |
| **Model Serving** | FastAPI | High-performance Python API |

### Infrastructure

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Databases** | PostgreSQL 16 | ACID compliance, JSON support |
| **Message Queue** | RabbitMQ | Reliable async processing |
| **Monitoring** | Prometheus + Grafana | Industry standard observability |
| **Logging** | Seq (structured logs) | .NET-native, powerful querying |
| **Secrets** | Azure Key Vault | Managed secrets, HSM-backed |

### Communication Protocols

- **Client ↔ API**: HTTPS (TLS 1.3)
- **.NET ↔ Python**: gRPC (HTTP/2, Protocol Buffers)
- **Real-time**: SignalR (WebSockets)
- **Federated**: Encrypted parameter exchange (TLS + app-level encryption)

---

## Deployment Architecture

### Development Environment

```
Developer Machine
├─ .NET API (localhost:5000)
├─ Python ML Service (localhost:8000)
├─ PostgreSQL (Docker container)
├─ Redis (Docker container)
└─ React Frontend (localhost:3000)
```

### Staging Environment (Multi-Node Simulation)

```
Azure Cloud (South Africa North region)
├─ API Gateway (App Service)
├─ Federated Coordinator (Container Instance)
├─ Regional Node 1 (simulated - VM)
├─ Regional Node 2 (simulated - VM)
├─ Regional Node 3 (simulated - VM)
└─ Shared PostgreSQL (Azure Database)
```

Staging FREE: 
- Primary: Local Docker Compose (multi-container simulation)
- Optional: Azure free tier (App Service Free F1 + Azure Database Free tier)
- Avoid: Any services requiring student email/credits

### Free Tier Limits & Workarounds

**Phase 1-2 (Months 0-12): Zero-Cost Target**

| Service | Free Tier Limit | Our Usage | Strategy |
|---------|----------------|-----------|----------|
| **Compute** | Local only | Dev environment | Docker Compose (no cloud yet) |
| **Database** | PostgreSQL local | All data local | Docker container |
| **Gemini API** | 60 req/min free | ~10/day testing | Well within limit |
| **Storage** | Local disk | <10GB | More than sufficient |

**Phase 3 (Months 12-18): Minimal Cloud Costs**

| Service | Free Option | Paid Upgrade Trigger | Monthly Cost |
|---------|-------------|---------------------|--------------|
| **VM (Azure)** | B1S burstable | >80% CPU sustained | $0-15 |
| **Database** | Azure DB Basic | >2GB data | $0-25 |
| **Networking** | 15GB egress free | >1000 users | $0 |
| **Total** | | | **<$50/month** |

**Scale Trigger**: Only migrate to paid tier when free tier becomes bottleneck

Production: Clinic Node A (On-Premise/Edge)
```
Production Phase 3: Cloud-Simulated Federation
- Each "clinic node" is a separate Azure VM or container
- Simulates federation without physical deployment
- Proves architecture works before clinic partnerships
  
Production Phase 4+ (Future): Hybrid Cloud-Edge
- Actual clinic deployments once partnerships secured
- Cloud nodes remain for clinics without on-premise capacity
```



### Production Environment (Phase 3)

```
Clinic Node A (On-Premise/Edge)
├─ Local API (.NET)
├─ Local ML Service (Python)
├─ Local PostgreSQL
└─ Backup connectivity (4G failover)

Clinic Node B (On-Premise/Edge)
├─ [Same stack]

Central Coordination (Azure)
├─ API Gateway
├─ Federated Coordinator
├─ Governance Engine
├─ Analytics Aggregator
└─ Public Dashboard
```

---

## Security Architecture

### Trust Boundary Enforcement

| Boundary | Enforcement Mechanism |
|----------|----------------------|
| **Patient → Node** | Session-based auth, no persistent IDs, TLS 1.3 |
| **Node → Central** | Mutual TLS, API keys, IP whitelisting |
| **Central → Governance** | Smart contract-like immutability, audit logging |
| **Public Transparency** | Read-only dashboard, differential privacy (ε=0.1) |

### Data Classification

**RESTRICTED (never centralized):**
- Patient symptoms
- Vital signs
- Session identifiers
- Individual triage results

**INTERNAL (encrypted, aggregated):**
- Model parameters
- Fairness metrics (by demographic group)
- Node performance statistics

**PUBLIC (transparency requirement):**
- Governance decisions (vote records)
- Aggregate outcome statistics
- Model performance metrics (overall)
- Disparate impact ratios

### Encryption Strategy

| Data Type | At Rest | In Transit | Key Management |
|-----------|---------|------------|----------------|
| Patient symptoms | AES-256 | TLS 1.3 | Local node keys |
| Model parameters | AES-256 | TLS 1.3 + app-level | Azure Key Vault |
| Governance records | Immutable logs | TLS 1.3 | Audit-only access |

---

## Scalability Strategy

### Current Limits (Phase 1-2)

| Resource | Limit | Current Usage | Headroom |
|----------|-------|---------------|----------|
| Regional Nodes | 3 max | 1 (simulated) | 3x |
| Concurrent Patients | 50/node | ~5 (testing) | 10x |
| Triage Latency | <10s (p95) | 8s avg | OK |
| Federated Training | Daily | Weekly | 7x |

### Growth Triggers

**Phase Transition Criteria:**

**Phase 1 → Phase 2:**
- Gemini API costs exceed $50/month → migrate to local model
- Accuracy validated at 80%+ → proceed with local deployment

**Phase 2 → Phase 3:**
- 3+ clinic partnerships secured → expand to multi-node
- Fairness metrics stable at >0.8 DI ratio → ready for real patients
- Local model performance plateaus → upgrade to federated LLM

**Phase 3 → Scale:**
- 5+ nodes operational → consider multi-region
- 2000+ patients served → measure real-world impact
- Sustainability funding secured → plan expansion

---

## Monitoring & Observability

### Key Metrics (Dashboards)

**Clinical Metrics:**
- Triage accuracy (validated by nurses)
- Override rate (% decisions changed by humans)
- Emergency detection sensitivity
- False positive rate (unnecessary ER referrals)

**Fairness Metrics:**
- Disparate impact ratio (by race, income, geography)
- Outcome equity (ER diversion by demographic)
- Accessibility metrics (low-literacy patient outcomes)

**Operational Metrics:**
- Triage latency (p50, p95, p99)
- Node uptime
- Federated training convergence time
- Governance decision frequency

**Governance Metrics:**
- Proposals submitted
- Vote distribution (by agent type)
- Decision approval rate
- Conflict resolution time

### Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Triage accuracy | <85% | <80% | Halt new patients, investigate |
| Disparate impact | >0.2 | >0.3 | Flag to governance, audit model |
| Override rate | >20% | >30% | Clinical review needed |
| Node downtime | >5% | >10% | Failover to backup |

---

## Success Criteria (Lock These)

### Phase 1 Success (Month 6)
- ✅ Gemini-based triage working
- ✅ 100 synthetic scenarios processed correctly
- ✅ Fairness DI ratio >0.8
- ✅ Governance agents voting consistently
- ✅ Nurse dashboard functional

### Phase 2 Success (Month 12)
- ✅ Local model accuracy ≥80%
- ✅ Federated learning proof-of-concept working
- ✅ 3 simulated nodes operational
- ✅ Governance blocking unfair model updates
- ✅ Monthly costs <$200

### Phase 3 Success (Month 18)
- ✅ Federated LLM accuracy ≥85%
- ✅ 2+ real clinic partnerships
- ✅ 500+ synthetic patient validations by nurses
- ✅ No fairness violations in production
- ✅ Public transparency dashboard live

---

## Stop Conditions (Non-Negotiable)

**Phase 1 STOP if:**
- ❌ Gemini API unreliable (<90% success rate) → implement fallback
- ❌ Fairness metrics fail (DI >0.2) → freeze development, fix bias
- ❌ Costs exceed $150/month → optimize or reduce scope

**Phase 2 STOP if:**
- ❌ Local model accuracy <75% → extend training, collect more data
- ❌ Federated training diverges → debug aggregation
- ❌ Security audit fails → remediate before proceeding

**Phase 3 STOP if:**
- ❌ Nurse validation accuracy <80% → retrain model
- ❌ Patient harm incident → suspend system, investigate
- ❌ POPIA compliance violation → halt patient data collection

---

## Appendix: Architectural Decisions Record

### ADR-001: Hybrid .NET + Python Stack
**Decision**: Use .NET for infrastructure, Python for ML  
**Rationale**: Leverage expertise (.NET) + ML ecosystem (Python)  
**Alternatives Rejected**: Pure .NET (weak ML libraries), Pure Python (slower API development)

### ADR-002: Federated Learning vs. Centralized
**Decision**: Federated architecture from design  
**Rationale**: Power distribution principle, POPIA compliance, trust building  
**Tradeoff**: Higher complexity, slower iteration

### ADR-003: Stakeholder Agents vs. Real Voting
**Decision**: Research-backed agent simulation  
**Rationale**: Solo developer, empirically grounded, publishable methodology  
**Migration Path**: Replace with real stakeholders when partnerships secured

### ADR-004: Gemini → Local → Federated LLM Progression
**Decision**: Staged AI complexity increase  
**Rationale**: Ship fast (Gemini), build capability (local), achieve architecture (federated)  
**Risk Mitigation**: Each phase validates before next

---

**End of Architecture Specification v1.0**

**Next Document**: Security & Privacy Model (healthcare threat analysis, POPIA compliance architecture)