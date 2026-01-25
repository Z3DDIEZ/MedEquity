**Version**: 1.0  
**Status**: Locked for Implementation  
**Author**: Zawadi MC Nyachiya  
**Date**: January 2026  
**Reference**: "Economic Justice, Social Liberty, and the Ethics of Technology Design" (Research Paper)

---

## Executive Summary

This document operationalizes the five-dimensional ethical framework from your research paper into concrete technical architecture, measurable metrics, and validation procedures for MedEquity.

### Framework Dimensions Overview

| Dimension | Core Principle | Technical Implementation | Success Metric |
|-----------|---------------|------------------------|----------------|
| **1. Power Distribution** | No centralized control | Federated architecture + multi-stakeholder governance | Gini coefficient <0.2 |
| **2. Distributive Justice** | Fair outcomes across demographics | Fairness-aware ML + accessibility design | Disparate impact <0.2 |
| **3. Transparency & Contestability** | Explainable decisions + human override | Causal explanations + nurse review dashboard | Contest success rate >20% |
| **4. Human Agency** | Humans retain decision authority | Tiered automation + mandatory review | Override rate 10-30% |
| **5. Proportionality** | Minimal data collection + privacy | Data minimization + differential privacy | Privacy budget ε=0.1 |

---

## Dimension 1: Power Distribution Analysis

### Framework Principle (From Research Paper)

> "Technical systems inevitably concentrate or disperse authority. Rigorous power analysis interrogates control structures: Who exercises administrative authority? Do those who govern systems share exposure to risks?"

### Architectural Implementation

**1.1 Federated Data Architecture (No Central Repository)**

```
CENTRALIZED (Traditional Healthcare AI):
┌──────────────┐
│   Hospital A  │─┐
│   Hospital B  │─┤
│   Hospital C  │─┼──→ Central Database (ALL patient data)
│   Hospital D  │─┤      ↓
│   Hospital E  │─┘   AI Training (centralized)
└──────────────┘

FEDERATED (MedEquity):
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Clinic A   │      │   Clinic B   │      │   Clinic C   │
│ (Local Data) │      │ (Local Data) │      │ (Local Data) │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │ Encrypted Model     │ Parameters Only     │
       │ Parameters          │ (NO Patient Data)   │
       └─────────────────────┼─────────────────────┘
                             ↓
                    ┌────────────────┐
                    │  Central       │
                    │  Coordinator   │
                    │  (Aggregation) │
                    └────────────────┘
```

**Power Distribution Properties**:
- ✅ Patient data stays at originating clinic (local sovereignty)
- ✅ Central server NEVER sees raw patient information
- ✅ Each clinic retains veto power (can disconnect from federation)
- ✅ No single point of control or data concentration

**Measurable Metric**:
```typescript
interface PowerDistributionMetrics {
  // Gini coefficient of decision-making authority
  giniCoefficient: number;  // Target: <0.2 (near-perfect equality)
  
  // Data locality: % of patient data that stays local
  dataLocalityPercentage: number;  // Target: >98%
  
  // Control distribution: How many entities must collude to control system?
  collusionResistance: number;  // Target: >50% (majority needed)
  
  // Stakeholder veto rate: % of governance decisions challenged
  vetoExerciseRate: number;  // Target: 5-15% (proves power exists)
}
```

---

**1.2 Multi-Stakeholder Governance (Distributed Authority)**

```csharp
// Governance power is distributed across THREE stakeholder agents
// No single agent can unilaterally make decisions

public class GovernanceSystem
{
    private readonly Dictionary<string, decimal> _votingWeights = new()
    {
        { "Patient", 0.40m },          // 40% voting power
        { "Provider", 0.35m },         // 35% voting power
        { "PublicHealth", 0.25m }      // 25% voting power
    };
    
    public GovernanceDecision EvaluateProposal(Proposal proposal)
    {
        // Each agent evaluates based on research-backed priorities
        var patientVote = _patientAgent.EvaluateProposal(proposal);
        var providerVote = _providerAgent.EvaluateProposal(proposal);
        var publicHealthVote = _publicHealthAgent.EvaluateProposal(proposal);
        
        // Calculate weighted outcome
        var support = 0m;
        if (patientVote == Vote.For) support += 0.40m;
        if (providerVote == Vote.For) support += 0.35m;
        if (publicHealthVote == Vote.For) support += 0.25m;
        
        // Requires >50% support to pass
        var approved = support > 0.50m;
        
        // Log full decision with rationales (transparency)
        return new GovernanceDecision
        {
            ProposalId = proposal.Id,
            Votes = new[]
            {
                new StakeholderVote("Patient", patientVote, 0.40m),
                new StakeholderVote("Provider", providerVote, 0.35m),
                new StakeholderVote("PublicHealth", publicHealthVote, 0.25m)
            },
            Approved = approved,
            WeightedSupport = support
        };
    }
}
```

