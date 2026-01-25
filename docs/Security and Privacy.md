
**Version**: 1.0  
**Status**: Locked for Phase 1 Implementation  
**Author**: Zawadi MC Nyachiya  
**Date**: January 2026  
**Compliance**: POPIA (South Africa), GDPR (EU-aligned)

---

## Executive Summary

### Security Posture Statement

MedEquity operates under a **zero-trust, privacy-first** security model where:
- Patient data is **never centralized**
- All systems assume **hostile actors** (including compromised clients and internal threats)
- Medical liability is **structurally prevented** through architectural constraints
- Privacy is **enforced by design**, not policy

### Core Security Principles

1. **Data Minimization**: Collect only clinically necessary information
2. **Federated Architecture**: Patient data stays local, only model parameters aggregate
3. **Automatic Deletion**: 7-day retention with cryptographic erasure
4. **Transparent Logging**: All decisions auditable, immutable records
5. **Human Oversight**: High-stakes decisions require nurse approval

### Threat Model Summary

| Threat Category | Risk Level | Primary Mitigation |
|----------------|------------|-------------------|
| **Patient Data Breach** | CRITICAL | Federated storage, encryption, auto-deletion |
| **Model Poisoning** | HIGH | Secure aggregation, fairness validation |
| **Medical Liability** | HIGH | Navigation-only recommendations, human oversight |
| **Governance Manipulation** | MEDIUM | Immutable audit logs, transparent voting |
| **Privacy Leakage** | MEDIUM | Differential privacy (ε=0.1), data bucketing |

---

## Healthcare Threat Model

### Threat 1: Unauthorized Access to Patient Data

**Attack Scenarios:**
1. **External attacker** compromises regional node database
2. **Malicious insider** (clinic staff) exports patient records
3. **Compromised client device** attempts to access other patients' sessions
4. **Nation-state actor** subpoenas central coordination server

**Impact**: CRITICAL
- POPIA violation (R1-5M fine per violation)
- Patient privacy breach
- Loss of trust in system
- Potential medical identity theft

**Mitigation Strategy:**

**Layer 1: No Centralized Patient Data**
```
Central Server NEVER stores:
- Patient symptoms
- Triage results
- Session identifiers
- Any linkable patient information

Only stores:
- Aggregated model parameters (encrypted)
- Anonymized fairness metrics (differential privacy)
- Governance decisions (public)
```

**Layer 2: Regional Node Isolation**
```sql
-- Each node database is isolated
-- No cross-node queries possible
-- Patient data scoped to single node

-- Example: Node A cannot access Node B data
SELECT * FROM patient_sessions 
WHERE node_id = 'node_b';  -- FAILS (different database)
```

**Layer 3: Ephemeral Session IDs**
```csharp
// Session IDs are cryptographically random, short-lived
public class SessionManager
{
    public Guid CreateSession()
    {
        var sessionId = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddDays(7);
        
        // No linkage to patient identity
        // No email, phone, ID number stored
        return sessionId;
    }
}
```

**Layer 4: Automatic Cryptographic Erasure**
```sql
-- After 7 days, data is PERMANENTLY deleted
-- Not soft-delete, actual DROP/TRUNCATE

CREATE OR REPLACE FUNCTION secure_delete_expired()
RETURNS void AS $$
BEGIN
    -- Delete patient sessions (cascades to symptoms, results)
    DELETE FROM patient_sessions WHERE expires_at < NOW();
    
    -- Overwrite deleted pages (PostgreSQL-specific)
    VACUUM FULL patient_sessions;
    
    -- Log deletion for audit (no patient data in log)
    INSERT INTO audit_log (event_type, action) 
    VALUES ('data_deletion', 'Expired sessions purged');
END;
$$ LANGUAGE plpgsql;
```

**Residual Risk**: LOW
- Even if node compromised, data exists <7 days
- No linkage to patient identity possible
- Central server has zero patient data

