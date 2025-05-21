"use client"

import { useState, useEffect } from "react"
import { usePosts } from "@/lib/posts-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, X } from "lucide-react"
import type { MetricMapping, CalculationType } from "@/lib/types/dashboard"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"

export function MetricMappingTab() {
  const { sources } = usePosts()
  const { metricMappings, addMetricMapping, updateMetricMapping, deleteMetricMapping } = useDashboardSettings()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<MetricMapping | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [selectedSourceMetrics, setSelectedSourceMetrics] = useState<Array<{ sourceId: string; fieldId: string }>>([])
  const [calculationType, setCalculationType] = useState<CalculationType>("sum")
  const [customFormula, setCustomFormula] = useState("")

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen && !editingMapping) {
      resetForm()
    }
  }, [isAddDialogOpen, editingMapping])

  // Set form values when editing
  useEffect(() => {
    if (editingMapping) {
      setName(editingMapping.name)
      setSelectedSourceMetrics(editingMapping.sourceMetrics)
      setCalculationType(editingMapping.calculationType)
      setCustomFormula(editingMapping.customFormula || "")
    }
  }, [editingMapping])

  const resetForm = () => {
    setName("")
    setSelectedSourceMetrics([])
    setCalculationType("sum")
    setCustomFormula("")
  }

  const handleAddSourceMetric = () => {
    if (sources.length > 0) {
      const firstSource = sources[0]
      const firstField = firstSource.fields[0]

      if (firstField) {
        setSelectedSourceMetrics([...selectedSourceMetrics, { sourceId: firstSource.id, fieldId: firstField.id }])
      }
    }
  }

  const handleRemoveSourceMetric = (index: number) => {
    setSelectedSourceMetrics(selectedSourceMetrics.filter((_, i) => i !== index))
  }

  const handleSourceChange = (index: number, sourceId: string) => {
    const newMetrics = [...selectedSourceMetrics]
    const source = sources.find((s) => s.id === sourceId)

    if (source && source.fields.length > 0) {
      newMetrics[index] = { sourceId, fieldId: source.fields[0].id }
      setSelectedSourceMetrics(newMetrics)
    }
  }

  const handleFieldChange = (index: number, fieldId: string) => {
    const newMetrics = [...selectedSourceMetrics]
    newMetrics[index] = { ...newMetrics[index], fieldId }
    setSelectedSourceMetrics(newMetrics)
  }

  const handleSave = () => {
    if (!name || selectedSourceMetrics.length === 0) return

    const newMapping: Omit<MetricMapping, "id"> = {
      name,
      sourceMetrics: selectedSourceMetrics,
      calculationType,
      ...(calculationType === "custom" && { customFormula }),
    }

    if (editingMapping) {
      updateMetricMapping(editingMapping.id, newMapping)
      setEditingMapping(null)
    } else {
      addMetricMapping(newMapping)
      setIsAddDialogOpen(false)
    }

    resetForm()
  }

  const handleDelete = (id: string) => {
    deleteMetricMapping(id)
  }

  const handleEdit = (mapping: MetricMapping) => {
    setEditingMapping(mapping)
  }

  const getSourceName = (sourceId: string) => {
    const source = sources.find((s) => s.id === sourceId)
    return source ? source.name : "Unknown Source"
  }

  const getFieldName = (sourceId: string, fieldId: string) => {
    const source = sources.find((s) => s.id === sourceId)
    const field = source?.fields.find((f) => f.id === fieldId)
    return field ? field.label : "Unknown Field"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Metric Mappings</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> Add Metric
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Metric Mapping</DialogTitle>
              <DialogDescription>
                Map source metrics to dashboard displays and create calculated metrics.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Metric Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Total Impressions, Engagement Rate"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>Source Metrics</Label>
                  <Button variant="outline" size="sm" onClick={handleAddSourceMetric} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Source
                  </Button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {selectedSourceMetrics.map((metric, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select value={metric.sourceId} onValueChange={(value) => handleSourceChange(index, value)}>
                        <SelectTrigger className="flex-1">
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

                      <Select value={metric.fieldId} onValueChange={(value) => handleFieldChange(index, value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {sources
                            .find((s) => s.id === metric.sourceId)
                            ?.fields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Button variant="ghost" size="icon" onClick={() => handleRemoveSourceMetric(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {selectedSourceMetrics.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No source metrics added. Click "Add Source" to add one.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="calculation">Calculation Type</Label>
                <Select value={calculationType} onValueChange={(value) => setCalculationType(value as CalculationType)}>
                  <SelectTrigger id="calculation">
                    <SelectValue placeholder="Select calculation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="latest">Latest Value</SelectItem>
                    <SelectItem value="custom">Custom Formula</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {calculationType === "custom" && (
                <div className="grid gap-2">
                  <Label htmlFor="formula">Custom Formula</Label>
                  <Input
                    id="formula"
                    value={customFormula}
                    onChange={(e) => setCustomFormula(e.target.value)}
                    placeholder="e.g., metric1 / metric2 * 100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Use metric1, metric2, etc. to refer to the source metrics in the order they are listed above.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Create Metric</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMapping} onOpenChange={(open) => !open && setEditingMapping(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Metric Mapping</DialogTitle>
            <DialogDescription>Update your metric mapping configuration.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Metric Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Source Metrics</Label>
                <Button variant="outline" size="sm" onClick={handleAddSourceMetric} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Source
                </Button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {selectedSourceMetrics.map((metric, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select value={metric.sourceId} onValueChange={(value) => handleSourceChange(index, value)}>
                      <SelectTrigger className="flex-1">
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

                    <Select value={metric.fieldId} onValueChange={(value) => handleFieldChange(index, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources
                          .find((s) => s.id === metric.sourceId)
                          ?.fields.map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSourceMetric(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-calculation">Calculation Type</Label>
              <Select value={calculationType} onValueChange={(value) => setCalculationType(value as CalculationType)}>
                <SelectTrigger id="edit-calculation">
                  <SelectValue placeholder="Select calculation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                  <SelectItem value="latest">Latest Value</SelectItem>
                  <SelectItem value="custom">Custom Formula</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {calculationType === "custom" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-formula">Custom Formula</Label>
                <Input
                  id="edit-formula"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="e.g., metric1 / metric2 * 100"
                />
                <p className="text-sm text-muted-foreground">
                  Use metric1, metric2, etc. to refer to the source metrics in the order they are listed above.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMapping(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Metrics Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Source Metrics</TableHead>
              <TableHead>Calculation</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metricMappings.length > 0 ? (
              metricMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">{mapping.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {mapping.sourceMetrics.map((metric, index) => (
                        <div key={index} className="text-sm">
                          {getSourceName(metric.sourceId)}: {getFieldName(metric.sourceId, metric.fieldId)}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {mapping.calculationType === "custom"
                      ? `Custom: ${mapping.customFormula}`
                      : mapping.calculationType.charAt(0).toUpperCase() + mapping.calculationType.slice(1)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(mapping)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(mapping.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No metric mappings defined. Click "Add Metric" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