**Power Distribution Properties**:
- ✅ No single stakeholder can dominate (max 40% weight)
- ✅ Any two stakeholders can form majority coalition
- ✅ All decisions publicly logged (transparent power exercise)
- ✅ Dissenting votes preserved (minority protection)

**Measurable Metric**:
```typescript
interface GovernanceMetrics {
  // Decision distribution across agent types
  proposalsByType: {
    modelUpdate: number;
    featureAddition: number;
    policyChange: number;
  };
  
  // Vote alignment: how often agents agree?
  consensusRate: number;  // Target: 60-80% (some conflict expected)
  
  // Veto power exercise: how often minority blocks majority?
  minorityBlockRate: number;  // Target: 10-20% (proves power balance)
  
  // Decision reversal rate: how often decisions get reconsidered?
  reversalRate: number;  // Target: <5% (stability with flexibility)
}
```

---

### Validation Procedures

**Quarterly Power Audit**:
```markdown
## Q1 2026 Power Distribution Audit

### Data Sovereignty Audit
- [ ] Verify no patient data in central database
- [ ] Confirm all training uses only aggregated parameters
- [ ] Validate data deletion compliance (7-day limit)

### Governance Participation Audit
- [ ] Review all proposals from quarter
- [ ] Verify agent votes match documented logic
- [ ] Check for unexplained decision patterns

### Stakeholder Representation Audit
- [ ] Confirm agent priorities align with research
- [ ] Review dissenting opinions for legitimacy
- [ ] Validate no stakeholder dominance

**Findings**: [Document results]  
**Corrective Actions**: [If violations found]  
**Next Audit**: [Date]
```

---

## Dimension 2: Distributive Justice Assessment

### Framework Principle (From Research Paper)

> "Technology operates as an allocative mechanism, determining access to resources and opportunities. Fairness evaluation scrutinizes whether systems amplify or mitigate existing inequalities."

### Architectural Implementation

**2.1 Fairness-Aware Model Training**

```python
class FairFederatedAvg(fl.server.strategy.FedAvg):
    """Custom federated averaging that enforces fairness constraints"""
    
    def __init__(self, fairness_threshold=0.2):
        super().__init__()
        self.fairness_threshold = fairness_threshold
    
    def aggregate_fit(self, rnd, results, failures):
        # Standard federated averaging
        aggregated_params = super().aggregate_fit(rnd, results, failures)
        
        # FAIRNESS VALIDATION (before deployment)
        fairness_metrics = self.evaluate_fairness(aggregated_params)
        
        # REJECT if disparate impact exceeds threshold
        if fairness_metrics.disparate_impact_race > self.fairness_threshold:
            self.log_fairness_violation(
                round=rnd,
                metric="disparate_impact_race",
                value=fairness_metrics.disparate_impact_race,
                threshold=self.fairness_threshold
            )
            # Return previous model (don't deploy unfair update)
            return self.get_previous_model()
        
        if fairness_metrics.disparate_impact_income > self.fairness_threshold:
            self.log_fairness_violation(
                round=rnd,
                metric="disparate_impact_income",
                value=fairness_metrics.disparate_impact_income,
                threshold=self.fairness_threshold
            )
            return self.get_previous_model()
        
        # Deploy only if fair
        return aggregated_params
    
    def evaluate_fairness(self, model_params):
        # Test on diverse held-out dataset
        test_results = self.evaluate_model(model_params, self.fairness_test_set)
        
        # Calculate disparate impact by demographic group
        di_race = self.calculate_disparate_impact(
            test_results, 
            protected_attribute='race',
            favorable_outcome='appropriate_care_level'
        )
        
        di_income = self.calculate_disparate_impact(
            test_results,
            protected_attribute='income_quintile',
            favorable_outcome='appropriate_care_level'
        )
        
        di_geography = self.calculate_disparate_impact(
            test_results,
            protected_attribute='urban_vs_rural',
            favorable_outcome='appropriate_care_level'
        )
        
        return FairnessMetrics(
            disparate_impact_race=di_race,
            disparate_impact_income=di_income,
            disparate_impact_geography=di_geography,
            overall_accuracy=test_results.accuracy
        )
```

