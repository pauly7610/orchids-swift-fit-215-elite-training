# Cron Job Setup Guide

This application includes automated scheduled tasks (cron jobs) that need to be configured for proper operation.

## Credit Expiration Cron Job

### Purpose
Automatically deactivates expired credit packages to prevent students from using credits past their expiration date.

### Endpoint
```
GET/POST /api/cron/expire-credits
```

### Required Environment Variable
Add to your `.env` file:
```
CRON_SECRET=your-secure-random-string-here
```

Generate a secure random string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### Setup Options

#### Option 1: Vercel Cron Jobs (Recommended for Vercel deployments)

1. Create `vercel.json` in your project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/expire-credits",
      "schedule": "0 0 * * *"
    }
  ]
}
```

2. Add `CRON_SECRET` to your Vercel environment variables
3. Deploy to Vercel - cron jobs will run automatically

**Schedule:** Daily at midnight UTC

#### Option 2: External Cron Service (cron-job.org)

1. Sign up at https://cron-job.org
2. Create a new cron job with:
   - **URL:** `https://yourdomain.com/api/cron/expire-credits`
   - **Schedule:** `0 0 * * *` (daily at midnight)
   - **HTTP Method:** GET
   - **Headers:** 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

#### Option 3: GitHub Actions

1. Create `.github/workflows/cron-expire-credits.yml`:
```yaml
name: Expire Credits Cron Job

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  expire-credits:
    runs-on: ubuntu-latest
    steps:
      - name: Call expire credits endpoint
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://yourdomain.com/api/cron/expire-credits
```

2. Add `CRON_SECRET` to your GitHub repository secrets

#### Option 4: Node-cron (For self-hosted deployments)

If you're running on a VPS or dedicated server, you can use system cron:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at midnight)
0 0 * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/expire-credits
```

### Recommended Schedule

- **Production:** Daily at midnight (`0 0 * * *`)
- **Development/Testing:** Every 6 hours (`0 */6 * * *`)

### Monitoring

The endpoint returns:
```json
{
  "success": true,
  "message": "Expired X credit purchase(s)",
  "deactivatedCount": 5,
  "details": [
    {
      "purchaseId": 123,
      "studentProfileId": 45,
      "creditsExpired": 10,
      "expiresAt": "2025-12-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2025-12-05T00:00:00.000Z"
}
```

### Security Notes

- ✅ Endpoint is protected with bearer token authentication
- ✅ Requires `CRON_SECRET` environment variable
- ✅ Logs all expiration activities
- ✅ Only deactivates purchases with `expiresAt < current date`
- ✅ Won't affect purchases without expiration dates

### Testing

Test the cron job manually:

```bash
# Test locally (development)
curl -X POST \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/expire-credits

# Test production
curl -X POST \
  -H "Authorization: Bearer your-cron-secret" \
  https://yourdomain.com/api/cron/expire-credits
```

### Troubleshooting

**401 Unauthorized:**
- Check that `CRON_SECRET` is set in environment variables
- Verify the Authorization header matches `Bearer YOUR_CRON_SECRET`

**500 Cron Not Configured:**
- `CRON_SECRET` environment variable is missing
- Add it to your `.env` file or hosting platform

**No credits expired:**
- This is normal if no credits have expired yet
- Check `studentPurchases` table for purchases with `expiresAt < current date`
