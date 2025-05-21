// Dashboard widget types and interfaces

export type CalculationType = "sum" | "average" | "count" | "min" | "max" | "latest" | "custom"

export type WidgetType =
  | "number"
  | "percentage"
  | "chart-line"
  | "chart-bar"
  | "chart-pie"
  | "list"
  | "table"
  | "comparison"

export type TimeRange =
  | "today"
  | "yesterday"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "last-quarter"
  | "this-year"
  | "last-year"
  | "custom"

export type FilterOperator = "equals" | "not-equals" | "greater-than" | "less-than" | "contains" | "not-contains"

export interface MetricMapping {
  id: string
  name: string
  sourceMetrics: Array<{
    sourceId: string
    fieldId: string
  }>
  calculationType: CalculationType
  customFormula?: string // For custom calculations, e.g., "metric1 / metric2 * 100"
}

export interface WidgetFilter {
  field: string // Can be "sourceId", "date", "status", or a metric name
  operator: FilterOperator
  value: any
}

export interface DashboardWidget {
  id: string
  name: string
  type: WidgetType
  metrics: string[] // IDs of metrics to display
  timeRange: TimeRange
  customTimeRange?: {
    start: string
    end: string
  }
  filters: WidgetFilter[]
  layout: {
    x: number
    y: number
    w: number
    h: number
  }
  displayOptions: {
    title: string
    description?: string
    format?: string // e.g., "number", "currency", "percentage"
    decimals?: number
    prefix?: string
    suffix?: string
    colors?: string[]
    showChange?: boolean
    comparisonTimeRange?: TimeRange
  }
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  isDefault?: boolean
}
