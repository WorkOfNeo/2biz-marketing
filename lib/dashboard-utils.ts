import {
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns"
import type { Post, Source } from "@/lib/posts-context"
import type { MetricMapping, TimeRange } from "@/lib/types/dashboard"

// Calculate the value for a metric based on the mapping and time range
export async function calculateMetricValue(
  metricMapping: MetricMapping,
  posts: Post[],
  sources: Source[],
  timeRange: TimeRange,
): Promise<number> {
  // Get filtered posts based on time range
  const filteredPosts = filterPostsByTimeRange(posts, timeRange)

  // Get the values for each source metric
  const metricValues: number[] = []

  for (const sourceMetric of metricMapping.sourceMetrics) {
    const { sourceId, fieldId } = sourceMetric

    // Get all completed posts for this source
    const sourcePosts = filteredPosts.filter(
      (post) => post.sourceId === sourceId && post.status === "completed" && post.metrics,
    )

    // Sum up the values for this field across all posts
    let fieldTotal = 0
    for (const post of sourcePosts) {
      if (post.metrics && post.metrics[fieldId] !== undefined) {
        fieldTotal += Number(post.metrics[fieldId]) || 0
      }
    }

    metricValues.push(fieldTotal)
  }

  // Apply the calculation type
  switch (metricMapping.calculationType) {
    case "sum":
      return metricValues.reduce((sum, value) => sum + value, 0)

    case "average":
      if (metricValues.length === 0) return 0
      return metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length

    case "count":
      return metricValues.length

    case "min":
      if (metricValues.length === 0) return 0
      return Math.min(...metricValues)

    case "max":
      if (metricValues.length === 0) return 0
      return Math.max(...metricValues)

    case "latest":
      if (metricValues.length === 0) return 0
      return metricValues[metricValues.length - 1]

    case "custom":
      if (!metricMapping.customFormula) return 0

      try {
        // Create a function from the custom formula
        const formula = metricMapping.customFormula
          .replace(/metric(\d+)/g, (_, index) => {
            const i = Number.parseInt(index) - 1
            return i < metricValues.length ? metricValues[i].toString() : "0"
          })
          .replace(/totalImpressions/g, metricValues.reduce((sum, value) => sum + value, 0).toString())

        // Use Function constructor to evaluate the formula
        // This is safe because we're not executing user input directly
        const result = new Function(`return ${formula}`)()
        return Number(result) || 0
      } catch (error) {
        console.error("Error evaluating custom formula:", error)
        return 0
      }

    default:
      return 0
  }
}

// Get comparison data for a different time range
export async function getComparisonData(
  metricMapping: MetricMapping,
  posts: Post[],
  sources: Source[],
  comparisonTimeRange: TimeRange,
): Promise<number> {
  return calculateMetricValue(metricMapping, posts, sources, comparisonTimeRange)
}

// Format a metric value based on display options
export function formatMetricValue(value: number, displayOptions: any): string {
  const { format, decimals = 0, prefix = "", suffix = "" } = displayOptions

  let formattedValue = value.toFixed(decimals)

  // Apply number formatting
  if (format === "number" && value >= 1000) {
    if (value >= 1000000) {
      formattedValue = (value / 1000000).toFixed(1) + "M"
    } else if (value >= 1000) {
      formattedValue = (value / 1000).toFixed(1) + "K"
    }
  }

  // Apply percentage formatting
  if (format === "percentage") {
    formattedValue = value.toFixed(decimals) + "%"
  }

  // Apply currency formatting
  if (format === "currency") {
    formattedValue = "$" + value.toFixed(decimals)
  }

  return `${prefix}${formattedValue}${suffix}`
}

// Filter posts by time range
export function filterPostsByTimeRange(posts: Post[], timeRange: TimeRange): Post[] {
  const now = new Date()

  let startDate: Date
  let endDate: Date

  switch (timeRange) {
    case "today":
      startDate = startOfDay(now)
      endDate = endOfDay(now)
      break

    case "yesterday":
      startDate = startOfDay(subDays(now, 1))
      endDate = endOfDay(subDays(now, 1))
      break

    case "this-week":
      startDate = startOfWeek(now)
      endDate = endOfWeek(now)
      break

    case "last-week":
      startDate = startOfWeek(subDays(now, 7))
      endDate = endOfWeek(subDays(now, 7))
      break

    case "this-month":
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break

    case "last-month":
      startDate = startOfMonth(subDays(now, 30))
      endDate = endOfMonth(subDays(now, 30))
      break

    case "this-quarter":
      startDate = startOfQuarter(now)
      endDate = endOfQuarter(now)
      break

    case "last-quarter":
      startDate = startOfQuarter(subDays(now, 90))
      endDate = endOfQuarter(subDays(now, 90))
      break

    case "this-year":
      startDate = startOfYear(now)
      endDate = endOfYear(now)
      break

    case "last-year":
      startDate = startOfYear(subDays(now, 365))
      endDate = endOfYear(subDays(now, 365))
      break

    case "custom":
      // For custom time ranges, we would need to pass in the custom range
      // For now, default to this month
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break

    default:
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
  }

  return posts.filter((post) => {
    const postDate = parseISO(post.date)
    return isWithinInterval(postDate, { start: startDate, end: endDate })
  })
}
