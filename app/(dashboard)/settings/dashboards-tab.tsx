"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, LayoutGrid } from "lucide-react"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"
import { DashboardEditor } from "@/components/dashboard/dashboard-editor"
import type { Dashboard } from "@/lib/types/dashboard"
import { v4 as uuidv4 } from "uuid"

export function DashboardsTab() {
  const { dashboards, addDashboard, updateDashboard, setDefaultDashboard, deleteDashboard } = useDashboardSettings()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null)

  const handleCreateDashboard = () => {
    // Create a new empty dashboard
    const newDashboard: Dashboard = {
      id: uuidv4(),
      name: "New Dashboard",
      widgets: [],
      isDefault: dashboards.length === 0, // Make it default if it's the first one
    }

    setEditingDashboard(newDashboard)
    setIsEditorOpen(true)
  }

  const handleEditDashboard = (dashboard: Dashboard) => {
    setEditingDashboard({ ...dashboard })
    setIsEditorOpen(true)
  }

  const handleSaveDashboard = (dashboard: Dashboard) => {
    if (dashboards.some((d) => d.id === dashboard.id)) {
      // Update existing dashboard
      updateDashboard(dashboard.id, dashboard)
    } else {
      // Add new dashboard
      addDashboard(dashboard)
    }

    setIsEditorOpen(false)
    setEditingDashboard(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Dashboards</h3>
        <Button className="gap-1" onClick={handleCreateDashboard}>
          <Plus className="h-4 w-4" /> Create Dashboard
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <DashboardCard
            key={dashboard.id}
            dashboard={dashboard}
            onEdit={() => handleEditDashboard(dashboard)}
            onSetDefault={() => setDefaultDashboard(dashboard.id)}
            onDelete={() => deleteDashboard(dashboard.id)}
          />
        ))}

        {dashboards.length === 0 && (
          <div className="col-span-full text-center py-12 border rounded-lg bg-muted/10">
            <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Dashboards</h3>
            <p className="text-muted-foreground mb-4">Create your first dashboard to start visualizing your data.</p>
            <Button className="gap-1" onClick={handleCreateDashboard}>
              <Plus className="h-4 w-4" /> Create Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Dashboard Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingDashboard?.id ? "Edit Dashboard" : "Create Dashboard"}</DialogTitle>
          </DialogHeader>
          {editingDashboard && (
            <DashboardEditor
              dashboard={editingDashboard}
              onSave={handleSaveDashboard}
              onCancel={() => setIsEditorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DashboardCard({
  dashboard,
  onEdit,
  onSetDefault,
  onDelete,
}: {
  dashboard: Dashboard
  onEdit: () => void
  onSetDefault: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {dashboard.name}
          {dashboard.isDefault && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Default</span>
          )}
        </CardTitle>
        <CardDescription>{dashboard.description || "No description"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{dashboard.widgets.length} widgets</div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="gap-1" onClick={onEdit}>
          <Edit className="h-3.5 w-3.5" /> Edit
        </Button>
        <div className="flex gap-2">
          {!dashboard.isDefault && (
            <Button variant="outline" size="sm" onClick={onSetDefault}>
              Set as Default
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
