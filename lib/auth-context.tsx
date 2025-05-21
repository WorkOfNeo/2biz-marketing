"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

// User type
type User = {
  uid: string
  email: string | null
  role: "super_admin" | "member" | "viewer"
  status: "pending" | "active"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Check if we're in v0 environment
const isV0Environment = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // For v0 environment, provide a mock user option
  const useMockAuth = isV0Environment

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener...")
    console.log("Environment:", isV0Environment ? "v0 preview" : "production")

    // If we're in v0, we can use a mock user for testing
    if (useMockAuth) {
      console.log("Using mock authentication for v0 environment")
      setUser({
        uid: "mock-user-id",
        email: "admin@example.com",
        role: "super_admin",
        status: "active",
      })
      setIsLoading(false)
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "No user")

      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          console.log("Fetching user data from Firestore for:", firebaseUser.uid)
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
            console.log("User document exists, data:", userDoc.data())
            const userData = userDoc.data() as Omit<User, "uid">
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role || "viewer", // Default to viewer if role is not set
              status: userData.status || "pending",
            })
          } else {
            // If user document doesn't exist yet, create it
            console.log("User document doesn't exist, creating...")
            await setDoc(doc(db, "users", firebaseUser.uid), {
              email: firebaseUser.email,
              role: "viewer", // Changed default role to viewer
              status: "pending",
            })
            console.log("User document created successfully")

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "viewer", // Changed default role to viewer
              status: "pending",
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      console.log("Cleaning up auth state listener")
      unsubscribe()
    }
  }, [useMockAuth])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login for:", email)

      // For v0 environment, use mock login
      if (useMockAuth) {
        console.log("Using mock login for v0 environment")
        setUser({
          uid: "mock-user-id",
          email: email,
          role: "super_admin",
          status: "active",
        })
        return true
      }

      setIsLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login successful for:", email)

      // Check user status
      console.log("Checking user status in Firestore")
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log("User status:", userData.status)

        if (userData.status === "pending") {
          console.log("User account is pending approval, signing out")
          await signOut(auth)
          toast({
            variant: "destructive",
            title: "Account pending approval",
            description: "Your account is awaiting admin approval.",
          })
          return false
        }
      }

      return true
    } catch (error: any) {
      console.error("Login error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)

      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Starting signup process for:", email)

      // For v0 environment, use mock signup
      if (useMockAuth) {
        console.log("Using mock signup for v0 environment")
        toast({
          title: "Account created",
          description:
            "Your account has been created successfully. In a real environment, you would need admin approval.",
        })
        return true
      }

      setIsLoading(true)

      console.log("Firebase auth instance check:", auth ? "Valid" : "Invalid")
      console.log("Creating user with Firebase Auth...")
      console.log("Email:", email)
      console.log("Password length:", password.length)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("User created successfully:", userCredential.user.uid)

      // Create user document in Firestore
      console.log("Firestore db instance check:", db ? "Valid" : "Invalid")
      console.log("Creating user document in Firestore...")
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          role: "viewer", // Changed default role to viewer
          status: "pending",
          createdAt: new Date().toISOString(),
        })
        console.log("User document created successfully")
      } catch (firestoreError) {
        console.error("Firestore error during user creation:", firestoreError)
        throw firestoreError
      }

      // Sign out after registration since they need approval
      console.log("Signing out user after registration...")
      await signOut(auth)
      console.log("User signed out successfully")

      return true
    } catch (error: any) {
      console.error("Signup error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)

      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "An error occurred during signup.",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      console.log("Logging out user")

      // For v0 environment, use mock logout
      if (useMockAuth) {
        console.log("Using mock logout for v0 environment")
        setUser(null)
        router.push("/login")
        return
      }

      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      console.log("Sending password reset email to:", email)

      // For v0 environment, use mock reset
      if (useMockAuth) {
        console.log("Using mock password reset for v0 environment")
        toast({
          title: "Reset email sent",
          description: "If your email is registered, you'll receive a password reset link.",
        })
        return true
      }

      await sendPasswordResetEmail(auth, email)
      console.log("Password reset email sent successfully")
      return true
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "Please check your email and try again.",
      })
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
