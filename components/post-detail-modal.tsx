"use client"

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
import { CheckCircle, Pencil, Trash2 } from "lucide-react"
import { usePosts } from "@/lib/posts-context"
import { usePostModal } from "@/lib/post-modal-context"
import { useState } from "react"
import { PostMetricsModal } from "./post-metrics-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PostDetailModalProps {
  postId: string | null
  isOpen: boolean
  onClose: () => void
}

export function PostDetailModal({ postId, isOpen, onClose }: PostDetailModalProps) {
  const { getPostById, getSourceById, deletePost } = usePosts()
  const { setEditingPost, openPostModal } = usePostModal()
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const post = postId ? getPostById(postId) : null
  const source = post ? getSourceById(post.sourceId) : null

  if (!post || !source) return null

  const handleEdit = () => {
    setEditingPost(post)
    openPostModal()
    onClose()
  }

  const handleComplete = () => {
    setIsMetricsModalOpen(true)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    deletePost(post.id)
    setIsDeleteDialogOpen(false)
    onClose()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 hover:bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400"
          >
            Draft
          </Badge>
        )
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
          >
            Scheduled
          </Badge>
        )
      case "published":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
          >
            Published
          </Badge>
        )
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 hover:bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
          >
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{post.title}</DialogTitle>
              {getStatusBadge(post.status)}
            </div>
            <DialogDescription>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: source.color }} />
                {source.name}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Date</h4>
              <p>{format(parseISO(post.date), "MMMM d, yyyy")}</p>
            </div>

            {post.content && (
              <div>
                <h4 className="text-sm font-medium mb-1">Content</h4>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
            )}

            {post.status === "completed" && post.metrics && (
              <div>
                <h4 className="text-sm font-medium mb-2">Metrics</h4>
                <div className="bg-muted/50 p-3 rounded-md">
                  {Object.entries(post.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-sm text-muted-foreground">{key}:</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <DialogFooter className="flex sm:justify-between">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <div className="flex gap-2">
              {post.status === "published" && (
                <Button variant="outline" size="sm" onClick={handleComplete}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              )}
              <Button size="sm" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PostMetricsModal
        post={post}
        isOpen={isMetricsModalOpen}
        onClose={() => {
          setIsMetricsModalOpen(false)
          onClose()
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
