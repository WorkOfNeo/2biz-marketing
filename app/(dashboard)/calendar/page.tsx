"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { usePosts } from "@/lib/posts-context"
import type { Post } from "@/lib/post-modal-context"

export default function CalendarPage() {
  const router = useRouter()
  const { posts, getSourceById } = usePosts()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  // Filter posts based on date range if selected
  const filteredPosts = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return posts.filter((post) => {
        const postDate = parseISO(post.date)
        return postDate >= dateRange.from! && postDate <= dateRange.to!
      })
    }
    return posts
  }, [posts, dateRange])

  // Generate days for the month view
  const monthDays = useMemo(() => {
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
  }, [currentDate])

  // Generate days for the week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(weekStart)

    const days = []
    let day = weekStart
    while (day <= weekEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentDate])

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    return filteredPosts.filter((post) => {
      const postDate = parseISO(post.date)
      return isSameDay(postDate, day)
    })
  }

  // Handle navigation
  const previousMonth = () => {
    setCurrentDate((prev) => {
      if (view === "month") {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() - 1)
        return newDate
      } else if (view === "week") {
        return addDays(prev, -7)
      } else {
        return addDays(prev, -1)
      }
    })
  }

  const nextMonth = () => {
    setCurrentDate((prev) => {
      if (view === "month") {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() + 1)
        return newDate
      } else if (view === "week") {
        return addDays(prev, 7)
      } else {
        return addDays(prev, 1)
      }
    })
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  // Handle post click
  const handlePostClick = (postId: string) => {
    router.push(`/posts/${postId}`)
  }

  // Handle day click
  const handleDayClick = (day: Date) => {
    setCurrentDate(day)
    setView("day")
  }

  // Render post item
  const renderPost = (post: Post) => {
    const source = getSourceById(post.sourceId)
    const sourceColor = source?.color || "#cccccc"

    return (
      <div
        key={post.id}
        className="p-1 mb-1 rounded text-xs cursor-pointer truncate"
        style={{
          backgroundColor: `${sourceColor}20`, // 20% opacity
          borderLeft: `3px solid ${sourceColor}`,
          color: `${sourceColor}`,
        }}
        onClick={(e) => {
          e.stopPropagation()
          handlePostClick(post.id)
        }}
      >
        {post.title}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View and manage your marketing posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <CalendarIcon className="h-4 w-4" />
                Select Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={today}>
                Today
              </Button>
              <CardTitle>
                {view === "month" && format(currentDate, "MMMM yyyy")}
                {view === "week" && `Week of ${format(weekDays[0], "MMM d, yyyy")}`}
                {view === "day" && format(currentDate, "MMMM d, yyyy")}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
            <div className="mb-4">
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="month">
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
                      onClick={() => handleDayClick(day)}
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
            </TabsContent>

            <TabsContent value="week">
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
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="overflow-y-auto h-full">{dayPosts.map((post) => renderPost(post))}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="day">
              <div className="bg-background p-4 min-h-[500px]">
                <h3 className="text-lg font-medium mb-4">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
                <div className="space-y-2">
                  {getPostsForDay(currentDate).length > 0 ? (
                    getPostsForDay(currentDate).map((post) => {
                      const source = getSourceById(post.sourceId)
                      return (
                        <div
                          key={post.id}
                          className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                          style={{ borderLeftColor: source?.color, borderLeftWidth: "4px" }}
                          onClick={() => handlePostClick(post.id)}
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{post.title}</h4>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{source?.name || "Unknown Source"}</p>
                          {post.content && <p className="text-sm mt-2 line-clamp-2">{post.content}</p>}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">No posts scheduled for this day</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to get status badge
function getStatusBadge(status: string) {
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
