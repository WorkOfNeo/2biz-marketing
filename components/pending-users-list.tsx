"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, User, X } from "lucide-react"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type UserData = {
  id: string
  email: string
  role: "super_admin" | "member"
  status: "pending" | "active"
  createdAt: any
}

interface PendingUsersListProps {
  pendingUsers: UserData[]
  onUserApproved: (userId: string) => void
  onUserRejected: (userId: string) => void
}

export function PendingUsersList({ pendingUsers, onUserApproved, onUserRejected }: PendingUsersListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleApproveUser = async (id: string) => {
    try {
      setProcessingId(id)

      // Update user status in Firestore
      await updateDoc(doc(db, "users", id), {
        status: "active",
      })

      onUserApproved(id)

      toast({
        title: "User approved",
        description: "The user has been approved and can now log in.",
      })
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve user. Please try again.",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectUser = async (id: string) => {
    try {
      setProcessingId(id)

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", id))

      onUserRejected(id)

      toast({
        title: "User rejected",
        description: "The user request has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject user. Please try again.",
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No pending users at this time.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingUsers.map((pendingUser) => (
          <TableRow key={pendingUser.id}>
            <TableCell className="font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {pendingUser.email}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {pendingUser.role === "super_admin" ? "Super Admin" : "Member"}
              </Badge>
            </TableCell>
            <TableCell>
              {pendingUser.createdAt ? new Date(pendingUser.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:hover:bg-green-900/30"
                  onClick={() => handleApproveUser(pendingUser.id)}
                  disabled={processingId === pendingUser.id}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-900/30"
                  onClick={() => handleRejectUser(pendingUser.id)}
                  disabled={processingId === pendingUser.id}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