**Fairness Properties**:
- ✅ Fairness validated BEFORE every model deployment
- ✅ Unfair models automatically rejected
- ✅ Multiple protected attributes monitored (intersectionality)
- ✅ Fairness-accuracy tradeoff explicitly managed

**Measurable Metric**:
```typescript
interface FairnessMetrics {
  // Disparate impact ratio: P(favorable|protected) / P(favorable|unprotected)
  // Target: >0.8 (80% rule from employment discrimination law)
  disparateImpactRatio: {
    byRace: number;        // Black/White, Coloured/White, etc.
    byIncome: number;      // Low-income/High-income
    byGeography: number;   // Rural/Urban
    byGender: number;      // Female/Male
  };
  
  // False negative rate parity: Are emergency conditions missed equally?
  falseNegativeRateParity: {
    byDemographic: Map<string, number>;
    maxDifference: number;  // Target: <5 percentage points
  };
  
  // Calibration by group: Are confidence scores equally reliable?
  calibrationError: {
    byDemographic: Map<string, number>;
    maxDifference: number;  // Target: <0.05
  };
}
```

---

**2.2 Accessibility-First Design**

```typescript
// Multi-language symptom intake (underserved communities)
interface SymptomIntakeForm {
  language: Language;  // English | isiZulu | Afrikaans | Sesotho | Xhosa
  literacyMode: LiteracyMode;  // Standard | SimplifiedText | VoiceGuided | Visual
  
  // Adaptive explanation complexity
  explanationLevel: ExplanationLevel;  // Basic | Intermediate | Advanced
  
  // Accessibility features
  screenReaderOptimized: boolean;
  highContrastMode: boolean;
  voiceInput: boolean;
  smsBackupOption: boolean;  // For low-data environments
}

// Explanation adapted to user literacy level
function adaptExplanationToLiteracy(
  explanation: Explanation, 
  literacyLevel: number
): AdaptedExplanation {
  if (literacyLevel < 5) {  // Grade 5 reading level
    return {
      summary: "Your symptoms are serious. You should go to the hospital emergency room right away.",
      keyPoints: [
        "Go to ER now",
        "Bring this message",
        "Call ambulance if needed: 10177"
      ],
      readingLevel: 3,  // Grade 3 equivalent
      estimatedReadTime: "15 seconds"
    };
  }
  
  // Higher literacy: more detailed explanation
  return {
    summary: "Your symptoms suggest a potentially serious respiratory condition requiring emergency evaluation.",
    keyPoints: explanation.detailedReasons,
    readingLevel: 8,
    estimatedReadTime: "1-2 minutes"
  };
}
```

**Accessibility Properties**:
- ✅ Content accessible in 5+ South African languages
- ✅ Literacy-adaptive explanations (automatic simplification)
- ✅ Voice guidance for low-literacy users
- ✅ SMS fallback for limited connectivity

**Measurable Metric**:
```typescript
interface AccessibilityMetrics {
  // Language coverage: % of target population served
  languageCoverage: number;  // Target: >95%
  
  // Literacy adaptation effectiveness
  comprehensionRate: {
    lowLiteracy: number;   // Target: >70%
    avgLiteracy: number;   // Target: >85%
    highLiteracy: number;  // Target: >95%
  };
  
  // Outcome equity: Do outcomes differ by access barriers?
  outcomeEquityByBarrier: {
    lowConnectivity: OutcomeMetrics;
    noSmartphone: OutcomeMetrics;
    ruralLocation: OutcomeMetrics;
  };
}
```

---

**2.3 Counterfactual Fairness Checking**

```csharp
// For each triage decision, check: "Would recommendation change if demographics different?"
public class CounterfactualFairnessChecker
{
    public FairnessAlert CheckCounterfactualFairness(
        TriageResult result, 
        PatientDemographics demographics)
    {
        // Generate counterfactual: same symptoms, different demographics
        var counterfactualDemographics = new[]
        {
            demographics with { Race = "White" },
            demographics with { Race = "Black" },
            demographics with { IncomeQuintile = 1 },  // Poorest
            demographics with { IncomeQuintile = 5 },  // Wealthiest
            demographics with { Geography = "Urban" },
            demographics with { Geography = "Rural" }
        };
        
        var recommendations = new List<CareLevel>();
        
        foreach (var cf in counterfactualDemographics)
        {
            // Re-run triage with counterfactual demographics
            var cfResult = _triageEngine.Analyze(result.Symptoms, cf);
            recommendations.Add(cfResult.CareLevel);
        }
        
        // Check if recommendations differ
        var uniqueRecommendations = recommendations.Distinct().Count();
        
        if (uniqueRecommendations > 1)
        {
            // ALERT: Demographics affecting recommendation
            return new FairnessAlert
            {
                Severity = AlertSeverity.High,
                Message = "Recommendation varies by demographic (potential bias)",
                OriginalRecommendation = result.CareLevel,
                CounterfactualRecommendations = recommendations,
                RequiresHumanReview = true
            };
        }
        
        return FairnessAlert.None;
    }
}
```

