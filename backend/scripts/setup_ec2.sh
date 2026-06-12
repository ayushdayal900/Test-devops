#!/bin/bash

# 🚀 Mahalaxmi Tailors - EC2 Setup Script
# Run this script on your fresh Ubuntu EC2 instance.
# Usage: ./setup_ec2.sh

set -e # Exit on error

echo "Starting EC2 Setup..."

# 1. Update System
echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
echo "🌍 Installing Nginx..."
sudo apt install -y nginx

# 4. Install PM2
echo "🚀 Installing PM2..."
sudo npm install -g pm2

# 5. Connect to Repo
echo "📂 Cloning Repository..."
# Check if repo exists, if so pull, else clone
if [ -d "Mahalaxmi-Tailoring" ]; then
    echo "   Repo exists, pulling latest changes..."
    cd Mahalaxmi-Tailoring
    git pull
else
    git clone https://github.com/ayushdayal900/Mahalaxmi-Tailoring.git
fi

# 6. Backend Setup
echo "🛠️ Setting up Backend..."
cd backend || cd Mahalaxmi-Tailoring/backend
npm install

echo "⚠️ IMPORTANT: You must create your .env file manually now!"
echo "   Run: nano .env"
echo "   Then paste your environment variables."

# 7. Setup Nginx (Placeholder)
echo "🌐 Setting up Nginx..."
# We will create a default config but it needs your domain
sudo rm -f /etc/nginx/sites-enabled/default

# Create a template config
cat <<EOF | sudo tee /etc/nginx/sites-available/mahalaxmi
server {
    listen 80;
    server_name api.mahalaxmi-tailors.shop; # Change this if needed

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mahalaxmi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ EC2 Setup Complete (Phase 1)!"
echo "👉 Next Steps:"
echo "1. Run 'nano .env' in the backend folder and paste your secrets."
echo "2. Start the app: 'pm2 start ecosystem.config.js --env production'"
echo "3. Run 'pm2 save' and 'pm2 startup'"
echo "4. Setup SSL: 'sudo apt install certbot python3-certbot-nginx -y' then 'sudo certbot --nginx'"