---

### Threat 2: Model Poisoning (Adversarial Training Data)

**Attack Scenarios:**
1. **Malicious clinic node** submits corrupted model updates to degrade global model
2. **Data injection attack**: Attacker creates fake patient records to bias model
3. **Gradient manipulation**: Node sends malicious gradients to favor certain demographics

**Impact**: HIGH
- Degraded triage accuracy (patient harm risk)
- Fairness violations (biased recommendations)
- Loss of clinical validity

**Mitigation Strategy:**

**Defense 1: Fairness Validation Before Deployment**
```python
class FederatedCoordinator:
    def validate_model_update(self, aggregated_params):
        # Test on diverse held-out dataset
        test_results = self.evaluate_on_test_set(aggregated_params)
        
        # Measure disparate impact across demographics
        di_race = test_results.disparate_impact_by_race
        di_income = test_results.disparate_impact_by_income
        di_geography = test_results.disparate_impact_by_geography
        
        # REJECT if fairness threshold violated
        if di_race > 0.2 or di_income > 0.2 or di_geography > 0.2:
            self.log_security_event(
                event_type="model_poisoning_detected",
                metrics={"di_race": di_race, "di_income": di_income}
            )
            return ModelUpdateDecision.REJECT
        
        # REJECT if accuracy drops significantly
        if test_results.accuracy < 0.75:
            self.log_security_event(
                event_type="accuracy_degradation",
                accuracy=test_results.accuracy
            )
            return ModelUpdateDecision.REJECT
        
        return ModelUpdateDecision.APPROVE
```

**Defense 2: Secure Aggregation Protocol**
```python
# Use cryptographic secure aggregation
# Individual node updates are NEVER visible to coordinator

from flwr.server.strategy import SecureAggregation

class FairSecureAggregation(SecureAggregation):
    def aggregate_fit(self, rnd, results, failures):
        # Nodes encrypt their updates
        # Coordinator can only see aggregated result
        # Prevents identifying which node sent malicious update
        
        aggregated = super().aggregate_fit(rnd, results, failures)
        
        # But we DO validate final aggregate for fairness
        if not self.is_fair(aggregated):
            return self.previous_model  # Rollback
        
        return aggregated
```

**Defense 3: Anomaly Detection**
```python
class ModelUpdateAnomalyDetector:
    def detect_anomalies(self, node_updates):
        # Statistical outlier detection
        # Flag nodes with updates >3 std deviations from mean
        
        for node_id, update in node_updates.items():
            z_score = self.calculate_z_score(update)
            
            if abs(z_score) > 3.0:
                self.flag_suspicious_node(
                    node_id=node_id,
                    reason=f"Update z-score: {z_score}",
                    action="exclude_from_aggregation"
                )
```

**Residual Risk**: MEDIUM
- Sophisticated attacks could evade detection
- Multiple colluding nodes could outvote fairness checks
- **Accepted tradeoff**: Federated architecture worth residual risk

---

### Threat 3: Medical Liability (Incorrect Triage Causing Harm)

**Attack Scenarios:**
1. **System recommends "self-care"** for emergency condition → patient delay → harm
2. **System recommends ER** for minor condition → unnecessary cost/anxiety
3. **Bias in recommendations** → certain demographics systematically undertriaged

**Impact**: CRITICAL
- Patient harm or death
- Medical malpractice lawsuit
- System shutdown by regulators
- Reputational destruction

**Mitigation Strategy:**

