import { useState } from 'react'
import { Route, MapPin, MessageSquare } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { RoutesManagement } from './RoutesManagement'
// correct
import BusLocationViewer from "./BusLocationViewer";

import FeedbackReview from './FeedbackReview';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('routes')

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage routes, track buses, and monitor system performance</p>
        </div>



        {/* Main Dashboard */}
        <Card className="hover-glow">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-none bg-muted/50">
                <TabsTrigger value="routes" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  <span className="hidden sm:inline">Routes</span>
                  <span className="sm:hidden">Routes</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Location</span>
                  <span className="sm:hidden">Location</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Feedback</span>
                  <span className="sm:hidden">Feedback</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="routes" className="p-6">
                <RoutesManagement />
              </TabsContent>

              <TabsContent value="location" className="p-6">
                <BusLocationViewer />
              </TabsContent>

              <TabsContent value="feedback" className="p-6">
                <FeedbackReview />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}