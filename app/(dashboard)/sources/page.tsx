"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { AddCustomFieldDialog } from "@/components/add-custom-field-dialog"

// Check if we're in v0 environment
const isV0Environment = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

// Define the Source type
interface SourceField {
  id: string
  label: string
  type: string
}

interface SourceMetrics {
  impressions?: number
  clicks?: number
  engagement?: number
}

interface Source {
  id: string
  name: string
  platform: string
  color: string
  status: string
  fields: SourceField[]
  metrics?: SourceMetrics
  createdAt?: any
  updatedAt?: any
}

// Mock data for v0 environment
const mockSources: Source[] = [
  {
    id: "source1",
    name: "Facebook",
    platform: "facebook",
    color: "#1877F2",
    status: "active",
    fields: [
      { id: "impressions", label: "Impressions", type: "number" },
      { id: "likes", label: "Likes", type: "number" },
      { id: "shares", label: "Shares", type: "number" },
    ],
    metrics: {
      impressions: 12500,
      clicks: 450,
      engagement: 2.8,
    },
  },
  {
    id: "source2",
    name: "Instagram",
    platform: "instagram",
    color: "#E1306C",
    status: "active",
    fields: [
      { id: "impressions", label: "Impressions", type: "number" },
      { id: "likes", label: "Likes", type: "number" },
      { id: "comments", label: "Comments", type: "number" },
    ],
    metrics: {
      impressions: 8700,
      clicks: 320,
      engagement: 3.2,
    },
  },
  {
    id: "source3",
    name: "Google Ads",
    platform: "other",
    color: "#4285F4",
    status: "active",
    fields: [
      { id: "impressions", label: "Impressions", type: "number" },
      { id: "clicks", label: "Clicks", type: "number" },
      { id: "ctr", label: "CTR", type: "number" },
    ],
    metrics: {
      impressions: 15200,
      clicks: 620,
      engagement: 1.9,
    },
  },
  {
    id: "source4",
    name: "Email Newsletter",
    platform: "other",
    color: "#6B7280",
    status: "inactive",
    fields: [
      { id: "opens", label: "Opens", type: "number" },
      { id: "clicks", label: "Clicks", type: "number" },
      { id: "unsubscribes", label: "Unsubscribes", type: "number" },
    ],
    metrics: {
      impressions: 5400,
      clicks: 210,
      engagement: 4.1,
    },
  },
]

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false)
  const [newSource, setNewSource] = useState({
    name: "",
    platform: "",
    color: "#000000",
    status: "active",
  })
  const [customFields, setCustomFields] = useState<Array<{ label: string; type: string }>>([])
  console.log("Initial customFields state:", customFields)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    console.log("Component re-rendered, customFields:", customFields)
    const fetchSources = async () => {
      try {
        setIsLoading(true)

        if (isV0Environment) {
          // Use mock data in v0 environment
          setSources(mockSources)
        } else {
          // Fetch real data from Firestore
          const sourcesCollection = collection(db, "sources")
          const sourcesSnapshot = await getDocs(sourcesCollection)
          const sourcesList = sourcesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Source[]
          setSources(sourcesList)
        }
      } catch (error) {
        console.error("Error fetching sources:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load sources. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSources()
  }, [toast, customFields])

  const handleAddSource = async () => {
    console.log("handleAddSource called", { newSource, customFields })

    if (!newSource.name || !newSource.platform || customFields.length === 0) {
      console.log("Validation failed:", {
        name: newSource.name,
        platform: newSource.platform,
        customFieldsLength: customFields.length,
      })

      toast({
        variant: "destructive",
        title: "Invalid source",
        description: "Please fill in all fields and add at least one custom field.",
      })
      return
    }

    try {
      console.log("Starting source creation process")
      const sourceData = {
        name: newSource.name,
        platform: newSource.platform,
        color: newSource.color,
        status: newSource.status,
        fields: customFields.map((field, index) => ({
          id: `field-${index + 1}`,
          ...field,
        })),
        createdAt: isV0Environment ? new Date().toISOString() : serverTimestamp(),
        updatedAt: isV0Environment ? new Date().toISOString() : serverTimestamp(),
      }

      console.log("Source data prepared:", sourceData)

      if (isV0Environment) {
        console.log("Using mock environment, adding to local state")
        // Add to mock data in v0 environment
        const newId = `source${sources.length + 1}`
        const newSourceData = {
          id: newId,
          ...sourceData,
        } as Source
        console.log("New source data:", newSourceData)
        setSources((prev) => [...prev, newSourceData])
      } else {
        console.log("Adding to Firestore")
        // Add to Firestore
        const docRef = await addDoc(collection(db, "sources"), sourceData)
        console.log("Firestore document created with ID:", docRef.id)

        // Add to local state
        const newSourceData = {
          id: docRef.id,
          ...sourceData,
        } as Source
        console.log("New source data:", newSourceData)
        setSources((prev) => [...prev, newSourceData])
      }

      console.log("Source added successfully, showing toast")
      toast({
        title: "Source added",
        description: "Your new source has been added successfully.",
      })

      // Reset form
      console.log("Resetting form")
      setIsAddSourceOpen(false)
      setNewSource({
        name: "",
        platform: "",
        color: "#000000",
        status: "active",
      })
      setCustomFields([])
    } catch (error) {
      console.error("Error adding source:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add source. Please try again.",
      })
    }
  }

  const filteredSources = sources.filter((source) => source.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleViewSource = (sourceId: string) => {
    router.push(`/sources/${sourceId}`)
  }

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "instagram":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            Instagram
          </span>
        )
      case "facebook":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Facebook
          </span>
        )
      case "youtube":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            YouTube
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
        )
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Marketing Sources</CardTitle>
              <CardDescription>Manage your marketing data sources</CardDescription>
            </div>
            <Button onClick={() => setIsAddSourceOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Metrics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources
                  .filter((source) =>
                    source.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((source) => (
                    <TableRow
                      key={source.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/sources/${source.id}`)
                      }}
                    >
                      <TableCell className="font-medium">{source.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          {source.platform}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            source.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {source.status}
                        </span>
                      </TableCell>
                      <TableCell>{source.fields.length} fields</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {source.metrics && (
                            <>
                              <div className="text-sm">
                                Impressions: {source.metrics.impressions?.toLocaleString()}
                              </div>
                              <div className="text-sm">
                                Clicks: {source.metrics.clicks?.toLocaleString()}
                              </div>
                              <div className="text-sm">
                                Engagement: {source.metrics.engagement}%
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Source Dialog */}
      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                placeholder="Instagram - @yourbrand"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={newSource.platform}
                onValueChange={(value) => setNewSource({ ...newSource, platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={newSource.color}
                  onChange={(e) => setNewSource({ ...newSource, color: e.target.value })}
                  className="w-12 h-9 p-1"
                />
                <Input
                  type="text"
                  value={newSource.color}
                  onChange={(e) => setNewSource({ ...newSource, color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newSource.status}
                onValueChange={(value) => setNewSource({ ...newSource, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Fields</Label>
                <AddCustomFieldDialog
                  onAddField={(field) => {
                    console.log("Field received from dialog:", field)
                    const updatedFields = [...customFields, field]
                    console.log("Updating customFields state:", updatedFields)
                    setCustomFields(updatedFields)
                  }}
                />
              </div>
              {customFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No custom fields added yet. Add at least one field.</p>
              ) : (
                <div className="border rounded-md divide-y">
                  {customFields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between p-2">
                      <div>
                        <p className="text-sm font-medium">{field.label}</p>
                        <p className="text-xs text-muted-foreground capitalize">{field.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFields = [...customFields]
                          newFields.splice(index, 1)
                          setCustomFields(newFields)
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-muted-foreground"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSourceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSource}>Add Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