**Defense 1: Navigation-Only Recommendations (NOT Diagnosis)**
```typescript
// System NEVER says: "You have pneumonia"
// System ONLY says: "Your symptoms suggest seeking urgent care"

interface TriageResult {
  care_level: CareLevel;  // ER | UrgentCare | PrimaryCare | Telemedicine | SelfCare
  confidence: number;
  explanation: Explanation;
  
  // EXPLICITLY NOT INCLUDED:
  // diagnosis: string;  ❌ FORBIDDEN
  // treatment: string;  ❌ FORBIDDEN
  // medication: string; ❌ FORBIDDEN
}

// Disclaimer shown EVERY time
const MEDICAL_DISCLAIMER = `
This is a navigation assistant, NOT medical advice.
This system does NOT diagnose conditions or recommend treatments.
It ONLY suggests appropriate care settings based on symptom severity.
Always consult a licensed healthcare provider for medical decisions.
`;
```

**Defense 2: Human-in-Loop for High-Stakes Cases**
```csharp
public class StakesAssessor
{
    public AutomationTier DetermineAutomationLevel(
        TriageResult result, 
        SymptomSet symptoms)
    {
        // Critical: Life-threatening symptoms
        if (result.CareLevel == CareLevel.Emergency)
        {
            return AutomationTier.HumanLed;
            // Nurse MUST approve before showing to patient
        }
        
        // High: Urgent symptoms, low confidence
        if (result.CareLevel == CareLevel.UrgentCare || result.Confidence < 0.8)
        {
            return AutomationTier.HumanInLoop;
            // Show to patient WITH "pending nurse review" notice
        }
        
        // Medium: Primary care, high confidence
        if (result.CareLevel == CareLevel.PrimaryCare && result.Confidence >= 0.8)
        {
            return AutomationTier.AutomatedWithAlert;
            // Show to patient, notify nurse for audit sample
        }
        
        // Low: Self-care, very high confidence
        return AutomationTier.FullyAutomated;
    }
}
```

**Defense 3: Immutable Audit Trail**
```sql
-- Every triage decision logged
-- Cannot be modified or deleted
-- Includes: symptoms, recommendation, nurse override, timestamp

CREATE TABLE triage_audit_log (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    symptoms JSONB NOT NULL,
    ai_recommendation JSONB NOT NULL,
    ai_confidence DECIMAL(3,2) NOT NULL,
    nurse_reviewed BOOLEAN DEFAULT FALSE,
    nurse_decision JSONB,
    final_recommendation JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Immutability enforced
REVOKE UPDATE, DELETE ON triage_audit_log FROM ALL;

-- Only INSERT allowed (append-only)
GRANT INSERT ON triage_audit_log TO triage_service;
```

**Defense 4: Clinical Validation Requirements**
```csharp
// Model updates require nurse validation
public class ClinicalValidator
{
    public async Task<ValidationResult> ValidateModelUpdate(
        Model newModel, 
        TestDataset clinicalCases)
    {
        // Test model on 100+ validated clinical scenarios
        var results = await EvaluateModel(newModel, clinicalCases);
        
        // Nurse reviews results
        var nurseApproval = await _nurseReviewService.RequestValidation(
            modelVersion: newModel.Version,
            testResults: results,
            criticalFailures: results.Where(r => r.Severity == "Critical")
        );
        
        if (!nurseApproval.Approved)
        {
            return ValidationResult.Reject(nurseApproval.Rationale);
        }
        
        // Only deploy if nurse approves
        return ValidationResult.Approve();
    }
}
```

**Residual Risk**: MEDIUM
- No system is perfect; false negatives possible
- **Accepted**: Research status + human oversight reduces liability
- **Insurance**: Obtain professional liability insurance before Phase 3

---

### Threat 4: Privacy Leakage via Model Inference

**Attack Scenarios:**
1. **Membership inference**: Attacker determines if specific patient data was in training set
2. **Attribute inference**: Attacker infers sensitive demographics from model behavior
3. **Model inversion**: Attacker reconstructs training data from model parameters

**Impact**: MEDIUM
- POPIA violation (privacy breach)
- Demographic information leakage
- Loss of trust

**Mitigation Strategy:**