---

### Validation Procedures

**Monthly Fairness Audit**:
```sql
-- Query disparate impact for last 30 days
WITH outcomes AS (
  SELECT 
    demographic_group,
    care_level,
    COUNT(*) as total,
    AVG(CASE WHEN care_level = 'emergency' THEN 1 ELSE 0 END) as er_rate
  FROM triage_results
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY demographic_group, care_level
)
SELECT 
  demographic_group,
  er_rate,
  er_rate / (SELECT MAX(er_rate) FROM outcomes) as disparate_impact_ratio
FROM outcomes
HAVING disparate_impact_ratio < 0.8;  -- Flag violations
```

---

## Dimension 3: Transparency & Contestability Architecture

### Framework Principle (From Research Paper)

> "Legitimate authority requires justification. Opaque systems that resist scrutiny violate accountability norms. Democratic legitimacy requires affected parties understand decisions and retain means to contest erroneous outcomes."

### Architectural Implementation

**3.1 Causal Explanation Generation**

```python
class ExplainableTriageModel:
    def __init__(self, model):
        self.model = model
        self.explainer = shap.TreeExplainer(model)  # For decision trees
    
    def predict_with_explanation(self, symptoms: SymptomVector) -> TriageExplanation:
        # Make prediction
        care_level = self.model.predict(symptoms)
        confidence = self.model.predict_proba(symptoms)
        
        # Generate SHAP values (feature importance)
        shap_values = self.explainer.shap_values(symptoms)
        
        # Extract top contributing symptoms
        symptom_contributions = [
            SymptomContribution(
                symptom=symptoms.names[i],
                severity=symptoms.values[i],
                contribution=shap_values[i],
                explanation=self.get_clinical_rationale(symptoms.names[i])
            )
            for i in shap_values.argsort()[-5:][::-1]  # Top 5
        ]
        
        # Generate counterfactuals: "What would change recommendation?"
        counterfactuals = self.generate_counterfactuals(symptoms, care_level)
        
        return TriageExplanation(
            care_level=care_level,
            confidence=confidence,
            primary_concern=self.identify_primary_concern(symptom_contributions),
            symptom_contributions=symptom_contributions,
            counterfactuals=counterfactuals,
            clinical_rationale=self.get_decision_path_explanation(symptoms)
        )
    
    def generate_counterfactuals(self, symptoms, current_care_level):
        """Generate alternative scenarios that would change recommendation"""
        counterfactuals = []
        
        # Try adding/removing symptoms
        for symptom in ['chest_pain', 'shortness_of_breath', 'confusion']:
            modified = symptoms.copy()
            modified.add(symptom, severity=8)
            
            new_care_level = self.model.predict(modified)
            
            if new_care_level != current_care_level:
                counterfactuals.append(
                    Counterfactual(
                        condition=f"If you also had {symptom}",
                        would_change_to=new_care_level,
                        explanation=f"Adding {symptom} increases urgency"
                    )
                )
        
        return counterfactuals[:3]  # Top 3 most relevant
```

**Transparency Properties**:
- ✅ Every decision has causal explanation (not just correlation)
- ✅ Explanations reference actual model logic (faithful)
- ✅ Counterfactuals show decision boundaries
- ✅ Clinical rationale provided (evidence-based)

**Measurable Metric**:
```typescript
interface TransparencyMetrics {
  // Explanation fidelity: Does explanation match actual model?
  explanationFidelity: number;  // Target: >0.9 (correlation)
  
  // User comprehension: Do patients understand explanations?
  comprehensionRate: number;  // Target: >75% (validated via quiz)
  
  // Readability: Flesch-Kincaid grade level
  readabilityLevel: number;  // Target: 8-9th grade
  
  // Explanation completeness: % of decisions with full explanation
  completenessRate: number;  // Target: 100%
}
```

