# Q&A – Quick Reference

---

## Q1. What is Helmet and how is it used in this project?

### What is Helmet?
Helmet is an Express.js middleware that **sets secure HTTP response headers** to protect the app from common web attacks.

---

### Attacks it Protects Against

| Attack | What it is | How Helmet Protects |
|--------|------------|---------------------|
| **Clickjacking** | Attacker embeds your site in a hidden `<iframe>` and tricks users into clicking buttons unknowingly. | Sets `X-Frame-Options: DENY` → browser refuses to render site inside any iframe. |
| **XSS (Cross-Site Scripting)** | Attacker injects malicious `<script>` into your page to steal cookies/data. | Sets `Content-Security-Policy` → only allows scripts from trusted sources. |
| **MIME Sniffing** | Browser ignores `Content-Type` header and guesses file type, risking execution of malicious file as a script. | Sets `X-Content-Type-Options: nosniff` → browser strictly follows the declared Content-Type. |

---

### How to Use (Basic)
```js
const helmet = require('helmet');
app.use(helmet()); // applies all default security headers at once
```

---

### How it is Used in This Project (`backend/server.js`)
Custom configuration — allows Cloudinary images and relaxes cross-origin resource policy for frontend:

```js
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow images from Cloudinary (CDN)
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],                                        // only load resources from same origin
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],     // allow Cloudinary images
            scriptSrc: ["'self'", "'unsafe-inline'"],                      // allow inline scripts (Razorpay, etc.)
        }
    }
}));
```

> **Why custom config?**
> Default Helmet blocks all external images and CDN resources. Since this project uses **Cloudinary** for product images and **Razorpay** for payments, the rules are relaxed selectively instead of disabling helmet entirely.

---

## Q2. What is JWT and how is it used in this project?

### What is JWT?
**JWT (JSON Web Token)** is a compact, self-contained token used to **verify identity** between client and server — without storing sessions in the database.

Structure: `Header.Payload.Signature`
```
eyJhbGci...  .  eyJpZCI6...  .  Xd3k9...
  (algorithm)     (user data)    (signature)
```
- Server signs it with a **secret key** → client stores it → sends it on every request → server verifies it.

---

### This Project's JWT Strategy: Access + Refresh Tokens

| Token | Lifetime | Stored In | Purpose |
|-------|----------|-----------|---------|
| **Access Token** | 15 minutes | Response body / `localStorage` | Sent on every API request in header |
| **Refresh Token** | 7 days | `httpOnly` Cookie | Used to silently get a new Access Token |

> Short-lived Access Token = less damage if stolen. Refresh Token in cookie = JS can't access it (XSS safe).

---

### 1. Generate Tokens on Login/Register (`authController.js`)
```js
// Short-lived access token (15m)
const generateAccessToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });

// Long-lived refresh token (7d)
const generateRefreshToken = (id) =>
    jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// On login success:
const accessToken  = generateAccessToken(user._id);
const refreshToken = generateRefreshToken(user._id);

res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None' }); // store in cookie
res.json({ token: accessToken }); // send access token to frontend
```

---

### 2. Protect Routes — Verify Token (`authMiddleware.js`)
```js
const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1]; // get from "Bearer <token>"

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify signature
    req.user = await User.findById(decoded.id).select('-password'); // attach user to request
    next();
};

const admin = (req, res, next) => {
    if (req.user?.role === 'admin') next();       // allow admin
    else res.status(401).json({ message: 'Not authorized as admin' });
};
```

---

### 3. Refresh Access Token (`authController.js`)
```js
// When access token expires, frontend calls POST /api/auth/refresh
const refreshToken = req.cookies.jwt;                          // read from cookie
const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
const newAccessToken = generateAccessToken(decoded.id);        // issue fresh token
res.json({ token: newAccessToken });
```

---

### 4. Logout (`authController.js`)
```js
res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
// Clears the refresh token cookie — user must login again
```

---

### Flow Summary
```
User Login
  → Server creates AccessToken (15m) + RefreshToken (7d)
  → RefreshToken saved in httpOnly Cookie
  → AccessToken sent to frontend

Every API Request
  → Frontend sends: Authorization: Bearer <accessToken>
  → protect middleware verifies it

AccessToken Expires
  → Frontend calls POST /api/auth/refresh
  → Server reads RefreshToken from cookie, issues new AccessToken

Logout
  → Server clears cookie → both tokens invalidated
```

---

## Q3. What is `httpOnly` and important HTTP headers for interviews?

### What is `httpOnly`?
`httpOnly` is a **cookie flag** that makes the cookie **inaccessible to JavaScript** (`document.cookie`).

```js
res.cookie('jwt', refreshToken, {
    httpOnly: true,   // JS cannot read this cookie → XSS can't steal it
    secure: true,     // only sent over HTTPS
    sameSite: 'None', // allow cross-site (needed for frontend on different domain)
});
```

> Without `httpOnly` → attacker's injected `<script>` can run `document.cookie` and steal the token.  
> With `httpOnly` → cookie is sent automatically by browser but JS can never read it. ✅

---

### Important HTTP Headers for Interviews

| Header | Set By | Purpose | Example |
|--------|--------|---------|---------|
| `Content-Security-Policy` | Server (Helmet) | Controls which sources can load scripts, images, etc. Prevents XSS. | `default-src 'self'` |
| `X-Frame-Options` | Server (Helmet) | Prevents site from being embedded in `<iframe>`. Stops Clickjacking. | `DENY` |
| `X-Content-Type-Options` | Server (Helmet) | Stops browser from guessing file type. Prevents MIME sniffing. | `nosniff` |
| `Strict-Transport-Security` | Server (Helmet) | Forces HTTPS. Browser never uses HTTP after first visit. | `max-age=31536000` |
| `Authorization` | Client | Sends token with every request. | `Bearer <jwt_token>` |
| `Set-Cookie` | Server | Sends cookie to browser with flags like `httpOnly`, `secure`. | `jwt=abc; HttpOnly; Secure` |
| `CORS` (`Access-Control-Allow-Origin`) | Server | Tells browser which origins can talk to this API. | `https://mysite.com` |
| `Content-Type` | Both | Tells what format the body is in. | `application/json` |
| `Cache-Control` | Server | Controls browser caching. | `no-store` (for sensitive data) |
| `Referrer-Policy` | Server (Helmet) | Controls how much referrer info is sent to other sites. | `no-referrer` |

