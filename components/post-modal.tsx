"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePostModal } from "@/lib/post-modal-context"
import { usePosts } from "@/lib/posts-context"
import { useToast } from "@/components/ui/use-toast"

export function PostModal() {
  const { isPostModalOpen, closePostModal, editingPost } = usePostModal()
  const { sources, addPost, updatePost } = usePosts()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [sourceId, setSourceId] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens/closes or editing post changes
  useEffect(() => {
    if (isPostModalOpen) {
      if (editingPost) {
        setTitle(editingPost.title)
        setSourceId(editingPost.sourceId)
        setDate(new Date(editingPost.date))
        setContent(editingPost.content || "")
        setStatus(editingPost.status as "draft" | "scheduled" | "published")
      } else {
        setTitle("")
        setSourceId(sources.length > 0 ? sources[0].id : "")
        setDate(new Date())
        setContent("")
        setStatus("draft")
      }
    }
  }, [isPostModalOpen, editingPost, sources])

  const handleSubmit = async () => {
    if (!title || !sourceId || !date) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSubmitting(true)
    const formattedDate = format(date, "yyyy-MM-dd")

    try {
      if (editingPost) {
        await updatePost({
          ...editingPost,
          title,
          sourceId,
          date: formattedDate,
          content,
          status,
        })
      } else {
        await addPost({
          title,
          sourceId,
          date: formattedDate,
          content,
          status,
        })
      }
      closePostModal()
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save post. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isPostModalOpen} onOpenChange={(open) => !open && closePostModal()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
          <DialogDescription>
            {editingPost ? "Update your post details below." : "Add a new post to your marketing calendar."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="source">Source</Label>
            <Select value={sourceId} onValueChange={setSourceId}>
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

          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: "draft" | "scheduled" | "published") => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Post content or notes"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closePostModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title || !sourceId || !date}>
            {isSubmitting ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