---

**3.2 Contestability Mechanisms**

```csharp
// Patient can contest any recommendation
public class ContestabilityService
{
    public async Task<ContestResult> SubmitContest(
        Guid sessionId, 
        ContestReason reason, 
        string patientRationale)
    {
        var triageResult = await _db.TriageResults
            .FirstOrDefaultAsync(t => t.SessionId == sessionId);
        
        if (triageResult == null)
            throw new NotFoundException("Triage result not found");
        
        // Log contest (for fairness monitoring)
        var contest = new Contest
        {
            SessionId = sessionId,
            OriginalRecommendation = triageResult.CareLevel,
            ContestReason = reason,
            PatientRationale = patientRationale,
            Status = ContestStatus.PendingReview,
            SubmittedAt = DateTime.UtcNow
        };
        
        await _db.Contests.AddAsync(contest);
        await _db.SaveChangesAsync();
        
        // Route to human review queue (PRIORITY)
        await _nurseReviewQueue.EnqueuePriority(new ReviewRequest
        {
            SessionId = sessionId,
            Type = ReviewType.Contest,
            Urgency = DetermineUrgency(triageResult.CareLevel),
            Contest = contest
        });
        
        return new ContestResult
        {
            ContestId = contest.Id,
            Status = ContestStatus.PendingReview,
            EstimatedReviewTime = DetermineReviewTime(triageResult.CareLevel),
            Message = "Your concern has been escalated to a nurse for review."
        };
    }
}

// Nurse reviews and resolves contest
public class NurseReviewService
{
    public async Task<ContestResolution> ResolveContest(
        Guid contestId, 
        Guid nurseId, 
        NurseDecision decision)
    {
        var contest = await _db.Contests.FindAsync(contestId);
        
        var resolution = new ContestResolution
        {
            ContestId = contestId,
            ReviewedBy = nurseId,
            NurseDecision = decision.RecommendedCareLevel,
            NurseRationale = decision.Rationale,
            AgreesWithAI = decision.RecommendedCareLevel == contest.OriginalRecommendation,
            ResolvedAt = DateTime.UtcNow
        };
        
        // If nurse disagrees with AI, LOG for model improvement
        if (!resolution.AgreesWithAI)
        {
            await _modelFeedbackService.LogDisagreement(new Disagreement
            {
                Symptoms = contest.Symptoms,
                AIRecommendation = contest.OriginalRecommendation,
                NurseRecommendation = decision.RecommendedCareLevel,
                Rationale = decision.Rationale
            });
        }
        
        await _db.ContestResolutions.AddAsync(resolution);
        await _db.SaveChangesAsync();
        
        return resolution;
    }
}
```

**Contestability Properties**:
- ✅ Any patient can challenge any recommendation
- ✅ Human review guaranteed within SLA (2hr urgent, 24hr routine)
- ✅ Contest success rate tracked (proves meaningful contestability)
- ✅ Disagreements feed back into model training

**Measurable Metric**:
```typescript
interface ContestabilityMetrics {
  // Contest rate: % of decisions challenged
  contestRate: number;  // Target: 5-15% (too low = no trust, too high = broken)
  
  // Contest success rate: % resulting in changed recommendation
  contestSuccessRate: number;  // Target: 20-40% (proves contests matter)
  
  // Review latency: Time from contest to resolution
  reviewLatency: {
    urgent_p95: Duration;    // Target: <2 hours
    routine_p95: Duration;   // Target: <24 hours
  };
  
  // Nurse agreement rate: How often nurses agree with AI?
  nurseAgreementRate: number;  // Target: 70-85% (calibration check)
}
```

---

### Validation Procedures

**Explanation Quality Audit**:
```markdown
## User Comprehension Testing (Quarterly)

### Method
- Recruit 30 representative users
- Show 10 triage explanations
- Quiz on understanding:
  1. "What is the main reason for this recommendation?"
  2. "If you had [symptom], would recommendation change?"
  3. "How confident is the system in this recommendation?"

### Success Criteria
- >75% correctly answer all 3 questions
- >85% rate explanation as "helpful" or "very helpful"
- No significant comprehension differences by literacy level

### Findings: [Document results]
### Improvements: [If comprehension <75%]
```

---

## Dimension 4: Human Agency Preservation

### Framework Principle (From Research Paper)

> "High-stakes domains involving liberty deprivation, medical treatment, or employment determination demand sustained human oversight. Systems that automate such decisions without preserving meaningful human control violate dignity by reducing individuals to optimization variables."

