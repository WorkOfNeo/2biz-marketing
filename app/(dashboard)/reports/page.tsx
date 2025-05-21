"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Download, Calendar, Trash2, FileText } from "lucide-react"
import { useReports } from "@/lib/reports-context"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"
import type { Report } from "@/lib/types/report"

export default function ReportsPage() {
  const { reports, deleteReport, generateReport } = useReports()
  const { dashboards } = useDashboardSettings()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const handleCreateReport = () => {
    setSelectedReport(null)
    setIsEditorOpen(true)
  }

  const handleEditReport = (report: Report) => {
    setSelectedReport(report)
    setIsEditorOpen(true)
  }

  const handleScheduleReport = (report: Report) => {
    setSelectedReport(report)
    setIsSchedulerOpen(true)
  }

  const handleDeleteReport = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      await deleteReport(id)
    }
  }

  const handleGenerateReport = async (id: string) => {
    try {
      const url = await generateReport(id)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Failed to generate report. Please try again.")
    }
  }

  const getTimeRangeLabel = (timeRange: string): string => {
    switch (timeRange) {
      case "today":
        return "Today"
      case "yesterday":
        return "Yesterday"
      case "this-week":
        return "This Week"
      case "last-week":
        return "Last Week"
      case "this-month":
        return "This Month"
      case "last-month":
        return "Last Month"
      case "this-quarter":
        return "This Quarter"
      case "last-quarter":
        return "Last Quarter"
      case "this-year":
        return "This Year"
      case "last-year":
        return "Last Year"
      case "custom":
        return "Custom Range"
      default:
        return timeRange
    }
  }

  const getScheduleLabel = (report: Report): string => {
    if (!report.schedule) return "Not scheduled"

    const { frequency, day } = report.schedule

    switch (frequency) {
      case "daily":
        return "Daily"
      case "weekly":
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return `Weekly on ${days[day || 0]}`
      case "monthly":
        return `Monthly on day ${day || 1}`
      case "quarterly":
        return "Quarterly"
      default:
        return "Custom schedule"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Create, schedule, and download reports</p>
        </div>
        <Button className="gap-1" onClick={handleCreateReport}>
          <Plus className="h-4 w-4" /> Create Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Reports</h3>
          <p className="text-muted-foreground mb-4">Create your first report to start sharing your data.</p>
          <Button className="gap-1" onClick={handleCreateReport}>
            <Plus className="h-4 w-4" /> Create Report
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>Manage and generate reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Time Range</TableHead>
                  <TableHead>Formats</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{getTimeRangeLabel(report.timeRange)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {report.formats &&
                          report.formats.map((format) => (
                            <Badge key={format} variant="outline">
                              {format.toUpperCase()}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>{getScheduleLabel(report)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerateReport(report.id)}
                          title="Generate Report"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleScheduleReport(report)}
                          title="Schedule Report"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditReport(report)}
                          title="Edit Report"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete Report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Report Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedReport ? "Edit Report" : "Create Report"}</DialogTitle>
          </DialogHeader>
          {/* Placeholder for ReportEditor component */}
          <div className="py-4">
            <p>Report editor would go here.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditorOpen(false)}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Scheduler Dialog */}
      <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
          </DialogHeader>
          {/* Placeholder for ReportScheduler component */}
          <div className="py-4">
            <p>Report scheduler would go here.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsSchedulerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsSchedulerOpen(false)}>Save Schedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
