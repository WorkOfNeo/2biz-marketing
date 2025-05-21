"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"
import { WidgetRenderer } from "@/components/dashboard/widget-renderer"
import type { DashboardWidget, WidgetType, TimeRange } from "@/lib/types/dashboard"
import { v4 as uuidv4 } from "uuid"

interface WidgetBuilderProps {
  initialWidget?: DashboardWidget
  onSave: (widget: DashboardWidget) => void
  onCancel: () => void
}

export function WidgetBuilder({ initialWidget, onSave, onCancel }: WidgetBuilderProps) {
  const { metricMappings } = useDashboardSettings()
  const [activeTab, setActiveTab] = useState("data")

  // Widget state
  const [widget, setWidget] = useState<DashboardWidget>(() => {
    if (initialWidget) return { ...initialWidget }

    // Default widget
    return {
      id: uuidv4(),
      name: "New Widget",
      type: "number",
      metrics: metricMappings.length > 0 ? [metricMappings[0].id] : [],
      timeRange: "this-month",
      filters: [],
      layout: { x: 0, y: 0, w: 1, h: 1 },
      displayOptions: {
        title: "New Widget",
        format: "number",
        decimals: 0,
        showChange: true,
        comparisonTimeRange: "last-month",
      },
    }
  })

  // Update widget state
  const updateWidget = (path: string, value: any) => {
    setWidget((prev) => {
      const newWidget = { ...prev }
      const parts = path.split(".")
      let current: any = newWidget

      // Navigate to the nested property
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]]
      }

      // Set the value
      current[parts[parts.length - 1]] = value

      return newWidget
    })
  }

  // Handle save
  const handleSave = () => {
    onSave(widget)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="widget-name">Widget Name</Label>
              <Input id="widget-name" value={widget.name} onChange={(e) => updateWidget("name", e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="widget-type">Widget Type</Label>
              <Select value={widget.type} onValueChange={(value) => updateWidget("type", value as WidgetType)}>
                <SelectTrigger id="widget-type">
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="chart-line">Line Chart</SelectItem>
                  <SelectItem value="chart-bar">Bar Chart</SelectItem>
                  <SelectItem value="chart-pie">Pie Chart</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="widget-metric">Primary Metric</Label>
              <Select value={widget.metrics[0] || ""} onValueChange={(value) => updateWidget("metrics", [value])}>
                <SelectTrigger id="widget-metric">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricMappings.map((metric) => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="widget-time-range">Time Range</Label>
              <Select value={widget.timeRange} onValueChange={(value) => updateWidget("timeRange", value as TimeRange)}>
                <SelectTrigger id="widget-time-range">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="widget-title">Display Title</Label>
              <Input
                id="widget-title"
                value={widget.displayOptions.title}
                onChange={(e) => updateWidget("displayOptions.title", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="widget-description">Description (Optional)</Label>
              <Input
                id="widget-description"
                value={widget.displayOptions.description || ""}
                onChange={(e) => updateWidget("displayOptions.description", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="widget-format">Number Format</Label>
              <Select
                value={widget.displayOptions.format || "number"}
                onValueChange={(value) => updateWidget("displayOptions.format", value)}
              >
                <SelectTrigger id="widget-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="widget-decimals">Decimal Places</Label>
              <Input
                id="widget-decimals"
                type="number"
                min="0"
                max="5"
                value={widget.displayOptions.decimals || 0}
                onChange={(e) => updateWidget("displayOptions.decimals", Number.parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="widget-show-change">Show Change</Label>
              <Switch
                id="widget-show-change"
                checked={widget.displayOptions.showChange || false}
                onCheckedChange={(checked) => updateWidget("displayOptions.showChange", checked)}
              />
            </div>

            {widget.displayOptions.showChange && (
              <div className="grid gap-2">
                <Label htmlFor="widget-comparison">Comparison Period</Label>
                <Select
                  value={widget.displayOptions.comparisonTimeRange || "last-month"}
                  onValueChange={(value) => updateWidget("displayOptions.comparisonTimeRange", value as TimeRange)}
                >
                  <SelectTrigger id="widget-comparison">
                    <SelectValue placeholder="Select comparison period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="text-center py-6 text-muted-foreground">
              <p>Filter functionality will be implemented in a future update.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Widget</Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preview</h3>
        <Card>
          <CardContent className="p-6">
            <WidgetRenderer widget={widget} />
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
          This is a preview of how your widget will appear on the dashboard. The data shown is based on your actual
          data.
        </p>
      </div>
    </div>
  )
}
