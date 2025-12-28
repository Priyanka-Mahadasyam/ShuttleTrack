// src/components/student/ViewRoutes.tsx
import { useState } from 'react'
import { ArrowLeft, MapPin, Clock, Bus } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { busRoutes, type BusRoute } from '../../data/routes'

interface ViewRoutesProps {
  onBack: () => void
}

export function ViewRoutes({ onBack }: ViewRoutesProps) {
  const [selectedBusId, setSelectedBusId] = useState<string>('')
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null)

  const handleBusSelect = (busId: string) => {
    setSelectedBusId(busId)
    const route = busRoutes.find(r => r.id === busId)
    setSelectedRoute(route || null)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover-glow"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bus Routes</h1>
              <p className="text-muted-foreground">View detailed route information for all buses</p>
            </div>
          </div>
        </div>

        {/* Bus Selection */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" />
              Select a Bus Route
            </CardTitle>
            <CardDescription>
              Choose a bus to view its complete route and timings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedBusId} onValueChange={handleBusSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a bus route..." />
              </SelectTrigger>
              <SelectContent>
                {busRoutes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: route.color }}
                      ></div>
                      {route.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Route Details */}
        {selectedRoute && (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedRoute.color }}
                ></div>
                {selectedRoute.name} Route Details
              </CardTitle>
              <CardDescription>
                {selectedRoute.stops.length} stops • {selectedRoute.timing.length} daily trips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Route Path */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  Route Path
                </div>
                <div className="space-y-2">
                  {selectedRoute.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm text-primary-foreground font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{stop.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Stop {index + 1} of {selectedRoute.stops.length}
                        </div>
                      </div>
                      {index < selectedRoute.stops.length - 1 && (
                        <div className="text-2xl text-muted-foreground">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-secondary" />
                  Daily Schedule
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedRoute.timing.map((time, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-center py-2 justify-center"
                    >
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-4 bg-card/50 rounded-lg border border-border">
                <h4 className="font-medium mb-2">Important Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Buses run according to the scheduled timings above</li>
                  <li>• Track real-time location using the "Track Bus" feature</li>
                  <li>• Timings may vary during holidays or special events</li>
                  <li>• Please arrive at stops 5 minutes before scheduled time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Routes Overview (when no bus selected) */}
        {!selectedRoute && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {busRoutes.map((route) => (
              <Card 
                key={route.id} 
                className="hover-glow cursor-pointer"
                onClick={() => handleBusSelect(route.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: route.color }}
                    ></div>
                    {route.name}
                  </CardTitle>
                  <CardDescription>
                    {route.stops.length} stops • {route.timing.length} trips daily
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {route.stops[0].name} → {route.stops[route.stops.length - 1].name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {route.timing[0]} - {route.timing[route.timing.length - 1]}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewRoutes
