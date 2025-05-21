"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { db } from "./firebase"
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { useAuth } from "./auth-context"
import type { Report } from "./types/report"

// Check if we're in v0 environment
const isV0Environment = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

interface ReportsContextType {
  reports: Report[]
  isLoading: boolean
  addReport: (report: Omit<Report, "id" | "createdAt" | "updatedAt" | "createdBy">) => Promise<string>
  updateReport: (
    id: string,
    report: Partial<Omit<Report, "id" | "createdAt" | "updatedAt" | "createdBy">>,
  ) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  getReportById: (id: string) => Report | undefined
  generateReport: (id: string) => Promise<string> // Returns a URL to the generated report
  scheduleReport: (id: string, schedule: Report["schedule"]) => Promise<void>
}

// Mock data for v0 environment
const mockReports: Report[] = [
  {
    id: "report1",
    name: "Monthly Performance Report",
    description: "Overview of marketing performance for the current month",
    widgets: [
      {
        id: "widget1",
        name: "Total Impressions",
        type: "number",
        metrics: ["metric1"],
        timeRange: "this-month",
        filters: [],
        layout: { x: 0, y: 0, w: 1, h: 1 },
        displayOptions: {
          title: "Total Impressions",
          format: "number",
          showChange: true,
          comparisonTimeRange: "last-month",
        },
      },
      {
        id: "widget2",
        name: "Engagement Rate",
        type: "percentage",
        metrics: ["metric2"],
        timeRange: "this-month",
        filters: [],
        layout: { x: 1, y: 0, w: 1, h: 1 },
        displayOptions: {
          title: "Engagement Rate",
          format: "percentage",
          decimals: 2,
          showChange: true,
          comparisonTimeRange: "last-month",
        },
      },
    ],
    timeRange: "this-month",
    formats: ["pdf", "excel"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "user1",
  },
]

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Use mock data for v0 environment
  const useMockData = isV0Environment

  // Load reports from Firestore
  useEffect(() => {
    console.log("ReportsProvider: Initializing...")
    console.log("ReportsProvider: User:", user?.email, "Role:", user?.role)
    console.log("ReportsProvider: Using mock data:", useMockData)

    if (useMockData) {
      console.log("ReportsProvider: Setting mock data")
      setReports(mockReports)
      setIsLoading(false)
      return
    }

    if (!user) {
      console.log("ReportsProvider: No user, skipping data load")
      setIsLoading(false)
      return
    }

    const loadReports = async () => {
      try {
        console.log("ReportsProvider: Loading reports from Firestore...")
        setIsLoading(true)

        // Check if reports collection exists, if not create it
        const reportsRef = collection(db, "reports")
        console.log("ReportsProvider: Reports collection reference:", reportsRef.path)

        try {
          // Try to get reports
          const reportsSnapshot = await getDocs(collection(db, "reports"))
          console.log("ReportsProvider: Reports snapshot size:", reportsSnapshot.size)

          const reportsData = reportsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Report[]

          console.log("ReportsProvider: Loaded reports:", reportsData.length)
          setReports(reportsData)
        } catch (error) {
          console.error("ReportsProvider: Error loading reports:", error)
          // If there's an error, initialize with empty array
          setReports([])
        }
      } catch (error) {
        console.error("ReportsProvider: Error loading reports:", error)
        setReports([])
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [user, useMockData])

  // Add a new report
  const addReport = async (report: Omit<Report, "id" | "createdAt" | "updatedAt" | "createdBy">): Promise<string> => {
    console.log("ReportsProvider: Adding report:", report)

    if (useMockData) {
      console.log("ReportsProvider: Using mock data, adding locally")
      const id = uuidv4()
      const newReport = {
        id,
        ...report,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.uid || "mock-user",
      }

      setReports([...reports, newReport])
      return id
    }

    try {
      console.log("ReportsProvider: Adding report to Firestore")
      const id = uuidv4()
      const newReport = {
        id,
        ...report,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.uid,
      }

      await setDoc(doc(db, "reports", id), newReport)
      console.log("ReportsProvider: Report added successfully")

      setReports([...reports, newReport])
      return id
    } catch (error) {
      console.error("ReportsProvider: Error adding report:", error)
      throw error
    }
  }

  // Update an existing report
  const updateReport = async (
    id: string,
    updates: Partial<Omit<Report, "id" | "createdAt" | "updatedAt" | "createdBy">>,
  ): Promise<void> => {
    console.log("ReportsProvider: Updating report:", id, updates)

    if (useMockData) {
      console.log("ReportsProvider: Using mock data, updating locally")
      setReports(
        reports.map((report) =>
          report.id === id
            ? {
                ...report,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : report,
        ),
      )
      return
    }

    try {
      console.log("ReportsProvider: Updating report in Firestore")
      const reportData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await updateDoc(doc(db, "reports", id), reportData)
      console.log("ReportsProvider: Report updated successfully")

      setReports(
        reports.map((report) =>
          report.id === id
            ? {
                ...report,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : report,
        ),
      )
    } catch (error) {
      console.error("ReportsProvider: Error updating report:", error)
      throw error
    }
  }

  // Delete a report
  const deleteReport = async (id: string): Promise<void> => {
    console.log("ReportsProvider: Deleting report:", id)

    if (useMockData) {
      console.log("ReportsProvider: Using mock data, deleting locally")
      setReports(reports.filter((report) => report.id !== id))
      return
    }

    try {
      console.log("ReportsProvider: Deleting report from Firestore")
      await deleteDoc(doc(db, "reports", id))
      console.log("ReportsProvider: Report deleted successfully")

      setReports(reports.filter((report) => report.id !== id))
    } catch (error) {
      console.error("ReportsProvider: Error deleting report:", error)
      throw error
    }
  }

  // Get a report by ID
  const getReportById = (id: string): Report | undefined => {
    return reports.find((report) => report.id === id)
  }

  // Generate a report
  const generateReport = async (id: string): Promise<string> => {
    console.log("ReportsProvider: Generating report:", id)
    // In a real implementation, this would call a server function to generate the report
    // For now, we'll just return a mock URL
    return `https://example.com/reports/${id}`
  }

  // Schedule a report
  const scheduleReport = async (id: string, schedule: Report["schedule"]): Promise<void> => {
    console.log("ReportsProvider: Scheduling report:", id, schedule)
    return updateReport(id, { schedule })
  }

  return (
    <ReportsContext.Provider
      value={{
        reports,
        isLoading,
        addReport,
        updateReport,
        deleteReport,
        getReportById,
        generateReport,
        scheduleReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
