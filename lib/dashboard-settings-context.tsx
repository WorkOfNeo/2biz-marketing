"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { db } from "./firebase"
import { doc, getDoc, setDoc, collection } from "firebase/firestore"
import { useAuth } from "./auth-context"
import type { MetricMapping, Dashboard } from "./types/dashboard"

// Check if we're in v0 environment
const isV0Environment = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

interface DashboardSettings {
  organizationName: string
  defaultDateRange: string
  enableNotifications: boolean
  enableAnalytics: boolean
}

interface DashboardSettingsContextType {
  metricMappings: MetricMapping[]
  dashboards: Dashboard[]
  settings: DashboardSettings
  addMetricMapping: (mapping: Omit<MetricMapping, "id">) => Promise<string>
  updateMetricMapping: (id: string, mapping: Partial<Omit<MetricMapping, "id">>) => Promise<void>
  deleteMetricMapping: (id: string) => Promise<void>
  addDashboard: (dashboard: Omit<Dashboard, "id">) => Promise<string>
  updateDashboard: (id: string, dashboard: Partial<Omit<Dashboard, "id">>) => Promise<void>
  deleteDashboard: (id: string) => Promise<void>
  setDefaultDashboard: (id: string) => Promise<void>
  updateSettings: (settings: Partial<DashboardSettings>) => Promise<void>
}

// Mock data for v0 environment
const mockMetricMappings: MetricMapping[] = [
  {
    id: "metric1",
    name: "Total Impressions",
    sourceMetrics: [
      { sourceId: "source1", fieldId: "impressions" },
      { sourceId: "source2", fieldId: "impressions" },
      { sourceId: "source3", fieldId: "views" },
    ],
    calculationType: "sum",
  },
  {
    id: "metric2",
    name: "Engagement Rate",
    sourceMetrics: [
      { sourceId: "source1", fieldId: "likes" },
      { sourceId: "source1", fieldId: "comments" },
      { sourceId: "source2", fieldId: "likes" },
      { sourceId: "source2", fieldId: "shares" },
    ],
    calculationType: "custom",
    customFormula: "(metric1 + metric2 + metric3 + metric4) / totalImpressions * 100",
  },
]

const mockDashboards: Dashboard[] = [
  {
    id: "dashboard1",
    name: "Marketing Overview",
    description: "Key marketing metrics at a glance",
    isDefault: true,
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
  },
]

