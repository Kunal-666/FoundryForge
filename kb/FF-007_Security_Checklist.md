# Security Checklist for Production Applications

This document provides a comprehensive security checklist for engineering teams building and deploying production applications. It covers authentication best practices, authorization and role-based access control, input validation and sanitization, cross-site scripting (XSS) prevention, cross-site request forgery (CSRF) protection, SQL injection prevention, Firestore security rules, secrets management, rate limiting, logging and audit trails, and a production deployment readiness checklist. Each section includes actionable decision rules, practical examples, and clear guidance on what to do and what to avoid.

## Authentication Best Practices

Authentication is the process of verifying who a user is. Every production application must enforce authentication on every protected endpoint, route, and resource. The guiding principle is deny-by-default: if a resource requires authentication and the user is not authenticated, reject the request immediately without revealing whether the resource exists or what it contains.

Use a battle-tested authentication provider rather than building your own. Firebase Authentication, Auth0, Clerk, Supabase Auth, and similar services handle password hashing, session management, token rotation, and brute-force protection out of the box. Building custom authentication introduces risk in areas like password storage, timing attacks, and session fixation that even experienced teams frequently get wrong.

If you must implement authentication yourself, follow these rules:

- Hash passwords with bcrypt, scrypt, or Argon2. Never use MD5, SHA-1, or SHA-256 directly. These are hash functions, not password hashing functions, and can be cracked in seconds at scale. Use a cost factor of at least 12 for bcrypt.
- Use HTTP-only, Secure, SameSite cookies for session tokens. Do not store session tokens in localStorage, which is accessible to any JavaScript running on your domain. An XSS vulnerability would leak every token in localStorage.
- Implement account lockout after a configurable number of failed login attempts. Five failed attempts within 15 minutes is a reasonable threshold. Inform the user that their account is temporarily locked but do not reveal whether the account exists.
- Enforce password complexity rules that reject common passwords. Use a library like zxcvbn to score password strength and reject passwords below a minimum threshold. Require a minimum of 8 characters.
- Always use HTTPS in production. HTTP transmits credentials in plaintext. Configure HSTS headers to instruct browsers to never connect over HTTP.

Do not send password reset links that include the user's email in the URL query string. The email address may be leaked through referrer headers or browser history. Instead, send a time-limited, single-use token tied to the user's account on the server side. Invalidate the token after successful use or after a 15-minute expiration window.

## Authorization and Role-Based Access Control

Authorization determines what an authenticated user is allowed to do. The most common approach is Role-Based Access Control (RBAC), where users are assigned roles and roles are granted permissions.

Define roles and permissions in a centralized location, not scattered across your codebase. A typical RBAC implementation uses an enum or constant object that maps roles to their permissions:

```typescript
const ROLES = {
  admin: ['read:any', 'write:any', 'delete:any', 'manage:users'],
  editor: ['read:any', 'write:any'],
  viewer: ['read:any'],
} as const;
```

Check permissions at the point of access, not just at the UI level. Hiding an "Edit" button from a viewer is necessary for good UX, but it is not a security control. An attacker can send a direct API request to edit a resource. Server-side or security-rule-level authorization checks are mandatory.

For Firestore-backed applications, encode authorization in security rules rather than in application code. Security rules execute on Firebase's servers and cannot be bypassed by the client. Use custom claims on the user's ID token to convey role information:

```plaintext
match /posts/{postId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
                && request.auth.token.role in ['admin', 'editor'];
  allow update, delete: if request.auth.token.role == 'admin'
                        || request.auth.uid == resource.data.authorId;
}
```

Do not rely on client-side role checks for security. They are a convenience for UX, not a control. The server or security rules must independently verify every request.

Apply the principle of least privilege. Grant users the minimum permissions they need to do their job. If a user needs to read 10 documents, do not grant read access to the entire collection. If a background job needs write access to one field, do not give it write access to the entire document. Granular permissions reduce the blast radius of a compromised account.

## Input Validation

Every input from the client is potentially malicious. Validate all user input on the server side, regardless of any client-side validation you have in place. Client-side validation is for user experience; server-side validation is for security.

Validate on three dimensions:

1. **Type and format**. If a field expects an email address, validate that it matches an email pattern. If it expects a UUID, validate that it is a valid UUID v4. Reject anything that does not match.
2. **Length and size**. Set minimum and maximum length on all string inputs. A username shorter than 3 characters or longer than 50 characters should be rejected. File uploads should have both per-file and total-upload size limits.
3. **Allowed values**. For enums and constrained fields, accept only values from a predefined allowlist. A status field that should be one of `draft`, `published`, or `archived` should reject any other value.

Use a validation library like Zod, Yup, or Joi to define schemas and parse incoming data. These libraries provide type safety, clear error messages, and protection against prototype pollution:

