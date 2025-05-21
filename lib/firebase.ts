import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Log environment variables (safely)
console.log("Environment check:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Not set",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Set" : "Not set",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Set" : "Not set",
  // Other env vars...
})

// Your web app's Firebase configuration
// For v0 testing, we'll use a conditional approach
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// For v0 testing only - mock configuration if we detect we're in v0
// This is a workaround for v0 environment variable handling
const isV0Environment = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")
const mockConfig = {
  apiKey: "mock-api-key-for-v0-testing",
  authDomain: "mock-project-id.firebaseapp.com",
  projectId: "mock-project-id",
  storageBucket: "mock-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789",
}

// Use mock config in v0 environment
const configToUse = isV0Environment ? mockConfig : firebaseConfig

console.log("Using Firebase config:", isV0Environment ? "Mock config for v0" : "Real config")

// Initialize Firebase
let app
let auth
let db
let storage

try {
  console.log("Initializing Firebase app...")
  app = getApps().length > 0 ? getApp() : initializeApp(configToUse)
  console.log("Firebase app initialized successfully")

  // Initialize Firebase services
  console.log("Initializing Firebase services...")
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  console.log("Firebase services initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase:", error)

  // Fallback for v0 environment if the first attempt failed
  if (isV0Environment && !app) {
    console.log("Attempting fallback initialization for v0...")
    try {
      app = initializeApp(mockConfig)
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
      console.log("Fallback initialization successful")
    } catch (fallbackError) {
      console.error("Fallback initialization failed:", fallbackError)
    }
  }
}

export { app, auth, db, storage }
