"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"
import { usePosts } from "@/lib/posts-context"
import { usePostModal } from "@/lib/post-modal-context"
import { PostModal } from "@/components/post-modal"

export default function PostsPage() {
  const router = useRouter()
  const { posts, getSourceById, isLoading } = usePosts()
  const { openPostModal } = usePostModal()

  const handleAddPost = () => {
    openPostModal()
  }

  const handlePostClick = (postId: string) => {
    router.push(`/posts/${postId}`)
  }

  const handleSourceClick = (sourceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/sources/${sourceId}`)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">Manage your marketing posts across different sources</p>
        </div>
        <Button className="gap-1" onClick={handleAddPost}>
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>View and manage all your marketing posts</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No posts added yet.</p>
              <Button className="mt-4 gap-1" onClick={handleAddPost}>
                <Plus className="h-4 w-4" />
                Add your first post
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const source = getSourceById(post.sourceId)
                  return (
                    <TableRow
                      key={post.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        {source ? (
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:underline"
                            onClick={(e) => handleSourceClick(post.sourceId, e)}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: source.color || "#000000" }}
                            />
                            {source.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown Source</span>
                        )}
                      </TableCell>
                      <TableCell>{format(parseISO(post.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PostModal />
    </div>
  )
}
