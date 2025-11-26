# 🚀 AI Recruiter System - Usage Guide

## 📍 **Where to Find the New Features**

### **1. Main Dashboard Access**
```
📁 Location: /dashboard/ai-features
```
Navigate to: `http://localhost:3000/dashboard/ai-features`

This is your central hub for all AI-powered features.

---

## 🎯 **How to Use Each Feature**

### **1. Skill Assessment Engine**

#### **📍 Access Path:**
```
Dashboard → AI Features → Skill Assessments Tab
```

#### **🔧 How to Use:**

**A. Create a New Assessment**
1. Click "Create Assessment" button
2. Fill in assessment details:
   - **Title**: "JavaScript Fundamentals"
   - **Type**: Choose from Coding, Technical, Behavioral, or Mixed
   - **Difficulty**: Beginner, Intermediate, Advanced, or Expert
   - **Time Limit**: Set assessment duration (minutes)
   - **Passing Score**: Minimum score to pass (70-90%)

**B. Add Coding Challenges**
1. Select "Coding" assessment type
2. Add challenges with:
   - **Problem Description**: Clear problem statement
   - **Test Cases**: Input/output examples
   - **Language**: JavaScript, Python, Java, etc.
   - **Solution**: Reference solution for AI comparison

**C. AI-Powered Evaluation**
- Candidates submit code solutions
- AI automatically evaluates:
  - ✅ Code correctness
  - ⚡ Performance efficiency  
  - 🎨 Code quality
  - 📋 Best practices
- Provides detailed feedback with strengths and improvement areas

#### **📱 API Usage:**
```javascript
// Create assessment
POST /api/skill-assessments
{
  "title": "React Hooks Challenge",
  "description": "Build custom hooks",
  "assessment_type": "coding",
  "difficulty_level": "intermediate",
  "interview_id": "your-interview-id"
}

// Evaluate code submission
POST /api/evaluate-code
{
  "code": "function solution() { ... }",
  "language": "javascript",
  "challenge": { ...challenge_data },
  "submissionData": { ... }
}
```

---

### **2. Advanced Candidate Filtering**

#### **📍 Access Path:**
```
Dashboard → AI Features → Candidate Filtering Tab
```

#### **🔧 How to Use:**

**A. Set Filter Criteria**
1. **Score Range**: Min/max overall scores (0-100)
2. **Required Skills**: Add specific skills (React, Node.js, etc.)
3. **Experience**: Years of experience range
4. **Location**: Geographic preferences
5. **Status**: Filter by candidate status
6. **Time Spent**: Assessment completion time

**B. AI-Powered Insights**
- **Match Score**: AI calculates candidate fit percentage
- **Strengths Analysis**: Identifies key candidate strengths
- **Risk Assessment**: Flags potential concerns
- **Role Fit**: Suggests suitable positions

**C. Export Results**
- **CSV Export**: Download filtered candidates
- **JSON Export**: For integration with other systems

#### **📱 API Usage:**
```javascript
// Filter candidates
POST /api/filter-candidates
{
  "interviewId": "your-interview-id",
  "criteria": {
    "minScore": 70,
    "skills": ["React", "TypeScript"],
    "experienceYears": { "min": 2, "max": 8 },
    "status": ["in_review", "selected"]
  },
  "page": 1,
  "limit": 20
}

// Export candidates
POST /api/export-candidates
{
  "interviewId": "your-interview-id",
  "format": "csv",
  "criteria": { ...filter_criteria }
}
```

---

### **3. ATS Integration**

#### **📍 Access Path:**
```
Dashboard → AI Features → ATS Integration Tab
```

#### **🔧 How to Use:**

**A. Configure ATS Providers**
1. **Greenhouse Setup**:
   - Enter API Key
   - Set Board Token
   - Configure default job ID

2. **Lever Setup**:
   - Add Client ID
   - Enter Client Secret
   - Configure webhook URLs

3. **Workday Setup**:
   - Tenant configuration
   - API credentials
   - Enterprise setup

**B. Automatic Sync Features**
- **Candidate Creation**: Auto-create profiles in ATS
- **Status Updates**: Sync status changes in real-time
- **Assessment Results**: Send AI evaluation results
- **Error Handling**: Retry failed syncs automatically

#### **📱 API Usage:**
```javascript
// Create ATS integration
POST /api/ats-integrations
{
  "organization_id": "your-org-id",
  "provider": "greenhouse",
  "configuration": {
    "api_key": "your-api-key",
    "board_token": "your-board-token",
    "default_job_id": "12345"
  }
}

// Sync candidate to ATS
POST /api/sync-to-ats
{
  "integrationId": "integration-id",
  "candidateProfile": { ...profile_data },
  "responseId": 123,
  "type": "candidate_create"
}
```

---

### **4. Enhanced Candidate Status Management**

#### **📍 Access Path:**
```
Dashboard → Interview Details → Candidate Management
```

#### **🔧 How to Use:**

**A. Status Workflow**
```
Pending → In Review → Selected/Rejected/On Hold
```

