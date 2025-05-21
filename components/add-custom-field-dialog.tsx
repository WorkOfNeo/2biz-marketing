"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface AddCustomFieldDialogProps {
  onAddField: (field: { label: string; type: string }) => void
}

export function AddCustomFieldDialog({ onAddField }: AddCustomFieldDialogProps) {
  console.log("AddCustomFieldDialog rendered")
  const [open, setOpen] = useState(false)
  const [field, setField] = useState({
    label: "",
    type: "",
  })

  const handleAddField = () => {
    console.log("handleAddField called", field)
    if (field.label && field.type) {
      console.log("Field is valid, adding field", field)
      onAddField(field)
      setField({ label: "", type: "" })
      setOpen(false)
    } else {
      console.log("Field validation failed", field)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        console.log("Custom field dialog open state changed:", newOpen, "Current field:", field)
        setOpen(newOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add Field
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogDescription>Add a custom field to track for this source.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">Field Label</Label>
            <Input
              id="label"
              placeholder="Impressions, Likes, Comments, etc."
              value={field.label}
              onChange={(e) => {
                console.log("Field label changed:", e.target.value)
                setField({ ...field, label: e.target.value })
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Field Type</Label>
            <Select
              value={field.type}
              onValueChange={(value) => {
                console.log("Field type changed:", value)
                setField({ ...field, type: value })
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddField}>Add Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
