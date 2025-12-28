import { MapPin, MessageSquare, Clock, Bus, Route } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface StudentDashboardProps {
  onTrackBus: () => void
  onFeedback: () => void
  onViewRoutes: () => void
}

export function StudentDashboard({ onTrackBus, onFeedback, onViewRoutes }: StudentDashboardProps) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your shuttle and share feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Track My Bus Card */}
          <Card className="hover-glow cursor-pointer transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Track My Bus</CardTitle>
                <CardDescription className="mt-2">
                  See real-time location and ETA of your shuttle
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button onClick={onTrackBus} className="w-full hover-glow">
                <Bus className="mr-2 h-4 w-4" />
                Track Shuttle
              </Button>
            </CardContent>
          </Card>

          {/* View Routes Card */}
          <Card className="hover-glow cursor-pointer transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                <Route className="h-8 w-8 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">View Routes</CardTitle>
                <CardDescription className="mt-2">
                  Check all bus routes, stops, and timings
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button onClick={onViewRoutes} variant="outline" className="w-full hover-glow">
                <Route className="mr-2 h-4 w-4" />
                View Routes
              </Button>
            </CardContent>
          </Card>

          {/* Give Feedback Card */}
          <Card className="hover-glow cursor-pointer transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Give Feedback</CardTitle>
                <CardDescription className="mt-2">
                  Share your experience with the shuttle service
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button onClick={onFeedback} variant="secondary" className="w-full hover-glow">
                <MessageSquare className="mr-2 h-4 w-4" />
                Share Feedback
              </Button>
            </CardContent>
          </Card>
        </div>



        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">A Bus arrived at College</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">N Bus departed from Pendurthi</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">You provided feedback for K Bus</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}