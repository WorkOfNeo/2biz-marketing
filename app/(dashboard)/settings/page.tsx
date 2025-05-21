"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricMappingTab } from "./metric-mapping-tab"
import { DashboardsTab } from "./dashboards-tab"
import { SourcesTab } from "./sources-tab"
import { GeneralTab } from "./general-tab"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="metric-mapping">
        <TabsList className="mb-6">
          <TabsTrigger value="metric-mapping">Metric Mapping</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="metric-mapping">
          <MetricMappingTab />
        </TabsContent>

        <TabsContent value="dashboards">
          <DashboardsTab />
        </TabsContent>

        <TabsContent value="sources">
          <SourcesTab />
        </TabsContent>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