const mockSettings: DashboardSettings = {
  organizationName: "Marketing Analytics",
  defaultDateRange: "this-month",
  enableNotifications: true,
  enableAnalytics: false,
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined)

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
  const [metricMappings, setMetricMappings] = useState<MetricMapping[]>([])
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [settings, setSettings] = useState<DashboardSettings>({
    organizationName: "",
    defaultDateRange: "this-month",
    enableNotifications: false,
    enableAnalytics: false,
  })
  const { user } = useAuth()

  // Use mock data for v0 environment
  const useMockData = isV0Environment

  // Load data from Firestore
  useEffect(() => {
    console.log("DashboardSettingsProvider: Initializing...")
    console.log("DashboardSettingsProvider: User:", user?.email, "Role:", user?.role)
    console.log("DashboardSettingsProvider: Using mock data:", useMockData)

    if (useMockData) {
      console.log("DashboardSettingsProvider: Setting mock data")
      setMetricMappings(mockMetricMappings)
      setDashboards(mockDashboards)
      setSettings(mockSettings)
      return
    }

    if (!user) {
      console.log("DashboardSettingsProvider: No user, skipping data load")
      return
    }

    const loadData = async () => {
      try {
        console.log("DashboardSettingsProvider: Loading data from Firestore...")

        // Check if settings collection exists, if not create it
        const settingsRef = collection(db, "settings")
        console.log("DashboardSettingsProvider: Settings collection reference:", settingsRef.path)

        // Load metric mappings
        console.log("DashboardSettingsProvider: Loading metric mappings...")
        try {
          const metricMappingsDoc = await getDoc(doc(db, "settings", "metricMappings"))
          console.log("DashboardSettingsProvider: Metric mappings doc exists:", metricMappingsDoc.exists())

          if (metricMappingsDoc.exists()) {
            setMetricMappings(metricMappingsDoc.data().mappings || [])
            console.log(
              "DashboardSettingsProvider: Loaded metric mappings:",
              metricMappingsDoc.data().mappings?.length || 0,
            )
          } else {
            // Initialize with empty array if document doesn't exist
            console.log("DashboardSettingsProvider: Creating initial metric mappings document")
            await setDoc(doc(db, "settings", "metricMappings"), { mappings: [] })
            setMetricMappings([])
          }
        } catch (error) {
          console.error("DashboardSettingsProvider: Error loading metric mappings:", error)
        }

        // Load dashboards
        console.log("DashboardSettingsProvider: Loading dashboards...")
        try {
          const dashboardsDoc = await getDoc(doc(db, "settings", "dashboards"))
          console.log("DashboardSettingsProvider: Dashboards doc exists:", dashboardsDoc.exists())

          if (dashboardsDoc.exists()) {
            setDashboards(dashboardsDoc.data().dashboards || [])
            console.log("DashboardSettingsProvider: Loaded dashboards:", dashboardsDoc.data().dashboards?.length || 0)
          } else {
            // Initialize with empty array if document doesn't exist
            console.log("DashboardSettingsProvider: Creating initial dashboards document")
            await setDoc(doc(db, "settings", "dashboards"), { dashboards: [] })
            setDashboards([])
          }
        } catch (error) {
          console.error("DashboardSettingsProvider: Error loading dashboards:", error)
        }

        // Load general settings
        console.log("DashboardSettingsProvider: Loading general settings...")
        try {
          const settingsDoc = await getDoc(doc(db, "settings", "general"))
          console.log("DashboardSettingsProvider: Settings doc exists:", settingsDoc.exists())

          if (settingsDoc.exists()) {
            setSettings(settingsDoc.data() as DashboardSettings)
            console.log("DashboardSettingsProvider: Loaded settings:", settingsDoc.data())
          } else {
            // Initialize with default settings if document doesn't exist
            const defaultSettings = {
              organizationName: "Marketing Analytics",
              defaultDateRange: "this-month",
              enableNotifications: false,
              enableAnalytics: false,
            }
            console.log("DashboardSettingsProvider: Creating initial settings document")
            await setDoc(doc(db, "settings", "general"), defaultSettings)
            setSettings(defaultSettings)
          }
        } catch (error) {
          console.error("DashboardSettingsProvider: Error loading general settings:", error)
        }
      } catch (error) {
        console.error("DashboardSettingsProvider: Error loading dashboard settings:", error)
      }
    }

    loadData()
  }, [user, useMockData])

  // Metric Mapping Functions
  const addMetricMapping = async (mapping: Omit<MetricMapping, "id">): Promise<string> => {
    console.log("DashboardSettingsProvider: Adding metric mapping:", mapping)
    const id = uuidv4()
    const newMapping = { id, ...mapping }

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, adding locally")
      setMetricMappings([...metricMappings, newMapping])
      return id
    }

    try {
      console.log("DashboardSettingsProvider: Adding metric mapping to Firestore")
      const updatedMappings = [...metricMappings, newMapping]

      await setDoc(doc(db, "settings", "metricMappings"), {
        mappings: updatedMappings,
      })
      console.log("DashboardSettingsProvider: Metric mapping added successfully")

      setMetricMappings(updatedMappings)
      return id
    } catch (error) {
      console.error("DashboardSettingsProvider: Error adding metric mapping:", error)
      throw error
    }
  }

  const updateMetricMapping = async (id: string, updates: Partial<Omit<MetricMapping, "id">>): Promise<void> => {
    console.log("DashboardSettingsProvider: Updating metric mapping:", id, updates)

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, updating locally")
      setMetricMappings(metricMappings.map((mapping) => (mapping.id === id ? { ...mapping, ...updates } : mapping)))
      return
    }

    try {
      console.log("DashboardSettingsProvider: Updating metric mapping in Firestore")
      const updatedMappings = metricMappings.map((mapping) =>
        mapping.id === id ? { ...mapping, ...updates } : mapping,
      )

      await setDoc(doc(db, "settings", "metricMappings"), {
        mappings: updatedMappings,
      })
      console.log("DashboardSettingsProvider: Metric mapping updated successfully")

      setMetricMappings(updatedMappings)
    } catch (error) {
      console.error("DashboardSettingsProvider: Error updating metric mapping:", error)
      throw error
    }
  }

  const deleteMetricMapping = async (id: string): Promise<void> => {
    console.log("DashboardSettingsProvider: Deleting metric mapping:", id)

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, deleting locally")
      setMetricMappings(metricMappings.filter((mapping) => mapping.id !== id))
      return
    }

    try {
      console.log("DashboardSettingsProvider: Deleting metric mapping from Firestore")
      const updatedMappings = metricMappings.filter((mapping) => mapping.id !== id)

      await setDoc(doc(db, "settings", "metricMappings"), {
        mappings: updatedMappings,
      })
      console.log("DashboardSettingsProvider: Metric mapping deleted successfully")

      setMetricMappings(updatedMappings)
    } catch (error) {
      console.error("DashboardSettingsProvider: Error deleting metric mapping:", error)
      throw error
    }
  }

  // Dashboard Functions
  const addDashboard = async (dashboard: Omit<Dashboard, "id">): Promise<string> => {
    console.log("DashboardSettingsProvider: Adding dashboard:", dashboard)
    const id = uuidv4()
    const newDashboard = { id, ...dashboard }

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, adding locally")
      setDashboards([...dashboards, newDashboard])
      return id
    }

    try {
      console.log("DashboardSettingsProvider: Adding dashboard to Firestore")
      const updatedDashboards = [...dashboards, newDashboard]

      await setDoc(doc(db, "settings", "dashboards"), {
        dashboards: updatedDashboards,
      })
      console.log("DashboardSettingsProvider: Dashboard added successfully")

      setDashboards(updatedDashboards)
      return id
    } catch (error) {
      console.error("DashboardSettingsProvider: Error adding dashboard:", error)
      throw error
    }
  }

  const updateDashboard = async (id: string, updates: Partial<Omit<Dashboard, "id">>): Promise<void> => {
    console.log("DashboardSettingsProvider: Updating dashboard:", id, updates)

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, updating locally")
      setDashboards(dashboards.map((dashboard) => (dashboard.id === id ? { ...dashboard, ...updates } : dashboard)))
      return
    }

    try {
      console.log("DashboardSettingsProvider: Updating dashboard in Firestore")
      const updatedDashboards = dashboards.map((dashboard) =>
        dashboard.id === id ? { ...dashboard, ...updates } : dashboard,
      )

      await setDoc(doc(db, "settings", "dashboards"), {
        dashboards: updatedDashboards,
      })
      console.log("DashboardSettingsProvider: Dashboard updated successfully")

      setDashboards(updatedDashboards)
    } catch (error) {
      console.error("DashboardSettingsProvider: Error updating dashboard:", error)
      throw error
    }
  }

  const deleteDashboard = async (id: string): Promise<void> => {
    console.log("DashboardSettingsProvider: Deleting dashboard:", id)

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, deleting locally")
      setDashboards(dashboards.filter((dashboard) => dashboard.id !== id))
      return
    }

    try {
      console.log("DashboardSettingsProvider: Deleting dashboard from Firestore")
      const updatedDashboards = dashboards.filter((dashboard) => dashboard.id !== id)

      await setDoc(doc(db, "settings", "dashboards"), {
        dashboards: updatedDashboards,
      })
      console.log("DashboardSettingsProvider: Dashboard deleted successfully")

      setDashboards(updatedDashboards)
    } catch (error) {
      console.error("DashboardSettingsProvider: Error deleting dashboard:", error)
      throw error
    }
  }

  const setDefaultDashboard = async (id: string): Promise<void> => {
    console.log("DashboardSettingsProvider: Setting default dashboard:", id)

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, updating locally")
      setDashboards(
        dashboards.map((dashboard) => ({
          ...dashboard,
          isDefault: dashboard.id === id,
        })),
      )
      return
    }

    try {
      console.log("DashboardSettingsProvider: Setting default dashboard in Firestore")
      const updatedDashboards = dashboards.map((dashboard) => ({
        ...dashboard,
        isDefault: dashboard.id === id,
      }))

      await setDoc(doc(db, "settings", "dashboards"), {
        dashboards: updatedDashboards,
      })
      console.log("DashboardSettingsProvider: Default dashboard set successfully")

      setDashboards(updatedDashboards)
    } catch (error) {
      console.error("DashboardSettingsProvider: Error setting default dashboard:", error)
      throw error
    }
  }

  // Settings Functions
  const updateSettings = async (updates: Partial<DashboardSettings>): Promise<void> => {
    console.log("DashboardSettingsProvider: Updating settings:", updates)

    if (useMockData) {
      console.log("DashboardSettingsProvider: Using mock data, updating locally")
      setSettings({ ...settings, ...updates })
      return
    }

    try {
      console.log("DashboardSettingsProvider: Updating settings in Firestore")
      const updatedSettings = { ...settings, ...updates }

      await setDoc(doc(db, "settings", "general"), updatedSettings)
      console.log("DashboardSettingsProvider: Settings updated successfully")

      setSettings(updatedSettings)
    } catch (error) {
      console.error("DashboardSettingsProvider: Error updating settings:", error)
      throw error
    }
  }

  return (
    <DashboardSettingsContext.Provider
      value={{
        metricMappings,
        dashboards,
        settings,
        addMetricMapping,
        updateMetricMapping,
        deleteMetricMapping,
        addDashboard,
        updateDashboard,
        deleteDashboard,
        setDefaultDashboard,
        updateSettings,
      }}
    >
      {children}
    </DashboardSettingsContext.Provider>
  )
}

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext)
  if (context === undefined) {
    throw new Error("useDashboardSettings must be used within a DashboardSettingsProvider")
  }
  return context
}
