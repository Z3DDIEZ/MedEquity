**Version**: 1.0  
**Status**: Locked for Execution  
**Author**: Zawadi MC Nyachiya  
**Date**: January 2026  
**Timeline**: January 2026 → June 2027 (18 months)  
**Effort**: Part-time (20-30 hours/week)

---

## Executive Summary

### Project Scope

MedEquity will be built in **5 distinct phases** over 18 months:

1. **Phase 0** (Months 0-1): Foundation & Learning
2. **Phase 1** (Months 2-6): Centralized Prototype (Gemini API)
3. **Phase 2** (Months 7-12): Local Models & Federated Learning POC
4. **Phase 3** (Months 13-15): Hardening & Validation
5. **Phase 4** (Months 16-18): Gauteng Pilot Preparation

### Timeline Visual

```
Month: 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
       |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
Phase: [0][--------1--------][----------2-----------][--3--][4]
Learn  Setup  Gemini    Local Models  Federated  Harden  Pilot
              Triage    + Governance  Learning   Validate Deploy

Gates:    ✓     ✓          ✓             ✓          ✓      ✓
       Learn  Proto    Fairness     Fed Train   Secure  Ready
```

### Success Milestones

| Month  | Milestone           | Deliverable                 | Gate Criteria                      |
| ------ | ------------------- | --------------------------- | ---------------------------------- |
| **1**  | Foundation Complete | Docker env, gRPC working    | Can run .NET ↔ Python hello world  |
| **6**  | Gemini Prototype    | 100 synthetic cases triaged | Accuracy >85%, Fairness DI <0.2    |
| **9**  | Governance System   | Agents voting on proposals  | 10+ proposal scenarios resolved    |
| **12** | Federated Learning  | 3-node training converges   | Accuracy ≥80%, Fairness maintained |
| **15** | Security Validated  | Penetration test passed     | Zero critical vulnerabilities      |
| **18** | Pilot Ready         | Nurse training complete     | 500+ synthetic validations         |

---

## Phase 0: Foundation & Learning (Month 0-1)

### **Month 0: Pre-Development Learning (January 2026)**

**Goal**: Acquire prerequisite technical knowledge before writing code.

**Time Commitment**: 50-60 hours total (12-15 hrs/week)

---

#### **Week 1-2: gRPC Fundamentals (15-20 hours)**

**What is gRPC?**

- Remote Procedure Call (RPC) framework using Protocol Buffers
- Enables .NET services to call Python functions (and vice versa)
- Required for MedEquity: .NET API calls Python ML models

**Learning Resources**:

