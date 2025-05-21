"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, MoveVertical } from "lucide-react"
import { WidgetBuilder } from "@/components/dashboard/widget-builder"
import { WidgetRenderer } from "@/components/dashboard/widget-renderer"
import type { Dashboard, DashboardWidget } from "@/lib/types/dashboard"

interface DashboardEditorProps {
  dashboard: Dashboard
  onSave: (dashboard: Dashboard) => void
  onCancel: () => void
}

export function DashboardEditor({ dashboard, onSave, onCancel }: DashboardEditorProps) {
  const [editedDashboard, setEditedDashboard] = useState<Dashboard>({ ...dashboard })
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false)
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null)
  const [activeTab, setActiveTab] = useState("layout")

  // Add a new widget
  const handleAddWidget = () => {
    setEditingWidget(null)
    setIsWidgetDialogOpen(true)
  }

  // Edit an existing widget
  const handleEditWidget = (widget: DashboardWidget) => {
    setEditingWidget(widget)
    setIsWidgetDialogOpen(true)
  }

  // Delete a widget
  const handleDeleteWidget = (widgetId: string) => {
    setEditedDashboard({
      ...editedDashboard,
      widgets: editedDashboard.widgets.filter((w) => w.id !== widgetId),
    })
  }

  // Save a widget (new or edited)
  const handleSaveWidget = (widget: DashboardWidget) => {
    if (editingWidget) {
      // Update existing widget
      setEditedDashboard({
        ...editedDashboard,
        widgets: editedDashboard.widgets.map((w) => (w.id === widget.id ? widget : w)),
      })
    } else {
      // Add new widget
      setEditedDashboard({
        ...editedDashboard,
        widgets: [...editedDashboard.widgets, widget],
      })
    }

    setIsWidgetDialogOpen(false)
    setEditingWidget(null)
  }

  // Move a widget up or down in the layout
  const handleMoveWidget = (widgetId: string, direction: "up" | "down") => {
    const widgets = [...editedDashboard.widgets]
    const index = widgets.findIndex((w) => w.id === widgetId)

    if (index === -1) return

    if (direction === "up" && index > 0) {
      // Swap with the widget above
      ;[widgets[index], widgets[index - 1]] = [widgets[index - 1], widgets[index]]
    } else if (direction === "down" && index < widgets.length - 1) {
      // Swap with the widget below
      ;[widgets[index], widgets[index + 1]] = [widgets[index + 1], widgets[index]]
    }

    setEditedDashboard({
      ...editedDashboard,
      widgets,
    })
  }

  // Save the dashboard
  const handleSaveDashboard = () => {
    onSave(editedDashboard)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Dashboard Widgets</h3>
            <Button onClick={handleAddWidget} className="gap-1">
              <Plus className="h-4 w-4" /> Add Widget
            </Button>
          </div>

          {editedDashboard.widgets.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-2">No Widgets</h3>
              <p className="text-muted-foreground mb-4">
                Add widgets to your dashboard to start visualizing your data.
              </p>
              <Button onClick={handleAddWidget} className="gap-1">
                <Plus className="h-4 w-4" /> Add Widget
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {editedDashboard.widgets.map((widget, index) => (
                <div key={widget.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">{widget.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveWidget(widget.id, "up")}
                        disabled={index === 0}
                      >
                        <MoveVertical className="h-4 w-4 rotate-180" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveWidget(widget.id, "down")}
                        disabled={index === editedDashboard.widgets.length - 1}
                      >
                        <MoveVertical className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditWidget(widget)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteWidget(widget.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="h-[200px] overflow-hidden">
                    <WidgetRenderer widget={widget} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="dashboard-name" className="text-sm font-medium">
                Dashboard Name
              </label>
              <input
                id="dashboard-name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editedDashboard.name}
                onChange={(e) => setEditedDashboard({ ...editedDashboard, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="dashboard-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                id="dashboard-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editedDashboard.description || ""}
                onChange={(e) => setEditedDashboard({ ...editedDashboard, description: e.target.value })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveDashboard}>Save Dashboard</Button>
      </div>

      {/* Widget Builder Dialog */}
      <Dialog open={isWidgetDialogOpen} onOpenChange={setIsWidgetDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingWidget ? "Edit Widget" : "Add Widget"}</DialogTitle>
          </DialogHeader>
          <WidgetBuilder
            initialWidget={editingWidget || undefined}
            onSave={handleSaveWidget}
            onCancel={() => setIsWidgetDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
