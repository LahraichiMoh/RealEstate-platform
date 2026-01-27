# Domain & Access Setup Guide

## Overview

Your Real Estate Platform now supports full domain management where:
- **Super Admin** creates client accounts and generates unique access codes
- **Clients** receive access credentials to log in
- **Clients** can connect their custom domains to their project portal

## For Super Admin: Creating Client Access

### Step 1: Create a New Client Account

1. Go to `/admin/clients` (or click "Clients" in the admin sidebar)
2. Click "New Client"
3. Fill in client information:
   - **Name**: Business name (e.g., "Prestige Developers")
   - **Email**: Contact email
   - **Phone**: Contact number (optional)
   - **City**: Location (optional)

4. Click "Create Client"

### Step 2: View & Share Access Code

1. After creating the client, click on their name to view details
2. You'll see the **Access Code** at the top of the page
3. Copy the access code and share it with the client

The access code looks like: `A7K3M2P9B1Q8`

### Step 3: Create User Account for Client

1. On the client detail page, click "Add User"
2. Fill in the owner's information:
   - **Name**: Person's name
   - **Email**: Login email
   - **Password**: Set a temporary password (they can change it later)
   - **Role**: Select "OWNER" for the main account

3. Click "Create User"

### Step 4: Provide Client with Login Credentials

Send the client an email with:
```
Welcome to Real Estate Admin Platform!

Your Access Code: A7K3M2P9B1Q8

Login Details:
- Email: owner@prestige.com
- Password: [temporary password]
- URL: https://yoursite.com/admin/login

Please log in and change your password immediately.
```

---

## For Clients: Getting Started

### Step 1: First Login

1. Go to `https://yoursite.com/admin/login`
2. Enter the email and password provided by admin
3. Click "Sign In"
4. You'll be redirected to your dashboard

### Step 2: Connect Your Domain

1. Click "Settings" in the left sidebar
2. Click "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `prestige.com` or `projects.prestige.com`)
5. Check "Set as primary domain" if this is your main domain
6. Click "Add Domain"

### Step 3: Configure DNS

You'll see instructions with a CNAME record:

```
CNAME Record:
yourdomain.com  CNAME  verify.yoursite.com
```

**Where to add this:**
- Log into your domain registrar (GoDaddy, Namecheap, etc.)
- Go to DNS settings
- Add a new CNAME record with the values above
- Save changes

**Note**: DNS changes can take 24-48 hours to propagate.

### Step 4: Wait for Verification

- Status will show "PENDING" initially
- Check back in a few hours
- Once verified, status will change to "VERIFIED"
- Your projects will be accessible at your domain

### Step 5: Add Projects and Team Members

1. Click "Projects" to add your real estate projects
2. Create floors, apartments, and pricing
3. Click "Team" to invite agents/team members
4. Set up your profile and branding

---

## Domain Status Explained

### PENDING
- Domain is waiting for DNS verification
- Add the CNAME record to your registrar
- Status will update automatically once verified

### VERIFIED
- Domain is successfully connected
- Your projects are live at this domain
- You can set it as your primary domain

### FAILED
- DNS verification failed
- Check that your CNAME record is correct
- Wait 24 hours and try again
- Contact support if issues persist

---

## Multi-Domain Setup

You can connect multiple domains to your account:

1. Add each domain separately in the Domains page
2. Only one domain can be "Primary"
3. Primary domain is used for:
   - Default public access link
   - Email notifications
   - Branding display

### Setting Primary Domain

1. Go to Domains page
2. Click "Set Primary" on the domain you want to use
3. This domain will now be your main public portal

---

## Team Member Access

### Adding Team Members

1. Click "Team" in the sidebar
2. Click "Add Team Member"
3. Enter their information:
   - **Name**: Full name
   - **Email**: Their login email
   - **Role**: OWNER or AGENT
   - **Password**: Temporary password

4. Click "Create User"

### User Roles

**OWNER**
- Full access to client account
- Can manage team members
- Can manage domains
- Can view all data

**AGENT**
- Can create and manage projects
- Can manage apartments and reservations
- Cannot manage team members
- Cannot change domains

---

## Troubleshooting

### Domain Not Verified

1. Check that CNAME record is correctly added
2. Use a DNS checker tool (e.g., mxtoolbox.com)
3. Wait 24-48 hours for DNS propagation
4. Try deleting and re-adding the domain

### Cannot Login

1. Verify email address is correct
2. Check password (case-sensitive)
3. Ensure account status is ACTIVE
4. Contact admin if account was suspended

### Projects Not Showing on Domain

1. Verify domain is set to VERIFIED status
2. Check that domain is set as PRIMARY
3. Ensure projects exist in your account
4. Clear browser cache and reload

### DNS Record Not Found

1. Log into your domain registrar (GoDaddy, etc.)
2. Go to DNS/Domain Settings
3. Add a new CNAME record:
   - Name/Host: `@` or your domain
   - Points to: `verify.yoursite.com`
   - TTL: 3600 or default
4. Save changes

---

## Security Notes

- **Access Codes** are unique per client - never share them
- **Passwords** should be changed on first login
- **Domains** prove ownership - verify your domain registrar before adding
- **Team Members** should use strong passwords
- Inactive accounts are automatically suspended after 90 days

---

## API Reference

### Getting Your Access Code

As a client, your access code is displayed when you log in to your dashboard.

### Domain API Endpoints

```
GET  /api/domains           - List your domains
POST /api/domains           - Add new domain
PATCH /api/domains/:id      - Update domain (set primary, etc.)
DELETE /api/domains/:id     - Remove domain
```

---

## Support

For issues or questions:
- Check this guide first
- Review domain setup instructions in the Domains page
- Contact admin with your client ID
- Include error messages if reporting issues

---

## FAQ

**Q: Can I have multiple domains?**
A: Yes, add as many domains as you need. Only one is marked as primary.

**Q: How long does DNS verification take?**
A: Usually 24-48 hours, but can be instant if your registrar processes quickly.

**Q: Can I change my primary domain?**
A: Yes, anytime. Go to Domains and click "Set Primary" on another domain.

**Q: What if I don't have a domain?**
A: You'll get a subdomain from the platform admin (e.g., prestige.yoursite.com).

**Q: Can agents see my domains?**
A: No, only OWNER role can manage domains and team members.

**Q: What happens if my domain verification fails?**
A: Check your DNS settings. The system will keep retrying every 24 hours.
