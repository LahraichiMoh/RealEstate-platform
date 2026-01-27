# Client Onboarding Checklist

## Step-by-Step: How to Create Client Access & Domain

### For Super Admin

#### Week 1: Initial Setup

- [ ] **Create New Client**
  - Go to `/admin/clients`
  - Click "New Client"
  - Fill in: Name, Email, Phone, City
  - Click "Create Client"

- [ ] **Copy Access Code**
  - Click on the new client
  - Copy the 12-character Access Code
  - Share with client securely

- [ ] **Create Owner Account**
  - On client detail page, click "Add User"
  - Fill: Name, Email, Password
  - Set Role to "OWNER"
  - Click "Create User"

- [ ] **Send Onboarding Email to Client**
  
  ```
  Subject: Your Real Estate Admin Portal Access
  
  Welcome!
  
  You're all set. Here are your login details:
  
  Access Code: [12-CHAR-CODE]
  
  LOGIN DETAILS:
  - Email: [owner@company.com]
  - Password: [temporary password]
  - URL: https://yoursite.com/admin/login
  
  IMPORTANT: Change your password on first login!
  
  Next steps:
  1. Log in to the portal
  2. Connect your domain
  3. Invite team members
  4. Add your projects
  
  Questions? Contact us at support@yoursite.com
  ```

---

### For Client: First Week

#### Day 1: Login & Secure Account

- [ ] **Login to Admin Portal**
  - URL: https://yoursite.com/admin/login
  - Email: [provided by admin]
  - Password: [temporary password]

- [ ] **Change Your Password**
  - Click Settings
  - Change password to something secure
  - Save changes

- [ ] **Verify Your Email**
  - Check your inbox
  - Confirm email address if required

#### Day 2-3: Connect Your Domain

- [ ] **Go to Settings > Domains**
  - Click "Add Domain"
  - Enter your domain (e.g., prestige.com)
  - Check "Set as primary" (if your only domain)
  - Click "Add Domain"

- [ ] **Get CNAME Record**
  - Copy the CNAME record shown:
    ```
    yourdomain.com  CNAME  verify.yoursite.com
    ```

- [ ] **Add DNS Record to Your Registrar**
  - Log into GoDaddy, Namecheap, etc.
  - Go to DNS settings
  - Create new CNAME record with above details
  - Save changes

- [ ] **Wait for Verification**
  - Status will be "PENDING" for 24-48 hours
  - Check back later for "VERIFIED" status
  - You'll receive email when domain is verified

#### Day 4-5: Build Your Portfolio

- [ ] **Add Your First Project**
  - Go to "Projects"
  - Click "Add Project"
  - Fill: Name, Location, Description, Floors
  - Click "Create Project"

- [ ] **Add Floors & Apartments**
  - Click on your project
  - Add floor numbers
  - Add apartments with pricing
  - Set apartment statuses (Available, Reserved, Sold)

- [ ] **Set Project Images**
  - Upload cover image for project
  - Add photos of apartments
  - Add floor plan details

#### Week 2: Team & Launch

- [ ] **Invite Team Members**
  - Go to "Team"
  - Click "Add Team Member"
  - Add your agents/sales staff
  - Set role to "AGENT"
  - Share their login info

- [ ] **Configure Your Profile**
  - Add company logo
  - Add contact information
  - Set your branding colors
  - Add office address

- [ ] **Test Public Portal**
  - Visit your domain
  - Browse projects
  - Check apartment listings
  - Test reservation form

- [ ] **Launch to Public**
  - Announce your domain to clients
  - Share project links
  - Monitor reservations

---

## Troubleshooting Quick Links

### Login Issues
- [ ] Verify email address is correct
- [ ] Check password is correct (case-sensitive)
- [ ] Account status is ACTIVE
- [ ] Browser cookies enabled

### Domain Verification Stuck
- [ ] Verify CNAME record is added to registrar
- [ ] Check record exactly matches provided format
- [ ] Wait full 24-48 hours (don't add duplicates)
- [ ] Use online DNS checker to verify

### Projects Not Showing on Domain
- [ ] Domain is set to PRIMARY
- [ ] Domain status is VERIFIED
- [ ] Projects have been created
- [ ] Browser cache cleared

### Can't Invite Team Members
- [ ] Your role must be OWNER
- [ ] You have active subscription
- [ ] New member's email is valid and unique

---

## Important Dates

- **Day 1**: Account created & setup
- **Day 2**: Domain added to system
- **Day 3**: DNS record added by client
- **Day 4**: Domain verification (usually complete)
- **Day 5**: Domain VERIFIED & live
- **Week 2**: Projects and team added
- **Week 3**: Full launch to public

---

## Key Contacts

- **Admin Support**: admin@yoursite.com
- **Tech Support**: support@yoursite.com
- **Sales Questions**: sales@yoursite.com

---

## Success Metrics

You'll know onboarding is complete when:
- ✅ Client can log in with their email/password
- ✅ Domain is verified (PENDING → VERIFIED)
- ✅ At least one project is created
- ✅ Domain is set as PRIMARY
- ✅ Public can access projects at the domain
- ✅ Team members have been added
- ✅ First reservation is received

---

## Post-Launch Checklist

- [ ] Monitor domain verification emails
- [ ] Check first reservation submissions
- [ ] Confirm team members can log in
- [ ] Test admin dashboard features
- [ ] Review analytics dashboard
- [ ] Plan for upgrades/additional features

---

## Common Questions

**Q: How long until domain is verified?**
A: Usually 24-48 hours after adding DNS record.

**Q: Can I change my domain later?**
A: Yes, you can add multiple domains and change your primary domain anytime.

**Q: Do I need to tell my agent the access code?**
A: No, just give them their individual email/password login.

**Q: What if domain verification fails?**
A: Check your DNS record is correct. It should be exactly: yourdomain.com CNAME verify.yoursite.com

**Q: Can my agents change domains?**
A: No, only OWNER role can manage domains.

**Q: How many projects can I add?**
A: Unlimited! Add as many as you want.

---

**Last Updated**: January 2026
**Version**: 1.0