**Defense 1: Differential Privacy (ε=0.1)**
```python
class DifferentialPrivacyGuarantee:
    def __init__(self, epsilon=0.1):
        self.epsilon = epsilon  # Strong privacy guarantee
        # ε=0.1 means: indistinguishable whether any single patient was in dataset
    
    def add_noise_to_aggregates(self, aggregate_stats):
        # Laplace mechanism for counting queries
        sensitivity = 1  # Max influence of single patient
        scale = sensitivity / self.epsilon
        
        noisy_stats = {}
        for key, value in aggregate_stats.items():
            noise = np.random.laplace(0, scale)
            noisy_stats[key] = max(0, value + noise)  # Clip negative
        
        return noisy_stats
```

**Defense 2: Bucketed Demographics (No Exact Values)**
```sql
-- Store age ranges, not exact ages
age_range VARCHAR(10),  -- "20-30", "30-40", "40-50"

-- Store district, not street address
geography VARCHAR(50),  -- "Johannesburg Metro", "eThekwini Metro"

-- Store sex for clinical accuracy only
sex VARCHAR(10),  -- "Male", "Female", "Other"

-- NEVER store:
-- - Name
-- - ID number
-- - Email
-- - Phone number
-- - Precise address
```

**Defense 3: Aggregation Thresholds**
```python
# Don't publish statistics for small groups
MIN_GROUP_SIZE = 10

def publish_fairness_metrics(demographic_group, metrics):
    if metrics['count'] < MIN_GROUP_SIZE:
        return None  # Suppress small groups to prevent re-identification
    
    # Add differential privacy noise
    noisy_metrics = add_laplace_noise(metrics, epsilon=0.1)
    
    return noisy_metrics
```

**Residual Risk**: LOW
- Differential privacy provides mathematical guarantee
- Bucketed demographics prevent re-identification

---

### Threat 5: Governance System Manipulation

**Attack Scenarios:**
1. **Attacker modifies stakeholder agent logic** to approve malicious proposals
2. **Attacker replays old governance votes** to reverse decisions
3. **Attacker floods system with spam proposals** to hide malicious one

**Impact**: MEDIUM
- System changes without proper oversight
- Fairness protections bypassed
- Trust in governance eroded

**Mitigation Strategy:**

**Defense 1: Immutable Governance Logs**
```sql
CREATE TABLE governance_decisions (
    id UUID PRIMARY KEY,
    proposal_id UUID NOT NULL,
    proposal_type VARCHAR(50) NOT NULL,
    proposal_data JSONB NOT NULL,
    patient_agent_vote JSONB NOT NULL,
    provider_agent_vote JSONB NOT NULL,
    public_health_agent_vote JSONB NOT NULL,
    weighted_result JSONB NOT NULL,
    approved BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Cryptographic hash of proposal + votes
    hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64)  -- Blockchain-like chaining
);

-- Cannot be modified
REVOKE UPDATE, DELETE ON governance_decisions FROM ALL;
```

**Defense 2: Code-Signed Agent Logic**
```csharp
public class StakeholderAgentRegistry
{
    public async Task<bool> ValidateAgent(IStakeholderAgent agent)
    {
        // Verify agent code hasn't been tampered with
        var codeHash = ComputeHash(agent.GetType().Assembly);
        var expectedHash = await _agentHashRegistry.GetExpectedHash(agent.AgentType);
        
        if (codeHash != expectedHash)
        {
            await _securityLog.LogCritical(
                $"Agent code tampering detected: {agent.AgentType}",
                new { computed: codeHash, expected: expectedHash }
            );
            throw new SecurityException("Agent integrity violation");
        }
        
        return true;
    }
}
```

**Defense 3: Public Transparency Dashboard**
```typescript
// All governance decisions publicly visible
// Community can audit and challenge decisions

interface PublicGovernanceDashboard {
  recentDecisions: GovernanceDecision[];
  voteDistribution: {
    patient_support: number;
    provider_support: number;
    public_health_support: number;
  };
  controversialProposals: Proposal[];  // Close votes
  agentLogicVersion: string;  // Current agent code version
}

// Anyone can verify votes match published agent logic
```