---

### 3 Most Common Interview Questions on Headers

**Q: Difference between `httpOnly` and `secure` cookie flag?**
- `httpOnly` → JS can't read it (XSS protection)
- `secure` → only sent over HTTPS (man-in-the-middle protection)

**Q: What does CORS do?**
- Browser blocks frontend from calling a different domain's API by default.
- Server sets `Access-Control-Allow-Origin` to explicitly allow it.

**Q: What is CSP (Content-Security-Policy)?**
- Whitelist of trusted sources for scripts, images, fonts, etc.
- If attacker injects a script from unknown source → CSP blocks it.

---

## Q4. What are different types of tokens and what is a Bearer token?

### Types of Tokens

| Token Type | What it is | Used For |
|------------|-----------|---------|
| **Bearer Token** | A string (usually JWT) — "whoever bears this, gets access" | Most common — REST APIs, this project |
| **JWT (JSON Web Token)** | A signed, self-contained Bearer token with encoded payload | Stateless auth (no DB session needed) |
| **Refresh Token** | Long-lived token used only to get a new Access Token | Keeps user logged in silently |
| **API Key** | A static secret key given to a developer/app | Server-to-server calls (e.g. Cloudinary, Razorpay) |
| **OAuth Token** | Token issued by a 3rd party (Google, GitHub) after user approves | "Login with Google" flows |
| **Session Token** | Random ID stored in DB, matched on every request | Traditional server-side sessions |
| **OTP (One-Time Password)** | Short-lived numeric code for 2FA | Login verification, password reset |

---

### What is a Bearer Token?

**"Bearer"** means → *"whoever is holding (bearing) this token, give them access."*  
The server does **not** check WHO sent it — just that the token is **valid**.

```
Client Request Header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                ↑              ↑
             keyword        the actual JWT token
```

> ⚠️ This is why Bearer tokens must be kept secret — if stolen, anyone can use them.  
> That's why this project uses short-lived (15m) Access Tokens.

---

### How Bearer Token is Used in This Project

**Frontend sends it:**
```js
// Every API request adds this header
headers: { Authorization: `Bearer ${accessToken}` }
```

**Backend reads & verifies it (`authMiddleware.js`):**
```js
const token = req.headers.authorization.split(' ')[1]; // extract after "Bearer "
const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify → get user id
req.user = await User.findById(decoded.id);               // attach user to request
```

---

### Bearer vs Other Token Types (Interview)

| | Bearer (JWT) | Session Token | API Key |
|--|------------|--------------|---------|
| **Stored** | Client (localStorage/memory) | Server DB | Client (env file) |
| **Stateless?** | ✅ Yes | ❌ No | ✅ Yes |
| **Expires?** | ✅ Yes (15m here) | ✅ Yes | ❌ Usually not |
| **Self-contained?** | ✅ Has user data inside | ❌ Just an ID | ❌ Just a key |
| **Used in this project?** | ✅ Access Token | ❌ No | ✅ Razorpay, Cloudinary |

---

## Q5. How does Frontend communicate with Backend? (Tokens, Helmet, CORS)

### Big Picture Flow
```
Browser (React)                             Server (Express)
     |                                            |
     |── POST /api/auth/login ──────────────────>|  (1) Login
     |<─ { token, refreshToken } + Cookie ───────|  (2) Server responds
     |                                            |
     |── GET /api/orders                          |  (3) Protected request
     |   Header: Authorization: Bearer <token> ──>|  (4) Middleware verifies JWT
     |<─ { orders data } ─────────────────────── |  (5) Data returned
     |                                            |
     |── POST /api/auth/refresh ────────────────>|  (6) Token expired? Auto-refresh
     |   Cookie: jwt=<refreshToken> (auto) ──────>|
     |<─ { new token } ───────────────────────── |  (7) New access token issued
```

---

### Layer by Layer

#### 1. Axios Instance — Central API Client (`services/api.js`)
All frontend API calls go through ONE axios instance:
```js
const api = axios.create({
    baseURL: 'http://localhost:5000/api',  // backend URL
    withCredentials: true,                  // send cookies automatically
    headers: { 'Content-Type': 'application/json' }
});
```
> `withCredentials: true` → browser sends the `httpOnly` refresh token cookie on every request automatically.

---

