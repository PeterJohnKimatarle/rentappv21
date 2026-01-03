# Google Authentication Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with these variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000
```

## How to Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/select a project**
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure OAuth consent screen if prompted
   - Choose "Web application" as application type
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
5. **Copy the Client ID and Client Secret** to your `.env.local` file

## NEXTAUTH_SECRET

Generate a random secret for NextAuth:
- You can use: `openssl rand -base64 32`
- Or any random string of 32+ characters
