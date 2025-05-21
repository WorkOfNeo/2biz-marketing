"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePosts } from "@/lib/posts-context"
import type { Post } from "@/lib/post-modal-context"

interface PostMetricsModalProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
}

export function PostMetricsModal({ post, isOpen, onClose }: PostMetricsModalProps) {
  const { completePost, getSourceById } = usePosts()
  const [metrics, setMetrics] = useState<Record<string, any>>({})
  const [source, setSource] = useState<any>(null)

  useEffect(() => {
    if (post && isOpen) {
      const sourceData = getSourceById(post.sourceId)
      setSource(sourceData)

      // Initialize metrics with empty values
      const initialMetrics: Record<string, any> = {}
      sourceData?.fields.forEach((field) => {
        initialMetrics[field.label] = post.metrics?.[field.label] || ""
      })
      setMetrics(initialMetrics)
    }
  }, [post, isOpen, getSourceById])

  const handleSubmit = () => {
    if (!post) return

    completePost(post.id, metrics)
    onClose()
  }

  if (!post || !source) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Complete Post: {post.title}</DialogTitle>
          <DialogDescription>Enter the metrics for this post to mark it as completed.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {source.fields.map((field: any) => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={`metric-${field.id}`}>{field.label}</Label>
              <Input
                id={`metric-${field.id}`}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={metrics[field.label] || ""}
                onChange={(e) => setMetrics({ ...metrics, [field.label]: e.target.value })}
                type={field.type === "number" || field.type === "percentage" ? "number" : "text"}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Complete Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