#### 2. Login — Token Exchange (`AuthContext.jsx`)
```js
const res = await api.post('/auth/login', { email, password });

setToken(res.data.token);                                    // store access token in React state
localStorage.setItem('refreshToken', res.data.refreshToken); // store refresh token in localStorage
```
> Access token → React memory (fastest, cleared on tab close)  
> Refresh token → localStorage (persists across tab refresh)  
> Refresh token cookie → set by server automatically (httpOnly, JS can't read it)

---

#### 3. Every Protected Request — Bearer Token (`services/api.js`)
```js
// AuthContext sets this once after login
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Every call after that automatically includes the header:
api.get('/measurements');  // → sends Authorization: Bearer <token>
api.get('/orders');        // → same, no manual token passing needed
```

---

#### 4. Token Expired? Auto-Refresh via Interceptor (`services/api.js`)
Axios intercepts every **401 Unauthorized** response automatically:
```js
api.interceptors.response.use(null, async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Try refreshing silently
        const res = await api.post('/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') });
        const newToken = res.data.token;

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // update default
        return api(originalRequest);  // retry original failed request with new token
    }
    // If refresh also fails → fire logout event
    document.dispatchEvent(new Event('auth:logout'));
});
```
> User never sees this happen. Token silently renews in background. ✅

---

#### 5. Auto Logout on Inactivity (`AuthContext.jsx`)
```js
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

// Track user activity
window.addEventListener('mousemove', updateActivity);
window.addEventListener('keydown', updateActivity);

// Check every minute
setInterval(() => {
    const diff = Date.now() - parseInt(localStorage.getItem('lastActivity'));
    if (diff > INACTIVITY_LIMIT) logout(); // auto logout
}, 60 * 1000);
```

---

#### 6. CORS — Who Can Talk to the Backend? (`server.js`)
```js
const allowedOrigins = [
    'http://localhost:5173',              // local dev
    'https://mahalaxmi-tailoring.vercel.app', // deployed frontend
    'https://mahalaxmi-tailors.shop',         // custom domain
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
```
> Without `credentials: true` in CORS → cookies won't be sent → refresh token fails.

---

#### 7. Helmet — Securing Response Headers (`server.js`)
Every response from the backend includes security headers set by Helmet:
```
Response Headers (set by Helmet automatically):
  Content-Security-Policy: default-src 'self'; img-src 'self' https://res.cloudinary.com
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=31536000
```
> Browser enforces these rules before rendering anything → protects frontend users.

---

### Complete Summary Table

| Step | What Happens | Tech Used |
|------|-------------|-----------|
| User visits site | App tries silent login via refresh token | Axios, Cookie |
| User logs in | Server returns access + refresh token | JWT, bcrypt |
| Every API call | Bearer token auto-attached to header | Axios defaults |
| Access token expires | Interceptor auto-refreshes silently | Axios interceptor |
| 30 min no activity | User auto-logged out | AuthContext timer |
| Unknown origin calls API | Blocked | CORS |
| Response reaches browser | Security headers enforced | Helmet |
| User logs out | Cookie cleared, tokens wiped | JWT, httpOnly cookie |

---

## Q6. How is Razorpay integrated in this project?

### What is Razorpay?
Razorpay is a **payment gateway** — it handles the actual money transfer (Card, UPI, Netbanking).
Your server never touches card details. Razorpay handles that. You only get a **payment ID + signature** to verify.

---

### Complete Payment Flow (Step by Step)

```mermaid
sequenceDiagram
    participant F as 🖥️ Frontend (Checkout.jsx)
    participant B as ⚙️ Backend (paymentController.js)
    participant R as 💳 Razorpay Servers

    F->>B: [1] POST /api/orders (cart items, address)
    B-->>F: { localOrder._id }

    F->>R: [2] Load Razorpay SDK (dynamic script tag)
    R-->>F: checkout.js ready

    F->>B: [3] POST /payments/create-order { orderId }
    B->>R: razorpay.orders.create({ amount in paise })
    R-->>B: { razorpay_order_id }
    B-->>F: { key, razorpay_order_id, amount }

    F->>F: [4] new window.Razorpay(options).open()
    Note over F,R: User pays via UPI / Card / Netbanking
    R-->>F: { razorpay_payment_id, razorpay_signature }

    F->>B: [5] POST /payments/verify { order_id, payment_id, signature }
    Note over B: HMAC-SHA256 signature check
    B->>B: Update Order → paymentStatus = paid
    B-->>F: { success: true }

    Note over R,B: [Webhook] If user closes tab after payment,
    Note over R,B: Razorpay calls POST /payments/webhook directly
```

---

### Code: Step by Step

#### Step 1 — Create Local Order First (`Checkout.jsx`)
```js
const orderRes = await api.post('/orders', orderData);
const localOrder = orderRes.data; // get _id of our DB order
```
> Order is saved in MongoDB first, then payment is initiated.

---

#### Step 2 — Load Razorpay SDK Dynamically (`Checkout.jsx`)
```js
const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'; // Razorpay CDN
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});
```
> SDK loaded at runtime (not npm install) → reduces initial bundle size.

---

#### Step 3 — Backend Creates Razorpay Order (`paymentController.js`)
```js
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const razorpayOrder = await razorpay.orders.create({
    amount: order.totalAmount * 100, // in paise (₹1 = 100 paise)
    currency: "INR",
    receipt: `receipt_${order.orderNumber}`,
});

// Save payment intent to DB
await Payment.create({ order: order._id, razorpay_order_id: razorpayOrder.id, status: 'created' });

// Return to frontend
res.json({ razorpay_order_id: razorpayOrder.id, amount, key: process.env.RAZORPAY_KEY_ID });
```

---

#### Step 4 — Open Razorpay Checkout UI (`Checkout.jsx`)
```js
const options = {
    key: key,                         // public key from backend
    amount: amount,                   // in paise
    currency: 'INR',
    order_id: razorpay_order_id,      // from backend
    handler: async function (response) {
        // called automatically after user pays
        await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
        });
    },
    prefill: { name: customer_name, email: customer_email }, // auto-fill form
    theme: { color: "#800000" }       // brand color
};

const paymentObject = new window.Razorpay(options);
paymentObject.open(); // opens Razorpay popup
```

---

#### Step 5 — Backend Verifies Signature (`paymentController.js`)
```js
// Recreate signature using HMAC-SHA256
const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
}

// Signature matched → mark order as paid
order.paymentStatus = 'paid';
order.status = 'measurements_confirmed';
await order.save();
```
> ⚠️ Signature verification is **critical** — without it, anyone could fake a successful payment.

---

#### Bonus: Webhook for Safety (`paymentController.js`)
```js
// Razorpay calls this URL directly if user closes tab after payment
// POST /api/payments/webhook
if (event === 'payment.captured') {
    // same: update order to paid
}
```
> Handles edge cases: user pays but closes tab before `handler` fires.

---

### Summary

| Step | Where | What |
|------|-------|------|
| Create local order | Frontend → Backend | Save order to MongoDB |
| Load Razorpay SDK | Frontend | Dynamic `<script>` injection |
| Create Razorpay order | Backend → Razorpay API | Get `razorpay_order_id` |
| Open payment UI | Frontend | `new window.Razorpay(options).open()` |
| User pays | Razorpay | Handles card/UPI/netbanking |
| Verify signature | Backend | HMAC-SHA256 check → mark paid |
| Webhook fallback | Razorpay → Backend | Safety net if user closes tab |

---

### 🟢 Simple English Explanation

When a customer clicks **"Pay Now"**, the app first saves the order in our database and then loads the Razorpay payment popup on the screen. The customer enters their card or UPI details **directly into Razorpay's popup** — our server never sees those details at all. Once the customer pays, Razorpay sends back three IDs to our frontend. The frontend then sends those IDs to our backend, and the backend does a quick **math check** (HMAC signature) to confirm the payment is real and not fake. If the check passes, the order is marked as **paid** in the database. There is also a **webhook** — if the customer pays but accidentally closes the tab before the confirmation screen, Razorpay itself calls our backend directly to mark the order as paid, so no payment is ever lost.

---

## Q7. What is HMAC?

**HMAC** = **Hash-based Message Authentication Code**

It is a way to verify that a message is **genuine and untampered**, by combining the message with a **secret key** and passing it through a hash function.

```js
// How it works in this project (paymentController.js)
const generated_signature = crypto
    .createHmac("sha256", SECRET_KEY)        // hash function + secret key
    .update(razorpay_order_id + "|" + razorpay_payment_id) // the message
    .digest("hex");                           // output as hex string

// If Razorpay's signature === our generated signature → payment is real ✅
// If they don't match → someone tampered with it → reject ❌
```

> Razorpay signs the payment result using your `RAZORPAY_KEY_SECRET`.
> Your backend recreates the same hash using the same secret.
> If both match → payment is genuine. No one can fake it without knowing your secret key.

---

## Q8. How is Cloudinary integrated in this project?

### What is Cloudinary?
Cloudinary is a **cloud-based image storage and CDN service**.
Instead of saving images on your own server (which wastes disk space and is slow), you upload them to Cloudinary and get back a **permanent HTTPS URL** to use anywhere.

---

### Complete Flow (Step by Step)

```mermaid
sequenceDiagram
    participant A as 🧑‍💼 Admin Panel (Frontend)
    participant B as ⚙️ Backend (cloudinaryController.js)
    participant C as ☁️ Cloudinary Cloud
    participant U as 👤 Customer Browser

    A->>B: [1] GET /admin/cloudinary/images?folder=mahalaxmi_tailoring
    B->>C: cloudinary.search.expression(folder).execute()
    C-->>B: { images[], folders[] }
    B-->>A: Display image grid in picker modal

    A->>B: [2] POST /admin/cloudinary/upload (image file)
    Note over B: File received as buffer via multer (not saved to disk)
    B->>C: cloudinary.uploader.upload_stream(buffer)
    C-->>B: { secure_url, public_id }
    B-->>A: { secure_url }

    A->>B: [3] Admin picks image → Save secure_url in Product/CMS
    B->>B: MongoDB: product.images = [secure_url]
    B-->>A: Product saved ✅

    U->>C: [4] Customer visits page → browser loads img src=secure_url
    Note over U,C: Image served directly from Cloudinary CDN
    Note over U,C: Our backend server is NOT involved
```

---

### Code: Step by Step

#### Step 1 — Configure Cloudinary (`cloudinaryController.js`)
```js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

---

#### Step 2 — Fetch Images from Cloudinary (`cloudinaryController.js`)
```js
// GET /api/admin/cloudinary/images
const result = await cloudinary.search
    .expression(`folder:mahalaxmi_tailoring`) // search by folder
    .sort_by('created_at', 'desc')
    .max_results(50)
    .execute();

res.json({ images: result.resources, next_cursor: result.next_cursor });
```

---

#### Step 3 — Upload Image to Cloudinary (`cloudinaryController.js`)
```js
// POST /api/admin/cloudinary/upload
// Image arrives as file buffer (via multer), streamed directly to Cloudinary
const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'mahalaxmi_tailoring', resource_type: 'auto' },
    (error, result) => resolve(result)
);
uploadStream.end(file.buffer); // push file bytes into stream

