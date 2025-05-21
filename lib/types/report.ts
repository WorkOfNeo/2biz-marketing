import type { TimeRange } from "./dashboard"

export type ReportFormat = "pdf" | "csv" | "excel" | "image"

export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "quarterly"
  day?: number // Day of week (0-6) or day of month (1-31)
  time?: string // Time in 24-hour format (HH:MM)
  recipients: string[] // Email addresses
}

export interface Report {
  id: string
  name: string
  description?: string
  widgets: ReportWidget[]
  timeRange: TimeRange
  formats: ReportFormat[]
  schedule?: ReportSchedule
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ReportWidget {
  id: string
  type: "metric" | "chart"
  title: string
  metricId?: string // For single metric widgets
  metricIds?: string[] // For chart widgets
}
