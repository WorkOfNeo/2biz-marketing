"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type PostModalContextType = {
  isPostModalOpen: boolean
  openPostModal: () => void
  closePostModal: () => void
  editingPost: Post | null
  setEditingPost: (post: Post | null) => void
}

export type Post = {
  id: string
  title: string
  sourceId: string
  date: string
  status: "draft" | "scheduled" | "published" | "completed"
  content?: string
  metrics?: Record<string, any>
}

const PostModalContext = createContext<PostModalContextType | undefined>(undefined)

export function PostModalProvider({ children }: { children: ReactNode }) {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const openPostModal = () => setIsPostModalOpen(true)
  const closePostModal = () => {
    setIsPostModalOpen(false)
    setEditingPost(null)
  }

  return (
    <PostModalContext.Provider
      value={{
        isPostModalOpen,
        openPostModal,
        closePostModal,
        editingPost,
        setEditingPost,
      }}
    >
      {children}
    </PostModalContext.Provider>
  )
}

export function usePostModal() {
  const context = useContext(PostModalContext)
  if (context === undefined) {
    throw new Error("usePostModal must be used within a PostModalProvider")
  }
  return context
}