// Response: { secure_url: "https://res.cloudinary.com/...", public_id: "..." }
```
> Image is never saved on our server disk — it's streamed directly to Cloudinary. ✅

---

#### Step 4 — Admin picks image from UI (`CloudinaryImagePicker.jsx`)
```js
// Opens a modal showing Cloudinary folders + images
const imageRes = await api.get('/admin/cloudinary/images', { params: { folder: path } });
setImages(imageRes.data.images); // display as grid

// When admin clicks an image:
onSelect([img.secure_url]); // pass URL back to AdminProducts or AdminCMS
```

---

#### Step 5 — URL saved in MongoDB, used in frontend
```js
// Product/CMS saves: images: ["https://res.cloudinary.com/xyz/..."]
// Customer page renders:
<img src={product.images[0]} />
// Image loads directly from Cloudinary CDN — fast, globally cached
```

---

### Helmet's Role with Cloudinary
Since Helmet blocks external image sources by default, it's explicitly allowed:
```js
// server.js
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            imgSrc: ["'self'", "https://res.cloudinary.com"], // ← whitelist Cloudinary
        }
    }
}));
```

---

### 🟢 Simple English Explanation

When the admin wants to add a product image, they open the **Image Picker** on the admin panel. This picker calls our backend, which talks to Cloudinary and shows all uploaded images in a nice grid. If the admin wants to upload a new photo, they select the file — our backend receives it and streams it directly to Cloudinary without saving it on our server. Cloudinary stores the image and gives back a permanent link (URL). The admin picks an image and that URL is saved in MongoDB. When a customer visits the product page, their browser loads the image directly from Cloudinary's fast global network — our server is not involved at all.

---

### Summary

| Step | Where | What |
|------|-------|------|
| Configure | Backend | API keys from `.env` |
| Browse images | Frontend → Backend → Cloudinary | `cloudinary.search` |
| Upload image | Frontend → Backend → Cloudinary | `upload_stream` (no disk save) |
| Admin picks image | Frontend | `secure_url` sent to parent component |
| URL saved | Backend | Stored in MongoDB with Product/CMS |
| Customer views | Browser → Cloudinary CDN | Image loaded directly, server not involved |
| Helmet | Backend | Whitelists `res.cloudinary.com` in CSP |

---

## Q9. How is Jitsi Meet integrated in this project?

### What is Jitsi Meet?
Jitsi Meet is a **free, open-source video calling platform** (like Google Meet).
No SDK installation needed. No API keys. No billing.
You just generate a **unique room URL** → anyone who opens it joins the video call instantly.

---

### Complete Flow (Step by Step)

```mermaid
sequenceDiagram
    participant C as 👤 Customer (AppointmentBooking.jsx)
    participant B as ⚙️ Backend (appointmentController.js)
    participant J as 📹 Jitsi Meet (meet.jit.si)
    participant A as 🧑‍💼 Admin Dashboard

    C->>B: [1] POST /api/appointments { type: "video", date, time }
    Note over B: type === 'video' → generate unique Jitsi URL
    B->>B: meetingLink = "https://meet.jit.si/MahalxmiTailors-userId-randomId"
    B->>B: Save appointment + meetingLink to MongoDB
    B-->>C: { appointment with meetingLink }

    Note over C,B: At appointment time...

    C->>J: [2] Customer clicks "Join Call" → opens meetingLink in browser
    A->>J: [3] Admin opens same meetingLink → joins same room
    Note over C,J: Video call happens directly on Jitsi servers
    Note over A,J: Our backend is NOT involved in the call at all
