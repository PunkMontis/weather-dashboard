# 🚀 Deployment Guide

This guide covers deploying the Weather Dashboard to various platforms.

## Table of Contents

1. [Heroku](#heroku)
2. [Vercel](#vercel)
3. [AWS EC2](#aws-ec2)
4. [DigitalOcean](#digitalocean)
5. [Docker](#docker)
6. [GitHub Pages (Static)](#github-pages)

---

## Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Deployment Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set OPENWEATHER_API_KEY=your_api_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **View Logs**
   ```bash
   heroku logs --tail
   ```

6. **Open App**
   ```bash
   heroku open
   ```

---

## Vercel

### Prerequisites
- Vercel account
- Vercel CLI installed

### Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Project**
   - Follow prompts to link to your GitHub repo
   - Set environment variables in Vercel dashboard

4. **Deploy Production**
   ```bash
   vercel --prod
   ```

### Vercel Configuration (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

---

## AWS EC2

### Prerequisites
- AWS account
- EC2 instance running Ubuntu/Amazon Linux
- SSH access to instance

### Deployment Steps

1. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/PunkMontis/weather-dashboard.git
   cd weather-dashboard
   ```

4. **Install Node Packages**
   ```bash
   npm install --production
   ```

5. **Create .env File**
   ```bash
   echo "OPENWEATHER_API_KEY=your_api_key" > .env
   echo "PORT=3000" >> .env
   echo "NODE_ENV=production" >> .env
   ```

6. **Setup PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name weather-dashboard
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx Reverse Proxy**

   Create `/etc/nginx/sites-available/weather-dashboard`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/weather-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL (Optional but Recommended)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## DigitalOcean

### Prerequisites
- DigitalOcean account
- Droplet created (Ubuntu 20.04 or later)

### Deployment Steps

1. **SSH into Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

2. **Update System**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Install Node.js**
   ```bash
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs
   ```

4. **Clone and Setup Application**
   ```bash
   cd /var/www
   git clone https://github.com/PunkMontis/weather-dashboard.git
   cd weather-dashboard
   npm install --production
   ```

5. **Create Environment File**
   ```bash
   nano .env
   # Add: OPENWEATHER_API_KEY=your_api_key
   # Add: PORT=3000
   ```

6. **Install and Configure PM2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name weather-dashboard
   pm2 startup systemd -u root --hp /root
   pm2 save
   ```

7. **Install and Configure Nginx**
   ```bash
   sudo apt install nginx
   ```

   Edit `/etc/nginx/sites-available/default` and add reverse proxy config (see AWS EC2 section)

8. **Start Services**
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

---

## Docker

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]
```

### Create .dockerignore

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
DEPLOYMENT.md
```

### Build and Run

```bash
# Build image
docker build -t weather-dashboard .

# Run container
docker run -p 3000:3000 \
  -e OPENWEATHER_API_KEY=your_api_key \
  -e NODE_ENV=production \
  weather-dashboard
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  weather-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

### Run with Docker Compose

```bash
# Create .env file
echo "OPENWEATHER_API_KEY=your_api_key" > .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## GitHub Pages (Static Frontend Only)

Note: GitHub Pages hosts static content only. For this option, you'll need to:

1. Deploy the API elsewhere (Heroku, DigitalOcean, etc.)
2. Update API_BASE in `public/script.js` to point to your deployed API

### Deployment Steps

1. **Create GitHub Pages Branch**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   ```

2. **Copy Frontend Files**
   ```bash
   git checkout main -- public/
   mv public/* .
   rm -rf public .gitignore package.json server.js
   ```

3. **Update Script Path** in `index.html`:
   ```html
   <script src="script.js"></script>
   ```

4. **Update API URL** in `script.js`:
   ```javascript
   const API_BASE = 'https://your-api-domain.com/api';
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

6. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages
   - Select `gh-pages` branch as source

---

## Environment Variables

For all deployments, ensure these variables are set:

| Variable | Value | Required |
|----------|-------|----------|
| `OPENWEATHER_API_KEY` | Your OpenWeatherMap API key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | `production` or `development` | No |

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com

# Configure Nginx to use certificate
sudo certbot --nginx -d your-domain.com
```

### Update Nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring and Maintenance

### Monitor Application

```bash
# PM2 monitoring
pm2 monit

# Docker logs
docker logs -f container-name

# System logs
sudo journalctl -u your-service -f
```

### Auto-restart on Reboot

```bash
# PM2
pm2 startup systemd -u $USER --hp $HOME
pm2 save

# Docker (automatic with restart policy)
docker run --restart=unless-stopped ...
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### API Key Not Working
- Verify key is correctly set in environment
- Check API key hasn't been rotated
- Test key with curl: `curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY"`

### High CPU/Memory Usage
- Check for memory leaks with `clinic` or `autocannon`
- Implement caching
- Scale horizontally with load balancer

---

## Performance Tips

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Add Cache Headers**
   ```javascript
   app.use((req, res, next) => {
       res.set('Cache-Control', 'public, max-age=300');
       next();
   });
   ```

3. **Use CDN** for static assets

4. **Implement Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

---

For more help, consult the platform-specific documentation or open an issue.
