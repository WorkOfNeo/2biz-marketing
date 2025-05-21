"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReports } from "@/lib/reports-context"
import type { ReportSchedule } from "@/lib/types/report"
import { Calendar, Mail, FileType, Trash2 } from "lucide-react"

export function ReportScheduler() {
  const { reports, updateReport } = useReports()
  const [selectedReportId, setSelectedReportId] = useState<string>("")
  const [schedule, setSchedule] = useState<Partial<ReportSchedule>>({
    frequency: "monthly",
    day: 1,
    recipients: [],
    format: "pdf",
  })
  const [recipient, setRecipient] = useState("")

  const scheduledReports = reports.filter((report) => report.schedule)
  const selectedReport = reports.find((report) => report.id === selectedReportId)

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId)
    const report = reports.find((r) => r.id === reportId)
    if (report?.schedule) {
      setSchedule(report.schedule)
    } else {
      setSchedule({
        frequency: "monthly",
        day: 1,
        recipients: [],
        format: "pdf",
      })
    }
  }

  const handleScheduleChange = (field: keyof ReportSchedule, value: any) => {
    setSchedule((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddRecipient = () => {
    if (!recipient || !recipient.includes("@")) return

    setSchedule((prev) => ({
      ...prev,
      recipients: [...(prev.recipients || []), recipient],
    }))
    setRecipient("")
  }

  const handleRemoveRecipient = (email: string) => {
    setSchedule((prev) => ({
      ...prev,
      recipients: prev.recipients?.filter((r) => r !== email) || [],
    }))
  }

  const handleSaveSchedule = () => {
    if (!selectedReportId) return

    updateReport(selectedReportId, {
      schedule: schedule as ReportSchedule,
    })

    setSelectedReportId("")
    setSchedule({
      frequency: "monthly",
      day: 1,
      recipients: [],
      format: "pdf",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledReports.length > 0 ? (
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleSelectReport(report.id)}>
                      Edit Schedule
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {report.schedule?.frequency.charAt(0).toUpperCase() + report.schedule?.frequency.slice(1)}
                        {report.schedule?.frequency === "monthly" && report.schedule.day
                          ? ` (Day ${report.schedule.day})`
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileType className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{report.schedule?.format.toUpperCase()}</span>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">{report.schedule?.recipients.join(", ")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No scheduled reports. Select a report to schedule.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule a Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report">Select Report</Label>
            <Select value={selectedReportId} onValueChange={handleSelectReport}>
              <SelectTrigger id="report">
                <SelectValue placeholder="Select a report" />
              </SelectTrigger>
              <SelectContent>
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReportId && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={schedule.frequency}
                    onValueChange={(value) => handleScheduleChange("frequency", value)}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {schedule.frequency === "monthly" && (
                  <div className="space-y-2">
                    <Label htmlFor="day">Day of Month</Label>
                    <Select
                      value={String(schedule.day || 1)}
                      onValueChange={(value) => handleScheduleChange("day", Number.parseInt(value))}
                    >
                      <SelectTrigger id="day">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={String(day)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {schedule.frequency === "weekly" && (
                  <div className="space-y-2">
                    <Label htmlFor="day">Day of Week</Label>
                    <Select
                      value={String(schedule.day || 1)}
                      onValueChange={(value) => handleScheduleChange("day", Number.parseInt(value))}
                    >
                      <SelectTrigger id="day">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={schedule.format} onValueChange={(value) => handleScheduleChange("format", value)}>
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <div className="flex gap-2">
                  <Input
                    id="recipients"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="email@example.com"
                  />
                  <Button onClick={handleAddRecipient}>Add</Button>
                </div>

                <div className="mt-2">
                  {schedule.recipients && schedule.recipients.length > 0 ? (
                    <div className="space-y-2">
                      {schedule.recipients.map((email) => (
                        <div key={email} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <span>{email}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveRecipient(email)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recipients added.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSchedule}>Save Schedule</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