```

---

### Code: Step by Step

#### Step 1 — Generate Jitsi Link on Booking (`appointmentController.js`)
```js
// Only for video appointments
if (type === 'video') {
    const uniqueId = Math.random().toString(36).substring(7); // random 7-char string
    meetingLink = `https://meet.jit.si/MahalxmiTailors-${req.user._id}-${uniqueId}`;
    //  e.g. → https://meet.jit.si/MahalxmiTailors-6624abc-k3f9p2
}

// Save with appointment
await Appointment.create({ user, type, date, time, meetingLink });
```
> No Jitsi API call needed. Just constructing a URL with a unique room name.  
> Anyone who opens the same URL joins the same room automatically.

---

#### Step 2 — Customer Sees "Join Call" Button (`AppointmentBooking.jsx`)
```jsx
// Only shows if: type=video, status=scheduled, meetingLink exists
{apt.type === 'video' && apt.status === 'scheduled' && apt.meetingLink && (
    <a
        href={apt.meetingLink}
        target="_blank"        // opens in new tab
        rel="noopener noreferrer"
    >
        <Video size={16} /> Join Call
    </a>
)}
```

---

#### Step 3 — Admin & Customer Join the Same Room
Both open the same URL → Jitsi puts them in the same room.
```
Customer:  https://meet.jit.si/MahalxmiTailors-6624abc-k3f9p2  ─┐
Admin:     https://meet.jit.si/MahalxmiTailors-6624abc-k3f9p2  ─┘ same room ✅
```

---

### 🟢 Simple English Explanation

When a customer books a **Video Call** appointment, the backend generates a unique Jitsi link by combining the customer's ID and a random string. This link is saved with the appointment in MongoDB. At the appointment time, the customer sees a **"Join Call"** button in their dashboard — clicking it opens Jitsi Meet in a new tab. The admin opens the same link from their side. Both join the same video room. No API key, no payment, no extra setup — Jitsi's public server handles everything. Our backend's only job was to **generate and store the unique room URL**.

---

### Why Jitsi and not Zoom/Google Meet?

| Feature | Jitsi Meet | Zoom / Google Meet |
|---------|------------|-------------------|
| **Cost** | ✅ Free forever | ❌ Paid after limits |
| **API Key needed** | ✅ No | ❌ Yes |
| **Self-hosted option** | ✅ Yes | ❌ No |
| **Setup complexity** | ✅ Just a URL | ❌ SDK + OAuth |
| **Used in this project** | ✅ Yes | ❌ No |

---

### Summary

| Step | Where | What |
|------|-------|------|
| Customer books video appointment | Frontend → Backend | POST /appointments with type: "video" |
| Generate meeting link | Backend | `meet.jit.si/MahalxmiTailors-{userId}-{random}` |
| Save link | Backend | Stored in MongoDB with appointment |
| Join Call button | Frontend | Shown only when status = scheduled |
| Video call happens | Jitsi servers | Our backend NOT involved |

---

## Q10. What is i18n and how is it used in this project?

### What is i18n?
**i18n** = **Internationalization** (18 letters between 'i' and 'n').
It is the process of making your app support **multiple languages** without changing the core code.

In this project: **English ↔ Marathi** switching using the `react-i18next` library.

---

### Complete Flow

```mermaid
sequenceDiagram
    participant U as 👤 User (Browser)
    participant L as 🌐 LanguageDetector
    participant B as 📦 i18next-http-backend
    participant F as 📄 /locales/mr/translation.json

    U->>L: [1] App loads → detect browser language
    L-->>B: language = 'mr' (or 'en' as fallback)
    B->>F: [2] GET /locales/mr/translation.json
    F-->>B: { "welcome": "स्वागत आहे", ... }
    B-->>U: Translations loaded into memory

    U->>U: [3] User clicks "मराठी" toggle button
    Note over U: i18n.changeLanguage('mr')
    U->>F: Reload translations for new language
    F-->>U: All t('key') values update instantly
    Note over U: Page re-renders in Marathi — no page reload
