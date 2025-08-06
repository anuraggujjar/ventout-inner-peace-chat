# Google Authentication Setup Guide

## 1. Google Cloud Console Setup

### Create Google OAuth Client IDs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**

### Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** (for testing) or **Internal** (for organization)
3. Fill in the required fields:
   - App name: VentOut
   - User support email: your email
   - Developer contact email: your email
4. Add scopes: `../auth/userinfo.email`, `../auth/userinfo.profile`, `openid`
5. Add test users (for external apps during development)

### Create Web Client ID
1. **Application type**: Web application
2. **Name**: VentOut Web
3. **Authorized JavaScript origins**:
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)
4. **Authorized redirect URIs**:
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)

### Create iOS Client ID (if building for iOS)
1. **Application type**: iOS
2. **Name**: VentOut iOS
3. **Bundle ID**: `app.lovable.ventout.ec8637e871fc4141999d99b992b60c02`

### Create Android Client ID (if building for Android)
1. **Application type**: Android
2. **Name**: VentOut Android
3. **Package name**: `app.lovable.ventout.ec8637e871fc4141999d99b992b60c02`
4. **SHA-1 certificate fingerprint**: 
   - For debug: Get from Android Studio or keystore
   - For release: Your production keystore SHA-1

## 2. Code Configuration

### Update Client IDs
Replace the following placeholders in your code:

**In `src/services/auth.ts`:**
```typescript
const GOOGLE_WEB_CLIENT_ID = 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com';
```

**In `index.html`:**
```html
<meta name="google-signin-client_id" content="YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com">
```

**In `capacitor.config.json`:**
```json
{
  "GoogleAuth": {
    "scopes": ["profile", "email"],
    "serverClientId": "YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com",
    "clientId": "YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com",
    "forceCodeForRefreshToken": true
  }
}
```

## 3. Backend Configuration

Ensure your Node.js backend at `http://localhost:3000` has:

### CORS Configuration
```javascript
app.use(cors({
  origin: ['http://localhost:8080', 'https://yourdomain.com'],
  credentials: true
}));
```

### Google Token Verification Endpoint
```javascript
app.post('/auth/google/callback', async (req, res) => {
  const { tokenId } = req.body;
  
  try {
    // Verify the Google ID token with Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com'
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;
    
    // Your user creation/login logic here
    // Return user, token, refreshToken
    
    res.json({
      user: { id: userId, email, name, role: 'talker' },
      token: 'your-jwt-token',
      refreshToken: 'your-refresh-token'
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});
```

## 4. Development Testing

### Web Testing (localhost:8080)
1. Start your backend: `npm run dev` (on port 3000)
2. Start your frontend: `npm run dev` (on port 8080)
3. Open browser and test Google login

### Mobile Testing
1. Run `npm run build`
2. Run `npx cap sync`
3. For iOS: `npx cap run ios`
4. For Android: `npx cap run android`

## 5. Platform Detection

The authentication service automatically detects the platform:
- **Web**: Uses Google Web SDK with `gapi.auth2`
- **Native**: Uses `@codetrix-studio/capacitor-google-auth`

## 6. Troubleshooting

### Common Issues
1. **"idpiframe_initialization_failed"**: Check your client ID and domain configuration
2. **"popup_blocked_by_browser"**: Use redirect flow instead of popup
3. **CORS errors**: Ensure backend CORS is properly configured
4. **CSP violations**: Check Content Security Policy in index.html

### Debug Steps
1. Check browser console for errors
2. Verify client IDs match exactly
3. Ensure domains are whitelisted in Google Console
4. Test in incognito mode to avoid cache issues

## 7. Production Deployment

1. Update client IDs for production domain
2. Add production domain to Google Console
3. Update CORS configuration for production
4. Test thoroughly on both web and mobile platforms

## 8. Security Notes

- Never expose client secrets in frontend code
- Use server-side token verification
- Implement proper JWT validation
- Store tokens securely using Capacitor Preferences
- Consider implementing token refresh logic