**Residual Risk**: LOW
- Immutable logs prevent tampering
- Public transparency enables external audit

---

## POPIA Compliance Architecture

### Legal Framework

**Protection of Personal Information Act (POPIA), 2013**
- South Africa's privacy law (equivalent to GDPR)
- Applies to all patient data processing
- Maximum penalty: R10 million fine or 10 years imprisonment

### POPIA Requirements Mapping

| POPIA Principle | MedEquity Implementation | Evidence |
|----------------|------------------------|----------|
| **Accountability** | Designated Information Officer, documented policies | Security policies, training records |
| **Processing Limitation** | Only process for triage purpose, explicit consent | Consent flow, purpose limitation code |
| **Purpose Specification** | "Healthcare navigation assistance only" | Terms of service, disclaimers |
| **Further Processing** | No secondary use without new consent | Code review, audit logs |
| **Information Quality** | Accurate symptoms, validated by nurse | Human review, correction mechanism |
| **Openness** | Transparent data handling, privacy policy | Public privacy policy, user dashboard |
| **Security Safeguards** | Encryption, access control, audit logging | This document, penetration tests |
| **Data Subject Rights** | Access, correction, deletion, export | User data portal implementation |

---

### POPIA Compliance Implementation

#### Consent Management

```csharp
public class ConsentManager
{
    public async Task<ConsentRecord> ObtainConsent(Guid sessionId)
    {
        // Explicit, informed consent required before any data collection
        var consent = new ConsentRecord
        {
            SessionId = sessionId,
            Purpose = "Healthcare triage navigation assistance",
            DataCollected = new[]
            {
                "Symptoms and vital signs (for triage only)",
                "Age range, sex, location (for fairness monitoring)",
                "Triage recommendation and explanation (for your records)"
            },
            DataRetention = "7 days (automatic deletion)",
            DataSharing = "NEVER shared outside your clinic node",
            ConsentedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        
        // User must actively consent (no pre-checked boxes)
        await _db.ConsentRecords.AddAsync(consent);
        await _db.SaveChangesAsync();
        
        return consent;
    }
}
```

#### Data Subject Rights Portal

```csharp
public class DataSubjectRightsService
{
    // Right to Access
    public async Task<PatientDataPackage> ExportMyData(Guid sessionId)
    {
        var session = await _db.PatientSessions
            .Include(s => s.Symptoms)
            .Include(s => s.TriageResults)
            .Include(s => s.ConsentRecord)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);
        
        if (session == null)
            throw new DataNotFoundException("Session not found or expired");
        
        return new PatientDataPackage
        {
            SessionId = session.SessionId,
            Symptoms = session.Symptoms,
            TriageResults = session.TriageResults,
            ConsentRecord = session.ConsentRecord,
            ExportFormat = ExportFormat.JSON,
            ExportedAt = DateTime.UtcNow
        };
    }
    
    // Right to Correction
    public async Task CorrectMyData(Guid sessionId, SymptomCorrection correction)
    {
        // Allow patient to correct inaccurate symptom data
        var symptoms = await _db.Symptoms
            .Where(s => s.SessionId == sessionId)
            .ToListAsync();
        
        // Log correction for audit
        await _auditLog.Log(new AuditEvent
        {
            Type = "data_correction",
            SessionId = sessionId,
            OldValue = symptoms,
            NewValue = correction
        });
        
        // Apply correction, re-run triage if requested
        // ...
    }
    
    // Right to Deletion (Erasure)
    public async Task DeleteMyData(Guid sessionId)
    {
        // Immediate deletion (don't wait 7 days)
        var session = await _db.PatientSessions
            .Include(s => s.Symptoms)
            .Include(s => s.TriageResults)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);
        
        if (session != null)
        {
            _db.Remove(session);  // Cascades to symptoms, results
            await _db.SaveChangesAsync();
            
            // Log deletion (no patient data in log)
            await _auditLog.Log(new AuditEvent
            {
                Type = "user_requested_deletion",
                SessionId = sessionId,
                Timestamp = DateTime.UtcNow
            });
        }
    }
    
    // Right to Restriction
    public async Task RestrictProcessing(Guid sessionId)
    {
        // Mark session as "restricted" - no further processing
        var session = await _db.PatientSessions.FindAsync(sessionId);
        
        if (session != null)
        {
            session.ProcessingRestricted = true;
            await _db.SaveChangesAsync();
        }
    }
}
```

