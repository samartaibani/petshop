# Production Security & Hardening Checklist

This comprehensive checklist provides actionable security controls, best practices, implementation guides, and pre-deployment verification steps for deploying the **Pet Food Shop (fean)** application—and Node.js / Express / Angular / Firebase full-stack applications—to production environments.

---

## 📋 Checklist Overview & Status Tracker

| # | Category | Criticality | Current Status | Target State |
|---|---|---|---|---|
| 1 | [HTTPS / SSL](#1-https--ssl) | Critical | ⚠️ Needs Configuration | Enforce TLS 1.3/1.2 & HSTS |
| 2 | [Authentication](#2-authentication) | Critical | 🟡 Firebase Auth Implemented | Add Lockout & Token Hardening |
| 3 | [Authorization](#3-authorization) | Critical | 🟡 Middleware Present | Enforce Granular RBAC & Firestore Rules |
| 4 | [Input Validation](#4-input-validation) | High | ⚠️ Partial Client Validation | Enforce Server Schema (Joi/Zod) |
| 5 | [SQL / NoSQL Injection Protection](#5-sqlnosql-injection-protection) | Critical | ✅ Firestore Parameterized API | Audit Custom Queries & Operators |
| 6 | [XSS Protection](#6-xss-protection) | High | 🟡 Angular Sanitization | Enforce Content Security Policy (CSP) |
| 7 | [CSRF Protection](#7-csrf-protection) | High | ⚠️ Unprotected APIs | SameSite Cookies & Anti-CSRF Tokens |
| 8 | [Security Headers](#8-security-headers) | High | ⚠️ Missing Headers | Implement `helmet` Middleware |
| 9 | [CORS Configuration](#9-cors-configuration) | High | ⚠️ Permissive (`cors()`) | Whitelist Trusted Production Domains |
| 10 | [Rate Limiting](#10-rate-limiting) | High | ⚠️ Not Configured | Implement `express-rate-limit` |
| 11 | [File Upload Security](#11-file-upload-security) | High | 🟡 Multer Uploads | Magic Byte Validation & Cloud Storage |
| 12 | [Application Firewall (WAF)](#12-application-firewall-waf) | Medium | ⚠️ Pending Setup | Cloudflare / AWS WAF Integration |
| 13 | [Server & OS Firewall](#13-server--os-firewall) | High | ⚠️ Pending Server Provisioning | UFW / Security Group Rules & Fail2Ban |
| 14 | [Secrets Management](#14-secrets-management) | Critical | ⚠️ `serviceAccountKey.json` in root | Environment Variables / Secret Manager |
| 15 | [Logging & Monitoring](#15-logging--monitoring) | High | 🟡 Console Logging | Structured Logging (Winston) & Sentry |
| 16 | [Backups & Disaster Recovery](#16-backups--disaster-recovery) | High | ⚠️ Manual Firestore Export | Automated Scheduled Firestore Exports |
| 17 | [Updates & Vulnerability Management](#17-updates--vulnerability-management) | High | ⚠️ Manual Audits | Dependabot / Automated `npm audit` |
| 18 | [Security Testing & Auditing](#18-security-testing--auditing) | High | ⚠️ Pending Execution | SAST, DAST (OWASP ZAP) & Penetration Audit |

---

## 1. HTTPS / SSL

Ensure all data in transit between clients, servers, and database endpoints is encrypted using TLS 1.2+.

### Action Items
- [ ] **Enforce HTTPS Only**: Disable all HTTP access or set up permanent HTTP (301) to HTTPS redirects.
- [ ] **SSL/TLS Certificates**: Provision automated certificates via **Let's Encrypt / Certbot** or host provider (Cloudflare, AWS ACM, Firebase Hosting).
- [ ] **Certificate Auto-Renewal**: Verify cron job / systemd service for automated renewal (`certbot renew --dry-run`).
- [ ] **HTTP Strict Transport Security (HSTS)**: Enable HSTS headers with `max-age=31536000; includeSubDomains; preload`.
- [ ] **Modern Cipher Suites**: Restrict TLS protocols to **TLS 1.2** and **TLS 1.3**; disable SSLv3, TLS 1.0, and TLS 1.1.
- [ ] **SSL Labs Audit**: Achieve an **A+ grade** on [Qualys SSL Labs Test](https://www.ssllabs.com/ssltest/).

---

## 2. Authentication

Secure identity management and credential handling.

### Action Items
- [ ] **Password Complexity**: Enforce password strength rules (minimum 12 characters, uppercase, lowercase, numbers, special characters).
- [ ] **Firebase Token Verification**: Ensure all protected backend routes call `admin.auth().verifyIdToken(token)`.
- [ ] **Secure Token Storage**:
  - Avoid storing JWTs in `localStorage` if vulnerable to XSS; use `HttpOnly`, `Secure`, `SameSite=Strict` cookies or memory storage.
- [ ] **Session & Token Expiration**: Set short lifetimes for access tokens (1 hour) and manage refresh tokens safely.
- [ ] **Brute-Force & Lockout**: Implement account lockout or IP cooldown after 5 consecutive failed login attempts.
- [ ] **Multi-Factor Authentication (MFA)**: Enable Firebase Auth 2FA / MFA for Admin accounts.
- [ ] **Secure Password Reset**: Ensure password reset tokens are single-use and expire within 15–30 minutes.

---

## 3. Authorization

Enforce granular control to ensure users can only access data they own or are explicit authorized to see.

### Action Items
- [ ] **Role-Based Access Control (RBAC)**: Maintain role verification middleware on the server (`verifyUser`, `verifyAdmin`).
- [ ] **Ownership Checks**: Validate that user `uid` in request params matching the authenticated user ID for order history, profile updates, and wishlist items.
- [ ] **Firestore Security Rules**: Configure cloud database rules to restrict direct client access:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /products/{productId} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.token.admin == true;
      }
    }
  }
  ```
- [ ] **Principle of Least Privilege**: Ensure service accounts (`serviceAccountKey.json`) have minimal necessary IAM permissions.

---

## 4. Input Validation

Validate and sanitize all incoming payloads on the backend before processing.

### Action Items
- [ ] **Server-Side Schema Validation**: Use `Joi`, `Zod`, or `express-validator` to enforce strict type, length, and format schemas for all request `body`, `query`, and `params`.
- [ ] **Reject Unexpected Fields**: Strip or fail requests containing non-whitelisted payload properties.
- [ ] **Type Coercion Prevention**: Validate primitives explicitly to prevent array/object injection into expected string fields.
- [ ] **Parameter Sanitization**: Sanitize query strings and URI parameters against path traversal (`../`) and control characters.

---

## 5. SQL / NoSQL Injection Protection

Prevent malicious injection into database queries and object filters.

### Action Items
- [ ] **Firestore Parameterization**: Use standard Firestore SDK query methods (`db.collection('products').where(...)`) which sanitize inputs natively.
- [ ] **Avoid Object Injection**: Do not pass raw JSON objects directly into query operators without validation.
- [ ] **Sanitize Operator Keys**: Ensure incoming body parameters cannot overwrite database operator keys (e.g. `$gt`, `$ne`, `$where` if using MongoDB/Mongoose).
- [ ] **Raw Query Avoidance**: Never construct dynamic queries using string concatenation.

---

## 6. XSS (Cross-Site Scripting) Protection

Prevent execution of unauthorized scripts in client browsers.

### Action Items
- [ ] **Context-Aware Encoding**: Rely on Angular's built-in DOM sanitization and template binding (`{{ value }}`).
- [ ] **Avoid Unsafe DOM APIs**: Prohibit direct use of `innerHTML`, `elementRef.nativeElement`, `BypassSecurityTrustHtml` unless strictly sanitized.
- [ ] **Input Sanitization**: Use `DOMPurify` or `sanitize-html` for rich text input fields before rendering or saving.
- [ ] **Content Security Policy (CSP)**: Set strict HTTP CSP headers:
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://identitytoolkit.googleapis.com https://firestore.googleapis.com;
  ```

---

## 7. CSRF (Cross-Site Request Forgery) Protection

Protect endpoints against unauthorized cross-origin requests.

### Action Items
- [ ] **SameSite Cookie Attribute**: Set `SameSite=Lax` or `SameSite=Strict` on all authentication cookies.
- [ ] **Anti-CSRF Tokens**: Implement Double-Submit Cookie or Synchronizer Token pattern for state-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`).
- [ ] **Origin & Referer Validation**: Verify `Origin` and `Referer` headers on backend API routes.
- [ ] **Custom Request Headers**: Require custom headers (e.g. `X-Requested-With` or `Authorization: Bearer <token>`) which browsers do not attach automatically in cross-site form submissions.

---

## 8. Security Headers

Configure HTTP response headers to defend against common attack vectors.

### Action Items
- [ ] **Integrate Helmet**: Install and configure `helmet` middleware in Express:
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```
- [ ] **Configured Headers**:
  - `X-Frame-Options: DENY` (prevents Clickjacking)
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-XSS-Protection: 0` (modern best practice defers to CSP)

---

## 9. CORS (Cross-Origin Resource Sharing)

Restrict API access to authorized domain names.

### Action Items
- [ ] **Disable Wildcard Origins**: Replace `cors()` default (`*`) with an explicit whitelist:
  ```javascript
  const allowedOrigins = ['https://yourdomain.com', 'https://admin.yourdomain.com'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Policy Violation'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));
  ```
- [ ] **Pre-Flight Handling**: Securely handle pre-flight `OPTIONS` requests.
- [ ] **Expose Necessary Headers Only**: Limit `Access-Control-Expose-Headers` to required client headers.

---

## 10. Rate Limiting

Prevent Denial of Service (DoS) and brute-force key space searches.

### Action Items
- [ ] **Global Rate Limiting**: Apply `express-rate-limit` globally:
  ```javascript
  const rateLimit = require('express-rate-limit');
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', globalLimiter);
  ```
- [ ] **Strict Auth & Sensitive Route Limiting**: Apply aggressive limits on authentication and order endpoints (e.g., 5 attempts per 15 minutes for `/api/auth/login`).
- [ ] **Reverse Proxy Rate Limiting**: Configure NGINX or Cloudflare rate limiting rules at the network perimeter.

---

## 11. File Upload Security

Mitigate risks associated with user-uploaded files (product images, profile pictures).

### Action Items
- [ ] **Extension & MIME Validation**: Whitelist allowed file extensions (`.png`, `.jpg`, `.jpeg`, `.webp`) and MIME types (`image/jpeg`, `image/png`).
- [ ] **Magic Byte Inspection**: Inspect file headers using `file-type` library to prevent extension spoofing.
- [ ] **File Size Restrictions**: Enforce maximum file upload size (e.g. 5 MB max per file).
- [ ] **File Renaming**: Generate cryptographically random filenames (UUIDv4) upon upload; never preserve original user-provided filenames.
- [ ] **Disable Script Execution**: Store uploaded files outside the web root or disable execution permissions (`NoExec`) on static upload folders (`/uploads`).
- [ ] **Cloud Storage Offloading**: Prefer storing uploads directly in **Firebase Storage** or **AWS S3** with restricted public access rules.

---

## 12. Application Firewall (WAF)

Defend the network perimeter against malicious web traffic.

### Action Items
- [ ] **Deploy WAF Solution**: Route traffic through Cloudflare, AWS WAF, or GCP Cloud Armor.
- [ ] **OWASP Core Rule Set**: Enable OWASP top 10 threat detection rules on WAF.
- [ ] **DDoS Protection**: Enable automated rate-based IP blocking and challenge pages for suspicious traffic spikes.
- [ ] **Bot Mitigation**: Implement CAPTCHA / Managed Challenges for high-risk endpoints (signup, contact forms).

---

## 13. Server & OS Firewall

Harden host machine infrastructure and network entry points.

### Action Items
- [ ] **Host Firewall (UFW / iptables)**: Block all incoming traffic except essential ports:
  - Port `80` (HTTP - redirect to 443)
  - Port `443` (HTTPS)
  - Port `22` (SSH - restricted to static admin IP)
- [ ] **SSH Hardening**:
  - Disable root login (`PermitRootLogin no`).
  - Disable password authentication (`PasswordAuthentication no`).
  - Enforce SSH Key Authentication (Ed25519 or RSA 4096-bit).
  - Change default SSH port (optional defense-in-depth).
- [ ] **Intrusion Prevention**: Install and configure `fail2ban` to ban IP addresses after repeated failed SSH login attempts.

---

## 14. Secrets Management

Protect API keys, credentials, and sensitive configurations.

### Action Items
- [ ] **No Secrets in Source Control**: Ensure `.env`, `serviceAccountKey.json`, and database keys are in `.gitignore`.
- [ ] **Audit Git History**: Run `trufflehog` or `git-secrets` to verify historical commits contain no leaked credentials.
- [ ] **Environment Injection**: Load configuration dynamically using `process.env` on production servers.
- [ ] **Secret Manager Integration**: Use AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault for production keys.
- [ ] **Key Rotation Plan**: Establish a process for rotating Firebase service account keys and API tokens every 90 days.

---

## 15. Logging & Monitoring

Maintain visibility into application operations and security events.

### Action Items
- [ ] **Structured Logging**: Replace `console.log` with structured loggers like **Winston** or **Pino** outputting JSON formats.
- [ ] **Sanitize Log Data**: Ensure Sensitive PII (passwords, credit card details, JWT tokens, SSNs) is redacted prior to writing logs.
- [ ] **Audit Logging**: Record security-relevant events (failed logins, privilege escalation, file uploads, role changes).
- [ ] **Centralized Log Aggregation**: Stream logs to GCP Cloud Logging, Datadog, Logstash, or AWS CloudWatch.
- [ ] **Error Tracking**: Integrate **Sentry** or **Bugsnag** for real-time frontend and backend runtime exception tracking.
- [ ] **Uptime & Performance Monitoring**: Configure UptimeRobot / Datadog synthetic monitors to track latency and uptime SLAs.

---

## 16. Backups & Disaster Recovery

Ensure data resiliency and fast recovery in case of system failures.

### Action Items
- [ ] **Automated Database Backups**: Enable automated daily Firestore exports to Google Cloud Storage bucket.
- [ ] **Retention Policy**: Retain daily backups for 30 days, weekly backups for 90 days, and monthly backups for 1 year.
- [ ] **Offsite Replication**: Replicate backup snapshots to a geographically distinct secondary cloud region.
- [ ] **Disaster Recovery Drills**: Test database restoration procedure quarterly to verify recovery time objective (RTO < 2 hours) and recovery point objective (RPO < 1 hour).

---

## 17. Updates & Vulnerability Management

Keep software components free from known vulnerabilities.

### Action Items
- [ ] **Dependency Audits**: Run `npm audit` / `npm audit fix` as part of CI/CD builds.
- [ ] **Automated Dependency Updates**: Enable **Dependabot** or **Renovate** on the GitHub repository for security patch alerts.
- [ ] **OS Patching**: Configure automatic security updates (`unattended-upgrades` on Ubuntu/Debian).
- [ ] **Runtime Updates**: Upgrade Node.js and Angular versions regularly to active LTS releases.

---

## 18. Security Testing & Pre-Launch Audits

Validate security controls before going live.

### Action Items
- [ ] **Static Code Analysis (SAST)**: Scan codebase with SonarQube, Semgrep, or CodeQL.
- [ ] **Dynamic Application Security Testing (DAST)**: Execute automated vulnerability scans using **OWASP ZAP** or **Burp Suite**.
- [ ] **Dependency Scanning**: Run `Snyk` or `Trivy` scans on container images and Node modules.
- [ ] **Pre-Production Verification Checklist Sign-off**: Complete manual verification of every checklist item before DNS migration.

---

## 🚀 Pre-Deployment Sign-Off Checklist

- [ ] HTTPS enforced across all endpoints with A+ SSL score.
- [ ] `serviceAccountKey.json` removed from Git tracking and managed via environment variables.
- [ ] `helmet` and `cors` strictly configured in `server.js`.
- [ ] `express-rate-limit` active on `/api/` and `/api/auth/`.
- [ ] Firestore Security Rules deployed and verified.
- [ ] WAF & Host Firewall (UFW) active.
- [ ] Automated Firestore backup schedule confirmed.
- [ ] `npm audit` passes with 0 critical/high vulnerabilities.