### Architectural Implementation

**4.1 Tiered Automation by Stakes**

```csharp
public enum AutomationTier
{
    FullyAutomated,      // Low stakes, high confidence (self-care)
    AutomatedWithAlert,  // Medium stakes (primary care)
    HumanInLoop,         // High stakes (urgent care, low confidence)
    HumanLed            // Critical stakes (emergency)
}

public class StakesAssessmentEngine
{
    public AutomationTier DetermineAutomationTier(
        TriageResult result, 
        SymptomSet symptoms)
    {
        var stakes = AssessStakes(result.CareLevel);
        var confidence = result.Confidence;
        var vulnerability = AssessVulnerability(symptoms);
        
        // Critical: Life-threatening OR vulnerable population
        if (stakes == Stakes.Critical || vulnerability == Vulnerability.High)
        {
            return AutomationTier.HumanLed;
            // AI ASSISTS nurse, but nurse makes decision
        }
        
        // High: Emergency-level care OR low confidence
        if (stakes == Stakes.High || confidence < 0.7)
        {
            return AutomationTier.HumanInLoop;
            // Nurse MUST approve before showing to patient
        }
        
        // Medium: Specialist/primary care with decent confidence
        if (stakes == Stakes.Medium && confidence >= 0.7)
        {
            return AutomationTier.AutomatedWithAlert;
            // Show to patient, notify nurse for audit sample
        }
        
        // Low: Self-care with high confidence
        return AutomationTier.FullyAutomated;
        // Show to patient immediately, human audit sample later
    }
    
    private Stakes AssessStakes(CareLevel careLevel) => careLevel switch
    {
        CareLevel.Emergency => Stakes.Critical,
        CareLevel.UrgentCare => Stakes.High,
        CareLevel.PrimaryCare => Stakes.Medium,
        CareLevel.Telemedicine => Stakes.Low,
        CareLevel.SelfCare => Stakes.Low,
        _ => Stakes.Medium
    };
    
    private Vulnerability AssessVulnerability(SymptomSet symptoms)
    {
        // High vulnerability: pediatric, elderly, multiple comorbidities
        if (symptoms.PatientAge < 5 || symptoms.PatientAge > 75)
            return Vulnerability.High;
        
        if (symptoms.ChronicConditions.Count >= 3)
            return Vulnerability.High;
        
        return Vulnerability.Normal;
    }
}
```

**Human Agency Properties**:
- ✅ Automation level scales with stakes (not uniform)
- ✅ Critical decisions ALWAYS human-led
- ✅ AI never fully replaces human judgment in high-stakes cases
- ✅ Human override always available

**Measurable Metric**:
```typescript
interface HumanAgencyMetrics {
  // Automation distribution by tier
  automationRate: {
    fullyAutomated: Percentage;    // Target: 40-60%
    automatedWithAlert: Percentage; // Target: 20-30%
    humanInLoop: Percentage;        // Target: 10-20%
    humanLed: Percentage;           // Target: 5-15%
  };
  
  // Override rate: How often humans change AI recommendation?
  overrideRate: {
    overall: Percentage;            // Target: 10-30%
    byStakes: Map<Stakes, Percentage>;
  };
  
  // Human review latency: Time to human intervention when needed
  reviewLatency: {
    critical_p95: Duration;  // Target: <15 minutes
    high_p95: Duration;      // Target: <2 hours
  };
  
  // Capacity utilization: Are we overwhelming human reviewers?
  humanCapacityUtilization: Percentage;  // Target: 60-80% (not maxed out)
}
```

---

**4.2 Nurse Override Mechanism**

```typescript
interface NurseOverrideWorkflow {
  // Nurse sees AI recommendation + full context
  aiRecommendation: TriageResult;
  patientSymptoms: SymptomSet;
  aiExplanation: Explanation;
  aiConfidence: number;
  
  // Nurse makes FINAL decision
  nurseDecision: {
    approveAI: boolean;
    overrideRecommendation?: CareLevel;  // If disagreeing
    rationale: string;  // REQUIRED for any decision
    additionalGuidance?: string;  // Optional message to patient
  };
  
  // System logs decision for accountability
  auditRecord: {
    nurseId: string;
    agreedWithAI: boolean;
    finalRecommendation: CareLevel;
    rationale: string;
    decisionTime: Duration;
    timestamp: DateTime;
  };
}

// Nurse dashboard shows queue prioritized by urgency
interface NurseReviewQueue {
  pending: Array<{
    sessionId: string;
    patientAgeRange: string;
    symptoms: string[];
    aiRecommendation: CareLevel;
    aiConfidence: number;
    urgency: Urgency;
    waitTime: Duration;
  }>;
  
  // SLA monitoring
  slaCompliance: {
    critical_within_15min: Percentage;
    high_within_2hr: Percentage;
    medium_within_24hr: Percentage;
  };
}
```

