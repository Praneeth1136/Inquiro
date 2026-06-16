# Perplexity Clone - React + Vite Frontend

This is the frontend client for the Perplexity Clone project. It is built using React (v19), Vite, Redux Toolkit (for global state management), React Router DOM (for page navigation), and Socket.io-client (for real-time streaming).

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.jsx               # Entry component (checks current auth session)
│   │   ├── app.routes.jsx        # React Router routes (/login, /register, /)
│   │   ├── app.store.js          # Redux Toolkit store setup
│   │   └── index.css             # Main styling entry point
│   ├── features/
│   │   ├── auth/                 # Authentication Feature
│   │   │   ├── components/
│   │   │   │   └── Protected.jsx # Route guard component (redirects to /login if unauthenticated)
│   │   │   ├── hooks/
│   │   │   │   └── userAuth.js   # Custom hook managing register, login, & getMe logic
│   │   │   ├── pages/
│   │   │   │   ├── Home.jsx      # Generic Home page
│   │   │   │   ├── Login.jsx     # Login form page
│   │   │   │   └── Register.jsx  # Register form page
│   │   │   ├── services/
│   │   │   │   └── auth.api.js   # Axios API client requests for authentication
│   │   │   └── auth.slice.js     # Redux slice (user state, loading, errors)
│   │   └── chat/                 # Chat Feature
│   │       ├── hooks/
│   │       │   └── useChat.js    # Custom hook exposing socket initialization
│   │       ├── pages/
│   │       │   └── Dashboard.jsx # Chat room / main query user interface
│   │       └── services/
│   │           └── chat.socket.js# Socket.io connection instance and events
│   └── main.jsx                  # Main entry point (loads Redux Provider & App)
├── public/                       # Static public assets
├── tailwind.config.js            # TailwindCSS styling configuration
├── vite.config.js                # Vite development server configuration
├── .env                          # Local environment variables
└── package.json                  # Frontend dependencies and run scripts
```

---

## 🛠️ Key Technologies & Dependencies

- **Framework**: React (v19) & Vite
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router DOM (v7)
- **API Client**: Axios (configured to send cookies via `withCredentials`)
- **Real-Time Client**: `socket.io-client`
- **Styling**: TailwindCSS (v4)

---

## ⚙️ Environment Configuration (`.env`)

Verify your environment variables file in `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🚦 Routes & Guards

- **`/register`**: Unprotected page containing the user registration form.
- **`/login`**: Unprotected page containing the login form.
- **`/`**: Protected route wrapping the `<Dashboard />` component. Requires active authentication (monitored via the Redux `auth.user` state).
- **`/dashboard`**: Automatically redirects back to `/`.

---

## 📦 Global State Management (Redux Store)

The state is managed using Redux Toolkit in `src/app/app.store.js`.
- **`auth` slice**:
  - `user`: Holds details of the currently authenticated user (`id`, `username`, `email`).
  - `loading`: Tracks active asynchronous requests (true during API calls).
  - `error`: Stores API response error messages to display inside the UI forms.

---

## 🔗 Socket Integration

- Inside the protected `<Dashboard />`, `useChat()` triggers `initializeSocketConnection()`.
- Establishes a Socket.io connection to the backend server (`http://localhost:3000`).
- Configures credentials passing (`withCredentials: true`) to authenticate socket sessions if necessary.

---

## 🚀 Running the App

Install dependencies:
```bash
npm install
```

Start the Vite development server locally:
```bash
npm run dev
```

The app will typically load at `http://localhost:5173` or `http://localhost:5174`.