#### Privacy by Design Checklist

```markdown
## Phase 1 Privacy Requirements (Before Any Patient Data)

- [ ] Privacy impact assessment completed
- [ ] Data Protection Officer (DPO) designated
- [ ] Privacy policy drafted and reviewed by legal
- [ ] Consent flow implemented and tested
- [ ] Data minimization validated (only necessary fields)
- [ ] Encryption at rest and in transit configured
- [ ] Automatic deletion tested and verified
- [ ] Data subject rights portal functional
- [ ] Audit logging comprehensive and immutable
- [ ] Staff training on POPIA obligations completed
- [ ] Incident response plan documented
- [ ] Vendor agreements reviewed for POPIA compliance

## Phase 3 Privacy Requirements (Before Real Patients)

- [ ] External privacy audit completed
- [ ] Penetration testing passed
- [ ] Data breach notification procedures tested
- [ ] Cross-border data transfer safeguards (if applicable)
- [ ] Regular privacy training schedule established
- [ ] Privacy metrics dashboard operational
```

---

## Cryptographic Strategy

### Encryption Standards

| Data Type | Algorithm | Key Size | Rotation |
|-----------|-----------|----------|----------|
| **Data at Rest** | AES-256-GCM | 256-bit | Yearly |
| **Data in Transit** | TLS 1.3 | 256-bit ECDHE | Per-session |
| **Model Parameters** | AES-256-CTR | 256-bit | Per-training-round |
| **Password Hashing** | Argon2id | N/A | N/A |
| **Session Tokens** | HMAC-SHA256 | 256-bit | 30-minute expiry |

### Key Management

```csharp
public class KeyManagementService
{
    private readonly AzureKeyVaultClient _keyVault;
    
    // Encryption key for patient data (per-node)
    public async Task<byte[]> GetDataEncryptionKey(string nodeId)
    {
        var keyName = $"dek-node-{nodeId}";
        
        // Retrieve from Azure Key Vault
        var key = await _keyVault.GetSecretAsync(keyName);
        
        if (key == null)
        {
            // Generate new key if doesn't exist
            key = GenerateSecureRandomKey(256);
            await _keyVault.SetSecretAsync(keyName, Convert.ToBase64String(key));
        }
        
        return Convert.FromBase64String(key.Value);
    }
    
    // Rotate keys annually
    public async Task RotateDataEncryptionKeys()
    {
        var nodes = await _nodeRegistry.GetAllNodes();
        
        foreach (var node in nodes)
        {
            var oldKey = await GetDataEncryptionKey(node.Id);
            var newKey = GenerateSecureRandomKey(256);
            
            // Re-encrypt all data with new key
            await _reencryptionService.ReencryptNodeData(node.Id, oldKey, newKey);
            
            // Store new key
            await _keyVault.SetSecretAsync($"dek-node-{node.Id}", Convert.ToBase64String(newKey));
            
            // Archive old key for 90 days (recovery)
            await _keyVault.SetSecretAsync(
                $"dek-node-{node.Id}-archived-{DateTime.UtcNow:yyyyMMdd}",
                Convert.ToBase64String(oldKey),
                expiresAt: DateTime.UtcNow.AddDays(90)
            );
        }
    }
}
```