```typescript
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['viewer', 'editor']).default('viewer'),
});

function handleCreateUser(req: Request, res: Response) {
  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }
  // result.data is fully typed and validated
}
```

Do not use `eval()`, `new Function()`, or template engines that render user input as code. These are common vectors for server-side template injection and remote code execution. If you must render user-provided content, use a safe templating library that auto-escapes output.

## Cross-Site Scripting Prevention

XSS attacks occur when an attacker injects malicious scripts into content that is rendered by another user's browser. The primary defense is context-aware output escaping.

For server-rendered HTML, use a templating engine that auto-escapes values by default. React automatically escapes JSX string values, which prevents XSS in React applications. However, `dangerouslySetInnerHTML` bypasses this protection and should be used only with sanitized content:

```typescript
// Do this: React auto-escapes
return <div>{userInput}</div>;

// Avoid this unless absolutely necessary
return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
```

When you must render raw HTML (for example, a rich text editor output), sanitize it server-side with a library like DOMPurify before storing it. Sanitize again before rendering. Never trust that previously sanitized content is still safe, especially if it has been stored for a long time and could be rendered in a different context.

For API responses that include user-generated content, set the `Content-Type` header to `application/json` and ensure JSON responses do not include function callbacks (which would be JSONP and vulnerable to XSS). Use the `X-Content-Type-Options: nosniff` header to prevent MIME sniffing.

Implement a Content Security Policy (CSP) header as a defense-in-depth measure. CSP restricts which sources of content the browser is allowed to load, making it much harder for an attacker to inject malicious scripts even if other defenses fail:

```plaintext
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://*.firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com;
```

Start with a restrictive CSP and relax it only as needed. Use the `Content-Security-Policy-Report-Only` header and a reporting endpoint to monitor violations before enforcing.

## Cross-Site Request Forgery Protection

CSRF attacks trick an authenticated user into making an unintended request. If a user is logged into your application and visits a malicious site, that site could submit a form to your application and the browser would automatically include the user's cookies.

The standard defense is a CSRF token. For each session, generate a cryptographically random token, associate it with the user's session on the server, and require it in every state-changing request (POST, PUT, PATCH, DELETE). The token is transmitted as a request header or in the request body, not as a cookie.

For API-only backends that use authentication headers (like Bearer tokens or API keys) rather than cookies, CSRF protection is not necessary because the browser does not automatically include custom headers cross-origin. However, you must still protect against CORS abuse:

- Set `Access-Control-Allow-Origin` to the specific origin of your frontend, never `*`.
- Set `Access-Control-Allow-Credentials` to `true` only if you use cookie-based auth.
- Do not reflect the `Origin` header back as `Access-Control-Allow-Origin`, as this would allow any origin to make credentialed requests.

For applications using Firebase Authentication, the SDK automatically handles CSRF protection for sign-in operations. For custom backend endpoints called by the Firebase client, use the ID token as a Bearer token rather than relying on cookies.

## SQL Injection Prevention

If your application uses a SQL database (PostgreSQL, MySQL, SQLite), every SQL query that incorporates user input must use parameterized queries. String interpolation or concatenation of user input into SQL is the primary cause of SQL injection:

