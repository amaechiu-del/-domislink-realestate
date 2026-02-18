# 📱 DomisLink PWA Setup Guide

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Node.js 20+ (for local development)
- Git

---

## 🐳 Deploy with Docker

### 1. Build the Docker Image

```bash
# Clone the repository
git clone https://github.com/amaechiu-del/-domislink-realestate.git
cd -domislink-realestate

# Build the Docker image
npm run docker:build
```

### 2. Run with Docker Compose (Recommended)

```bash
# Start the container
npm run docker:compose

# View logs
docker-compose logs -f

# Stop the container
npm run docker:down
```

### 3. Or Run with Docker directly

```bash
# Run the container
npm run docker:run

# Access the app at http://localhost:3001
```

---

## 💻 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open in Browser

```
http://localhost:3001
```

---

## 📱 PWA Installation

### On Mobile (Android/iOS)

1. **Open the app in your mobile browser**
   - Chrome (Android)
   - Safari (iOS)

2. **Install to Home Screen**
   
   **Android:**
   - Tap the menu (⋮)
   - Select "Add to Home Screen"
   - Confirm installation
   
   **iOS:**
   - Tap the Share button (□↑)
   - Scroll and tap "Add to Home Screen"
   - Confirm installation

3. **Launch the App**
   - Find the DomisLink icon on your home screen
   - Tap to open as a full-screen app

### On Desktop

1. **Chrome/Edge:**
   - Look for the install icon in the address bar (+)
   - Click "Install"
   
2. **Safari:**
   - Not supported (use mobile iOS instead)

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=DomisLink Real Estate
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# API Configuration (Add your APIs)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_MAPS_API_KEY=your_google_maps_key

# Features
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_OFFLINE=true
```

### Update manifest.json

Edit `public/manifest.json` to customize:
- App name
- Theme colors
- Icons
- Start URL

---

## 🎨 Customization

### 1. Update App Icons

Generate icons for all sizes:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

Place in `public/icons/` directory.

**Tools:**
- [PWA Image Generator](https://www.pwabuilder.com/imageGenerator)
- [Real Favicon Generator](https://realfavicongenerator.net/)

### 2. Update Colors

Edit in `manifest.json`:
```json
{
  "theme_color": "#2563eb",
  "background_color": "#ffffff"
}
```

### 3. Customize Service Worker

Edit `public/sw.js` to add:
- Custom cache strategies
- Background sync
- Push notification handling

---

## 🧪 Testing

### Run Tests

```bash
# Watch mode
npm test

# Single run
npm run test:ci

# With coverage
npm run test:coverage
```

### Test PWA Features

1. **Lighthouse Audit**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Target: 90+ score

2. **Offline Mode**
   - Open DevTools > Network
   - Check "Offline"
   - Reload page
   - Should work offline

3. **Install Prompt**
   - Clear site data
   - Visit site
   - Should see install prompt

---

## 📦 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Cloud Platforms

#### Vercel (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Docker Deployment
```bash
# Build production image
docker build -t domislink-pwa:prod .

# Run in production
docker run -d -p 3001:3001 \
  -e NODE_ENV=production \
  --name domislink \
  domislink-pwa:prod
```

#### Docker Hub
```bash
# Tag image
docker tag domislink-pwa:prod yourusername/domislink-pwa:latest

# Push to Docker Hub
docker push yourusername/domislink-pwa:latest
```

---

## 🔔 Push Notifications Setup

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

### 2. Add to .env.local

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 3. Request Permission

Add to your app:
```javascript
if ('Notification' in window) {
  Notification.requestPermission();
}
```

---

## 📊 Analytics & Monitoring

### Add Analytics

Install package:
```bash
npm install @vercel/analytics
```

Add to `app/layout.js`:
```javascript
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🐛 Troubleshooting

### Service Worker Not Updating

```bash
# Clear cache in browser
# Or update cache version in sw.js
const CACHE_NAME = 'domislink-v2'; // Increment version
```

### PWA Not Installing

1. Check HTTPS (required except localhost)
2. Verify manifest.json is accessible
3. Check service worker registration
4. Run Lighthouse PWA audit

### Docker Issues

```bash
# View container logs
docker logs domislink-pwa

# Shell into container
docker exec -it domislink-pwa sh

# Rebuild without cache
docker build --no-cache -t domislink-pwa .
```

---

## 📱 Mobile Testing

### Test on Real Devices

1. **Find your local IP:**
   ```bash
   # Mac/Linux
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. **Access on mobile:**
   ```
   http://YOUR_IP:3001
   ```

### Browser DevTools

1. **Chrome DevTools:**
   - F12 > Device Toolbar
   - Select mobile device
   - Test responsive design

2. **PWA Debugging:**
   - Chrome: chrome://inspect
   - Safari: Develop > Simulator

---

## 🔒 Security Best Practices

1. **HTTPS Only**
   - Use HTTPS in production
   - Service workers require HTTPS

2. **Content Security Policy**
   - Add CSP headers
   - Defined in next.config.js

3. **Environment Variables**
   - Never commit .env files
   - Use secrets management

---

## 📈 Performance Optimization

### Image Optimization

```javascript
import Image from 'next/image';

<Image
  src="/property.jpg"
  alt="Property"
  width={800}
  height={600}
  loading="lazy"
/>
```

### Code Splitting

Next.js handles automatically, but you can:
```javascript
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  loading: () => <p>Loading map...</p>,
  ssr: false
});
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Docker Documentation](https://docs.docker.com/)

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/amaechiu-del/-domislink-realestate/issues)
- **Discussions:** [GitHub Discussions](https://github.com/amaechiu-del/-domislink-realestate/discussions)

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-18 01:55:31  
**Status**: Production Ready
