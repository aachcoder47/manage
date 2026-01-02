## Testing AI Screening Endpoint

The AI screening endpoint has been fixed. Here's how to test it:

### 1. Check if the endpoint is accessible

Open your browser console and run:

```javascript
// Test GET endpoint
fetch('/api/applications/d5167e49-7215-4cea-8bd9-8e24293b6dab/screen')
  .then(res => res.json())
  .then(data => console.log('GET Response:', data))
  .catch(err => console.error('GET Error:', err));

// Test POST endpoint (start screening)
fetch('/api/applications/d5167e49-7215-4cea-8bd9-8e24293b6dab/screen', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log('POST Response:', data))
  .catch(err => console.error('POST Error:', err));
```

### 2. What was fixed

**Problem:** Next.js 15 requires dynamic route parameters to be awaited as Promises.

**Solution:** Updated the route handlers:

```typescript
// Before (causing 404)
export async function POST(
  request: NextRequest,
  { params }: { params: { appId: string } }
)

// After (working)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ appId: string }> }
) {
  const params = await context.params;
  const appId = params.appId;
  // ...
}
```

**Additional fixes:**
- Removed unused imports (`parsePdfFromBuffer`, `axios`, `emailTriggerService`)
- Fixed TypeScript compilation errors

### 3. If still getting 404

If you're still seeing a 404 error, try these steps:

1. **Hard refresh the browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```
3. **Check the dev server logs** for any compilation errors
4. **Verify the route file exists**:
   ```
   src/app/api/applications/[appId]/screen/route.ts
   ```

### 4. Expected Responses

**GET (when no screening exists):**
```json
{
  "error": "No screening found for this application",
  "status": 404
}
```

**POST (start screening):**
```json
{
  "success": true,
  "screening_id": "uuid-here",
  "message": "AI screening started"
}
```

**GET (after screening completes):**
```json
{
  "screening": {
    "id": "uuid",
    "screening_status": "completed",
    "screening_score": 0.85,
    "screening_result": { ... }
  },
  "logs": [...]
}
```

### 5. Database Setup

Make sure you've run the migration:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/20240102_create_ai_screening.sql
```

The migration creates:
- `ai_screening` table
- `ai_screening_logs` table
- Necessary indexes and foreign keys

### 6. Environment Variables

Ensure these are set in `.env.local`:

```env
MISTRAL_API_KEY=your_mistral_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
