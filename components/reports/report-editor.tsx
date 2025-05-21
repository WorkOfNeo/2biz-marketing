"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"
import type { Report, ReportWidget } from "@/lib/types/report"
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react"

interface ReportEditorProps {
  report?: Report
  onSave: (reportData: any) => void
  onCancel: () => void
}

export function ReportEditor({ report, onSave, onCancel }: ReportEditorProps) {
  const { metricMappings, dashboards } = useDashboardSettings()

  const [reportData, setReportData] = useState<Partial<Report>>(
    report || {
      name: "",
      description: "",
      widgets: [],
    },
  )

  const [selectedMetric, setSelectedMetric] = useState<string>("")
  const [selectedWidgetType, setSelectedWidgetType] = useState<"metric" | "chart">("metric")
  const [widgetTitle, setWidgetTitle] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReportData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddWidget = () => {
    if (!widgetTitle || (!selectedMetric && selectedWidgetType === "metric")) return

    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type: selectedWidgetType,
      title: widgetTitle,
      ...(selectedWidgetType === "metric" ? { metricId: selectedMetric } : { metricIds: [selectedMetric] }),
    }

    setReportData((prev) => ({
      ...prev,
      widgets: [...(prev.widgets || []), newWidget],
    }))

    // Reset form
    setWidgetTitle("")
    setSelectedMetric("")
  }

  const handleRemoveWidget = (widgetId: string) => {
    setReportData((prev) => ({
      ...prev,
      widgets: prev.widgets?.filter((w) => w.id !== widgetId) || [],
    }))
  }

  const handleSave = () => {
    onSave(reportData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onCancel} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{report ? "Edit Report" : "Create New Report"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Report Name</Label>
            <Input
              id="name"
              name="name"
              value={reportData.name || ""}
              onChange={handleInputChange}
              placeholder="Monthly Performance Report"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={reportData.description || ""}
              onChange={handleInputChange}
              placeholder="Overview of monthly marketing performance metrics"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Widgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="widgetTitle">Widget Title</Label>
              <Input
                id="widgetTitle"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="Total Impressions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="widgetType">Widget Type</Label>
              <Select
                value={selectedWidgetType}
                onValueChange={(value: "metric" | "chart") => setSelectedWidgetType(value)}
              >
                <SelectTrigger id="widgetType">
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric">Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger id="metric">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricMappings.map((metric) => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddWidget} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Added Widgets</h3>
            {reportData.widgets && reportData.widgets.length > 0 ? (
              <div className="space-y-2">
                {reportData.widgets.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{widget.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {widget.type === "metric" ? "Metric" : "Chart"}:{" "}
                        {widget.metricId
                          ? metricMappings.find((m) => m.id === widget.metricId)?.displayName
                          : widget.metricIds
                              ?.map((id) => metricMappings.find((m) => m.id === id)?.displayName)
                              .join(", ")}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveWidget(widget.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No widgets added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>{report ? "Update Report" : "Create Report"}</Button>
      </div>
    </div>
  )
}