---

### Validation Procedures

**Monthly Human Oversight Audit**:
```sql
-- Check override patterns for bias or automation failures
SELECT 
  nurse_id,
  COUNT(*) as total_reviews,
  SUM(CASE WHEN agreed_with_ai THEN 1 ELSE 0 END) as agreements,
  AVG(CASE WHEN agreed_with_ai THEN 1.0 ELSE 0.0 END) as agreement_rate,
  AVG(review_time_seconds) as avg_review_time
FROM nurse_reviews
WHERE review_date >= NOW() - INTERVAL '30 days'
GROUP BY nurse_id
HAVING agreement_rate < 0.7 OR agreement_rate > 0.95;
-- Flag: Too low = AI failing, Too high = rubber-stamping
```

---

## Dimension 5: Proportionality & Privacy Constraints

### Framework Principle (From Research Paper)

> "Power exercised through technological systems must justify itself through demonstrated necessity. Systems that harvest maximal data 'just in case' or impose blanket constraints exhibit authoritarianism incompatible with civil liberties."

### Architectural Implementation

**5.1 Data Minimization (Collect Only Necessary)**

```sql
-- ONLY collect clinically necessary information
CREATE TABLE patient_sessions (
    session_id UUID PRIMARY KEY,
    
    -- Demographics (bucketed, not exact)
    age_range VARCHAR(10),     -- "20-30" NOT exact age
    sex VARCHAR(10),           -- Clinical necessity only
    geography VARCHAR(50),     -- "Johannesburg Metro" NOT street address
    
    -- NO IDENTIFIERS COLLECTED:
    -- ❌ name
    -- ❌ ID number
    -- ❌ email
    -- ❌ phone number
    -- ❌ precise location
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

-- Symptoms (coded, not free text)
CREATE TABLE symptoms (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES patient_sessions,
    symptom_code VARCHAR(50),  -- SNOMED CT standard codes
    severity INT,              -- 1-10 scale
    duration_hours INT
    -- ❌ NO free-text symptom descriptions (prevents PII leakage)
);
```

**Data Minimization Properties**:
- ✅ Zero persistent identifiers (session IDs are ephemeral)
- ✅ Bucketed demographics (prevent re-identification)
- ✅ Coded symptoms (SNOMED CT, no free text)
- ✅ Automatic 7-day deletion (POPIA compliance)

**Measurable Metric**:
```typescript
interface ProportionalityMetrics {
  // Data minimality: Collected fields / Strictly necessary fields
  dataMinimalityRatio: number;  // Target: <1.1 (10% overhead max)
  
  // Retention compliance: % data deleted on schedule
  retentionCompliance: Percentage;  // Target: 100%
  
  // Purpose limitation: % data used only as consented
  purposeLimitationCompliance: Percentage;  // Target: 100%
  
  // PII leakage: Instances of identifiers in unintended locations
  piiLeakageIncidents: number;  // Target: 0
}
```

---

**5.2 Differential Privacy for Aggregates**

```python
class DifferentialPrivacyEngine:
    def __init__(self, epsilon=0.1):
        self.epsilon = epsilon
        # ε=0.1 = strong privacy (indistinguishable if any individual present)
    
    def publish_aggregate_statistics(self, data: List[PatientRecord]):
        # Calculate true aggregate
        true_count = len(data)
        true_avg_age = np.mean([p.age for p in data])
        true_outcome_dist = self.calculate_distribution(data, 'care_level')
        
        # Add Laplace noise for differential privacy
        sensitivity = 1  # Max influence of single patient
        scale = sensitivity / self.epsilon
        
        noisy_count = max(0, true_count + np.random.laplace(0, scale))
        noisy_avg_age = true_avg_age + np.random.laplace(0, scale)
        noisy_outcome_dist = {
            k: max(0, v + np.random.laplace(0, scale))
            for k, v in true_outcome_dist.items()
        }
        
        return AggregateStatistics(
            count=int(noisy_count),
            avg_age=noisy_avg_age,
            outcome_distribution=noisy_outcome_dist,
            privacy_guarantee=f"ε={self.epsilon} differential privacy"
        )
```

