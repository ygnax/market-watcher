# Vercel Deployment Setup

## Environment Variables

To deploy this application to Vercel, you need to add the following environment variable:

### Required Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
Name: NEWS_API_KEY
Value: your_newsapi_key_here
Environment: Production, Preview, Development (select all)
```

### Getting Your NewsAPI Key

1. Visit [https://newsapi.org/](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Copy the API key and paste it into Vercel's environment variables

### Important Notes

- **After adding environment variables**, you need to **redeploy** your application for the changes to take effect
- The free tier of NewsAPI has rate limits (100 requests per day)
- Make sure the environment variable is set for all environments (Production, Preview, Development)

### Verifying the Setup

After deployment, check the Vercel function logs to see if the API key is being read correctly. If you see errors about "NewsAPI key is not configured", the environment variable is not set correctly.

### Troubleshooting

1. **Check environment variable name**: Make sure it's exactly `NEWS_API_KEY` (case-sensitive)
2. **Redeploy**: After adding/changing environment variables, trigger a new deployment
3. **Check logs**: Go to Vercel dashboard → Your Project → Functions → View logs to see any errors
4. **Verify API key**: Make sure your NewsAPI key is valid and not expired

