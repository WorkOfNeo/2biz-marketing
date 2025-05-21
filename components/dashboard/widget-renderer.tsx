"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDown, ArrowUp } from "lucide-react"
import { usePosts } from "@/lib/posts-context"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"
import type { DashboardWidget } from "@/lib/types/dashboard"
import { calculateMetricValue, formatMetricValue, getComparisonData } from "@/lib/dashboard-utils"

interface WidgetRendererProps {
  widget: DashboardWidget
  className?: string
}

export function WidgetRenderer({ widget, className }: WidgetRendererProps) {
  const { posts, sources } = usePosts()
  const { metricMappings } = useDashboardSettings()
  const [isLoading, setIsLoading] = useState(true)
  const [value, setValue] = useState<number | null>(null)
  const [comparisonValue, setComparisonValue] = useState<number | null>(null)
  const [percentChange, setPercentChange] = useState<number | null>(null)

  useEffect(() => {
    const calculateWidgetValue = async () => {
      setIsLoading(true)

      try {
        // Get the primary metric mapping
        const primaryMetricId = widget.metrics[0]
        const metricMapping = metricMappings.find((m) => m.id === primaryMetricId)

        if (!metricMapping) {
          console.error(`Metric mapping not found for ID: ${primaryMetricId}`)
          setIsLoading(false)
          return
        }

        // Calculate the current value
        const currentData = await calculateMetricValue(metricMapping, posts, sources, widget.timeRange)
        setValue(currentData)

        // If we need to show comparison, calculate that too
        if (widget.displayOptions.showChange && widget.displayOptions.comparisonTimeRange) {
          const comparisonData = await getComparisonData(
            metricMapping,
            posts,
            sources,
            widget.displayOptions.comparisonTimeRange,
          )

          setComparisonValue(comparisonData)

          // Calculate percent change
          if (comparisonData !== null && comparisonData !== 0) {
            const change = ((currentData - comparisonData) / comparisonData) * 100
            setPercentChange(change)
          }
        }
      } catch (error) {
        console.error("Error calculating widget value:", error)
      } finally {
        setIsLoading(false)
      }
    }

    calculateWidgetValue()
  }, [widget, metricMappings, posts, sources])

  // Render different widget types
  const renderWidgetContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )
    }

    if (value === null) {
      return <div className="text-muted-foreground">No data available</div>
    }

    switch (widget.type) {
      case "number":
      case "percentage":
        return (
          <>
            <div className="text-3xl font-bold">{formatMetricValue(value, widget.displayOptions)}</div>
            {percentChange !== null && widget.displayOptions.showChange && (
              <p className="text-xs text-muted-foreground flex items-center">
                {percentChange > 0 ? (
                  <span className="text-green-500 flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    {Math.abs(percentChange).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <ArrowDown className="mr-1 h-4 w-4" />
                    {Math.abs(percentChange).toFixed(1)}%
                  </span>
                )}
                <span className="ml-1">from {getComparisonLabel(widget.displayOptions.comparisonTimeRange)}</span>
              </p>
            )}
          </>
        )
      // Add more widget type renderers as needed
      default:
        return <div className="text-muted-foreground">Unsupported widget type</div>
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.displayOptions.title}</CardTitle>
        {widget.displayOptions.description && <CardDescription>{widget.displayOptions.description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderWidgetContent()}</CardContent>
    </Card>
  )
}

function getComparisonLabel(timeRange?: string): string {
  switch (timeRange) {
    case "yesterday":
      return "yesterday"
    case "last-week":
      return "last week"
    case "last-month":
      return "last month"
    case "last-quarter":
      return "last quarter"
    case "last-year":
      return "last year"
    default:
      return "previous period"
  }
}
