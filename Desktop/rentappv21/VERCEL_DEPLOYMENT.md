# Vercel Deployment Guide for Rentapp

This guide will help you deploy Rentapp to Vercel successfully.

## Prerequisites

1. A GitHub account with the repository pushed
2. A Vercel account (sign up at https://vercel.com)
3. Google OAuth credentials (if using Google Sign-In)

## Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `PeterJohnKimatarle/rentappv19`
4. Vercel will automatically detect it's a Next.js project

## Step 2: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)
- **Node.js Version**: 18.x or higher (specified in package.json)

## Step 3: Set Environment Variables

**CRITICAL**: Add these environment variables in Vercel Dashboard → Project Settings → Environment Variables:

### Required for Google OAuth (Optional but Recommended)

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Required for NextAuth

```
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

**Important Notes:**
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Update `NEXTAUTH_URL` with your actual Vercel domain after first deployment
- For production, also add the production domain to Google OAuth authorized redirect URIs:
  - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
  - `https://your-custom-domain.com/api/auth/callback/google` (if using custom domain)

### Setting Environment Variables

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add each variable for:
   - **Production** (required)
   - **Preview** (optional, for PR previews)
   - **Development** (optional, for local development)

## Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## Step 5: Update Google OAuth Redirect URI

After deployment, update your Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   https://your-vercel-domain.vercel.app/api/auth/callback/google
   ```
5. Save changes

## Step 6: Verify Deployment

Check these after deployment:

- ✅ Homepage loads correctly
- ✅ Navigation works
- ✅ Property pages load
- ✅ Authentication works (if configured)
- ✅ Images load properly
- ✅ No console errors

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (>=18.0.0)

### Environment Variables Not Working

- Ensure variables are set for **Production** environment
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Google OAuth Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check redirect URI matches exactly in Google Console
- Ensure `NEXTAUTH_URL` matches your Vercel domain
- Check browser console for specific errors

### Images Not Loading

- Verify image domains in `next.config.ts` are correct
- Check that images are in the `public` folder
- Ensure image paths are correct

### 404 Errors on Routes

- Verify all pages are in `src/app` directory
- Check that dynamic routes use correct syntax: `[id]`
- Ensure API routes are in `src/app/api` directory

## Custom Domain Setup (Optional)

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to match
5. Update Google OAuth redirect URI

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or PRs

## Performance Optimization

Vercel automatically:
- ✅ Optimizes images
- ✅ Enables edge caching
- ✅ Provides CDN distribution
- ✅ Optimizes JavaScript bundles

## Support

If you encounter issues:
1. Check Vercel build logs
2. Review Next.js documentation
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

---

**Deployment Checklist:**
- [ ] Repository connected to Vercel
- [ ] Build settings verified
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Google OAuth redirect URI updated
- [ ] All pages working correctly
- [ ] Custom domain configured (if applicable)




