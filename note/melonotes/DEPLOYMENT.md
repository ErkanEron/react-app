# MELONOTES Deployment Guide 🚀

## Architecture Overview

- **Backend**: Node.js + SQLite → Google Cloud Run
- **Web App**: React → Netlify  
- **Desktop App**: Electron → Local installation (both connect to same backend)

## 1. Backend Deployment (Google Cloud Run)

### Prerequisites
- Google Cloud CLI installed
- Docker installed
- Google Cloud project created

### Steps

1. **Navigate to server directory:**
   ```bash
   cd server/
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Build and push to Google Container Registry:**
   ```bash
   # Set your project ID
   export PROJECT_ID=your-project-id
   
   # Build the image
   docker build -t gcr.io/$PROJECT_ID/melonotes-backend .
   
   # Push to registry
   docker push gcr.io/$PROJECT_ID/melonotes-backend
   ```

4. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy melonotes-backend \
     --image gcr.io/$PROJECT_ID/melonotes-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1 \
     --max-instances 10
   ```

5. **Note the service URL** for next steps.

## 2. Web App Deployment (Netlify)

### Prerequisites
- Netlify account
- GitHub repository (optional but recommended)

### Steps

1. **Navigate to client directory:**
   ```bash
   cd client/
   ```

2. **Create production .env:**
   ```bash
   # Create .env.production file
   echo "REACT_APP_API_URL=https://your-cloud-run-url" > .env.production
   ```

3. **Build the app:**
   ```bash
   npm run build
   ```

4. **Deploy to Netlify:**
   
   **Option A: Manual Deploy**
   - Drag and drop the `build` folder to Netlify dashboard
   
   **Option B: Git Deploy (Recommended)**
   - Connect your GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variable: `REACT_APP_API_URL=your-cloud-run-url`

5. **Update CORS in backend:**
   - Add your Netlify domain to CORS origins in `server/server.js`

## 3. Electron App Preparation

### Steps

1. **Update config.js:**
   ```javascript
   production: {
     API_URL: 'https://your-actual-cloud-run-url'
   }
   ```

2. **Build for production:**
   ```bash
   npm run build
   npm run electron
   ```

3. **Create distributable:**
   ```bash
   npm run dist
   ```

## 4. Environment Variables Summary

### Backend (.env)
```
PORT=8080
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
```

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-cloud-run-url
```

### Electron (config.js)
```javascript
production: {
  API_URL: 'https://your-cloud-run-url'
}
```

## 5. Post-Deployment Checklist

- [ ] Backend is accessible at Cloud Run URL
- [ ] Web app loads correctly on Netlify
- [ ] Electron app connects to production backend
- [ ] CORS is properly configured
- [ ] Authentication works across all platforms
- [ ] File uploads work (if applicable)

## 6. Updating Deployments

### Backend Updates
```bash
# Build and push new image
docker build -t gcr.io/$PROJECT_ID/melonotes-backend .
docker push gcr.io/$PROJECT_ID/melonotes-backend

# Deploy update
gcloud run deploy melonotes-backend --image gcr.io/$PROJECT_ID/melonotes-backend
```

### Frontend Updates
- Push to GitHub (auto-deploys if connected)
- Or run `npm run build` and upload to Netlify

### Electron Updates
- Update code
- Run `npm run dist`
- Distribute new executable

## Troubleshooting

### Common Issues
1. **CORS errors**: Update CORS origins in backend
2. **API connection fails**: Check environment variables
3. **Build fails**: Check Node.js version compatibility
4. **Database issues**: Verify SQLite file permissions in Cloud Run

### Monitoring
- Google Cloud Run logs: `gcloud logs tail`
- Netlify deploy logs: Available in Netlify dashboard
- Electron logs: Available in dev tools