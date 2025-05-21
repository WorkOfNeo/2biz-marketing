"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Loader2, MoreVertical, Plus, Search, Shield, User, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

type UserData = {
  id: string
  email: string
  role: "super_admin" | "member" | "viewer"
  status: "pending" | "active"
  createdAt: any
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "viewer", // Changed default to viewer
  })
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [editUserRole, setEditUserRole] = useState<string>("viewer") // Changed default to viewer
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role !== "super_admin") {
        setIsLoading(false)
        return
      }

      try {
        const usersSnapshot = await getDocs(collection(db, "users"))
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserData[]

        setUsers(usersData)
        setFilteredUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [user, toast])

  // Filter users based on tab and search query
  useEffect(() => {
    let result = [...users]

    // Filter by status tab
    if (activeTab === "active") {
      result = result.filter((user) => user.status === "active")
    } else if (activeTab === "pending") {
      result = result.filter((user) => user.status === "pending")
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((user) => user.email.toLowerCase().includes(query))
    }

    setFilteredUsers(result)
  }, [users, activeTab, searchQuery])

  // Check if user is super_admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
        </div>
      </div>
    )
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Invalid user",
        description: "Please enter an email address and password.",
      })
      return
    }

    try {
      setIsLoading(true)

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password)

      // Create user document in Firestore
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        email: newUser.email,
        role: newUser.role,
        status: "active", // Admin-created users are active by default
        createdAt: serverTimestamp(),
      })

      // Update local state
      const newUserObj = {
        id: userCredential.user.uid,
        email: newUser.email,
        role: newUser.role as "super_admin" | "member" | "viewer",
        status: "active",
        createdAt: new Date().toISOString(),
      }

      setUsers([...users, newUserObj])
      setIsAddUserOpen(false)
      setNewUser({ email: "", password: "", role: "viewer" }) // Reset to viewer

      toast({
        title: "User added",
        description: "The user has been added successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add user",
        description: error.message || "An error occurred while adding the user.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      setIsLoading(true)

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", id))

      // Update local state
      setUsers(users.filter((user) => user.id !== id))
      setDeleteUserId(null)

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (id: string) => {
    try {
      setIsLoading(true)

      // Update user status in Firestore
      await updateDoc(doc(db, "users", id), {
        status: "active",
      })

      // Update local state
      setUsers(users.map((user) => (user.id === id ? { ...user, status: "active" } : user)))

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
      setIsLoading(false)
    }
  }

  const handleRejectUser = async (id: string) => {
    try {
      setIsLoading(true)

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", id))

      // Update local state
      setUsers(users.filter((user) => user.id !== id))

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
      setIsLoading(false)
    }
  }

  const handleUpdateUserRole = async () => {
    if (!editUserId) return

    try {
      setIsLoading(true)

      // Update user role in Firestore
      await updateDoc(doc(db, "users", editUserId), {
        role: editUserRole,
      })

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editUserId ? { ...user, role: editUserRole as "super_admin" | "member" | "viewer" } : user,
        ),
      )

      setEditUserId(null)

      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 hover:bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
          >
            Super Admin
          </Badge>
        )
      case "member":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
          >
            Member
          </Badge>
        )
      case "viewer":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 hover:bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400"
          >
            Viewer
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400"
          >
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
          >
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  const pendingUsersCount = users.filter((user) => user.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and their permissions</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will receive an email with login instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" className="w-full sm:w-auto" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="pending" className="relative">
                    Pending
                    {pendingUsersCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-red-500 text-white">
                        {pendingUsersCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {userData.email}
                      </TableCell>
                      <TableCell>{getRoleBadge(userData.role)}</TableCell>
                      <TableCell>{getStatusBadge(userData.status)}</TableCell>
                      <TableCell>
                        {userData.createdAt
                          ? new Date(
                              typeof userData.createdAt === "string"
                                ? userData.createdAt
                                : userData.createdAt.seconds * 1000,
                            ).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {userData.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:hover:bg-green-900/30"
                              onClick={() => handleApproveUser(userData.id)}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-900/30"
                              onClick={() => handleRejectUser(userData.id)}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Dialog
                                open={editUserId === userData.id}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setEditUserId(userData.id)
                                    setEditUserRole(userData.role)
                                  } else {
                                    setEditUserId(null)
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Change Role</DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Change User Role</DialogTitle>
                                    <DialogDescription>
                                      Update the role for {userData.email}. This will change their permissions in the
                                      system.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-role">Role</Label>
                                      <Select value={editUserRole} onValueChange={(value) => setEditUserRole(value)}>
                                        <SelectTrigger id="edit-role">
                                          <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="super_admin">Super Admin</SelectItem>
                                          <SelectItem value="member">Member</SelectItem>
                                          <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditUserId(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateUserRole}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog
                                open={deleteUserId === userData.id}
                                onOpenChange={(open) => !open && setDeleteUserId(null)}
                              >
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onSelect={(e) => {
                                      e.preventDefault()
                                      setDeleteUserId(userData.id)
                                    }}
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the user. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDeleteUser(userData.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
