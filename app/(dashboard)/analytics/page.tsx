"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { CalendarIcon, Download, LineChart } from "lucide-react"

// Mock data for sources
const sources = [
  {
    id: "1",
    name: "Instagram - @yourbrand",
    platform: "instagram",
    fields: [
      { id: "1", label: "Impressions", type: "number" },
      { id: "2", label: "Engagement Rate", type: "percentage" },
      { id: "3", label: "Comments", type: "number" },
    ],
  },
  {
    id: "2",
    name: "YouTube Channel",
    platform: "youtube",
    fields: [
      { id: "1", label: "Views", type: "number" },
      { id: "2", label: "Watch Time", type: "text" },
      { id: "3", label: "Subscribers Gained", type: "number" },
    ],
  },
  {
    id: "3",
    name: "Facebook Page",
    platform: "facebook",
    fields: [
      { id: "1", label: "Reach", type: "number" },
      { id: "2", label: "Page Likes", type: "number" },
      { id: "3", label: "Post Engagement", type: "number" },
    ],
  },
]

// Mock analytics data
const generateAnalyticsData = (sourceId: string, startDate: Date, endDate: Date) => {
  const source = sources.find((s) => s.id === sourceId)
  if (!source) return []

  const days = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days.map((date) => {
    const data: Record<string, any> = {
      date: format(date, "yyyy-MM-dd"),
    }

    source.fields.forEach((field) => {
      if (field.type === "number") {
        data[field.label] = Math.floor(Math.random() * 10000)
      } else if (field.type === "percentage") {
        data[field.label] = (Math.random() * 10).toFixed(2) + "%"
      } else {
        data[field.label] = "Sample data"
      }
    })

    return data
  })
}

export default function AnalyticsPage() {
  const [selectedSource, setSelectedSource] = useState("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  })
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [availableFields, setAvailableFields] = useState<any[]>([])

  useEffect(() => {
    if (selectedSource) {
      const source = sources.find((s) => s.id === selectedSource)
      if (source) {
        setAvailableFields(source.fields)
        setSelectedFields([source.fields[0].label]) // Select first field by default
      }
    } else {
      setAvailableFields([])
      setSelectedFields([])
    }
  }, [selectedSource])

  const handleRunAnalytics = () => {
    if (selectedSource && dateRange.from && dateRange.to && selectedFields.length > 0) {
      const data = generateAnalyticsData(selectedSource, dateRange.from, dateRange.to)
      setAnalyticsData(data)
    }
  }

  const toggleField = (fieldLabel: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldLabel) ? prev.filter((f) => f !== fieldLabel) : [...prev, fieldLabel],
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Analyze your marketing data across different sources</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Select a source, date range, and metrics to analyze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) =>
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Metrics</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={availableFields.length === 0}
                  >
                    <span>{selectedFields.length > 0 ? `${selectedFields.length} selected` : "Select metrics"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="p-4 space-y-3">
                    {availableFields.map((field) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`field-${field.id}`}
                          checked={selectedFields.includes(field.label)}
                          onCheckedChange={() => toggleField(field.label)}
                        />
                        <Label htmlFor={`field-${field.id}`} className="text-sm font-normal cursor-pointer">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            onClick={handleRunAnalytics}
            disabled={!selectedSource || !dateRange.from || !dateRange.to || selectedFields.length === 0}
          >
            Run Analysis
          </Button>

          {analyticsData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Results</h3>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      {selectedFields.map((field) => (
                        <TableHead key={field}>{field}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.date}</TableCell>
                        {selectedFields.map((field) => (
                          <TableCell key={field}>{row[field]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="h-[300px] border rounded-md p-4 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-muted-foreground">Chart visualization would appear here</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-md p-8 text-center">
              <LineChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">No Data to Display</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Select a source, date range, and metrics, then click "Run Analysis" to view your data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