### Certificate Management

```yaml
# TLS Certificate Requirements
tls:
  version: 1.3
  cipher_suites:
    - TLS_AES_256_GCM_SHA384
    - TLS_CHACHA20_POLY1305_SHA256
  certificate:
    issuer: Let's Encrypt (automated renewal)
    validity: 90 days
    renewal_threshold: 30 days before expiry
    domains:
      - api.medequity.za
      - *.nodes.medequity.za
```

---

## Incident Response Procedures

### Security Incident Classification

| Severity | Definition | Examples | Response Time |
|----------|-----------|----------|---------------|
| **P0 (Critical)** | Active patient data breach | Database compromised, exfiltration detected | Immediate (15 min) |
| **P1 (High)** | Potential data exposure | Misconfigured access control, suspicious activity | 1 hour |
| **P2 (Medium)** | Security vulnerability | Unpatched dependency, failed audit | 24 hours |
| **P3 (Low)** | Policy violation | Weak password, expired certificate | 7 days |

### Incident Response Workflow

```
1. DETECTION
   └─> Automated monitoring alert OR manual report

2. TRIAGE (15 minutes)
   └─> Assess severity (P0-P3)
   └─> Assign incident commander
   └─> Activate response team

3. CONTAINMENT (P0: immediate, P1: 1 hour)
   └─> Isolate affected systems
   └─> Prevent further data access
   └─> Preserve forensic evidence

4. INVESTIGATION (4 hours for P0)
   └─> Identify attack vector
   └─> Determine data accessed/exfiltrated
   └─> Document timeline

5. ERADICATION (24 hours for P0)
   └─> Remove attacker access
   └─> Patch vulnerabilities
   └─> Rotate compromised credentials

6. RECOVERY (48 hours for P0)
   └─> Restore services safely
   └─> Verify integrity
   └─> Resume normal operations

7. NOTIFICATION (72 hours for breach)
   └─> Notify Information Regulator (South Africa)
   └─> Notify affected patients
   └─> Public disclosure if required

8. POST-MORTEM (7 days)
   └─> Root cause analysis
   └─> Corrective actions
   └─> Update security policies
```

### Data Breach Notification Template

```markdown
## Breach Notification (POPIA Compliance)

**To**: South African Information Regulator  
**From**: MedEquity Data Protection Officer  
**Date**: [Incident Date]  
**Subject**: Data Breach Notification (POPIA Section 22)

### Incident Summary
- **Date Discovered**: [Date]
- **Affected Node**: [Node ID, Location]
- **Data Types Compromised**: [Symptoms, Demographics, etc.]
- **Number of Affected Individuals**: [Estimated Count]
- **Attack Vector**: [How breach occurred]

### Immediate Actions Taken
1. Affected node isolated (timestamp)
2. Compromised credentials rotated (timestamp)
3. Forensic investigation initiated (timestamp)

### Risk Assessment
- **Patient Re-identification Risk**: [LOW/MEDIUM/HIGH]
- **Medical Harm Risk**: [Assessment]
- **Mitigation**: [Steps taken to reduce harm]

### Ongoing Actions
1. [Action plan with timelines]
2. [Corrective measures to prevent recurrence]

### Patient Notification Plan
- **Method**: [Email, SMS, Letter]
- **Timeline**: Within 72 hours of discovery
- **Support**: Helpline established at [Phone]

DPO Signature: _______________  
Date: _______________
```

---

## Security Monitoring & Alerting

### Real-Time Security Monitoring

