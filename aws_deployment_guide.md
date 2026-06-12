# 🚀 AWS Deployment Guide — Mahalaxmi Tailors

**Stack**: MongoDB Atlas · Node.js/Express on EC2 · React on AWS Amplify · CloudFront CDN · Route 53 DNS · IAM Security · Ansible · Jenkins

---

## 📋 Table of Contents
1. [IAM Setup (Security First)](#1-iam-setup)
2. [Phase 1: Backend on EC2](#2-phase-1-backend-ec2)
3. [Phase 2: Frontend on AWS Amplify](#3-phase-2-frontend-amplify)
4. [Phase 3: CloudFront CDN for Backend API](#4-phase-3-cloudfront)
5. [Phase 4: Domain & DNS on Route 53](#5-phase-4-route-53)
6. [Phase 5: CI/CD with GitHub Actions](#6-phase-5-cicd)
7. [Phase 6: Configuration Management with Ansible](#7-phase-6-ansible)
8. [Phase 7: Self-Hosted CI/CD with Jenkins](#8-phase-7-jenkins)
9. [Recommended Additional Services](#9-recommended-services)
   - 9.5 [Alternative: Skipping Route 53 (Using nip.io for Free SSL)](#95-nip-io)
10. [Environment Variables Reference](#10-env-reference)

---

## 1. IAM Setup (Security First) <a name="1-iam-setup"></a>

> ⚠️ **IMPORTANT**: Never use the AWS Root account for deployments. Always use IAM users/roles with minimum permissions.

### 1.1 Create a Deployment IAM User (for GitHub Actions CI/CD)

1. Go to **AWS Console → IAM → Users → Create User**
2. **User name**: `mahalaxmi-deploy-bot`
3. **Permissions**: Attach these policies directly:
   - `AmazonS3FullAccess` (for Amplify build artifacts and static assets)
   - `CloudFrontFullAccess` (to invalidate CDN cache on deploy)
   - `AmazonSESFullAccess` (for sending emails from EC2)
   - `AWSAmplifyFullAccess` (for triggering Amplify deployments)
4. After creating: go to **Security Credentials → Create Access Key** → choose **"Application running outside AWS"**
5. Save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — add them to **GitHub Secrets** (never commit them!)

### 1.2 Create an EC2 IAM Role (for SES email sending from the server)

1. Go to **IAM → Roles → Create Role**
2. **Trusted Entity**: AWS Service → **EC2**
3. **Permissions**: Attach `AmazonSESFullAccess`
4. **Name**: `Mahalaxmi-EC2-Role`
5. After launching EC2 (Step 2), attach this role to the instance.
   - EC2 → Select instance → **Actions → Security → Modify IAM Role**
   - This way your EC2 server can send emails **without storing AWS keys in `.env`** on the server.

---

## 2. Phase 1: Backend on EC2 <a name="2-phase-1-backend-ec2"></a>

### 2.1 Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Settings:
   | Setting | Value |
   |---|---|
   | **Name** | `Mahalaxmi-Backend` |
   | **AMI** | Ubuntu Server 24.04 LTS |
   | **Instance Type** | `t3.small` (recommended) or `t2.micro` (free tier) |
   | **Key Pair** | Create new: `mahalaxmi-key.pem` — download and save it |
3. **Network & Security Group** — allow these inbound rules:
   | Type | Protocol | Port | Source |
   |---|---|---|---|
   | SSH | TCP | 22 | My IP (your current IP only) |
   | HTTP | TCP | 80 | Anywhere (0.0.0.0/0) |
   | HTTPS | TCP | 443 | Anywhere (0.0.0.0/0) |
   | Custom TCP | TCP | 5000 | 0.0.0.0/0 (temporary for testing only) |
4. **IAM Instance Profile**: Select `Mahalaxmi-EC2-Role` (created in step 1.2)
5. **Launch Instance** — note the **Public IPv4 address**.

### 2.2 Connect to EC2

```bash
# On Windows PowerShell (from the folder where your .pem file is)
ssh -i "mahalaxmi-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```
> 💡 On Windows, if permissions error occurs: right-click `.pem` → Properties → Security → Advanced → Remove inheritance, then give yourself "Full Control" only.

### 2.3 Setup Server Environment

Run these commands **inside the EC2 terminal**:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js v20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v   # Should be v20.x.x
npm -v    # Should be 10.x.x

# 3. Install Nginx (reverse proxy)
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 4. Install PM2 (process manager — keeps Node running 24/7)
sudo npm install -g pm2

# 5. Install Git
sudo apt install -y git
```

### 2.4 Deploy Backend Code

```bash
# Clone your GitHub repository
git clone https://github.com/ayushdayal900/Mahalaxmi-Tailoring.git
cd Mahalaxmi-Tailoring/backend

# Install dependencies
npm install --production

# Create production .env file
nano .env
```

**Paste these values** into the `.env` file (edit with your actual values):
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://admin:PASSWORD@ac-xxx-shard-00-00.mongodb.net:27017,...?ssl=true&replicaSet=...&authSource=admin&retryWrites=true&w=majority
JWT_SECRET=your_super_long_random_jwt_secret_here

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS SES (no keys needed — EC2 IAM Role handles auth)
SES_FROM_NAME=Mahalaxmi Tailors
SES_FROM_EMAIL=noreply@mahalaxmi-tailors.shop
CONTACT_EMAIL=support@mahalaxmi-tailors.shop
AWS_REGION=ap-south-1

# Frontend URL (for CORS)
FRONTEND_URL=https://www.mahalaxmi-tailors.shop
```
Press `Ctrl+X` → `Y` → `Enter` to save.

### 2.5 Start Backend with PM2

```bash
# Go to the backend directory
cd /home/ubuntu/Mahalaxmi-Tailoring/backend

# Start the app using ecosystem.config.js
pm2 start ecosystem.config.js --env production

# Save the process list (auto-restart on reboot)
pm2 save

# Setup PM2 startup script — run the command it outputs
pm2 startup
# Copy-paste the sudo command it prints, then run it

# Check status
pm2 status
pm2 logs mahalaxmi-backend
```

### 2.6 Configure Nginx (Reverse Proxy)

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create config for your app
sudo nano /etc/nginx/sites-available/mahalaxmi
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name api.mahalaxmi-tailors.shop;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload limit for images
    client_max_body_size 10M;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mahalaxmi /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl restart nginx
```

### 2.7 SSL Configuration (SSL Terminated at CloudFront)

Because you are using **AWS CloudFront** in front of your EC2 backend, **you do not need to install Certbot or configure SSL certificates on your EC2 instance**.
* CloudFront handles the HTTPS SSL handshake (`https://api.mahalaxmi-tailors.shop`) at the edge.
* CloudFront decrypts the traffic and forwards it to Nginx on your EC2 instance over HTTP (port 80).
* Therefore, your Nginx config listening on port 80 (configured in Step 2.6) is already complete and sufficient.

### 2.8 Restrict Security Groups
To secure your environment:
1. Go to **AWS Console → EC2 → Security Groups** and select your backend security group.
2. **Delete the inbound rule for port 5000** (restricts direct access to your Node.js application from the internet).
3. **Keep Port 80 (HTTP) Open**: This is required so CloudFront can reach Nginx. (For maximum security, you can restrict Port 80 to accept traffic only from AWS CloudFront IP ranges using AWS Prefix Lists).
4. **Keep Port 22 (SSH) Restricted**: Only allow SSH traffic from your specific public IP.

---

## 3. Phase 2: Frontend on AWS Amplify <a name="3-phase-2-frontend-amplify"></a>

AWS Amplify auto-builds and deploys your React app on every push to `main`. It handles hosting, SSL, and CDN automatically.

### 3.1 Connect Amplify to GitHub

1. Go to **AWS Console → AWS Amplify → New App → Host Web App**
2. **Source**: GitHub → **Authorize AWS Amplify**
3. **Repository**: `ayushdayal900/Mahalaxmi-Tailoring`
4. **Branch**: `main`

### 3.2 Configure Build Settings

When prompted for build settings, use this configuration:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/dist
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
    appRoot: frontend
```

### 3.3 Set Environment Variables in Amplify

In **Amplify → App → Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://api.mahalaxmi-tailors.shop/api` |
| `NODE_ENV` | `production` |

### 3.4 Configure Amplify for React Router (SPA)

1. Go to **Amplify → Rewrites and Redirects**
2. Add this rule:
   | Source Address | Target Address | Type |
   |---|---|---|
   | `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |
3. This ensures React Router works on page refresh (e.g. `/contact`, `/admin`).

### 3.5 Get Your Amplify Domain
After the first deployment, Amplify gives you a URL like:
`https://main.d1234abcd.amplifyapp.com`

Note this — you'll need it for Route 53 and CORS.

---

## 4. Phase 3: CloudFront CDN for Backend API (SSL & Security) <a name="4-phase-3-cloudfront"></a>

To establish secure communication between your HTTPS Amplify frontend and your HTTP EC2 backend, we use **AWS CloudFront** in front of the EC2 instance. CloudFront serves as a secure proxy that handles HTTPS (SSL termination) and forwards requests to your EC2 instance over HTTP.

### 4.1 Request SSL Certificate in AWS ACM
Before creating the CloudFront distribution, you must request a free SSL certificate for your API subdomain:
1. Go to **AWS Console → Certificate Manager (ACM)**.
2. **CRITICAL**: Switch your AWS Region to **us-east-1 (N. Virginia)** at the top right. CloudFront distributions only support ACM certificates issued in `us-east-1`.
3. Click **Request Certificate → Request a public certificate**.
4. **Fully qualified domain name**: `api.mahalaxmi-tailors.shop`
5. **Validation method**: DNS validation (recommended).
6. Click **Request**.
7. In the certificate details page, click **Create records in Route 53** to automatically add the DNS validation records to your hosted zone. Wait a few minutes for the status to change to **Issued**.

### 4.2 Create CloudFront Distribution for Backend
1. Go to **AWS Console → CloudFront → Distributions → Create Distribution**.
2. **Origin Settings**:
   * **Origin Domain**: Enter your EC2 instance's **Public IPv4 DNS** (e.g., `ec2-35-154-216-9.ap-south-1.compute.amazonaws.com`).
   * **Protocol**: Choose **HTTP only** (Port `80`).
   * **Origin Path**: Leave blank.
3. **Default Cache Behavior Settings**:
   * **Viewer Protocol Policy**: **Redirect HTTP to HTTPS** (forces secure traffic).
   * **Allowed HTTP Methods**: **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE** (critical for database operations, logins, and uploads).
   * **Restrict Viewer Access**: No.
4. **Cache Key and Origin Requests** (CRITICAL for APIs):
   * Select **Cache policy and origin request policy (recommended)**.
   * **Cache Policy**: Select **CachingDisabled** (forces CloudFront to immediately forward all dynamic API requests to EC2 instead of caching them).
   * **Origin Request Policy**: Select **AllViewerExceptHostHeader** (ensures headers like `Authorization` tokens, `Cookie` sessions, and query parameters are forwarded to your Node.js backend. *Failing to select this will break logins and search queries*).
5. **Settings**:
   * **Alternate Domain Name (CNAME)**: Add `api.mahalaxmi-tailors.shop`.
   * **Custom SSL Certificate**: Select your ACM certificate (`api.mahalaxmi-tailors.shop`) created in Step 4.1.
   * **Security Policy**: Select `TLSv1.2_2021` (default).
6. Click **Create Distribution**.
7. *Wait 3–5 minutes for the status to change to `Enabled`.* Note the generated **Distribution Domain Name** (e.g., `d1234abcd.cloudfront.net`).

---

## 5. Phase 4: Domain & DNS on Route 53 <a name="5-phase-4-route-53"></a>

### 5.1 Register / Transfer Domain

If you have a domain elsewhere (e.g. GoDaddy), you can:
- **Transfer it to Route 53** (easiest long-term), OR
- Just **update the nameservers** in GoDaddy to point to Route 53

### 5.2 Create a Hosted Zone

1. **Route 53 → Hosted Zones → Create Hosted Zone**
2. **Domain**: `mahalaxmi-tailors.shop`
3. **Type**: Public Hosted Zone
4. AWS will give you **4 nameservers** (e.g. `ns-123.awsdns-45.com`) — add these to your domain registrar.

### 5.3 Create DNS Records

In the hosted zone, create these records:

| Record Name | Type | Value | Alias? |
|---|---|---|---|
| `api.mahalaxmi-tailors.shop` | **A (Alias)** | CloudFront Distribution Domain (e.g., `d1234abcd.cloudfront.net`) | Yes |
| `www.mahalaxmi-tailors.shop` | **CNAME** or **A (Alias)** | Amplify Domain (e.g., `main.d1234abcd.amplifyapp.com`) | Yes (for Alias) |
| `mahalaxmi-tailors.shop` (apex) | **A (Alias)** | Amplify Domain (e.g., `main.d1234abcd.amplifyapp.com`) | Yes |

#### Steps to configure the API subdomain Alias:
1. Go to **Route 53 → Hosted Zones → mahalaxmi-tailors.shop**.
2. Click **Create record**.
3. **Record name**: `api`
4. **Record type**: `A - Routes traffic to an IPv4 address and some AWS resources`.
5. Toggle the **Alias** switch to **Enabled** (on the right).
6. **Route traffic to**: Choose **Alias to CloudFront distribution**.
7. **Choose distribution**: Select your CloudFront distribution (the one created in Phase 3).
8. Click **Create records**.

> 💡 **For Amplify**: In Amplify → **Domain Management**, you can directly attach your Route 53 domain and Amplify will auto-create the records for the apex and `www` subdomains.

### 5.4 Attach Domain to Amplify (Recommended)

1. **Amplify → App → Domain Management → Add Domain**
2. Enter `mahalaxmi-tailors.shop`
3. Amplify will automatically create the DNS records in Route 53 and provision SSL certificates (via ACM)
4. Subdomains: Configure `www.mahalaxmi-tailors.shop` → `main` branch

---

## 6. Phase 5: CI/CD with GitHub Actions <a name="6-phase-5-cicd"></a>

### 6.1 GitHub Secrets Required

Go to **GitHub → Repo → Settings → Secrets and Variables → Actions** and add:

| Secret Name | Value |
|---|---|
| `EC2_HOST` | Your EC2 Public IP (e.g. `13.235.12.45`) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of `mahalaxmi-key.pem` (the whole file) |
| `AWS_ACCESS_KEY_ID` | From IAM deploy user (Step 1.1) |
| `AWS_SECRET_ACCESS_KEY` | From IAM deploy user (Step 1.1) |
| `CLOUDFRONT_DISTRIBUTION_ID` | From CloudFront (optional) |

> ⚠️ **NEVER** commit real credentials to `.env.example` or any file. Use GitHub Secrets for CI/CD.

### 6.2 How the CI/CD Pipeline Works

On every push to `main`:
1. **`deploy-backend`** job: SSHes into EC2, pulls latest code, runs `npm install`, and reloads PM2
2. **`deploy-frontend`** job: Amplify automatically triggers a new build (no GitHub Action needed — Amplify is watching the `main` branch)

The existing [`.github/workflows/deploy.yml`](file:///d:/Projects/Mahalaxmi-Tailoring/.github/workflows/deploy.yml) handles the backend deployment automatically.

---

## 7. Phase 6: Configuration Management with Ansible <a name="7-phase-6-ansible"></a>

Ansible automates the provisioning and configuration of your EC2 server — so you can rebuild the entire server environment with a single command instead of running manual steps.

> 💡 **When to use Ansible**: When you need to spin up a new EC2 instance (e.g., scaling, disaster recovery), onboard a second server, or ensure all server configs are version-controlled and reproducible.

### 7.1 Install Ansible (on your local machine / CI runner)

```bash
# On Ubuntu/WSL
sudo apt update && sudo apt install -y ansible

# On macOS
brew install ansible

# Verify
ansible --version
```

> 💡 **Windows users**: Run Ansible from WSL (Windows Subsystem for Linux) or from a GitHub Actions runner (Linux-based). Ansible does not run natively on Windows.

### 7.2 Project Structure

Create an `ansible/` folder in your project root:

```
ansible/
├── inventory.ini          # Defines your EC2 hosts
├── playbook.yml           # Master playbook
└── roles/
    └── backend/
        ├── tasks/
        │   └── main.yml   # Installation & setup tasks
        └── templates/
            └── nginx.conf.j2  # Nginx config template
```

### 7.3 Inventory File

Create `ansible/inventory.ini`:

```ini
[backend]
mahalaxmi-ec2 ansible_host=<YOUR_EC2_ELASTIC_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/mahalaxmi-key.pem
```

> ⚠️ Never commit `mahalaxmi-key.pem` to Git. Add `*.pem` to your `.gitignore`.

### 7.4 Master Playbook

Create `ansible/playbook.yml`:

```yaml
---
- name: Provision Mahalaxmi Backend Server
  hosts: backend
  become: true   # Run tasks as sudo

  vars:
    node_version: "20"
    app_dir: /home/ubuntu/Mahalaxmi-Tailoring
    repo_url: https://github.com/ayushdayal900/Mahalaxmi-Tailoring.git

  tasks:
    # --- System Setup ---
    - name: Update and upgrade apt packages
      apt:
        update_cache: yes
        upgrade: dist

    - name: Install essential packages
      apt:
        name:
          - git
          - curl
          - nginx
          - certbot
          - python3-certbot-nginx
        state: present

    # --- Node.js ---
    - name: Add NodeSource repo for Node.js {{ node_version }}
      shell: |
        curl -fsSL https://deb.nodesource.com/setup_{{ node_version }}.x | bash -
      args:
        creates: /etc/apt/sources.list.d/nodesource.list

    - name: Install Node.js
      apt:
        name: nodejs
        state: present
        update_cache: yes

    - name: Install PM2 globally
      npm:
        name: pm2
        global: yes
        state: present

    # --- Clone / Pull Repository ---
    - name: Clone or update repository
      git:
        repo: "{{ repo_url }}"
        dest: "{{ app_dir }}"
        version: main
        force: yes
      become_user: ubuntu

    - name: Install backend npm dependencies
      npm:
        path: "{{ app_dir }}/backend"
        production: yes
      become_user: ubuntu

    # --- Nginx ---
    - name: Deploy Nginx config from template
      template:
        src: roles/backend/templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/mahalaxmi
      notify: Reload Nginx

    - name: Enable Nginx site
      file:
        src: /etc/nginx/sites-available/mahalaxmi
        dest: /etc/nginx/sites-enabled/mahalaxmi
        state: link
      notify: Reload Nginx

    - name: Remove default Nginx site
      file:
        path: /etc/nginx/sites-enabled/default
        state: absent
      notify: Reload Nginx

    # --- PM2 ---
    - name: Start backend with PM2
      shell: |
        pm2 start {{ app_dir }}/backend/ecosystem.config.js --env production
        pm2 save
      become_user: ubuntu
      args:
        chdir: "{{ app_dir }}/backend"

    - name: Set PM2 startup on reboot
      shell: pm2 startup | tail -1 | bash
      become_user: ubuntu

  handlers:
    - name: Reload Nginx
      service:
        name: nginx
        state: reloaded
```

### 7.5 Nginx Config Template

Create `ansible/roles/backend/templates/nginx.conf.j2`:

```nginx
server {
    listen 80;
    server_name api.mahalaxmi-tailors.shop;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

### 7.6 Run the Playbook

```bash
# Dry run first (check what will change without applying)
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --check

# Apply the playbook
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

# Run only specific tags (e.g. just Nginx)
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --tags nginx
```

### 7.7 Integrate Ansible into GitHub Actions (Optional)

Add a step in `.github/workflows/deploy.yml` to run the playbook automatically on push:

```yaml
- name: Run Ansible Playbook
  uses: dawidd6/action-ansible-playbook@v2
  with:
    playbook: ansible/playbook.yml
    inventory: ansible/inventory.ini
    key: ${{ secrets.EC2_SSH_KEY }}
  env:
    ANSIBLE_HOST_KEY_CHECKING: "False"
```

---

## 8. Phase 7: Self-Hosted CI/CD with Jenkins <a name="8-phase-7-jenkins"></a>

Jenkins gives you a self-hosted, highly customizable CI/CD server — an alternative (or addition) to GitHub Actions. It is useful when you want full pipeline control, build artifact storage, or more complex multi-stage workflows.

> 💡 **Jenkins vs GitHub Actions**: GitHub Actions is simpler and hosted by GitHub (free for public repos). Jenkins requires its own server but gives more control, can run behind a VPN, and supports complex pipelines with plugins.

### 8.1 Install Jenkins on a Dedicated EC2 Instance

It is recommended to run Jenkins on a **separate** `t3.small` EC2 instance, not on the same server as your backend.

```bash
# SSH into the Jenkins EC2 instance
ssh -i "mahalaxmi-key.pem" ubuntu@<JENKINS_EC2_IP>

# 1. Install Java (Jenkins requires Java 17+)
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version

# 2. Add Jenkins repository and install
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins

# 3. Start and enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins

# 4. Get the initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 8.2 Open Jenkins in the Browser

1. Add inbound rule to the Jenkins EC2 Security Group: **TCP port 8080** from your IP
2. Open: `http://<JENKINS_EC2_IP>:8080`
3. Paste the **initial admin password** from step 4 above
4. Install **suggested plugins** when prompted
5. Create your admin user

> 💡 For production, put Jenkins behind Nginx on port 80/443 with SSL (same as your backend setup).

### 8.3 Install Required Jenkins Plugins

Go to **Jenkins → Manage Jenkins → Plugins → Available Plugins** and install:

| Plugin | Purpose |
|---|---|
| **Git** | Pull code from GitHub |
| **SSH Agent** | SSH into EC2 for deployment |
| **NodeJS** | Run `npm install` and `npm run build` |
| **Pipeline** | Declarative/scripted pipeline support |
| **GitHub Integration** | Webhook triggers from GitHub |
| **Blue Ocean** (optional) | Modern pipeline UI |
| **Ansible** (optional) | Run Ansible playbooks from Jenkins |

### 8.4 Configure Credentials in Jenkins

Go to **Jenkins → Manage Jenkins → Credentials → (global) → Add Credentials**:

| Kind | ID | Value |
|---|---|---|
| SSH Username with private key | `ec2-ssh-key` | Paste contents of `mahalaxmi-key.pem` |
| Secret text | `mongodb-uri` | Your MongoDB Atlas connection string |
| Secret text | `jwt-secret` | Your JWT secret |

### 8.5 Create a Jenkinsfile

Create `Jenkinsfile` in the project root:

```groovy
pipeline {
    agent any

    environment {
        EC2_USER = 'ubuntu'
        EC2_HOST = '<YOUR_EC2_ELASTIC_IP>'   // Replace with Elastic IP
        APP_DIR  = '/home/ubuntu/Mahalaxmi-Tailoring'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ayushdayal900/Mahalaxmi-Tailoring.git'
            }
        }

        stage('Lint & Test (Backend)') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test --if-present'
                }
            }
        }

        stage('Lint & Test (Frontend)') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Backend to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} \"
                            cd ${APP_DIR} && \
                            git pull origin main && \
                            cd backend && \
                            npm install --production && \
                            pm2 reload mahalaxmi-backend --update-env
                        \"
                    '''
                }
            }
        }

        stage('Run Ansible Provisioning (Optional)') {
            when {
                // Only run Ansible if triggered manually or on infra changes
                expression { params.RUN_ANSIBLE == true }
            }
            steps {
                ansiblePlaybook(
                    playbook: 'ansible/playbook.yml',
                    inventory: 'ansible/inventory.ini',
                    credentialsId: 'ec2-ssh-key',
                    extras: '-e "env=production"'
                )
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed! Check the logs above.'
            // Optional: Send email notification
            // mail to: 'support@mahalaxmi-tailors.shop',
            //      subject: "Jenkins Build Failed: ${env.JOB_NAME}",
            //      body: "Build ${env.BUILD_NUMBER} failed. Check: ${env.BUILD_URL}"
        }
    }
}
```

### 8.6 Create the Pipeline Job in Jenkins

Now that the `Jenkinsfile` is in your repository, you need to create the job in Jenkins:

1. Go to the Jenkins Dashboard and click **New Item** (on the left menu).
2. Enter a name (e.g., `mahalaxmi-backend-pipeline`).
3. Select **Pipeline** and click **OK**.
4. Scroll down to the **Pipeline** section at the bottom.
5. Change the **Definition** dropdown to **Pipeline script from SCM**.
6. **SCM**: Select **Git**.
7. **Repository URL**: `https://github.com/ayushdayal900/Mahalaxmi-Tailoring.git`
8. **Branch Specifier**: Change `*/master` to `*/main`.
9. **Script Path**: Leave as `Jenkinsfile` (this tells Jenkins to look for the file we created).

### 8.7 Configure Jenkins Polling (Poll SCM)

Instead of using webhooks, Jenkins can automatically check GitHub for new code every few minutes:

1. While still on the Pipeline Configuration page (or click **Configure** on your job), scroll down to the **Build Triggers** section.
2. Check the box for **Poll SCM**.
3. In the Schedule box, enter: `H/5 * * * *` (This tells Jenkins to check for updates every 5 minutes).
4. Click **Save**.

*Note: Jenkins will now periodically check your GitHub repository and automatically trigger a build if new commits are found on the `main` branch.*

### 8.8 Nginx Reverse Proxy for Jenkins (Production Setup)

To expose Jenkins on port 443 (HTTPS) instead of 8080:

```bash
# Create Nginx config for Jenkins
sudo nano /etc/nginx/sites-available/jenkins
```

```nginx
server {
    listen 80;
    server_name jenkins.mahalaxmi-tailors.shop;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/jenkins /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL cert for Jenkins subdomain
sudo certbot --nginx -d jenkins.mahalaxmi-tailors.shop
```

Add a DNS A record in Route 53: `jenkins.mahalaxmi-tailors.shop` → Jenkins EC2 IP.

### 8.9 Pipeline Summary

```
Developer pushes to main
        │
        ▼
   Jenkins Poll SCM
        │
        ▼
   Jenkins Pipeline
   ┌─────────────────────────────────┐
   │ 1. Checkout (git pull)          │
   │ 2. Backend lint & test          │
   │ 3. Frontend build               │
   │ 4. SSH deploy to EC2 (PM2)      │
   │ 5. Ansible (optional, on demand)│
   └─────────────────────────────────┘
        │
        ▼
   Notification (email/Slack)
```

---

## 9. Recommended Additional Services <a name="9-recommended-services"></a>

Here are highly useful AWS services for this project:

| Service | Purpose | Cost |
|---|---|---|
| **AWS SES** (already configured) | Transactional emails (order confirmation, contact forms) | ~$0.10/1000 emails |
| **AWS WAF** | Protect against SQL injection, DDoS, bots on CloudFront | ~$5/month |
| **AWS CloudWatch** | Monitor EC2 CPU, memory, logs; set alarms | Free tier available |
| **AWS SNS** | Push alerts to your phone/email when CPU spikes or errors occur | Free tier available |
| **AWS Secrets Manager** | Store `.env` secrets securely — EC2 fetches them at runtime (no `.env` file on server) | ~$0.40/secret/month |
| **AWS Backup** | Automated daily backups of EC2 instance | ~$5/month |
| **AWS Certificate Manager (ACM)** | Free SSL/TLS certificates for CloudFront & ALB | **Free** |
| **Elastic IP** | Static IP for EC2 (so your DNS record never breaks) | Free when attached to running instance |

### 🔥 Top Priority Recommendations:

1. **Elastic IP** — Attach a static IP to EC2 immediately so your DNS record doesn't change on instance restarts
2. **CloudWatch + SNS** — Get alerts when the server is down
3. **AWS WAF** — Protect your API from abuse
4. **AWS Secrets Manager** — For production, move `.env` secrets out of the file system

### Assign Elastic IP:
1. **EC2 → Elastic IPs → Allocate Elastic IP Address**
2. **Associate** it with your `Mahalaxmi-Backend` instance
3. Update the `api.mahalaxmi-tailors.shop` DNS A record with this static IP

---

## 9.5 Alternative: Skipping Route 53 (Using nip.io for Free SSL) <a name="95-nip-io"></a>

If you want to host your frontend on **AWS Amplify** (which forces HTTPS) and connect it to your **EC2 backend** without buying a custom domain or using Route 53:

### 1. The Dynamic Domain
We use `nip.io`, a free wildcard DNS helper. It resolves `<anything>-<EC2-IP>.nip.io` back to your EC2 instance.
For your IP `35.154.216.9`, your backend domain will be:
`35-154-216-9.nip.io`

### 2. Configure Nginx on EC2
SSH into your EC2 backend server and edit your Nginx site configuration:
```bash
sudo nano /etc/nginx/sites-available/mahalaxmi
```

Change the `server_name` line to:
```nginx
server_name 35-154-216-9.nip.io;
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Generate Let's Encrypt SSL Certificate
Run Certbot to fetch a valid SSL certificate and configure HTTPS automatically on Nginx:
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 35-154-216-9.nip.io
```

Confirm that going to `https://35-154-216-9.nip.io` in a browser shows the secure green lock and `Mahalaxmi Tailoring API is running...`.

### 4. Configure AWS Amplify Environment Variables
In your AWS Amplify Console dashboard:
1. Go to **App Settings > Environment Variables**.
2. Set `VITE_API_URL` to `https://35-154-216-9.nip.io` (HTTPS, no port).
3. Redeploy your branch to rebuild React with the new endpoint.

### 5. Update Backend CORS Allowed Origins
On the EC2 backend server, update your `.env` file to authorize your Amplify URL:
```env
FRONTEND_URL=https://main.d9vlrbw3rtht6.amplifyapp.com
```
Then reload PM2:
```bash
pm2 reload mahalaxmi-backend --update-env
```

---

## 10. Environment Variables Reference <a name="10-env-reference"></a>

### Backend `.env` (on EC2 — DO NOT commit this file)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<minimum 64 character random string>

RAZORPAY_KEY_ID=<from Razorpay dashboard>
RAZORPAY_KEY_SECRET=<from Razorpay dashboard>

CLOUDINARY_CLOUD_NAME=<from Cloudinary dashboard>
CLOUDINARY_API_KEY=<from Cloudinary dashboard>
CLOUDINARY_API_SECRET=<from Cloudinary dashboard>

SES_FROM_NAME=Mahalaxmi Tailors
SES_FROM_EMAIL=noreply@mahalaxmi-tailors.shop
CONTACT_EMAIL=support@mahalaxmi-tailors.shop

# Use EC2 IAM Role instead of keys — AWS SDK picks it up automatically
AWS_REGION=ap-south-1

FRONTEND_URL=https://www.mahalaxmi-tailors.shop
```

### Frontend Amplify Environment Variables
```env
VITE_API_URL=https://api.mahalaxmi-tailors.shop/api
NODE_ENV=production
```

---

## ✅ Deployment Checklist

### Core AWS Setup
- [ ] IAM deploy user created with correct permissions
- [ ] EC2 IAM Role (`Mahalaxmi-EC2-Role`) created and attached to instance
- [ ] EC2 launched with Ubuntu 24.04, security group configured
- [ ] Elastic IP allocated and attached to EC2
- [ ] Node.js, PM2, Nginx, Git installed on EC2
- [ ] Backend code cloned and `.env` file created on EC2
- [ ] PM2 started and configured to auto-restart on reboot
- [ ] Nginx configured as reverse proxy on port 80
- [ ] Route 53 hosted zone created and nameservers updated at registrar
- [ ] ACM SSL certificate for `api.mahalaxmi-tailors.shop` created in `us-east-1`
- [ ] CloudFront distribution created pointing to EC2 public DNS, caching disabled, headers forwarded
- [ ] Route 53 DNS A Record (Alias) created for `api.mahalaxmi-tailors.shop` → CloudFront
- [ ] Amplify app created and connected to GitHub `main` branch
- [ ] Amplify build settings configured (see Phase 2)
- [ ] Amplify custom domain attached (`www.mahalaxmi-tailors.shop`)
- [ ] GitHub Secrets added (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- [ ] Test end-to-end: push to `main` → backend auto-deploys → frontend auto-builds
- [ ] MongoDB Atlas IP Whitelist: add EC2 Elastic IP to allowed list
- [ ] Remove port 5000 from EC2 security group (after confirming port 80 is reachable from CloudFront)
- [ ] CloudWatch alarm set for EC2 CPU > 80%

### Ansible
- [ ] `ansible/` directory created with `inventory.ini`, `playbook.yml`, and Nginx template
- [ ] Ansible installed locally or on CI runner
- [ ] `ansible/inventory.ini` updated with correct EC2 Elastic IP
- [ ] `.pem` key file path set correctly in `inventory.ini`
- [ ] Dry run (`--check`) completed successfully: `ansible-playbook ... --check`
- [ ] Full playbook run completed: `ansible-playbook -i ansible/inventory.ini ansible/playbook.yml`
- [ ] `*.pem` added to `.gitignore` (never commit SSH keys)
- [ ] (Optional) Ansible step added to GitHub Actions `deploy.yml`

### Jenkins
- [ ] Jenkins EC2 instance launched (separate `t3.small` recommended)
- [ ] Java 17 and Jenkins installed and running on port 8080
- [ ] Required Jenkins plugins installed (Git, SSH Agent, NodeJS, Pipeline, GitHub Integration)
- [ ] EC2 SSH private key credential added to Jenkins (`ec2-ssh-key`)
- [ ] `Jenkinsfile` added to project root
- [ ] Jenkins pipeline job created and pointing to `Jenkinsfile`
- [ ] Jenkins Poll SCM configured (e.g., `H/5 * * * *`)
- [ ] Nginx reverse proxy configured for Jenkins (port 443)
- [ ] SSL certificate issued for `jenkins.mahalaxmi-tailors.shop`
- [ ] DNS A record for `jenkins.mahalaxmi-tailors.shop` → Jenkins EC2 IP
- [ ] Test pipeline: push to `main` → Jenkins triggers → deploys successfully
