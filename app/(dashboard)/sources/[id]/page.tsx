"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import { usePosts } from "@/lib/posts-context"
import { usePostModal } from "@/lib/post-modal-context"
import { PostModal } from "@/components/post-modal"
import { PostDetailModal } from "@/components/post-detail-modal"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Post } from "@/lib/post-modal-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"

export default function SourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { sources, getSourceById, updateSourceColor, getPostsBySourceId } = usePosts()
  const { setEditingPost, openPostModal } = usePostModal()
  const { dashboards } = useDashboardSettings()
  const [source, setSource] = useState<any>(null)
  const [color, setColor] = useState("")
  const [selectedDashboard, setSelectedDashboard] = useState<string>("")
  const [posts, setPosts] = useState<{ today: any[]; thisWeek: any[]; thisMonth: any[]; future: any[] }>({
    today: [],
    thisWeek: [],
    thisMonth: [],
    future: [],
  })
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<"month" | "week">("month")
  const [isLoading, setIsLoading] = useState(true)

  // For adding/editing fields
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<any>(null)
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldType, setFieldType] = useState("text")

  // Get source ID from params
  const sourceId = params.id as string

  useEffect(() => {
    const loadSource = async () => {
      try {
        setIsLoading(true)
        if (sourceId) {
          // Get source data
          const sourceData = getSourceById(sourceId)
          if (sourceData) {
            setSource(sourceData)
            setColor(sourceData.color)
            
            // Get posts for this source
            const sourcePosts = getPostsBySourceId(sourceId)
            if (sourcePosts) {
              // Organize posts by time periods
              const today = new Date()
              const todayStr = today.toISOString().split('T')[0]
              
              const organizedPosts = {
                today: sourcePosts.filter(post => post.date === todayStr),
                thisWeek: sourcePosts.filter(post => {
                  const postDate = new Date(post.date)
                  const weekStart = new Date(today)
                  weekStart.setDate(today.getDate() - today.getDay())
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekStart.getDate() + 6)
                  return postDate >= weekStart && postDate <= weekEnd
                }),
                thisMonth: sourcePosts.filter(post => {
                  const postDate = new Date(post.date)
                  return postDate.getMonth() === today.getMonth() && 
                         postDate.getFullYear() === today.getFullYear()
                }),
                future: sourcePosts.filter(post => new Date(post.date) > today)
              }
              
              setPosts(organizedPosts)
            }
          } else {
            toast({
              variant: "destructive",
              title: "Source not found",
              description: "The requested source could not be found.",
            })
            router.push('/sources')
          }
        }
      } catch (error) {
        console.error('Error loading source:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load source details. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSource()
  }, [sourceId, getSourceById, getPostsBySourceId, router, toast])

  // Generate days for the month view
  const monthDays = (() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  })()

  // Generate days for the week view
  const weekDays = (() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(weekStart)

    const days = []
    let day = weekStart
    while (day <= weekEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  })()

  // Get all posts for the source
  const allPosts = (() => {
    if (!source) return []
    return [...posts.today, ...posts.thisWeek, ...posts.thisMonth, ...posts.future]
  })()

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    return allPosts.filter((post) => {
      const postDate = parseISO(post.date)
      return isSameDay(postDate, day)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading source details...</p>
        </div>
      </div>
    )
  }

  if (!source) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Source not found</h2>
          <p className="text-muted-foreground">The requested source could not be found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/sources')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sources
          </Button>
        </div>
      </div>
    )
  }

  const handleSaveColor = () => {
    updateSourceColor(source.id, color)
    toast({
      title: "Color updated",
      description: "The source color has been updated successfully.",
    })
  }

  const handleAddPost = () => {
    setEditingPost({
      id: "",
      title: "",
      sourceId: source.id,
      date: format(new Date(), "yyyy-MM-dd"),
      status: "draft",
    })
    openPostModal()
  }

  const handlePostClick = (post: any) => {
    console.log("Post clicked:", post.id)
    setSelectedPost(post.id)
    setIsPostDetailModalOpen(true)
  }

  const handleAddField = () => {
    setEditingField(null)
    setFieldLabel("")
    setFieldType("text")
    setIsFieldDialogOpen(true)
  }

  const handleEditField = (field: any) => {
    setEditingField(field)
    setFieldLabel(field.label)
    setFieldType(field.type)
    setIsFieldDialogOpen(true)
  }

  const handleSaveField = () => {
    if (!fieldLabel) {
      toast({
        variant: "destructive",
        title: "Invalid field",
        description: "Please enter a field label.",
      })
      return
    }

    // In a real app, this would update the source fields in the database
    toast({
      title: editingField ? "Field updated" : "Field added",
      description: `The field has been ${editingField ? "updated" : "added"} successfully.`,
    })

    setIsFieldDialogOpen(false)
  }

  // Calendar navigation
  const previousPeriod = () => {
    setCurrentDate((prev) => {
      if (calendarView === "month") {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() - 1)
        return newDate
      } else {
        return addDays(prev, -7)
      }
    })
  }

  const nextPeriod = () => {
    setCurrentDate((prev) => {
      if (calendarView === "month") {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() + 1)
        return newDate
      } else {
        return addDays(prev, 7)
      }
    })
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  const renderPost = (post: Post) => {
    return (
      <div
        key={post.id}
        className="p-1 mb-1 rounded text-xs cursor-pointer truncate"
        style={{
          backgroundColor: `${source.color}20`, // 20% opacity
          borderLeft: `3px solid ${source.color}`,
          color: `${source.color}`,
        }}
        onClick={(e) => {
          e.stopPropagation()
          handlePostClick(post)
        }}
      >
        {post.title}
      </div>
    )
  }

  const renderPostList = (posts: any[], title: string) => {
    if (posts.length === 0) return null

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3 border rounded-md cursor-pointer hover:bg-muted"
              onClick={() => handlePostClick(post)}
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/sources")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Source Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: source.color }} />
            <CardTitle className="text-2xl">{source.name}</CardTitle>
          </div>
          <CardDescription>{getPlatformName(source.platform)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="source-color">Source Color</Label>
              <div className="flex gap-2">
                <Input
                  id="source-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <Button onClick={handleSaveColor}>Save Color</Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Dashboard</h3>
            </div>
            <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
              <SelectTrigger>
                <SelectValue placeholder="Select a dashboard" />
              </SelectTrigger>
              <SelectContent>
                {dashboards.map((dashboard) => (
                  <SelectItem key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Custom Fields</h3>
              <Button variant="outline" size="sm" onClick={handleAddField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            {source.fields.length === 0 ? (
              <div className="text-center py-6 bg-muted/30 rounded-md">
                <p className="text-muted-foreground">No custom fields added yet.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {source.fields.map((field: any) => (
                  <AccordionItem key={field.id} value={field.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div>
                          <p className="font-medium">{field.label}</p>
                          <p className="text-sm text-muted-foreground capitalize">{field.type}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{field.label}</p>
                          <p className="text-sm text-muted-foreground capitalize">{field.type}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleEditField(field)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <Separator />

          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6 pt-4">
              <div className="flex justify-end">
                <Button onClick={handleAddPost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post
                </Button>
              </div>

              <div className="space-y-6">
                {renderPostList(posts.today, "Today")}
                {renderPostList(posts.thisWeek, "This Week")}
                {renderPostList(posts.thisMonth, "This Month")}
                {renderPostList(posts.future, "Future")}

                {posts.today.length === 0 &&
                  posts.thisWeek.length === 0 &&
                  posts.thisMonth.length === 0 &&
                  posts.future.length === 0 && (
                    <div className="text-center py-8 bg-muted/30 rounded-md">
                      <p className="text-muted-foreground">No posts found for this source</p>
                      <Button className="mt-4" onClick={handleAddPost}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Post
                      </Button>
                    </div>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={previousPeriod}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextPeriod}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={today}>
                        Today
                      </Button>
                      <CardTitle>
                        {calendarView === "month" && format(currentDate, "MMMM yyyy")}
                        {calendarView === "week" && `Week of ${format(weekDays[0], "MMM d, yyyy")}`}
                      </CardTitle>
                    </div>
                    <div>
                      <TabsList>
                        <TabsTrigger value="month" onClick={() => setCalendarView("month")}>
                          Month
                        </TabsTrigger>
                        <TabsTrigger value="week" onClick={() => setCalendarView("week")}>
                          Week
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {calendarView === "month" && (
                    <div className="grid grid-cols-7 gap-px bg-muted">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="bg-background p-2 text-center text-sm font-medium">
                          {day}
                        </div>
                      ))}
                      {monthDays.map((day, i) => {
                        const dayPosts = getPostsForDay(day)
                        return (
                          <div
                            key={i}
                            className={`min-h-[100px] bg-background p-1 cursor-pointer hover:bg-muted/30 ${
                              !isSameMonth(day, currentDate)
                                ? "text-muted-foreground"
                                : isSameDay(day, new Date())
                                  ? "bg-muted/50"
                                  : ""
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium p-1">{format(day, "d")}</span>
                              {dayPosts.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {dayPosts.length}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 overflow-y-auto max-h-[80px]">
                              {dayPosts.map((post) => renderPost(post))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {calendarView === "week" && (
                    <div className="grid grid-cols-7 gap-px bg-muted">
                      {weekDays.map((day) => (
                        <div key={day.toString()} className="bg-background p-2 text-center text-sm font-medium">
                          {format(day, "EEE")}
                          <div
                            className={`text-center ${isSameDay(day, new Date()) ? "bg-muted rounded-full w-7 h-7 flex items-center justify-center mx-auto" : ""}`}
                          >
                            {format(day, "d")}
                          </div>
                        </div>
                      ))}
                      {weekDays.map((day) => {
                        const dayPosts = getPostsForDay(day)
                        return (
                          <div
                            key={day.toString() + "-content"}
                            className={`min-h-[200px] bg-background p-1 cursor-pointer hover:bg-muted/30 ${
                              isSameDay(day, new Date()) ? "bg-muted/50" : ""
                            }`}
                          >
                            <div className="overflow-y-auto h-full">{dayPosts.map((post) => renderPost(post))}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="pt-4">
              <div className="text-center py-8 bg-muted/30 rounded-md">
                <p className="text-muted-foreground">Analytics for this source will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingField ? "Edit Field" : "Add Custom Field"}</DialogTitle>
            <DialogDescription>
              {editingField
                ? "Update the custom field for this source."
                : "Add a new custom field to track for this source."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="field-label">Field Label</Label>
              <Input
                id="field-label"
                placeholder="e.g., Impressions, Engagement Rate"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="field-type">Field Type</Label>
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger id="field-type">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField}>{editingField ? "Update Field" : "Add Field"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PostDetailModal
        postId={selectedPost}
        isOpen={isPostDetailModalOpen}
        onClose={() => setIsPostDetailModalOpen(false)}
      />

      <PostModal />
    </div>
  )
}

function getPlatformName(platform: string) {
  switch (platform) {
    case "instagram":
      return "Instagram"
    case "youtube":
      return "YouTube"
    case "facebook":
      return "Facebook"
    case "other":
      return "Other Platform"
    default:
      return "Unknown Platform"
  }
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
