"use client"

import type React from "react"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePosts } from "@/lib/posts-context"
import { useState } from "react"
import { usePostModal } from "@/lib/post-modal-context"
import type { Post } from "@/lib/post-modal-context"

interface SourceDetailModalProps {
  sourceId: string | null
  isOpen: boolean
  onClose: () => void
  onPostClick: (post: Post) => void
}

export function SourceDetailModal({ sourceId, isOpen, onClose, onPostClick }: SourceDetailModalProps) {
  const { getSourceById, getPostsBySource, updateSourceColor } = usePosts()
  const { setEditingPost, openPostModal } = usePostModal()

  const source = sourceId ? getSourceById(sourceId) : null
  const [color, setColor] = useState(source?.color || "#000000")

  if (!source) return null

  const { today, thisWeek, thisMonth, future } = getPostsBySource(source.id)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleSaveColor = () => {
    updateSourceColor(source.id, color)
  }

  const handleAddPost = () => {
    setEditingPost(null)
    openPostModal()
    onClose()
  }

  const renderPostList = (posts: Post[], title: string) => {
    if (posts.length === 0) return null

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3 border rounded-md cursor-pointer hover:bg-muted"
              onClick={() => onPostClick(post)}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{post.title}</h4>
                <Badge variant="outline" className={getStatusClass(post.status)}>
                  {post.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{format(parseISO(post.date), "MMM d, yyyy")}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: source.color }} />
            {source.name}
          </DialogTitle>
          <DialogDescription>View and manage posts for this source</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="source-color">Source Color</Label>
              <div className="flex gap-2">
                <Input
                  id="source-color"
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                  className="w-12 h-9 p-1"
                />
                <Input type="text" value={color} onChange={handleColorChange} className="flex-1" />
              </div>
            </div>
            <Button onClick={handleSaveColor}>Save Color</Button>
          </div>

          <Separator />

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
            {renderPostList(today, "Today")}
            {renderPostList(thisWeek, "This Week")}
            {renderPostList(thisMonth, "This Month")}
            {renderPostList(future, "Future")}

            {today.length === 0 && thisWeek.length === 0 && thisMonth.length === 0 && future.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No posts found for this source</div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAddPost}>Add New Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getStatusClass(status: string) {
  switch (status) {
    case "draft":
      return "bg-gray-50 text-gray-700 hover:bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400"
    case "scheduled":
      return "bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
    case "published":
      return "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
    case "completed":
      return "bg-purple-50 text-purple-700 hover:bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
    default:
      return ""
  }
}