```

---

### Code: Step by Step

#### Step 1 — Setup (`i18n.js`)
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';         // loads JSON files from /public/locales/
import LanguageDetector from 'i18next-browser-languagedetector'; // auto-detect browser lang

i18n
    .use(HttpApi)            // fetch translation files over HTTP
    .use(LanguageDetector)   // auto-detect user's browser language
    .use(initReactI18next)   // connect to React
    .init({
        fallbackLng: 'en',   // default to English if language not found
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json', // file path pattern
            // e.g. /locales/mr/translation.json for Marathi
        },
    });
```

---

#### Step 2 — Translation JSON files (`/public/locales/`)
```
public/
  locales/
    en/
      translation.json  →  { "welcome": "Welcome", "cart": "Cart" }
    mr/
      translation.json  →  { "welcome": "स्वागत आहे", "cart": "कार्ट" }
```

---

#### Step 3 — Language Toggle Button (`LanguageToggle.jsx`)
```jsx
const { i18n } = useTranslation();

const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang); // switch instantly, no page reload
};

// Button shows opposite language label
<span>{i18n.language === 'en' ? 'मराठी' : 'English'}</span>
```

---

#### Step 4 — Language Switch via Chatbot (`ChatWidget.jsx`)
User can also type in chatbot to switch language:
```js
if (text === 'action:toggleLanguage') {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang); // same function, triggered from chatbot
    setMessages([...msgs, { type: 'bot', text: `Language changed to ${newLang === 'en' ? 'English' : 'Marathi'}` }]);
}
```
> Chatbot has a **"Change Language"** quick-action button that fires this command.

---

### 🟢 Simple English Explanation

This project supports **two languages: English and Marathi**. When the app loads, it automatically detects the user's browser language. All text labels are stored in JSON files — one for English, one for Marathi. When the user clicks the **"मराठी"** button in the navbar (or uses the chatbot's "Change Language" button), `i18n.changeLanguage()` is called and the entire app instantly switches to Marathi — no page refresh needed. If a translation is missing, it automatically falls back to English.

---

### Libraries Used

| Library | Role |
|---------|------|
| `i18next` | Core engine — manages translations |
| `react-i18next` | React hooks (`useTranslation`, `t()`) |
| `i18next-http-backend` | Loads JSON translation files from `/public/locales/` |
| `i18next-browser-languagedetector` | Auto-detects browser language on first load |

---

### Summary

| Step | Where | What |
|------|-------|------|
| App loads | `i18n.js` + LanguageDetector | Detect browser language automatically |
| Load translations | HttpBackend | Fetch `/locales/en/translation.json` |
| User toggles | `LanguageToggle.jsx` | `i18n.changeLanguage('mr')` |
| User uses chatbot | `ChatWidget.jsx` | Same `changeLanguage()` via chat command |
| Text renders | Any component | `t('key')` returns translated string |
| Missing key | Fallback | Always falls back to English |

---

## Q11. What is a Rate Limiter and how is it used in this project?

### What is a Rate Limiter?
A rate limiter **restricts how many requests a single IP can make** in a given time window.
It protects the server from:
- **Brute force attacks** (trying thousands of passwords)
- **DDoS attacks** (flooding server with requests)
- **API abuse** (bots hammering your endpoints)

---

### How it Works

```mermaid
sequenceDiagram
    participant C as 👤 Client (IP: 1.2.3.4)
    participant R as 🚦 Rate Limiter Middleware
    participant S as ⚙️ Server / Route Handler

    C->>R: Request #1 to /api/...
    R->>R: Count: 1/5000 → OK
    R->>S: Forward request
    S-->>C: 200 Response

    C->>R: Request #4999 to /api/...
    R->>R: Count: 4999/5000 → OK
    R->>S: Forward request
    S-->>C: 200 Response

    C->>R: Request #5001 to /api/...
    R->>R: Count: 5001 → LIMIT EXCEEDED ❌
    R-->>C: 429 Too Many Requests (blocked)
    Note over R: Counter resets after 15 minutes
```

---

### Code in This Project (`server.js`)

```js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes time window
    max: 5000,                 // max 5000 requests per IP in that window
});

app.use('/api', limiter); // applied to ALL /api/* routes
```

> ⚠️ `max: 5000` is very high — intentionally relaxed for development.  
> In production, a stricter limit like `max: 100` is recommended.

---

### What Happens When Limit is Exceeded?

```js
// Client gets:
HTTP 429 Too Many Requests
{ "message": "Too many requests, please try again later." }

// Headers sent back:
X-RateLimit-Limit: 5000       // max allowed
X-RateLimit-Remaining: 0      // how many left
X-RateLimit-Reset: 1234567890 // timestamp when window resets
```

---

### 🟢 Simple English Explanation

Imagine a shop that allows only 5000 customers to enter every 15 minutes. If the 5001st customer tries to enter, the guard stops them and says "come back later." That's exactly what a rate limiter does for API requests. Every time a request hits `/api/*`, the rate limiter checks how many requests that IP has already made in the last 15 minutes. If it's under the limit — request goes through. If not — it returns a `429 Too Many Requests` error and the client must wait for the window to reset.

---

### Types of Rate Limiting (Interview)

| Type | How it works | Example |
|------|-------------|---------|
| **Fixed Window** | Count resets at fixed time intervals | 100 req per minute, resets at :00 |
| **Sliding Window** | Rolling time window, smoother | 100 req in any 60-second period |
| **Token Bucket** | Tokens refill at fixed rate, burst allowed | Used in AWS, Nginx |
| **IP-based** ✅ (this project) | Limit per client IP | 5000/15min per IP |
| **User-based** | Limit per logged-in user | 100 req/min per user account |

---

### Summary

| What | Value in This Project |
|------|-----------------------|
| Library | `express-rate-limit` |
| Time Window | 15 minutes |
| Max Requests | 5000 per IP |
| Applied To | All `/api/*` routes |
| When exceeded | `429 Too Many Requests` |
| Counter reset | After 15-minute window ends |

