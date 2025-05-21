"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"

export function GeneralTab() {
  const { settings, updateSettings } = useDashboardSettings()
  const [formValues, setFormValues] = useState({
    organizationName: settings.organizationName || "",
    defaultDateRange: settings.defaultDateRange || "this-month",
    enableNotifications: settings.enableNotifications || false,
    enableAnalytics: settings.enableAnalytics || false,
  })

  const handleChange = (key: string, value: any) => {
    setFormValues({
      ...formValues,
      [key]: value,
    })
  }

  const handleSave = () => {
    updateSettings(formValues)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input
            id="org-name"
            value={formValues.organizationName}
            onChange={(e) => handleChange("organizationName", e.target.value)}
            placeholder="Your Organization"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="default-date-range">Default Date Range</Label>
          <select
            id="default-date-range"
            value={formValues.defaultDateRange}
            onChange={(e) => handleChange("defaultDateRange", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="last-week">Last Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="this-year">This Year</option>
            <option value="last-year">Last Year</option>
          </select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notifications</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications for important events</p>
          </div>
          <Switch
            id="notifications"
            checked={formValues.enableNotifications}
            onCheckedChange={(checked) => handleChange("enableNotifications", checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Analytics</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics">Enable Analytics</Label>
            <p className="text-sm text-muted-foreground">Collect usage data to improve the application</p>
          </div>
          <Switch
            id="analytics"
            checked={formValues.enableAnalytics}
            onCheckedChange={(checked) => handleChange("enableAnalytics", checked)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  )
}
