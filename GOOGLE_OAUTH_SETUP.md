# Google OAuth Setup Guide

## ✅ What's Already Configured:

Your application already has Google OAuth integration set up on both the **frontend** and **backend**:

### Frontend (HTML/JavaScript):
- ✅ Google Sign-In SDK loaded on both pages
- ✅ Login page has Google button container
- ✅ Register page has Google button container  
- ✅ Button rendering and callback handlers configured
- ✅ CSS animations added for smooth UI

### Backend (Node.js/Express):
- ✅ `/api/config` endpoint to serve Google Client ID
- ✅ `/users/google-login` route for authentication
- ✅ `/users/google-register` route for new user sign-up
- ✅ Google token verification using google-auth-library
- ✅ Database support for storing google_id field

## 🔧 What You Need To Do:

### Step 1: Get Your Google Client ID

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web Application**
6. Add these **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `http://localhost:5173` (if using Vite dev server)
   - `https://yourdomain.com` (your production domain)

7. **Copy your Client ID** (example: `123456789-abcdefg.apps.googleusercontent.com`)

### Step 2: Update Your .env File

Open `.env` in your project root and add:

```
GOOGLE_CLIENT_ID=paste_your_client_id_here
```

**Example:**
```
PORT=3000
NODE_ENV=development
DATABASE_URL=your_postgres_url
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
CLOUDINARY_NAME=your_cloudinary
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Step 3: Restart Your Server

```bash
npm run dev
```

### Step 4: Test It Out

1. Open [http://localhost:3000/login.html](http://localhost:3000/login.html)
2. You should now see a **Google Sign In button** below the email/password login
3. Click it to authenticate with your Google account
4. Same button appears on the registration page with "Sign up with Google"

## 🎨 Button Styling

The Google button will appear with:
- **Theme**: Outlined style (matches your app's design)
- **Size**: Large, full-width
- **Text**: "Sign in with" for login, "Sign up with" for registration
- **Styling**: Responsive and centered in the form

## 📱 Features

Once set up, users can:

### On Login Page:
- Click "Sign in with Google" to log in with existing Google account
- Must have previously registered with that Google account

### On Registration Page:
- Click "Sign up with Google" to create new account
- Automatically generates username from Google profile
- Stores Google ID for future logins

## 🛡️ Security

- All tokens verified server-side using `google-auth-library`
- Tokens are never exposed to frontend beyond verification
- User passwords are securely hashed with bcrypt
- Rate limiting applied to auth endpoints

## 🔍 Testing Tips

1. **First time?** Register with Google, then you can log in with the same Google account
2. **Can't see button?** Check browser console for errors (F12 → Console tab)
3. **CORS issues?** Make sure your domain is in Google Cloud authorized origins
4. **Still not working?** Verify `.env` has correct `GOOGLE_CLIENT_ID` value

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not showing | 1. Check `.env` has GOOGLE_CLIENT_ID set<br/>2. Check browser console for errors<br/>3. Restart server after updating .env |
| "Error loading Google SDK" | Clear browser cache, check Google Client ID is valid |
| "Account already exists" error | Email already registered; use Google login instead of register |
| CORS Error | Add your domain to authorized origins in Google Cloud Console |

---

**That's it!** Your Google login is now ready to use. 🚀