---

## Q12. What are the 5 CI/CD stages used in this project?

### What is CI/CD?
- **CI (Continuous Integration)** → automatically test code on every push
- **CD (Continuous Deployment)** → automatically deploy to server after tests pass
- Tool used: **Jenkins** (self-hosted automation server)

---

### 5 Stages in the Jenkinsfile

```mermaid
flowchart LR
    A([🔁 Code Push\nto GitHub]) --> B

    B[1️⃣ Checkout\nPull code from GitHub]
    B --> C[2️⃣ Lint & Test\nBackend\nnpm install + npm test]
    C --> D[3️⃣ Lint & Test\nFrontend\nnpm install + npm run build]
    D --> E[4️⃣ Deploy Backend\nto EC2 via SSH\npm2 reload]
    E --> F{5️⃣ Ansible\nOptional?}
    F -- YES --> G[Run Ansible\nPlaybook\nProvision server]
    F -- NO --> H

    G --> H([✅ Success\nor ❌ Failure\nnotification])
```

---

### Each Stage Explained

#### Stage 1 — Checkout
```groovy
stage('Checkout') {
    steps {
        git branch: 'main',
            url: 'https://github.com/ayushdayal900/Mahalaxmi-Tailoring.git'
    }
}
```
> Jenkins pulls the latest code from the `main` branch of GitHub.

---

#### Stage 2 — Lint & Test (Backend)
```groovy
stage('Lint & Test (Backend)') {
    steps {
        dir('backend') {
            sh 'npm install'         // install dependencies
            sh 'npm test --if-present' // run Jest tests (skips if no test script)
        }
    }
}
```
> If tests fail → pipeline stops here. Code does NOT get deployed. ✅

---

#### Stage 3 — Lint & Test (Frontend)
```groovy
stage('Lint & Test (Frontend)') {
    steps {
        dir('frontend') {
            sh 'npm install'     // install React dependencies
            sh 'npm run build'   // build production bundle (Vite)
        }
    }
}
```
> If build fails (e.g. syntax error in JSX) → pipeline stops. Nothing gets deployed.

---

#### Stage 4 — Deploy Backend to EC2
```groovy
stage('Deploy Backend to EC2') {
    steps {
        sshagent(credentials: ['ec2-ssh-key']) {
            sh '''
                ssh ubuntu@3.109.162.148 "
                    cd /home/ubuntu/Mahalaxmi-Tailoring &&
                    git fetch origin &&
                    git reset --hard origin/main &&   // pull latest code on server
                    cd backend &&
                    npm install --production &&        // install only prod deps
                    pm2 reload mahalaxmi-backend --update-env  // restart app with PM2
                "
            '''
        }
    }
}
```
> Jenkins SSHes into the AWS EC2 server, pulls latest code, and restarts the Node.js backend using **PM2** (process manager — keeps app alive after crash).

---

#### Stage 5 — Ansible Provisioning (Optional)
```groovy
stage('Run Ansible Provisioning (Optional)') {
    when {
        expression { params.RUN_ANSIBLE == true } // only if manually triggered
    }
    steps {
        ansiblePlaybook(
            playbook: 'ansible/playbook.yml',  // infra setup script
            inventory: 'ansible/inventory.ini', // list of servers
            extras: '-e "env=production"'
        )
    }
}
```
> Only runs when manually enabled. Used for **server provisioning** (installing Node, Nginx, PM2 on a fresh EC2). Not needed on every deploy.

---

### Post Actions
```groovy
post {
    success { echo '✅ Deployment successful!' }
    failure  { echo '❌ Deployment failed! Check the logs.' }
    // optional: email notification on failure
}
```

---

### 🟢 Simple English Explanation

When a developer pushes code to GitHub, Jenkins automatically wakes up and runs 5 steps in order. First it **pulls the latest code**. Then it **tests the backend** — if tests fail, everything stops and nothing is deployed. Next it **builds the frontend** — if there's a JS error, again everything stops. If both pass, Jenkins **SSHs into the AWS server** and restarts the backend using PM2. The 5th step is optional — it runs Ansible only when manually triggered to set up a brand-new server. If all goes well, Jenkins prints ✅ success; if anything fails, it prints ❌ failure.

---

### Summary

| Stage | Tool | What it does |
|-------|------|-------------|
| 1. Checkout | Git | Pull latest code from GitHub `main` |
| 2. Test Backend | npm + Jest | Install deps, run unit tests |
| 3. Build Frontend | npm + Vite | Install deps, build production bundle |
| 4. Deploy to EC2 | SSH + PM2 | Pull code on server, restart backend |
| 5. Ansible (Optional) | Ansible | Provision fresh server infra |

---

## Q13. What backend tests are implemented in this project?

### Test Location
The backend tests are located in `backend/tests/`. Currently, there is only one test file: `order.test.js`.

### Test Stack
The backend tests use **Jest** and **Supertest**:
- **Jest:** The testing framework (provides `describe`, `it`, `expect`, mocking).
- **Supertest:** Used to test HTTP requests to the Express app (`request(app).post(...)`).

---

### Implemented Tests (`order.test.js`)

Currently, there is a single integration test for the Order API:

**Test Description:**
- **Suite:** `Order API Integration`
- **Test Case:** `should calculate total amount correctly`

#### What the test does:
1. **Mocks Authentication:** It bypasses the real login process by mocking the `protect` middleware to inject a fake user ID.
2. **Mocks MongoDB:** It mocks the `Order` model so it doesn't actually write to a real database. It intercepts the `.save()` method to return a predefined order object.
3. **Simulates Request:** It uses Supertest to send a `POST /api/orders` request with sample order items and a total amount.
4. **Verifies Response:** It checks if the response status code is `201` (Created) and if an `orderNumber` is returned.

---