**B. AI Recommendations**
- AI analyzes candidate performance
- Suggests optimal status changes
- Provides reasoning for recommendations

**C. Approval Workflows**
- Critical changes require approval
- Audit trail for all status changes
- Automatic notifications to team

#### **📱 API Usage:**
```javascript
// Update candidate status
PUT /api/candidate-status
{
  "responseId": 123,
  "newStatus": "selected",
  "reason": "Excellent technical assessment results",
  "requestedBy": "hiring-manager-id"
}

// Get AI status recommendation
GET /api/candidate-status?type=recommendation&responseId=123
```

---

### **5. Rich Candidate Profiles**

#### **📍 Access Path:**
```
Dashboard → Interview Details → Candidate Profile
```

#### **🔧 How to Use:**

**A. AI-Generated Summaries**
- Auto-parse resume data
- Generate professional summaries
- Extract key skills and experience

**B. Social Integration**
- LinkedIn profile analysis
- GitHub portfolio review
- Portfolio website evaluation

**C. Skill Tagging**
- Automatic skill extraction
- Experience level assessment
- Technology stack analysis

#### **📱 API Usage:**
```javascript
// Create/update candidate profile
POST /api/candidate-profile
{
  "responseId": 123,
  "profileData": {
    "experience_years": 5,
    "skills": ["React", "Node.js", "AWS"],
    "location": "San Francisco, CA",
    "linkedin_url": "https://linkedin.com/in/...",
    "github_url": "https://github.com/...",
    "portfolio_url": "https://portfolio.com/...",
    "work_experience": [ ... ],
    "education": [ ... ]
  },
  "generateSummary": true
}
```

---

## 🛠️ **Quick Start Guide**

### **Step 1: Set Up Your First Assessment**
1. Go to `/dashboard/ai-features`
2. Click "Create Assessment"
3. Choose "Coding" type
4. Add a JavaScript challenge
5. Set passing score to 70%
6. Click "Save"

### **Step 2: Test Candidate Filtering**
1. Go to "Candidate Filtering" tab
2. Click "Show Filters"
3. Set minimum score to 70%
4. Add skill "JavaScript"
5. Click "Apply Filters"
6. Export results as CSV

### **Step 3: Configure ATS Integration**
1. Go to "ATS Integration" tab
2. Click "Configure" for Greenhouse
3. Enter your API credentials
4. Test connection
5. Enable auto-sync

### **Step 4: Review AI Analytics**
1. Go to "AI Analytics" tab
2. View performance metrics
3. Monitor assessment completion rates
4. Track AI accuracy scores

---

## 📊 **Real-World Examples**

### **Example 1: Technical Hiring**
```
🎯 Goal: Hire Senior React Developer

✅ Steps:
1. Create React coding assessment (Advanced level)
2. Filter candidates with React experience 3+ years
3. Set minimum score 75%
4. Sync top candidates to Greenhouse
5. Schedule interviews with AI-selected candidates

📈 Results:
- 50 candidates assessed
- 12 passed AI evaluation
- 8 synced to ATS
- 5 moved to interviews
```

### **Example 2: Bulk Campus Recruitment**
```
🎯 Goal: Hire 10 Junior Developers

✅ Steps:
1. Create JavaScript fundamentals assessment
2. Filter by "Beginner" difficulty
3. Set minimum score 60%
4. Auto-reject below 40%
5. Export top 20 candidates

📈 Results:
- 200 candidates processed
- 80 passed assessment
- 40 met score criteria
- 20 exported for review
```

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

**❌ Issue: "Assessment not evaluating code"**
```
✅ Solution:
1. Check Mistral API key in .env
2. Verify test cases are properly formatted
3. Ensure code submission includes solution
```

**❌ Issue: "ATS sync failing"**
```
✅ Solution:
1. Check API credentials
2. Verify webhook URLs are accessible
3. Review sync logs in database
```

**❌ Issue: "Candidates not showing in filter"**
```
✅ Solution:
1. Ensure candidates have completed assessments
2. Check interview ID is correct
3. Verify filter criteria aren't too restrictive
```

---

## 🎯 **Best Practices**

### **For Assessments**
- Keep challenges focused and realistic
- Provide clear problem statements
- Include comprehensive test cases
- Set appropriate time limits

### **For Filtering**
- Start broad, then narrow down
- Use AI insights to refine criteria
- Export results for team review
- Save frequently used filter presets

### **For ATS Integration**
- Test connections before enabling auto-sync
- Monitor sync logs regularly
- Set up webhook notifications
- Keep API credentials secure

---

## 🚀 **Next Steps**

1. **Run Database Migration**: Apply the new schema
2. **Set Environment Variables**: Add Mistral API key
3. **Configure ATS**: Set up provider credentials
4. **Create First Assessment**: Test the workflow
5. **Monitor Performance**: Track AI accuracy

---

## 📞 **Support**

For help with any of these features:
1. Check the troubleshooting section above
2. Review the API documentation
3. Test with sample data first
4. Monitor logs for errors

🎉 **Your AI Recruiter System is now ready for advanced technical hiring!**
