# API Documentation

## `/api/summary`
Generates an executive summary of the user's stack audit.

- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Payload
```json
{
  "report": {
    "teamSize": 15,
    "totalSpend": 1200,
    "monthlyWaste": 300,
    "score": 75,
    "recommendations": [
      {
        "id": "overlap-llm",
        "title": "LLM Overlap Detected",
        "description": "Consolidate ChatGPT and Claude.",
        "savings": 20
      }
    ]
  }
}
```

### Response (Success - AI Generated)
```json
{
  "summary": "Based on your team of 15, your current spend of $1,200 has an optimization potential of $300...",
  "source": "ai",
  "prompt": "..."
}
```

### Response (Fallback - Deterministic)
Returned gracefully if the AI provider limits the request.
```json
{
  "summary": "Your stack audit is complete. We identified 1 overlapping tools and $300 in estimated monthly waste.",
  "source": "fallback",
  "prompt": "..."
}
```

---

## `/api/leads`
Captures user email addresses for future optimizations and sends a transactional confirmation.

- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Payload
```json
{
  "email": "user@example.com",
  "reportId": "uuid-string-here",
  "a_password": "" 
}
```
*Note: `a_password` is a honeypot field. If populated, the server will silently discard the request to prevent bot spam.*

### Response (Success)
```json
{
  "success": true
}
```

### Response (Error)
```json
{
  "error": "Invalid email address"
}
```
