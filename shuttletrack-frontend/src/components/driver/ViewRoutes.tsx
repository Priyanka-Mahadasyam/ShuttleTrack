// src/components/driver/ViewRoutes.tsx
import { useState } from 'react'
import { ArrowLeft, MapPin, Clock, Bus, Navigation } from 'lucide-react'
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover-glow">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Route</h1>
              <p className="text-muted-foreground">Driver route and schedule</p>
            </div>
          </div>
        </div>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" />
              Select Route
            </CardTitle>
            <CardDescription>Select the route you're driving</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedBusId} onValueChange={handleBusSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your route..." />
              </SelectTrigger>
              <SelectContent>
                {busRoutes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                      {route.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedRoute && (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedRoute.color }} />
                {selectedRoute.name} Route Details
              </CardTitle>
              <CardDescription>
                {selectedRoute.stops.length} stops • {selectedRoute.timing.length} trips daily
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Route Path with Driver Instructions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Navigation className="h-4 w-4 text-primary" />
                  Route Path & Navigation
                </div>
                <div className="space-y-3">
                  {selectedRoute.stops.map((stop, index) => (
                    <div key={stop.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm text-primary-foreground font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-lg">{stop.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Stop {index + 1} of {selectedRoute.stops.length}
                          </div>
                        </div>
                        {index < selectedRoute.stops.length - 1 && (
                          <div className="text-primary font-bold">↓</div>
                        )}
                      </div>
                      
                      {/* Stop Instructions */}
                      <div className="ml-11 text-sm">
                        {index === 0 && (
                          <div className="text-green-400 font-medium">🚌 Route Start Point</div>
                        )}
                        {index === selectedRoute.stops.length - 1 && (
                          <div className="text-red-400 font-medium">🏁 Route End Point</div>
                        )}
                        {index > 0 && index < selectedRoute.stops.length - 1 && (
                          <div className="text-blue-400">⏱️ Passenger Pick-up/Drop-off</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-secondary" />
                  Today's Schedule
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRoute.timing.map((time, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{time}</div>
                        <div className="text-sm text-muted-foreground">
                          Trip {index + 1}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {index < 3 ? 'Morning' : 'Evening'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Instructions */}
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h4 className="font-medium mb-3 text-accent flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  Driver Instructions
                </h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Follow the route path in sequential order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Wait at each stop for 2-3 minutes for passenger boarding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Keep your GPS location sharing active throughout the trip</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Route Overview (when no bus selected) */}
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
                    {route.stops.length} stops • {route.timing.length} trips
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
                      First: {route.timing[0]} | Last: {route.timing[route.timing.length - 1]}
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
