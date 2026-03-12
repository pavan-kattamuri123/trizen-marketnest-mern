# MarketNest - Mini Fashion Marketplace

MarketNest is a MERN stack-based mini fashion marketplace. It supports two user roles: **Brands (Sellers)** and **Customers (Users)**. Brands can manage their own products, upload multiple images, and view dashboard analytics. Customers can explore the marketplace, securely search, and filter through available fashion items.

## Architecture Explanation

This application follows a traditional decoupled Client-Server architecture:
- **Client (Frontend)**: A Single Page Application (SPA) built with React.js + Vite, styled with Tailwind CSS v3, and state managed using React Context API. It communicates with the backend via a preconfigured Axios instance that handles background token refreshes automatically.
- **Server (Backend)**: Built with Node.js and Express.js to expose RESTful API endpoints. It follows a layered approach (Routes -> Controllers -> Models -> Database).
- **Database**: MongoDB (via Mongoose ODM) handles document storage using structured schemas with references to enforce relational constraints.
- **Storage**: Cloudinary is used via `multer-storage-cloudinary` to capture and store image uploads seamlessly without touching the local disk permanently.

## Folder Structure Overview

```
trizen/
├── client/                     # Frontend React Code (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI elements (e.g., Navbar)
│   │   ├── contexts/           # React Context (AuthContext)
│   │   ├── pages/              # View pages (Login, Signup, Marketplace, BrandDashboard)
│   │   ├── utils/              # Helper functions (Axios interceptor)
│   │   ├── App.jsx             # React Router configuration
│   │   └── main.jsx            # Entry point
│   ├── tailwind.config.js      # Tailwind UI setup
│   └── package.json
└── server/                     # Backend API Code (Node + Express)
    ├── config/                 # DB connections and S3 configs
    ├── controllers/            # Core business logic methods
    ├── middlewares/            # Auth/Role checks & global error handling
    ├── models/                 # Mongoose schema definitions
    ├── routes/                 # Express API router definitions
    ├── utils/                  # Utility functions (JWT generation)
    ├── index.js                # Server entry point
    ├── .env                    # Environment variables (MUST BE CONFIGURED)
    └── package.json
```

## Authentication Flow Explanation

The application ensures highly secure authentication using short-lived Access Tokens and long-lived Refresh Tokens.
1. **Login/Signup**: Upon successful authentication, the server generates two JWTs:
   - **Access Token (15m)**: Returned in the JSON response payload. The frontend saves this in memory / LocalStorage for immediate use.
   - **Refresh Token (7d)**: Attached automatically to the response as a secure, `httpOnly` cookie.
2. **Standard API Requests**: The client explicitly passes the Access Token in the `Authorization: Bearer <token>` header on protected API calls.
3. **Automatic Refresh**: When the Access Token expires, API calls will return `401 Unauthorized`. The custom Axios interceptor intercepts this error, makes an automatic background request to `/api/auth/refresh` (sending the `httpOnly` refresh cookie), retrieves a new Access Token, replaces the headers, and transparently retries the failed API call.

## Security Decisions

1. **httpOnly Refresh Tokens**: By placing the long-lived refresh token in an `httpOnly` cookie, it is completely immune to Cross-Site Scripting (XSS) attacks in the browser.
2. **Short-lived Access Tokens**: Access tokens expire in 15 minutes, drastically limiting the window of exposure if a token is somehow compromised.
3. **Role-Based Access Control (RBAC)**: All sensitive routes strictly check `req.user.role`. A Customer token can never be used to access Brand endpoints.
4. **Ownership Verification Checks**: Server-side logic explicitly verifies that `product.brand.toString() === req.user._id.toString()` before allowing edits or deletions. A Brand cannot manipulate another Brand's items.
5. **Soft Deletes**: Deleting products simply flips an `isDeleted` flag on the database, preserving audit trails and preventing orphaned references.
6. **Password Hashing**: `bcryptjs` is utilized systematically via Mongoose `pre('save')` hooks enforcing unidirectional password generation.

## Explanations of AI Tools

AI assistance was heavily utilized to scaffold the project structure comprehensively. Prompt-driven automation accelerated generating repetitious configurations (Express App initializations, MongoDB Connection handlers, Tailwind setup, Mongoose schema formulations), generating custom `Axios` interceptor implementations natively tuned for the advanced Refresh Token rotation constraint, and styling the frontend interfaces rapidly without manual CSS boilerplate iteration.

## Deployment Preparation

To deploy this project:
1. Ensure the `server/.env` is hydrated natively for the target deployment.
2. Add build commands for the `client` and point Express static serving locally if you plan to host the SPA directly out from Express, or deploy independently on Vercel/Netlify.
3. Setup MongoDB Atlas and Cloudinary configurations in Production.
