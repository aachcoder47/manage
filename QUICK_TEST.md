## Quick Test

Open your browser console and run this to test if the route structure works:

```javascript
// Test the simple test endpoint first
fetch('/api/applications/dedcbd21-6f91-4891-86ba-a479e31923f5/test', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log('Test endpoint:', data))
  .catch(err => console.error('Test error:', err));
```

If the test endpoint works, then the issue is specifically in the screen route logic.

Then try the screen endpoint again:

```javascript
fetch('/api/applications/dedcbd21-6f91-4891-86ba-a479e31923f5/screen', {
  method: 'POST'
})
  .then(async res => {
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  })
  .catch(err => console.error('Error:', err));
```

Check the terminal logs for the console.log messages starting with `[AI Screening]`.
