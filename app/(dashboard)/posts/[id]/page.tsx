"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, CheckCircle, Pencil, Trash2 } from "lucide-react"
import { usePosts } from "@/lib/posts-context"
import { usePostModal } from "@/lib/post-modal-context"
import { PostModal } from "@/components/post-modal"
import { useToast } from "@/components/ui/use-toast"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getPostById, getSourceById, deletePost, updatePost, completePost } = usePosts()
  const { setEditingPost, openPostModal } = usePostModal()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [post, setPost] = useState<any>(null)
  const [source, setSource] = useState<any>(null)
  const [metrics, setMetrics] = useState<Record<string, any>>({})
  const [isEditingMetrics, setIsEditingMetrics] = useState(false)

  const postId = params.id as string

  useEffect(() => {
    if (postId) {
      const postData = getPostById(postId)
      setPost(postData)

      if (postData) {
        const sourceData = getSourceById(postData.sourceId)
        setSource(sourceData)

        // Initialize metrics
        if (postData.metrics) {
          setMetrics(postData.metrics)
        } else if (sourceData) {
          const initialMetrics: Record<string, any> = {}
          sourceData.fields.forEach((field: any) => {
            initialMetrics[field.label] = ""
          })
          setMetrics(initialMetrics)
        }
      }
    }
  }, [postId, getPostById, getSourceById])

  if (!post || !source) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p>Loading post details...</p>
      </div>
    )
  }

  const handleEdit = () => {
    setEditingPost(post)
    openPostModal()
  }

  const handleDelete = () => {
    deletePost(post.id)
    toast({
      title: "Post deleted",
      description: "The post has been deleted successfully.",
    })
    router.push("/posts")
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "completed") {
      // If changing to completed, show metrics fields
      setIsEditingMetrics(true)

      // Update post status
      const updatedPost = {
        ...post,
        status: newStatus,
      }
      updatePost(updatedPost)
      setPost(updatedPost)
    } else {
      // For other status changes, just update the status
      const updatedPost = {
        ...post,
        status: newStatus,
      }
      updatePost(updatedPost)
      setPost(updatedPost)

      toast({
        title: "Status updated",
        description: `Post status changed to ${newStatus}.`,
      })
    }
  }

  const handleMetricChange = (fieldLabel: string, value: string) => {
    const updatedMetrics = {
      ...metrics,
      [fieldLabel]: value,
    }
    setMetrics(updatedMetrics)

    // Save metrics immediately
    const updatedPost = {
      ...post,
      metrics: updatedMetrics,
    }
    updatePost(updatedPost)
    setPost(updatedPost)
  }

  const handleSaveMetrics = () => {
    // Update the post with the metrics
    const updatedPost = {
      ...post,
      metrics,
      status: "completed",
    }
    updatePost(updatedPost)
    setPost(updatedPost)
    setIsEditingMetrics(false)

    toast({
      title: "Metrics saved",
      description: "Post metrics have been saved successfully.",
    })
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/posts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Post Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: source.color }} />
                {source.name}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={post.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[130px]">{getStatusBadge(post.status)}</SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-1 text-muted-foreground">Date</h3>
            <p>{format(parseISO(post.date), "MMMM d, yyyy")}</p>
          </div>

          {post.content && (
            <div>
              <h3 className="text-sm font-medium mb-1 text-muted-foreground">Content</h3>
              <div className="p-4 bg-muted/30 rounded-md whitespace-pre-wrap">{post.content}</div>
            </div>
          )}

          {/* Metrics Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Metrics</h3>
              {post.status === "completed" && !isEditingMetrics && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingMetrics(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit Metrics
                </Button>
              )}
            </div>

            {isEditingMetrics ? (
              <div className="space-y-4 bg-muted/30 p-4 rounded-md">
                {source.fields.map((field: any) => (
                  <div key={field.id} className="grid gap-2">
                    <Label htmlFor={`metric-${field.id}`}>{field.label}</Label>
                    <Input
                      id={`metric-${field.id}`}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={metrics[field.label] || ""}
                      onChange={(e) => handleMetricChange(field.label, e.target.value)}
                      type={field.type === "number" || field.type === "percentage" ? "number" : "text"}
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={handleSaveMetrics}>Save Metrics</Button>
                </div>
              </div>
            ) : post.status === "completed" && post.metrics ? (
              <div className="bg-muted/30 p-4 rounded-md">
                {Object.entries(post.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{key}:</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 p-4 rounded-md text-center text-muted-foreground">
                {post.status === "published" ? (
                  <p>Mark this post as completed to add metrics</p>
                ) : (
                  <p>Metrics will be available when the post is completed</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between pt-6">
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the post. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            {post.status === "published" && (
              <Button onClick={() => handleStatusChange("completed")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            )}
            <Button onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardFooter>
      </Card>

      <PostModal />
    </div>
  )
}
