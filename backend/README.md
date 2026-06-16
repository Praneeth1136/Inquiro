# Perplexity Clone - Backend Service

This is the backend service for the Perplexity Clone project. It is built using Node.js, Express, MongoDB (Mongoose), Socket.io, and LangChain (Gemini & Mistral AI integrations).

---

## 📂 Project Structure

```
backend/
├── config/
│   └── database.js               # MongoDB Mongoose connection config
├── controller/
│   ├── auth.controller.js        # Auth actions (register, login, verify, resend-verification)
│   └── chat.controller.js        # Chat actions (sendMessage, getChats, getMessages, deleteChat)
├── middlewares/
│   └── auth.middleware.js        # JWT verification middleware
├── models/
│   ├── chat.model.js             # Chat model (User ref, Title, timestamps)
│   ├── message.model.js          # Message model (Chat ref, Content, Role [user/ai], timestamps)
│   └── user.model.js             # User model (Username, Email, Password [hashed], Verified flag)
├── routers/
│   ├── auth.router.js            # Auth routes (/register, /login, /verify-email, etc.)
│   └── chat.routes.js            # Chat routes (/message, /, /:chatId/messages, /delete/:chatId)
├── services/
│   ├── ai.service.js             # LangChain AI service (Gemini-3.1-flash-lite, Mistral-small-latest)
│   └── email.service.js          # Gmail OAuth2 Nodemailer service
├── src/
│   ├── app.js                    # Express application and middlewares setup
│   └── sockets/
│       └── server.socket.js      # Socket.io connection initialization
├── validators/
│   └── auth.validator.js         # Input validation rules (express-validator)
├── .env                          # Local environment secrets
├── package.json                  # Dependencies and execution scripts
└── server.js                     # HTTP Server entry point (starts server and MongoDB connection)
```

---

## 🛠️ Key Technologies & Dependencies

- **Runtime & Web Framework**: Node.js, Express (v5.x)
- **Database**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt
- **AI Integrations**:
  - `@langchain/google-genai` (utilizing `gemini-3.1-flash-lite` for generating assistant responses)
  - `@langchain/mistralai` (utilizing `mistral-small-latest` for auto-generating short chat titles)
  - `langchain` core abstractions (`HumanMessage`, `SystemMessage`, `AIMessage`)
- **Real-Time Communication**: `socket.io`
- **Verification & Emails**: `nodemailer` with Gmail OAuth2
- **Validation**: `express-validator`

---

## ⚙️ Environment Variables (`.env`)

Configure the following environment variables in `backend/.env`:

```env
PORT=3000
MONGODB_URL=mongodb://127.0.0.1:27017/perplexity
JWT_SECRET=your_jwt_secret_key

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Mistral AI API Key
MISTRAL_API_KEY=your_mistral_api_key

# Nodemailer Gmail OAuth2 credentials
GOOGLE_USER=your_gmail_address
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_oauth_refresh_token

# Application configuration
APP_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

1. **POST `/register`**
   - Validates user input (username >= 6 chars, email, password >= 6 chars).
   - Creates a new user with a hashed password (default `verified: false`).
   - Generates an email verification token (JWT) and sends a verification link via email.
2. **POST `/login`**
   - Authenticates username/password.
   - Requires email to be verified.
   - Returns a JWT token and sets it as a HTTP-only cookie (`token`).
3. **GET `/get-me`**
   - Auth-guarded endpoint. Returns current authenticated user's details.
4. **GET `/verify-email?token=TOKEN`**
   - Decodes verification JWT. Sets `verified: true` for the user and renders a confirmation page.
5. **POST `/resend-verification`**
   - Resends the verification email link.

### Chat & AI (`/api/chats`)

1. **POST `/message`**
   - Auth-guarded endpoint. Takes a user `message` and optional `chat` or `chatId` in the request body.
   - If starting a new session (no chat ID): Auto-generates a title (via Mistral) and creates a new `Chat` session.
   - Appends the message to the conversation history, calls the Gemini model to get the response, and records both user and AI message documents.
   - Returns JSON containing `title`, `response`, `chat`, and `aiMessage`.
2. **GET `/`**
   - Auth-guarded endpoint. Retrieves all chat sessions created by the authenticated user.
   - Returns JSON: `{ message: "chats retrieved successfully", success: true, chats }`.
3. **GET `/:chatId/messages`**
   - Auth-guarded endpoint. Verifies access and fetches all message documents associated with the specified `chatId`.
   - Returns JSON: `{ message: "messages retrieved successfully", success: true, messages }`.
4. **DELETE `/delete/:chatId`**
   - Auth-guarded endpoint. Validates ownership, deletes the chat document, and deletes all associated messages.
   - Returns JSON: `{ message: "chat deleted successfully", success: true }`.

---

## 🔗 Real-Time Sockets

- **Socket initialization**: Configured in `src/sockets/server.socket.js`.
- **Port**: Listened alongside HTTP server. Accepts CORS connections from the frontend (e.g., `http://localhost:5173` / `http://localhost:5174` / `http://localhost:5176`).
- **Events**: Prints socket connection updates (logs `A user connected: [socket.id]`).

---

## 🚀 Running the Server

Install dependencies:
```bash
npm install
```

Start the development server with automatic reloading (Nodemon):
```bash
npm run dev
```