1. [Microsoft gRPC Tutorial](https://learn.microsoft.com/en-us/aspnet/core/grpc/) (3 hours)
2. [gRPC for .NET Developers Book](https://docs.microsoft.com/en-us/dotnet/architecture/grpc-for-wcf-developers/) (5 hours)
3. [Python gRPC Quickstart](https://grpc.io/docs/languages/python/quickstart/) (2 hours)

**Hands-On Exercise**:

```
Build a Calculator Service:
- C# client sends: Add(5, 3)
- Python server returns: 8
- Implement: Add, Subtract, Multiply, Divide

Deliverable: Working gRPC client-server (GitHub repo)
```

**Success Criteria**:

- [ ] Can define `.proto` service contract
- [ ] Can generate C# client stubs
- [ ] Can implement Python server
- [ ] Can handle errors gracefully

**Time**: 10-15 hours (including debugging)

---

#### **Week 3-4: Federated Learning Basics (15-20 hours)**

**What is Federated Learning?**

- Training ML models across decentralized data
- Data stays local, only model parameters shared
- Core to MedEquity's power distribution principle

**Learning Resources**:

1. [Google FL Comic](https://federated.withgoogle.com/) (30 min intro)
2. [Flower Framework Quickstart](https://flower.dev/docs/quickstart-pytorch.html) (3 hours)
3. [Federated Learning Paper](https://arxiv.org/abs/1602.05629) (McMahan et al.) (2 hours)
4. [FL for Healthcare Tutorial](https://flower.dev/blog/2021-12-15-federated-learning-in-healthcare/) (2 hours)

**Hands-On Exercise**:

```
MNIST Federated Training:
1. Download Flower's MNIST example
2. Run 3 simulated clients on your machine
3. Train model federally (5 rounds)
4. Compare to centralized baseline

Deliverable: Jupyter notebook with results
```

**Success Criteria**:

- [ ] Understand FL workflow (client-server architecture)
- [ ] Can run Flower simulation locally
- [ ] Understand secure aggregation concept
- [ ] Know when FL is appropriate vs. centralized

**Time**: 15-20 hours

---

#### **Week 5-6: scikit-learn Decision Trees (10-15 hours)**

**Why Decision Trees?**

- Phase 2 local model (explainable, fast)
- SHAP explanations extract decision paths
- Good baseline before deep learning

**Learning Resources**:

1. [scikit-learn Documentation](https://scikit-learn.org/stable/modules/tree.html) (2 hours)
2. [Decision Trees Tutorial](https://www.datacamp.com/tutorial/decision-tree-classification-python) (3 hours)
3. [SHAP Explainability](https://shap.readthedocs.io/en/latest/example_notebooks/overviews/An%20introduction%20to%20explainable%20AI%20with%20Shapley%20values.html) (2 hours)

**Hands-On Exercise**:

```
Build Symptom Classifier:
1. Create synthetic symptom dataset (500 examples)
   - Symptoms: fever, cough, shortness_of_breath, chest_pain
   - Labels: emergency, urgent_care, primary_care, self_care
2. Train DecisionTreeClassifier
3. Generate SHAP explanations
4. Visualize decision tree

Deliverable: Python script + visualizations
```

**Success Criteria**:

- [ ] Can train decision tree classifier
- [ ] Can extract feature importances
- [ ] Can generate SHAP value explanations
- [ ] Understand decision tree visualization

**Time**: 10-15 hours

---

#### **Week 7-8: SNOMED CT & Medical Informatics (8-10 hours)**

**Why SNOMED CT?**

- International standard for medical terminology
- Enables interoperability with health systems
- Required for clinical validation

**Learning Resources**:

1. [SNOMED CT Browser](https://browser.ihtsdotools.org/) (2 hours exploration)
2. [SNOMED CT Beginner's Guide](https://confluence.ihtsdotools.org/display/DOCSTART/SNOMED+CT+Starter+Guide) (3 hours)
3. [Healthcare Informatics Basics](https://www.coursera.org/learn/healthcare-data-models) (3 hours, free audit)

**Hands-On Exercise**:

```
Build Symptom Vocabulary:
1. Map 50 common symptoms to SNOMED codes:
   - "fever" → 386661006
   - "cough" → 49727002
   - "shortness of breath" → 267036007
   - [etc.]
2. Create JSON mapping file
3. Build symptom search function (fuzzy matching)

Deliverable: symptom_codes.json + search script
```

**Success Criteria**:

- [ ] Can navigate SNOMED CT browser
- [ ] Understand concept hierarchies (IS-A relationships)
- [ ] Can map common symptoms to codes
- [ ] Know when to use SNOMED vs. free text

**Time**: 8-10 hours

---

### **Month 0 Deliverables Checklist**

- [ ] gRPC calculator service (C# + Python)
- [ ] Federated learning MNIST example running
- [ ] Decision tree symptom classifier
- [ ] SNOMED CT symptom vocabulary (50+ codes)
- [ ] Learning journal documenting challenges

**Stop Condition**:

- ❌ If cannot get gRPC working → block Phase 1 (critical dependency)
- ❌ If FL concepts unclear → revisit resources, extend learning phase

---

### **Month 1: Development Environment Setup (February 2026)**

**Goal**: Production-ready local development environment.

---

#### **Week 1: Project Structure & Tooling**

**Tasks**:

1. Create GitHub repository (private initially)

   ```
   MedEquity/
   ├── src/
   │   ├── MedEquity.Api/          # .NET 8 API Gateway
   │   ├── MedEquity.Core/         # Domain models
   │   ├── MedEquity.Governance/   # Stakeholder agents
   │   ├── MedEquity.ML/           # Python ML services
   │   └── MedEquity.Web/          # React frontend
   ├── tests/
   ├── docs/
   ├── docker-compose.yml
   └── README.md
   ```

2. Initialize .NET solution

   ```bash
   dotnet new sln -n MedEquity
   dotnet new webapi -n MedEquity.Api
   dotnet new classlib -n MedEquity.Core
   dotnet new classlib -n MedEquity.Governance
   dotnet sln add **/*.csproj
   ```

3. Initialize Python project

   ```bash
   cd src/MedEquity.ML
   python -m venv venv
   pip install grpcio grpcio-tools flower scikit-learn shap
   pip freeze > requirements.txt
   ```

4. Configure tooling
   - VS Code workspace settings
   - Omnisharp (C#) + Pylance (Python) extensions
   - Git hooks for commit linting

**Deliverable**: Empty project structure, all tools configured

---

#### **Week 2: Docker Development Environment**

**Tasks**:

1. Create `docker-compose.yml`

   ```yaml
   version: "3.8"
   services:
     postgres:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: medequity
         POSTGRES_PASSWORD: dev_password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"

     api:
       build:
         context: ./src/MedEquity.Api
       ports:
         - "5000:5000"
       depends_on:
         - postgres
         - redis
       environment:
         ConnectionStrings__DefaultConnection: "Host=postgres;Database=medequity;Username=postgres;Password=dev_password"

     ml_service:
       build:
         context: ./src/MedEquity.ML
       ports:
         - "8000:8000"
       depends_on:
         - api

   volumes:
     postgres_data:
   ```

2. Test full stack startup

   ```bash
   docker-compose up -d
   docker-compose ps  # All services healthy
   docker-compose logs -f
   ```

3. Configure database migrations (Entity Framework)
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

**Deliverable**: `docker-compose up` brings up entire development environment

---

#### **Week 3: gRPC Integration Testing**

**Tasks**:

1. Define triage service contract (`.proto`)

   ```protobuf
   syntax = "proto3";

   package medequity.triage;

   service TriageService {
     rpc AnalyzeSymptoms (SymptomRequest) returns (TriageResult);
   }

   message SymptomRequest {
     repeated string symptom_codes = 1;
     repeated int32 severities = 2;
     string age_range = 3;
     string sex = 4;
   }

   message TriageResult {
     string care_level = 1;
     float confidence = 2;
     string explanation = 3;
   }
   ```

2. Generate C# client stubs

   ```bash
   dotnet add package Grpc.Tools
   # Auto-generates code from .proto
   ```

3. Implement Python server

   ```python
   import grpc
   from concurrent import futures
   import triage_pb2
   import triage_pb2_grpc

   class TriageServicer(triage_pb2_grpc.TriageServiceServicer):
       def AnalyzeSymptoms(self, request, context):
           # Stub implementation for now
           return triage_pb2.TriageResult(
               care_level="primary_care",
               confidence=0.85,
               explanation="Stub response"
           )

   def serve():
       server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
       triage_pb2_grpc.add_TriageServiceServicer_to_server(
           TriageServicer(), server)
       server.add_insecure_port('[::]:8000')
       server.start()
       server.wait_for_termination()
   ```

4. Test end-to-end

   ```csharp
   // C# client
   var channel = GrpcChannel.ForAddress("http://localhost:8000");
   var client = new TriageService.TriageServiceClient(channel);

   var request = new SymptomRequest
   {
       SymptomCodes = { "386661006", "49727002" },  // fever, cough
       Severities = { 8, 6 },
       AgeRange = "30-40",
       Sex = "Male"
   };

   var result = await client.AnalyzeSymptomsAsync(request);
   Console.WriteLine($"Care Level: {result.CareLevel}");
   ```

**Deliverable**: .NET API successfully calls Python ML service via gRPC

---

#### **Week 4: Basic Database Schema & API Skeleton**

**Tasks**:

1. Define domain models (C#)

   ```csharp
   public class PatientSession
   {
       public Guid SessionId { get; set; }
       public string AgeRange { get; set; }
       public string Sex { get; set; }
       public string Geography { get; set; }
       public DateTime CreatedAt { get; set; }
       public DateTime ExpiresAt { get; set; }
   }

   public class Symptom
   {
       public Guid Id { get; set; }
       public Guid SessionId { get; set; }
       public string SymptomCode { get; set; }
       public int Severity { get; set; }
       public int DurationHours { get; set; }
   }

   public class TriageResult
   {
       public Guid Id { get; set; }
       public Guid SessionId { get; set; }
       public string CareLevel { get; set; }
       public decimal Confidence { get; set; }
       public string Explanation { get; set; }
       public DateTime CreatedAt { get; set; }
   }
   ```

2. Create EF Core DbContext

   ```csharp
   public class MedEquityDbContext : DbContext
   {
       public DbSet<PatientSession> PatientSessions { get; set; }
       public DbSet<Symptom> Symptoms { get; set; }
       public DbSet<TriageResult> TriageResults { get; set; }

       protected override void OnModelCreating(ModelBuilder builder)
       {
           builder.Entity<PatientSession>()
               .HasMany<Symptom>()
               .WithOne()
               .HasForeignKey(s => s.SessionId);
       }
   }
   ```

3. Create migration and update database

   ```bash
   dotnet ef migrations add CoreSchema
   dotnet ef database update
   ```

4. Build skeleton API controllers
   ```csharp
   [ApiController]
   [Route("api/[controller]")]
   public class TriageController : ControllerBase
   {
       [HttpPost("analyze")]
       public async Task<ActionResult<TriageResultDto>> Analyze(
           [FromBody] SymptomRequestDto request)
       {
           // TODO: Implement
           return Ok(new TriageResultDto());
       }
   }
   ```

**Deliverable**: Database schema applied, API responds to requests (stub data)

---

### **Phase 0 Success Criteria**

**Technical Validation**:

- [x] Docker environment starts cleanly
- [x] .NET API → Python ML service gRPC call works
- [ ] Database migrations apply successfully
- [ ] All learning exercises completed

**Knowledge Validation**:

- [ ] Can explain federated learning workflow
- [x] Can define gRPC service contracts
- [ ] Can train decision tree and extract explanations
- [ ] Can map symptoms to SNOMED codes

**Stop Condition**:

- ❌ If gRPC integration fails → debug before Phase 1
- ❌ If Docker environment unstable → fix infrastructure first

---

## Phase 1: Centralized Prototype with Gemini (Months 2-6)

**Goal**: Working triage system using Gemini API, single-node deployment.

---

### **Month 2: Gemini Integration & Prompt Engineering**

#### **Week 1: Gemini API Setup**

**Tasks**:

1. Create Google AI Studio account
2. Generate API key
3. Install Gemini SDK
   ```bash
   pip install google-generativeai
   ```
4. Test basic completion

   ```python
   import google.generativeai as genai

   genai.configure(api_key='YOUR_API_KEY')
   model = genai.GenerativeModel('gemini-1.5-flash')

   response = model.generate_content("What is triage?")
   print(response.text)
   ```

**Deliverable**: Gemini API key working, quota confirmed

---

#### **Week 2-3: Triage Prompt Engineering**

**Tasks**:

1. Design canonical triage prompt

   ```python
   TRIAGE_PROMPT_TEMPLATE = """
   You are a healthcare triage assistant. Analyze the following symptoms and recommend appropriate care level.

   Patient Information:
   - Age Range: {age_range}
   - Sex: {sex}
   - Geography: {geography}

   Symptoms:
   {symptoms_list}

   Based ONLY on symptom severity and clinical guidelines, recommend ONE of:
   - emergency: Life-threatening, immediate ER needed
   - urgent_care: Serious but not life-threatening, urgent care within 4 hours
   - primary_care: Non-urgent, schedule appointment within 1-3 days
   - telemedicine: Suitable for virtual consultation
   - self_care: Minor symptoms, monitor at home

   Return ONLY valid JSON:
   {{
     "care_level": "...",
     "confidence": 0.0-1.0,
     "primary_concern": "...",
     "reasoning": "...",
     "red_flags": ["..."],
     "next_steps": ["..."]
   }}

   DO NOT diagnose conditions. ONLY recommend care settings.
   """
   ```

2. Test on 20 synthetic scenarios

   ```python
   test_cases = [
       {
           "symptoms": ["fever", "cough", "shortness_of_breath"],
           "severities": [8, 6, 9],
           "expected": "emergency"
       },
       # ... 19 more cases
   ]

   for case in test_cases:
       result = analyze_with_gemini(case)
       assert result.care_level == case["expected"]
   ```

3. Iterate on prompt (improve accuracy)
   - Add few-shot examples
   - Refine instructions
   - Test edge cases

**Deliverable**: Prompt achieving >80% accuracy on test set

---

#### **Week 4: Gemini Integration in .NET API**

**Tasks**:

1. Create `GeminiTriageService` (Python)

   ```python
   class GeminiTriageService:
       def __init__(self, api_key):
           genai.configure(api_key=api_key)
           self.model = genai.GenerativeModel('gemini-1.5-flash')

       def analyze_symptoms(self, request: SymptomRequest) -> TriageResult:
           prompt = build_prompt(request)

           try:
               response = self.model.generate_content(prompt)
               result = parse_and_validate(response.text)
               return result
           except Exception as e:
               logger.error(f"Gemini API error: {e}")
               return fallback_response()
   ```

2. Expose via gRPC

   ```python
   class TriageServicer(triage_pb2_grpc.TriageServiceServicer):
       def __init__(self):
           self.gemini = GeminiTriageService(os.getenv('GEMINI_API_KEY'))

       def AnalyzeSymptoms(self, request, context):
           result = self.gemini.analyze_symptoms(request)
           return result
   ```

3. Call from .NET API
   ```csharp
   public class TriageController : ControllerBase
   {
       private readonly TriageService.TriageServiceClient _grpcClient;

       [HttpPost("analyze")]
       public async Task<ActionResult<TriageResultDto>> Analyze(
           [FromBody] SymptomRequestDto request)
       {
           var grpcRequest = MapToGrpc(request);
           var grpcResult = await _grpcClient.AnalyzeSymptomsAsync(grpcRequest);

           // Store in database
           await SaveToDatabase(grpcResult);

           return Ok(MapToDto(grpcResult));
       }
   }
   ```

**Deliverable**: End-to-end triage working (user input → Gemini → database → response)

---

### **Month 3: Frontend & User Experience**

#### **Week 1-2: React Frontend Skeleton**

**Tasks**:

1. Initialize React + TypeScript + Vite

   ```bash
   npm create vite@latest medequity-web -- --template react-ts
   cd medequity-web
   npm install
   ```

2. Set up routing (React Router)

   ```typescript
   import { BrowserRouter, Routes, Route } from 'react-router-dom';

   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/triage" element={<TriagePage />} />
           <Route path="/result/:sessionId" element={<ResultPage />} />
         </Routes>
       </BrowserRouter>
     );
   }
   ```

3. Configure Tailwind CSS
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

**Deliverable**: React app running, basic routing working

---

#### **Week 3: Symptom Intake Form**

**Tasks**:

1. Build symptom selection UI

   ```typescript
   interface SymptomFormProps {
     onSubmit: (symptoms: SymptomData) => void;
   }

   function SymptomForm({ onSubmit }: SymptomFormProps) {
     const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);

     return (
       <form onSubmit={handleSubmit}>
         <h2>Select Your Symptoms</h2>

         <SymptomCheckboxGroup
           symptoms={COMMON_SYMPTOMS}
           selected={selectedSymptoms}
           onChange={setSelectedSymptoms}
         />

         {selectedSymptoms.map(symptom => (
           <SeveritySlider
             key={symptom.code}
             symptom={symptom}
             value={symptom.severity}
             onChange={updateSeverity}
           />
         ))}

         <button type="submit">Get Recommendation</button>
       </form>
     );
   }
   ```

2. Add demographics inputs (age range, sex, location)
3. Validate form (all required fields)
4. Show loading state during API call

**Deliverable**: Fully functional symptom intake form

---

#### **Week 4: Result Display & Explanation**

**Tasks**:

1. Build result page

   ```typescript
   function ResultPage() {
     const { sessionId } = useParams();
     const { data: result, isLoading } = useQuery(
       ['triage', sessionId],
       () => fetchTriageResult(sessionId)
     );

     if (isLoading) return <LoadingSpinner />;

     return (
       <div>
         <CareRecommendation level={result.care_level} />
         <ConfidenceIndicator value={result.confidence} />
         <Explanation reasoning={result.reasoning} />
         <NextSteps steps={result.next_steps} />
         <DisclaimerBanner />
       </div>
     );
   }
   ```

2. Style with urgency-based colors
   - Emergency: Red
   - Urgent Care: Orange
   - Primary Care: Yellow
   - Telemedicine: Blue
   - Self-Care: Green

3. Add export functionality (PDF/JSON)

**Deliverable**: Complete user journey (symptom entry → recommendation display)

---

### **Month 4: Nurse Dashboard & Human Oversight**

#### **Week 1-2: Blazor Nurse Dashboard**

**Tasks**:

1. Create Blazor Server project

   ```bash
   dotnet new blazorserver -n MedEquity.NurseDashboard
   ```

2. Build review queue UI

   ```razor
   @page "/review-queue"

   <h3>Triage Review Queue</h3>

   <div class="queue">
       @foreach (var item in Queue.OrderByDescending(q => q.Urgency))
       {
           <ReviewCard Item="@item" OnReview="HandleReview" />
       }
   </div>

   @code {
       private List<TriageReviewItem> Queue { get; set; } = new();

       protected override async Task OnInitializedAsync()
       {
           Queue = await TriageService.GetPendingReviews();
       }

       private async Task HandleReview(ReviewDecision decision)
       {
           await TriageService.SubmitReview(decision);
           await RefreshQueue();
       }
   }
   ```

3. Show AI recommendation + context
4. Allow nurse override with rationale

**Deliverable**: Nurse dashboard showing pending reviews

---

#### **Week 3: Override Mechanism**

**Tasks**:

1. Implement stakes assessment

   ```csharp
   public class StakesAssessor
   {
       public bool RequiresHumanReview(TriageResult result)
       {
           // High stakes: Emergency or low confidence
           if (result.CareLevel == "emergency" && result.Confidence < 0.95)
               return true;

           if (result.Confidence < 0.7)
               return true;

           return false;
       }
   }
   ```

2. Queue high-stakes cases for review
3. Log nurse decisions
   ```csharp
   public class NurseReviewService
   {
       public async Task SubmitReview(Guid sessionId, NurseDecision decision)
       {
           var review = new NurseReview
           {
               SessionId = sessionId,
               NurseId = decision.NurseId,
               AgreedWithAI = decision.ApprovedAIRecommendation,
               FinalRecommendation = decision.FinalCareLevel,
               Rationale = decision.Rationale,
               ReviewedAt = DateTime.UtcNow
           };

           await _db.NurseReviews.AddAsync(review);
           await _db.SaveChangesAsync();

           // Update patient session with final recommendation
           await UpdatePatientRecommendation(sessionId, review);
       }
   }
   ```

**Deliverable**: Human override workflow functional

---

#### **Week 4: SignalR Real-Time Updates**

**Tasks**:

1. Add SignalR hub

   ```csharp
   public class TriageHub : Hub
   {
       public async Task NotifyNewReview(TriageReviewItem item)
       {
           await Clients.All.SendAsync("NewReviewQueued", item);
       }
   }
   ```

2. Connect dashboard

   ```razor
   @inject NavigationManager Navigation
   @implements IAsyncDisposable

   @code {
       private HubConnection? hubConnection;

       protected override async Task OnInitializedAsync()
       {
           hubConnection = new HubConnectionBuilder()
               .WithUrl(Navigation.ToAbsoluteUri("/triageHub"))
               .Build();

           hubConnection.On<TriageReviewItem>("NewReviewQueued", item =>
           {
               Queue.Add(item);
               StateHasChanged();
           });

           await hubConnection.StartAsync();
       }
   }
   ```

**Deliverable**: Dashboard updates in real-time when new cases queued

---

### **Month 5: Fairness Metrics & Governance Foundation**

#### **Week 1-2: Fairness Measurement Infrastructure**

**Tasks**:

1. Aggregate outcomes by demographic

   ```sql
   CREATE VIEW fairness_metrics_daily AS
   SELECT
       DATE(created_at) as date,
       age_range,
       sex,
       geography,
       care_level,
       COUNT(*) as count,
       AVG(confidence) as avg_confidence
   FROM triage_results
   JOIN patient_sessions USING(session_id)
   GROUP BY date, age_range, sex, geography, care_level;
   ```

2. Calculate disparate impact

   ```csharp
   public class FairnessAnalyzer
   {
       public decimal CalculateDisparateImpact(
           string protectedAttribute,
           string favorableOutcome)
       {
           var protectedRate = GetSuccessRate(
               where: protectedAttribute,
               outcome: favorableOutcome);

           var unprotectedRate = GetSuccessRate(
               where: $"NOT {protectedAttribute}",
               outcome: favorableOutcome);

           return protectedRate / unprotectedRate;
       }
   }
   ```

3. Build fairness dashboard
4. Alert if thresholds violated

**Deliverable**: Fairness metrics tracked daily

---

#### **Week 3-4: Stakeholder Agent Skeleton**

**Tasks**:

1. Define agent interfaces

   ```csharp
   public interface IStakeholderAgent
   {
       string AgentType { get; }
       Vote EvaluateProposal(Proposal proposal);
       string GetRationale();
   }

   public class PatientAgent : IStakeholderAgent
   {
       public Vote EvaluateProposal(Proposal proposal)
       {
           // Stub: Always vote for fairness improvements
           if (proposal.ImprovesAccessibility())
               return Vote.For;
           if (proposal.ReducesTransparency())
               return Vote.Against;
           return Vote.Abstain;
       }
   }
   ```

2. Implement basic governance system

   ```csharp
   public class GovernanceSystem
   {
       public GovernanceDecision EvaluateProposal(Proposal proposal)
       {
           var votes = _agents.Select(a => new StakeholderVote
           {
               Agent = a.AgentType,
               Vote = a.EvaluateProposal(proposal),
               Weight = _weights[a.AgentType]
           }).ToList();

           var approved = CalculateWeightedOutcome(votes);
           return new GovernanceDecision { Approved = approved, Votes = votes };
       }
   }
   ```

3. Test with mock proposals
   ```csharp
   [Fact]
   public void Governance_RejectsFairnessViolation()
   {
       var proposal = new Proposal
       {
           Type = "model_update",
           FairnessChange = -0.15  // Worse fairness
       };

       var decision = _governance.EvaluateProposal(proposal);
       Assert.False(decision.Approved);
   }
   ```

**Deliverable**: Governance agents voting on test proposals

---

### **Month 6: Validation & Phase 1 Completion**

#### **Week 1-2: Synthetic Dataset Generation**

**Tasks**:

1. Create 100 clinically-informed scenarios

   ```python
   # Based on clinical decision rules
   SCENARIOS = [
       {
           "symptoms": ["chest_pain", "shortness_of_breath", "sweating"],
           "severities": [9, 8, 7],
           "age_range": "50-60",
           "sex": "Male",
           "expected_care_level": "emergency",
           "rationale": "Possible myocardial infarction"
       },
       # ... 99 more scenarios
   ]
   ```

2. Validate Gemini accuracy

   ```python
   correct = 0
   for scenario in SCENARIOS:
       result = triage_service.analyze(scenario)
       if result.care_level == scenario["expected_care_level"]:
           correct += 1

   accuracy = correct / len(SCENARIOS)
   print(f"Accuracy: {accuracy:.1%}")
   # Target: >85%
   ```

3. Measure fairness

   ```python
   by_demographic = group_by(SCENARIOS, "age_range")
   for group, scenarios in by_demographic.items():
       accuracy = evaluate_accuracy(scenarios)
       print(f"{group}: {accuracy:.1%}")

   # Ensure similar accuracy across groups
   ```

**Deliverable**: 100 scenarios validated, accuracy >85%, fairness DI <0.2

---

#### **Week 3: Security & Privacy Review**

**Tasks**:

1. Verify no PII stored

   ```sql
   -- Should return 0 rows
   SELECT * FROM patient_sessions WHERE name IS NOT NULL;
   SELECT * FROM patient_sessions WHERE email IS NOT NULL;
   ```

2. Test 7-day auto-deletion

   ```csharp
   [Fact]
   public async Task Sessions_AutoDeleteAfter7Days()
   {
       var session = await CreateTestSession();
       session.ExpiresAt = DateTime.UtcNow.AddDays(-1);  // Expired

       await RunDeletionJob();

       var exists = await _db.PatientSessions.AnyAsync(s => s.SessionId == session.SessionId);
       Assert.False(exists);
   }
   ```

3. Verify encryption at rest
4. Test data export mechanism

**Deliverable**: Security checklist complete, no vulnerabilities

---

#### **Week 4: Phase 1 Demo & Documentation**

**Tasks**:

1. Record demo video (5-10 min)
   - Show symptom intake
   - Gemini triage recommendation
   - Nurse override workflow
   - Fairness dashboard
2. Write Phase 1 report
   - Architecture as-built
   - Performance metrics
   - Fairness results
   - Lessons learned
3. Update documentation
4. Prepare Phase 2 planning

**Deliverable**: Phase 1 complete, demo-able system

---

### **Phase 1 Success Criteria (Gate)**

**Technical Validation**:

- [ ] 100 synthetic scenarios processed correctly
- [ ] Gemini accuracy >85%
- [ ] Fairness DI ratio <0.2 across demographics
- [ ] Human override mechanism functional
- [ ] 7-day auto-deletion working
- [ ] No PII in databases

**Performance**:

- [ ] Triage latency <10s (p95)
- [ ] Zero critical security vulnerabilities
- [ ] Gemini API costs <$50/month

**Documentation**:

- [ ] Architecture diagrams up to date
- [ ] API documentation complete
- [ ] Phase 1 report written

**Stop Conditions**:

- ❌ Accuracy <80% → improve prompt, extend Phase 1
- ❌ Fairness DI >0.3 → investigate bias, fix before Phase 2
- ❌ Gemini costs >$100/month → optimize usage

---

## Phase 2: Local Models & Federated Learning (Months 7-12)

**Goal**: Replace Gemini with local decision tree, implement federated learning proof-of-concept.

_(Detailed month-by-month breakdown follows same pattern...)_

### **Month 7-8: Local Model Development**

- Train decision tree on synthetic data
- Implement SHAP explanations
- Validate accuracy ≥80%
- Integrate via gRPC

### **Month 9-10: Stakeholder Agent Research & Implementation**

- Research 30+ papers on stakeholder priorities
- Implement full agent logic
- Test 50+ governance scenarios
- Validate vote outcomes

### **Month 11-12: Federated Learning Proof-of-Concept**

- Deploy Flower server
- Simulate 3 clinic nodes
- Train model federally (10 rounds)
- Validate convergence + fairness

**Phase 2 Success Criteria**:

- [ ] Local model accuracy ≥80%
- [ ] Governance agents voting according to research
- [ ] Federated training converges
- [ ] Fairness maintained across training rounds

---

## Phase 3: Hardening & Validation (Months 13-15)

**Goal**: Security audit, clinical validation, production readiness.

### **Month 13: Security Hardening**

- External penetration test
- POPIA compliance audit
- Vulnerability remediation
- Incident response testing

### **Month 14: Clinical Validation**

- 500 synthetic scenarios reviewed by nurses
- Override rate analysis
- Calibration assessment
- Clinical safety validation

### **Month 15: Production Infrastructure**

- Multi-node deployment (cloud-simulated)
- Monitoring & alerting setup
- Backup & disaster recovery
- Performance optimization

**Phase 3 Success Criteria**:

- [ ] Penetration test passed (zero critical vulns)
- [ ] Nurse validation accuracy >80%
- [ ] System handles 100 concurrent users
- [ ] Uptime >99.5% in staging

---

## Phase 4: Gauteng Pilot Preparation (Months 16-18)

**Goal**: Real-world deployment readiness, clinic partnerships.

### **Month 16-17: Pilot Infrastructure**

- Clinic partnership negotiations
- Deployment scripts & runbooks
- Nurse training materials
- Patient onboarding flow

### **Month 18: Pilot Launch**

- Deploy to 1-2 Gauteng clinics
- Initial synthetic patient testing
- Monitoring & support
- Feedback collection

**Phase 4 Success Criteria**:

- [ ] 2+ clinic partnerships secured
- [ ] 500+ synthetic validations by real nurses
- [ ] Zero patient harm incidents
- [ ] Fairness metrics validated in real setting

---

## Resource Requirements

### Time Commitment

| Phase     | Months | Hours/Week  | Total Hours |
| --------- | ------ | ----------- | ----------- |
| Phase 0   | 1      | 15          | 60          |
| Phase 1   | 5      | 25          | 500         |
| Phase 2   | 6      | 25          | 600         |
| Phase 3   | 3      | 30          | 360         |
| Phase 4   | 3      | 30          | 360         |
| **Total** | **18** | **~25 avg** | **1,880**   |

### Financial Budget

| Phase     | Infrastructure        | External Services     | Total        |
| --------- | --------------------- | --------------------- | ------------ |
| Phase 0-1 | $0 (local Docker)     | $0 (Gemini free tier) | $0           |
| Phase 2   | $0-50 (Azure free)    | $0                    | $0-50        |
| Phase 3   | $50-100 (Azure)       | $2,000 (pen test)     | $2,050-2,100 |
| Phase 4   | $100-200 (multi-node) | $1,500 (legal audit)  | $1,600-1,700 |
| **Total** | **$150-350**          | **$3,500**            | **~$4,000**  |

---

## Risk Management

### Top 5 Risks

| Risk                                    | Probability | Impact   | Mitigation                           |
| --------------------------------------- | ----------- | -------- | ------------------------------------ |
| **Federated learning doesn't converge** | Medium      | High     | Start early, allocate buffer time    |
| **Cannot secure clinic partnerships**   | High        | Medium   | Cloud-only deployment acceptable     |
| **Gemini API costs exceed budget**      | Low         | Medium   | Strict quotas, caching               |
| **Fairness violations in production**   | Medium      | Critical | Continuous monitoring, auto-rollback |
| **Scope creep / timeline slippage**     | High        | High     | Strict phase gates, stop conditions  |

---

## Success Metrics Summary

### Phase-by-Phase Gates

| Phase | Must-Pass Criteria                       | Stop If...                        |
| ----- | ---------------------------------------- | --------------------------------- |
| **0** | gRPC working, FL basics understood       | ❌ Can't get tech stack running   |
| **1** | Gemini >85% accurate, Fairness DI <0.2   | ❌ Accuracy <80% or Fairness >0.3 |
| **2** | Local model ≥80%, Fed learning converges | ❌ Can't match Gemini performance |
| **3** | Pen test passed, Nurse validation >80%   | ❌ Critical security issues       |
| **4** | Pilot deployed, 500+ validations         | ❌ Patient harm incident          |

---

## Conclusion

This 18-month roadmap provides a **realistic, phased approach** to building MedEquity as a production-grade federated healthcare triage system. Success requires:

1. **Disciplined execution**: Stick to phase gates, respect stop conditions
2. **Continuous learning**: Acquire new skills as needed (gRPC, FL, etc.)
3. **Pragmatic tradeoffs**: Start with Gemini, evolve to federated LLM
4. **Ethical rigor**: Never compromise fairness for performance
5. **Long-term commitment**: This is a 2+ year journey

**Next Steps**:

1. Review all 4 foundation documents
2. Commit to timeline and resource allocation
3. Begin Month 0 learning curriculum
4. Set up development environment

**The architecture is sound. The framework is operationalized. The roadmap is executable.**

**Ready to build something that matters.**

---

**Document Status**: LOCKED v1.0  
**All Foundation Documents Complete**: Architecture + Security + Framework + Roadmap  
**Total**: ~40,000 words of production-grade system design  
**Next Action**: Begin Phase 0 learning (Month 0, Week 1)