### Example Code Snippet
```js
// Mocks the auth middleware to skip JWT verification for testing
jest.mock('../middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        req.user = { _id: '507f1f77bcf86cd799439011', role: 'customer' };
        next();
    }
}));

// The actual test
it('should calculate total amount correctly', async () => {
    // Mocks the DB save
    Order.prototype.save = jest.fn().mockResolvedValue({
        _id: 'order_123',
        orderNumber: 'ORD-123',
        totalAmount: 1500
    });

    const res = await request(app)
        .post('/api/orders')
        .send({ /* ... order payload ... */ });

    expect(res.statusCode).toEqual(201);
    expect(res.body.orderNumber).toBeDefined();
});
```

---

## Q14. What is PM2 and what commands are used to continuously run the backend on EC2?

### What is PM2?
PM2 is a **Production Process Manager for Node.js applications**. 
If you run your backend using `node server.js`, the process will stop immediately if the terminal is closed or if the app crashes due to an error. 

PM2 solves this by:
1. **Running your app in the background** (as a daemon).
2. **Auto-restarting** the app if it crashes.
3. **Starting the app automatically** when the server (EC2 instance) reboots.

---

### PM2 Commands to Run Backend on EC2

Here are the step-by-step commands you would run on the EC2 server to set up and manage the backend with PM2:

#### 1. Start the App for the First Time
Navigate to your backend directory and start the server, giving it a memorable name:
```bash
cd /home/ubuntu/Mahalaxmi-Tailoring/backend
pm2 start server.js --name "mahalaxmi-backend"
```
*This starts your app in the background and PM2 will now monitor it.*

#### 2. Ensure PM2 Starts on Server Reboot
If the AWS EC2 instance restarts, PM2 needs to know how to bring your apps back online automatically.
```bash
# Step A: Generate the startup script (run this once)
pm2 startup

# Step B: Save the current list of running apps so PM2 remembers them
pm2 save
```
*After running `pm2 save`, "mahalaxmi-backend" will automatically restart if the EC2 instance reboots.*

#### 3. Update the App (After a Deployment)
When you deploy new code (as seen in the `Jenkinsfile`), you need to reload the app with the new code without downtime:
```bash
pm2 reload mahalaxmi-backend --update-env
```
*`reload` achieves a zero-downtime restart. `--update-env` ensures any changes to the `.env` file are picked up.*

---

### Other Useful PM2 Commands (For Debugging & Monitoring)

| Command | What it does |
|---------|--------------|
| `pm2 list` | Shows a table of all running apps, their status, CPU, and memory usage. |
| `pm2 logs mahalaxmi-backend` | Shows real-time console logs (errors and console.logs) for the app. |
| `pm2 stop mahalaxmi-backend` | Stops the application. |
| `pm2 restart mahalaxmi-backend` | Hard restarts the application (causes brief downtime, unlike `reload`). |
| `pm2 delete mahalaxmi-backend` | Stops and removes the app from PM2's management list. |
| `pm2 monit` | Opens a terminal-based dashboard showing live metrics and logs. |

---

## Q15. What are some potential modifications and future objectives for this project?

While the current architecture (MERN, Razorpay, Cloudinary, JWT, Jitsi, Jenkins) is solid for an MVP/mid-scale application, here are several professional upgrades that can be implemented for scale, security, and maintainability:

### 1. Testing & Quality Assurance
- **Expand Backend Tests:** Currently, there is only one integration test (`order.test.js`). Expand unit and integration tests across all controllers (Auth, Products, Payments) using Jest.
- **Frontend Testing:** Implement component testing using **React Testing Library** and end-to-end (E2E) testing using **Cypress** to simulate actual user flows (e.g., adding to cart, checkout).
- **Code Quality Checks:** Integrate tools like **SonarQube** or **ESLint** directly into the Jenkins pipeline to block deployments if code quality drops.

### 2. Infrastructure & Deployment (DevOps)
- **Containerization (Docker):** Wrap the frontend and backend in Docker containers. This ensures the app runs identically on a developer's laptop and the AWS server, removing "it works on my machine" issues.
- **Auto-Scaling:** Move away from a single EC2 instance. Place the EC2 instances in an **AWS Auto Scaling Group** behind an **Application Load Balancer (ALB)** to automatically handle traffic spikes.
- **Database Scalability:** Currently, MongoDB is likely hosted directly or on a single cluster. Consider migrating to **MongoDB Atlas** (fully managed) for automatic backups, scaling, and high availability.

### 3. Performance & Caching
- **Redis Integration:** Implement **Redis** to cache frequently accessed but rarely changed data (like the product catalog or homepage designs). This drastically reduces MongoDB read operations and speeds up API response times.
- **Frontend CDN:** While images are on Cloudinary, ensure the React static build files (JS/CSS) are served via a CDN (like AWS CloudFront or Vercel's Edge Network) for faster global load times.

### 4. Security Enhancements
- **Production Rate Limiting:** The current rate limit is `5000` requests per 15 minutes (development friendly). Reduce this to a stricter limit (e.g., `100` req/15min) in production.
- **Two-Factor Authentication (2FA):** Implement OTP or Authenticator app (like Google Authenticator) support, especially for **Admin** accounts, to secure the CMS and customer data.
- **Advanced Logging & Monitoring:** Replace basic `console.log` with a structured logger like **Winston** or **Morgan**. Integrate an error tracking service like **Sentry** to get immediate alerts when the app crashes in production.

### 5. Application Features
- **Webhooks Reliability:** Ensure the Razorpay webhook handles duplicate events gracefully (idempotency) so an order isn't processed twice if Razorpay retries the webhook.
- **Email/SMS Notifications:** Integrate AWS SES, SendGrid, or Twilio to send automated order confirmations and tracking updates to customers.
- **Advanced Chatbot:** Upgrade the current rule-based/simple chatbot to an AI-powered assistant (e.g., OpenAI integration) capable of answering complex custom tailoring questions.

---

*Add more Q&A entries below as needed.*
