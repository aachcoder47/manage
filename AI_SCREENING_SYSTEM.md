# AI Screening System Documentation

## Overview

The AI Screening System automatically evaluates job applications using AI (Mistral) to assess candidate fit, skills match, and overall suitability for positions. This system includes comprehensive error handling, retry logic, and detailed logging.

## Features

- **Automated AI Screening**: Uses Mistral AI to analyze applications
- **Scoring System**: Provides 0-100 match scores
- **Error Handling**: Robust retry mechanism with configurable limits
- **Detailed Logging**: Comprehensive logs for debugging and auditing
- **Status Tracking**: Real-time screening status updates
- **Resume Analysis**: Parses and analyzes resume content

## Database Schema

### `ai_screening` Table

Stores AI screening results for each application.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `application_id` | UUID | Foreign key to job_applications |
| `screening_status` | VARCHAR(20) | Status: pending, processing, completed, failed |
| `screening_result` | JSONB | AI analysis results |
| `screening_score` | DECIMAL(3,2) | Match score (0.00 to 1.00) |
| `screening_reason` | TEXT | AI reasoning for the score |
| `screening_model` | VARCHAR(50) | AI model used (default: mistral-7b) |
| `screening_version` | VARCHAR(20) | Model version |
| `error_message` | TEXT | Error details if failed |
| `error_code` | VARCHAR(50) | Error code for categorization |
| `retry_count` | INTEGER | Number of retry attempts |
| `max_retries` | INTEGER | Maximum retry attempts (default: 3) |
| `last_retry_at` | TIMESTAMP | Last retry timestamp |
| `metadata` | JSONB | Additional screening metadata |
| `is_active` | BOOLEAN | Active status |

### `ai_screening_logs` Table

Stores detailed logs for debugging and auditing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `screening_id` | UUID | Foreign key to ai_screening |
| `log_level` | VARCHAR(20) | Level: debug, info, warn, error |
| `log_message` | TEXT | Log message |
| `log_data` | JSONB | Additional log data |
| `processing_time_ms` | INTEGER | Processing time in milliseconds |
| `api_response` | TEXT | Raw API response |
| `error_details` | JSONB | Error details |

## API Endpoints

### Start AI Screening

**POST** `/api/applications/[appId]/screen`

Initiates AI screening for an application.

**Response:**
```json
{
  "success": true,
  "screening_id": "uuid",
  "message": "AI screening started"
}
```

### Get Screening Results

**GET** `/api/applications/[appId]/screen`

Retrieves screening results and logs.

**Response:**
```json
{
  "screening": {
    "id": "uuid",
    "application_id": "uuid",
    "screening_status": "completed",
    "screening_score": 0.85,
    "screening_result": {
      "score": 85,
      "skills_match": ["JavaScript", "React"],
      "experience_relevance": true,
      "communication_quality": "good",
      "recommendation": "interview",
      "reasoning": "Strong candidate with relevant experience"
    }
  },
  "logs": [...]
}
```

## Screening Process

### 1. Initiation
- Application data is fetched
- Screening record is created with status "processing"
- Background processing begins

### 2. AI Analysis
The system analyzes:
- Applicant name and email
- Job title and description
- Cover letter content
- Resume (if available)

### 3. Scoring
AI provides:
- **Overall Score**: 0-100 match score
- **Skills Match**: List of matching skills
- **Experience Relevance**: Boolean assessment
- **Communication Quality**: Evaluation of written communication
- **Recommendation**: hire/interview/reject
- **Reasoning**: Detailed explanation

### 4. Result Storage
- Screening status updated to "completed"
- Results stored in `screening_result` JSONB
- Score normalized to 0.00-1.00 range
- Success log created

### 5. Error Handling
If screening fails:
- Status set to "failed"
- Error message and code stored
- Retry count incremented
- Error log created
- Can be retried up to `max_retries` times

## Environment Variables

```env
# Required for AI screening
MISTRAL_API_KEY=your_mistral_api_key

# Database (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage Example

### Frontend Integration

```typescript
// Start screening
const startScreening = async (applicationId: string) => {
  const response = await fetch(`/api/applications/${applicationId}/screen`, {
    method: 'POST'
  });
  const data = await response.json();
  return data;
};

// Get screening results
const getScreeningResults = async (applicationId: string) => {
  const response = await fetch(`/api/applications/${applicationId}/screen`);
  const data = await response.json();
  return data;
};

// Poll for completion
const pollScreening = async (applicationId: string) => {
  const interval = setInterval(async () => {
    const { screening } = await getScreeningResults(applicationId);
    
    if (screening.screening_status === 'completed') {
      clearInterval(interval);
      console.log('Screening completed:', screening.screening_result);
    } else if (screening.screening_status === 'failed') {
      clearInterval(interval);
      console.error('Screening failed:', screening.error_message);
    }
  }, 3000); // Poll every 3 seconds
};
```

## Screening Result Format

```json
{
  "score": 85,
  "skills_match": ["JavaScript", "React", "Node.js"],
  "experience_relevance": true,
  "communication_quality": "excellent",
  "recommendation": "interview",
  "reasoning": "Candidate demonstrates strong technical skills with 5+ years of relevant experience. Communication is clear and professional. Highly recommended for interview."
}
```

## Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `AI_SERVICE_ERROR` | AI service unavailable | Retry automatically |
| `AI_PROCESSING_ERROR` | Error during AI processing | Check logs, may need manual review |
| `DATABASE_ERROR` | Database connection failed | Check database connectivity |
| `INVALID_APPLICATION` | Application not found | Verify application ID |

## Monitoring and Debugging

### Check Screening Status

```sql
SELECT 
  ja.applicant_name,
  ais.screening_status,
  ais.screening_score,
  ais.error_message,
  ais.retry_count
FROM ai_screening ais
JOIN job_applications ja ON ais.application_id = ja.id
WHERE ais.is_active = true
ORDER BY ais.created_at DESC;
```

### View Failed Screenings

```sql
SELECT 
  ja.applicant_name,
  ais.error_message,
  ais.error_code,
  ais.retry_count,
  ais.last_retry_at
FROM ai_screening ais
JOIN job_applications ja ON ais.application_id = ja.id
WHERE ais.screening_status = 'failed'
ORDER BY ais.created_at DESC;
```

### Check Screening Logs

```sql
SELECT 
  asl.log_level,
  asl.log_message,
  asl.processing_time_ms,
  asl.created_at
FROM ai_screening_logs asl
WHERE asl.screening_id = 'your-screening-id'
ORDER BY asl.created_at DESC;
```

## Best Practices

1. **Always check screening status** before displaying results
2. **Implement polling** for real-time updates
3. **Handle errors gracefully** with user-friendly messages
4. **Monitor retry counts** to identify persistent issues
5. **Review failed screenings** regularly for patterns
6. **Use logs** for debugging and auditing

## Troubleshooting

### Screening Stuck in "Processing"
- Check Mistral API key validity
- Review screening logs for errors
- Verify network connectivity
- Check if background process completed

### High Failure Rate
- Verify Mistral API quota
- Check API key permissions
- Review error logs for patterns
- Consider increasing retry limits

### Inconsistent Scores
- Review AI prompt in code
- Check input data quality
- Verify resume parsing is working
- Consider adjusting scoring criteria

## Future Enhancements

- [ ] Support for multiple AI models
- [ ] Custom scoring criteria per job
- [ ] Batch screening for multiple applications
- [ ] Email notifications on completion
- [ ] Dashboard for screening analytics
- [ ] Manual override capabilities
- [ ] A/B testing different prompts
- [ ] Integration with ATS systems
