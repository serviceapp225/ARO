# DigitalOcean Production Environment Configuration
# Copy these values to your VPS .env file

# PostgreSQL Database (DigitalOcean Managed)
DATABASE_URL=postgresql://doadmin:YOUR_PASSWORD@autobid-production-do-user-24204575-0.m.db.ondigitalocean.com:25060/autobid_db?sslmode=require

# DigitalOcean Spaces Configuration
DO_SPACES_ENDPOINT=ams3.digitaloceanspaces.com
DO_SPACES_BUCKET=autobid-storage
DO_SPACES_ACCESS_KEY=YOUR_ACCESS_KEY_ID
DO_SPACES_SECRET_KEY=YOUR_SECRET_ACCESS_KEY
DO_SPACES_CDN_ENDPOINT=https://autobid-storage.ams3.cdn.digitaloceanspaces.com

# SMS Configuration (OSON SMS API)
SMS_LOGIN=zarex
SMS_HASH=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
SMS_SERVER=https://api.osonsms.com/sendsms_v1.php

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-super-secure-session-secret-change-this

# Domain Configuration
DOMAIN=autobid.tj
FRONTEND_URL=https://autobid.tj