```typescript
// Do this: parameterized query
const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

// Never do this: string interpolation
const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

Parameterized queries ensure that user input is treated as data, not executable code. This applies to all parts of the query, including WHERE clauses, VALUES, SET clauses, and ORDER BY. There is no valid reason to concatenate user input into a SQL string in production code.

For NoSQL databases like Firestore, injection risks are lower but not zero. Firestore SDK queries are safe because they separate query structure from values. However, server-side code that constructs dynamic queries using string concatenation is still vulnerable. Always use the Firestore SDK's query builder methods rather than building query strings.

## Secrets Management

Never hardcode secrets in application code. Secrets include API keys, database passwords, signing keys, encryption keys, OAuth client secrets, and Firebase Admin SDK service account keys. Any of these values committed to a Git repository is a security incident waiting to happen.

For server-side applications, use environment variables loaded from a secure source. In development, use a `.env.local` file that is listed in `.gitignore`. In production, use your hosting platform's secrets management feature (Vercel Environment Variables, Google Cloud Secret Manager, AWS Secrets Manager, GitHub Actions Secrets).

Rotate secrets regularly and immediately if there is any suspicion of compromise. Automate key rotation with scripts that generate new keys, deploy them, verify the new keys work, and then revoke the old keys.

Do not store secrets in client-side code. Firebase client SDK configuration values (like `apiKey` and `projectId`) are not secrets—they are public identifiers. However, Firebase Admin SDK credentials, Stripe secret keys, and database connection strings must never appear in client bundles. Use a backend-for-frontend pattern or Cloud Functions to proxy requests that require these secrets.

Use a secret scanning tool like `git-secrets`, `truffleHog`, or GitHub's secret scanning to prevent accidental commits of secrets. Configure a pre-commit hook that scans for patterns matching common credential formats and blocks the commit if a match is found.

## Rate Limiting

Rate limiting prevents abuse by limiting how many requests a client can make within a time window. Without rate limiting, a single malicious actor could exhaust your database read quota, overwhelm your API, or brute-force login credentials.

Apply rate limiting at multiple layers:

1. **Global rate limiting** at the reverse proxy or load balancer level. For Firebase applications, Cloud Functions have built-in rate limiting through Cloud Run, but you should also add application-level rate limiting.
2. **Endpoint-specific rate limiting**. Authentication endpoints (login, signup, password reset) should have stricter limits—5 attempts per minute per IP address is a common starting point. Read endpoints can have more generous limits.
3. **User-based rate limiting**. Track requests per authenticated user ID and enforce limits. This prevents a single authenticated user from saturating the API even if they rotate IP addresses.

Use a distributed rate-limiting backend like Redis to enforce limits across multiple server instances. In-memory rate limiting works for single-process deployments but becomes inaccurate when you scale horizontally.

When a rate limit is exceeded, return HTTP 429 Too Many Requests with a `Retry-After` header indicating when the client should retry. Log the rate limit event for analysis; a sudden spike in rate-limit hits may indicate an attack.

## Logging and Audit Trails

Comprehensive logging is essential for detecting and investigating security incidents. Log every authentication event (login success, login failure, logout, password change, email change), every authorization failure (attempted access to a resource the user does not have permission to view), and every administrative action (role change, user deletion, configuration change).

Structure logs with consistent fields to enable automated analysis:

```typescript
const logEvent = {
  timestamp: new Date().toISOString(),
  level: 'info',
  event: 'auth.login',
  userId: user.uid,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  success: true,
};
```

Store logs in a centralized, tamper-resistant system. Forward logs from Cloud Functions, servers, and client-side error reporting to a single sink like Google Cloud Logging, Datadog, or Splunk. Enable audit log retention for at least one year, or longer if your regulatory requirements demand it.

Do not log sensitive information. Never log passwords, credit card numbers, session tokens, or personal identifiable information (PII) beyond what is necessary for the audit trail. If you must log an email address for debugging, mask it: `j***@example.com`. Configure log scrubbing or redaction in your logging system to catch accidental inclusion of sensitive data.

Monitor logs for suspicious patterns: multiple failed logins from the same IP within a short window, login attempts for non-existent users, API calls with missing or expired tokens, and unusual geographic locations. Set up alerts for these patterns so that the operations team can respond in real-time.

## Production Deployment Checklist

Before deploying to production, verify each of the following items:

- [ ] Authentication: Password reset flows require email verification before allowing password changes. Account lockout is enabled.
- [ ] Authorization: Every API endpoint has server-side authorization checks. RBAC is enforced in security rules or middleware.
- [ ] Input validation: All user inputs are validated server-side with strict schemas. File uploads have size and type restrictions.
- [ ] XSS: Content Security Policy header is configured and enforced. User-generated content is sanitized before rendering.
- [ ] CSRF: Anti-CSRF tokens are in place for cookie-based auth. CORS is configured with a specific allowed origin.
- [ ] SQL injection: All database queries use parameterized statements. No raw SQL concatenation exists in the codebase.
- [ ] Secrets: No secrets are hardcoded or committed. Environment variables are configured in the hosting platform. `.env` files are in `.gitignore`.
- [ ] Rate limiting: Global and endpoint-specific rate limits are configured. Authentication endpoints have strict limits.
- [ ] Logging: Security-relevant events are logged with consistent structure. Logs are forwarded to a centralized system. Sensitive data is redacted.
- [ ] HTTPS: TLS is enforced. HTTP requests redirect to HTTPS. HSTS header is configured.
- [ ] Dependencies: All dependencies are audited with `npm audit`, `pip audit`, or equivalent. No known critical vulnerabilities exist.
- [ ] Firewall: Only necessary ports are open. The database is not publicly accessible. Admin endpoints are restricted to internal IPs or require strong authentication.
- [ ] Monitoring: Alerts are configured for security events. Error tracking (Sentry, Datadog) is connected. Uptime monitoring is active.
- [ ] Incident response: An incident response plan is documented. Contact information for the security team is available in the on-call rotation.

Run a security scan using automated tools before every production release. Tools like OWASP ZAP, Burp Suite, or Snyk can catch common vulnerabilities that manual review misses. Use a dependency vulnerability scanner in CI to fail the build if a dependency with a known critical vulnerability is introduced.

Do not skip security reviews for small changes. A one-line change that removes an authentication check or adds a new dependency can introduce a critical vulnerability. Every pull request should be reviewed with security in mind, and changes that touch authentication, authorization, or data access should receive a focused security review.