```yaml
# Prometheus alerting rules
groups:
  - name: security_alerts
    interval: 30s
    rules:
      # Unauthorized access attempts
      - alert: HighFailedAuthRate
        expr: rate(auth_failures_total[5m]) > 10
        for: 1m
        labels:
          severity: critical
        annotations:
          description: "More than 10 failed auth attempts per second"
          action: "Block IP, investigate for brute force attack"
      
      # Data export anomalies
      - alert: UnusualDataExport
        expr: rate(data_exports_total[1h]) > 100
        for: 5m
        labels:
          severity: high
        annotations:
          description: "Unusual volume of data exports"
          action: "Audit export requests, check for data exfiltration"
      
      # Model poisoning attempt
      - alert: FairnessViolation
        expr: disparate_impact_ratio > 0.3
        for: 1m
        labels:
          severity: critical
        annotations:
          description: "Model fairness threshold breached"
          action: "Rollback model, investigate training data"
```

### Security Metrics Dashboard

```typescript
interface SecurityMetrics {
  // Access Control
  failed_auth_attempts: TimeSeries;
  active_sessions: number;
  session_duration_p95: Duration;
  
  // Data Protection
  data_at_rest_encrypted: Percentage;
  data_in_transit_encrypted: Percentage;
  auto_deletion_success_rate: Percentage;
  
  // Incident Tracking
  security_incidents_total: number;
  incidents_by_severity: Record<Severity, number>;
  mean_time_to_detect: Duration;
  mean_time_to_contain: Duration;
  
  // Compliance
  consent_rate: Percentage;
  data_subject_requests: number;
  popia_compliance_score: number;
}
```

---

## Penetration Testing Plan

### Phase 1 Security Testing (Before Real Patient Data)

**External Penetration Test** (3rd Party Vendor):
1. Network security assessment
2. Web application vulnerability scan
3. API security testing
4. Social engineering simulation
5. Physical security review (if on-premise nodes)

**Internal Security Audit**:
1. Code review (OWASP Top 10)
2. Dependency vulnerability scan
3. Configuration review
4. Access control verification
5. Encryption validation

**Acceptance Criteria**:
- Zero critical vulnerabilities
- All high-severity issues remediated
- Medium/low issues documented with mitigation plan
- Penetration test report approved by security expert

---

## Security Budget & Resources

### Phase 1-2 (Free Tier) Security Costs

| Item | Cost | Provider |
|------|------|----------|
| **TLS Certificates** | $0 | Let's Encrypt |
| **Vulnerability Scanning** | $0 | OWASP ZAP (open source) |
| **Secrets Management** | $0 | Azure Key Vault (free tier) |
| **Security Training** | $0 | OWASP, SANS free resources |
| **Total** | **$0/month** | |

### Phase 3 (Production) Security Costs

| Item | Cost | Provider |
|------|------|----------|
| **Penetration Testing** | $2,000 (one-time) | External vendor |
| **POPIA Compliance Audit** | $1,500 (one-time) | Legal firm |
| **Monitoring Tools** | $0-50/month | Prometheus (free) + Grafana Cloud (free tier) |
| **Incident Response Retainer** | $0 (in-house) | Your time + documentation |
| **Total** | **~$50/month** (after one-time costs amortized) |

---

## Conclusion

### Security Posture Summary

**Strengths**:
- ✅ Zero centralized patient data (architectural)
- ✅ Automatic cryptographic erasure (7-day limit)
- ✅ Differential privacy (mathematical guarantee)
- ✅ Human oversight (medical liability protection)
- ✅ Immutable audit logs (transparency + accountability)

**Residual Risks Accepted**:
- ⚠️ Model poisoning (mitigated by fairness validation)
- ⚠️ Sophisticated inference attacks (acceptable with DP)
- ⚠️ Zero-day vulnerabilities (mitigated by rapid patching)

**Not Addressed in MVP** (Future Work):
- Advanced cryptography (homomorphic encryption, MPC)
- Blockchain-based audit trails
- Hardware security modules (HSM)
- Formal verification of security properties

---

**Document Status**: LOCKED v1.0  
**Next Document**: Framework Implementation Mapping (ethical dimensions operationalized)
**Review Required**: Security expert + legal counsel before Phase 3