**Privacy Properties**:
- ✅ Mathematical privacy guarantee (ε=0.1)
- ✅ Individual patients cannot be re-identified from aggregates
- ✅ Noise calibrated to sensitivity of query
- ✅ Privacy budget tracked over time

**Measurable Metric**:
```typescript
interface PrivacyMetrics {
  // Privacy budget remaining (differential privacy)
  privacyBudgetRemaining: number;  // Target: >50% (not exhausted)
  
  // Encryption coverage
  encryptionCoverage: {
    atRest: Percentage;      // Target: 100%
    inTransit: Percentage;   // Target: 100%
  };
  
  // Data breach incidents
  breachIncidents: number;  // Target: 0
  
  // Privacy audit compliance score
  complianceScore: number;  // Target: >95% (POPIA compliance)
}
```

---

### Validation Procedures

**Quarterly Privacy Audit**:
```markdown
## Q1 2026 Privacy Compliance Audit

### Data Collection Audit
- [ ] Verify only necessary data collected
- [ ] Confirm no PII in databases
- [ ] Validate bucketing of demographics

### Retention Audit
- [ ] Confirm 7-day auto-deletion working
- [ ] Check for orphaned data
- [ ] Validate export mechanism before deletion

### Purpose Limitation Audit
- [ ] Review all data uses
- [ ] Confirm no secondary use without consent
- [ ] Validate consent records intact

### Encryption Audit
- [ ] Verify encryption at rest (AES-256)
- [ ] Confirm TLS 1.3 for transit
- [ ] Check key rotation schedule

**Findings**: [Document results]  
**Violations**: [If any found, remediation plan]  
**Next Audit**: [Date]
```

---

## Framework Integration & Conflict Resolution

### When Dimensions Conflict

**Example Conflict**: Transparency vs. Gaming

**Scenario**: Publishing detailed model explanations enables adversaries to reverse-engineer and manipulate recommendations.

**Resolution Protocol**:
```csharp
public class ConflictResolutionService
{
    public Resolution ResolveFrameworkConflict(FrameworkConflict conflict)
    {
        // Step 1: Identify conflicting dimensions
        var transparency = conflict.DimensionA;  // Transparency
        var security = conflict.DimensionB;      // Protection against gaming
        
        // Step 2: Consult stakeholder agents
        var patientView = _patientAgent.PrioritizeDimensions(transparency, security);
        var providerView = _providerAgent.PrioritizeDimensions(transparency, security);
        var publicHealthView = _publicHealthAgent.PrioritizeDimensions(transparency, security);
        
        // Step 3: Propose compromise solutions
        var compromises = new[]
        {
            "Provide aggregate transparency (population-level patterns) + individual contestability",
            "Detailed explanations for individual decisions, withhold global model details",
            "Full transparency with anomaly detection for gaming attempts"
        };
        
        // Step 4: Vote on compromises
        var votes = _governanceSystem.VoteOnProposals(compromises);
        var selected = votes.OrderByDescending(v => v.Support).First();
        
        // Step 5: Implement and monitor
        return new Resolution
        {
            Conflict = conflict,
            SelectedCompromise = selected.Proposal,
            Rationale = selected.CombinedRationale,
            MonitoringPlan = CreateMonitoringPlan(selected)
        };
    }
}
```

---

## Success Criteria (Framework Validation)

### Phase 1 (Month 6): Framework Baseline

- [ ] All 5 dimensions measurable
- [ ] Governance agents voting on proposals
- [ ] Fairness metrics within thresholds
- [ ] Human oversight functional
- [ ] Privacy guarantees validated

### Phase 2 (Month 12): Framework Refinement

- [ ] Governance conflict resolution tested (10+ scenarios)
- [ ] Fairness improvement demonstrated (DI ratio trending down)
- [ ] Contestability mechanisms used (5-15% contest rate)
- [ ] Human override patterns analyzed (calibration check)

### Phase 3 (Month 18): Framework at Scale

- [ ] Framework survives real-world stress testing
- [ ] All metrics within acceptable ranges
- [ ] No dimension systematically violated
- [ ] Stakeholder agent logic empirically validated
- [ ] Framework documented for external adoption

---

**Document Status**: LOCKED v1.0  
**Next Document**: 18-Month Phased Roadmap (detailed implementation plan)
**Dependencies**: Architecture + Security + Framework = Complete foundation