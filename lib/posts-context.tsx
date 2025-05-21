"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

// Check if we're in v0 environment
const isV0Environment = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

// Types
export type Source = {
  id: string
  name: string
  platform: string
  color: string
  status: "active" | "hidden" | "inactive"
  fields: { id: string; label: string; type: string }[]
  createdAt?: string
  updatedAt?: string
}

export type Post = {
  id: string
  title: string
  sourceId: string
  date: string
  status: "draft" | "scheduled" | "published" | "completed"
  content?: string
  metrics?: Record<string, number>
  createdAt?: string
  updatedAt?: string
}

type PostsContextType = {
  sources: Source[]
  posts: Post[]
  isLoading: boolean
  addSource: (source: Omit<Source, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateSource: (id: string, source: Partial<Omit<Source, "id">>) => Promise<void>
  deleteSource: (id: string) => Promise<void>
  addPost: (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updatePost: (id: string, post: Partial<Omit<Post, "id">>) => Promise<void>
  deletePost: (id: string) => Promise<void>
  getSourceById: (id: string) => Source | undefined
  getPostById: (id: string) => Post | undefined
  getPostsBySourceId: (sourceId: string) => Post[]
  refreshData: () => Promise<void>
}

// Mock data for v0 environment
const mockSources: Source[] = [
  {
    id: "source1",
    name: "Instagram",
    platform: "instagram",
    color: "#E1306C",
    status: "active",
    fields: [
      { id: "impressions", label: "Impressions", type: "number" },
      { id: "likes", label: "Likes", type: "number" },
      { id: "comments", label: "Comments", type: "number" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "source2",
    name: "Facebook",
    platform: "facebook",
    color: "#1877F2",
    status: "active",
    fields: [
      { id: "impressions", label: "Impressions", type: "number" },
      { id: "likes", label: "Likes", type: "number" },
      { id: "shares", label: "Shares", type: "number" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "source3",
    name: "YouTube",
    platform: "youtube",
    color: "#FF0000",
    status: "active",
    fields: [
      { id: "views", label: "Views", type: "number" },
      { id: "likes", label: "Likes", type: "number" },
      { id: "comments", label: "Comments", type: "number" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockPosts: Post[] = [
  {
    id: "post1",
    title: "Summer Campaign Launch",
    sourceId: "source1",
    date: "2023-06-15",
    status: "completed",
    content: "Launching our summer collection with a special discount!",
    metrics: { impressions: 5000, likes: 350, comments: 42 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "post2",
    title: "Product Feature Video",
    sourceId: "source3",
    date: "2023-06-20",
    status: "completed",
    content: "Detailed video showcasing our new product features",
    metrics: { views: 2500, likes: 180, comments: 35 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "post3",
    title: "Customer Testimonial",
    sourceId: "source2",
    date: "2023-06-25",
    status: "scheduled",
    content: "Sharing success stories from our customers",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "post4",
    title: "Upcoming Webinar",
    sourceId: "source1",
    date: "2023-07-05",
    status: "draft",
    content: "Join us for a webinar on digital marketing strategies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const PostsContext = createContext<PostsContextType | undefined>(undefined)

export function PostsProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<Source[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Use mock data for v0 environment
  const useMockData = isV0Environment

  const fetchData = async () => {
    try {
      console.log("Fetching data...")
      console.log("Environment:", isV0Environment ? "v0 preview" : "production")

      if (useMockData) {
        console.log("Using mock data for v0 environment")
        setSources(mockSources)
        setPosts(mockPosts)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      // Fetch sources
      console.log("Fetching sources from Firestore...")
      const sourcesSnapshot = await getDocs(collection(db, "sources"))
      const sourcesData = sourcesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Source[]
      console.log(`Fetched ${sourcesData.length} sources`)
      setSources(sourcesData)

      // Fetch posts
      console.log("Fetching posts from Firestore...")
      const postsSnapshot = await getDocs(collection(db, "posts"))
      const postsData = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[]
      console.log(`Fetched ${postsData.length} posts`)
      setPosts(postsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addSource = async (source: Omit<Source, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      console.log("Adding source:", source)

      if (useMockData) {
        console.log("Using mock addSource for v0 environment")
        const newId = `source${mockSources.length + 1}`
        const newSource = {
          id: newId,
          ...source,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setSources((prev) => [...prev, newSource])
        return newId
      }

      const sourceData = {
        ...source,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "sources"), sourceData)

      // Add to local state
      const newSource = {
        id: docRef.id,
        ...source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setSources((prev) => [...prev, newSource])

      return docRef.id
    } catch (error) {
      console.error("Error adding source:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add source. Please try again.",
      })
      throw error
    }
  }

  const updateSource = async (id: string, source: Partial<Omit<Source, "id">>): Promise<void> => {
    try {
      console.log("Updating source:", id, source)

      if (useMockData) {
        console.log("Using mock updateSource for v0 environment")
        setSources((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...source, updatedAt: new Date().toISOString() } : s)),
        )
        return
      }

      const sourceData = {
        ...source,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "sources", id), sourceData)

      // Update local state
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...source, updatedAt: new Date().toISOString() } : s)),
      )
    } catch (error) {
      console.error("Error updating source:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update source. Please try again.",
      })
      throw error
    }
  }

  const deleteSource = async (id: string): Promise<void> => {
    try {
      console.log("Deleting source:", id)

      if (useMockData) {
        console.log("Using mock deleteSource for v0 environment")
        setSources((prev) => prev.filter((s) => s.id !== id))
        setPosts((prev) => prev.filter((p) => p.sourceId !== id))
        return
      }

      await deleteDoc(doc(db, "sources", id))

      // Update local state
      setSources((prev) => prev.filter((s) => s.id !== id))

      // Also delete all posts associated with this source
      const postsToDelete = posts.filter((p) => p.sourceId === id)
      for (const post of postsToDelete) {
        await deleteDoc(doc(db, "posts", post.id))
      }

      setPosts((prev) => prev.filter((p) => p.sourceId !== id))
    } catch (error) {
      console.error("Error deleting source:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete source. Please try again.",
      })
      throw error
    }
  }

  const addPost = async (post: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      console.log("Adding post:", post)

      if (useMockData) {
        console.log("Using mock addPost for v0 environment")
        const newId = `post${mockPosts.length + 1}`
        const newPost = {
          id: newId,
          ...post,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setPosts((prev) => [...prev, newPost])
        return newId
      }

      const postData = {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "posts"), postData)

      // Add to local state
      const newPost = {
        id: docRef.id,
        ...post,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setPosts((prev) => [...prev, newPost])

      return docRef.id
    } catch (error) {
      console.error("Error adding post:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add post. Please try again.",
      })
      throw error
    }
  }

  const updatePost = async (id: string, post: Partial<Omit<Post, "id">>): Promise<void> => {
    try {
      console.log("Updating post:", id, post)

      if (useMockData) {
        console.log("Using mock updatePost for v0 environment")
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...post, updatedAt: new Date().toISOString() } : p)))
        return
      }

      const postData = {
        ...post,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "posts", id), postData)

      // Update local state
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...post, updatedAt: new Date().toISOString() } : p)))
    } catch (error) {
      console.error("Error updating post:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update post. Please try again.",
      })
      throw error
    }
  }

  const deletePost = async (id: string): Promise<void> => {
    try {
      console.log("Deleting post:", id)

      if (useMockData) {
        console.log("Using mock deletePost for v0 environment")
        setPosts((prev) => prev.filter((p) => p.id !== id))
        return
      }

      await deleteDoc(doc(db, "posts", id))

      // Update local state
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete post. Please try again.",
      })
      throw error
    }
  }

  const getSourceById = (id: string): Source | undefined => {
    return sources.find((source) => source.id === id)
  }

  const getPostById = (id: string): Post | undefined => {
    return posts.find((post) => post.id === id)
  }

  const getPostsBySourceId = (sourceId: string): Post[] => {
    return posts.filter((post) => post.sourceId === sourceId)
  }

  const refreshData = async (): Promise<void> => {
    await fetchData()
  }

  return (
    <PostsContext.Provider
      value={{
        sources,
        posts,
        isLoading,
        addSource,
        updateSource,
        deleteSource,
        addPost,
        updatePost,
        deletePost,
        getSourceById,
        getPostById,
        getPostsBySourceId,
        refreshData,
      }}
    >
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostsContext)
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider")
  }
  return context
}
