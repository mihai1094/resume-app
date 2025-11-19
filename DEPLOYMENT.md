# Deployment Guide - Vercel

This guide covers deploying your Resume Builder application to Vercel.

## Prerequisites

- A Vercel account ([sign up here](https://vercel.com/signup))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Method 1: Deploy via Vercel Dashboard (Recommended)

This is the easiest method and enables automatic deployments on every push.

### Step 1: Push to Git

Make sure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Project

Vercel will auto-detect these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or `next build`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 4: Environment Variables (Optional)

If you need environment variables (e.g., for SEO):

1. In the project settings, go to **"Environment Variables"**
2. Add:
   ```
   NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
   ```

### Step 5: Deploy

Click **"Deploy"** and wait for the build to complete. Your app will be live at:
`https://your-app-name.vercel.app`

---

## Method 2: Deploy via Vercel CLI

For quick deployments without Git integration.

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

From your project root:

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

### Step 4: Set Environment Variables (if needed)

```bash
vercel env add NEXT_PUBLIC_BASE_URL
# Enter the value when prompted
```

---

## Build Configuration

Your `package.json` already has the correct build scripts:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

Vercel will automatically:

- Run `npm install` to install dependencies
- Run `npm run build` to build the app
- Serve the app using Next.js's built-in server

---

## Environment Variables

### Optional Variables

If you want to customize the base URL for SEO:

```env
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

This is used in:

- `lib/seo/metadata.ts` - For generating absolute URLs in metadata
- Open Graph images
- Structured data

### Setting Environment Variables

**Via Dashboard:**

1. Go to your project → **Settings** → **Environment Variables**
2. Add variables for Production, Preview, and Development
3. Redeploy after adding variables

**Via CLI:**

```bash
vercel env add NEXT_PUBLIC_BASE_URL production
```

---

## Custom Domain

1. Go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain

---

## Automatic Deployments

Once connected to Git, Vercel will:

- **Production**: Deploy on push to `main`/`master` branch
- **Preview**: Deploy on every push to other branches
- **Pull Requests**: Create preview deployments automatically

---

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Ensure all dependencies are in `package.json` (not just `package-lock.json`)

### Environment Variables Not Working

1. Make sure variables are set for the correct environment (Production/Preview/Development)
2. Redeploy after adding variables
3. Variables starting with `NEXT_PUBLIC_` are available in the browser

### PDF Export Issues

If PDF export doesn't work:

- Check browser console for errors
- Ensure `@react-pdf/renderer` is in dependencies (it is ✅)
- Test locally first

### Performance

- Vercel automatically optimizes Next.js apps
- Images are optimized via Next.js Image component
- Static pages are automatically cached

---

## Next Steps After Deployment

1. ✅ Test all features on the live site
2. ✅ Update `NEXT_PUBLIC_BASE_URL` to your production URL
3. ✅ Submit sitemap to Google Search Console: `https://your-domain.com/sitemap.xml`
4. ✅ Test robots.txt: `https://your-domain.com/robots.txt`
5. ✅ Verify structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## Quick Deploy Commands

```bash
# First time setup
vercel login
vercel

# Production deploy
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs
```

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
