import { useState } from 'react'
import { Calendar, Download, Filter, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { getAllBuses } from '../../data/routes'

interface TripRecord {
  id: string
  busId: string
  route: string
  startTime: string
  endTime: string
  duration: string
  delays: number
  missedStops: number
  status: 'completed' | 'delayed' | 'cancelled'
  date: string
}

const mockTripHistory: TripRecord[] = [
  {
    id: 'T001',
    busId: 'A',
    route: 'NAD → College',
    startTime: '7:00 AM',
    endTime: '8:15 AM',
    duration: '1h 15m',
    delays: 0,
    missedStops: 0,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'T002',
    busId: 'N',
    route: 'NAD → College',
    startTime: '7:15 AM',
    endTime: '8:45 AM',
    duration: '1h 30m',
    delays: 15,
    missedStops: 1,
    status: 'delayed',
    date: '2024-01-15'
  },
  {
    id: 'T003',
    busId: 'K',
    route: 'Kotta Road → College',
    startTime: '7:30 AM',
    endTime: '8:30 AM',
    duration: '1h 00m',
    delays: 0,
    missedStops: 0,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'T004',
    busId: 'C',
    route: 'Srikakulam → College',
    startTime: '7:45 AM',
    endTime: '10:00 AM',
    duration: '2h 15m',
    delays: 0,
    missedStops: 0,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'T005',
    busId: 'A',
    route: 'NAD → College',
    startTime: '8:00 AM',
    endTime: '9:10 AM',
    duration: '1h 10m',
    delays: 5,
    missedStops: 0,
    status: 'completed',
    date: '2024-01-14'
  }
]

export function TripHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBus, setSelectedBus] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const buses = getAllBuses()

  const filteredTrips = mockTripHistory
    .filter(trip => {
      const matchesSearch = trip.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.busId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBus = !selectedBus || trip.busId === selectedBus
      const matchesStatus = !selectedStatus || trip.status === selectedStatus
      return matchesSearch && matchesBus && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof TripRecord]
      const bValue = b[sortField as keyof TripRecord]
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500'
      case 'delayed': return 'bg-yellow-500/10 text-yellow-500'
      case 'cancelled': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trip History</h2>
          <p className="text-muted-foreground">View and analyze historical trip data</p>
        </div>
        <Button className="hover-glow">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  placeholder="Search by route or bus..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bus</label>
              <Select value={selectedBus} onValueChange={setSelectedBus}>
                <SelectTrigger>
                  <SelectValue placeholder="All buses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All buses</SelectItem>
                  {buses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: bus.color }}
                        ></div>
                        {bus.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Select dates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredTrips.length}</div>
            <div className="text-sm text-muted-foreground">Total Trips</div>
          </CardContent>
        </Card>
        <Card className="hover-glow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {filteredTrips.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="hover-glow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {filteredTrips.filter(t => t.delays > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Delayed</div>
          </CardContent>
        </Card>
        <Card className="hover-glow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {Math.round(filteredTrips.filter(t => t.status === 'completed').length / filteredTrips.length * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Trip History Table */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Trip Records</CardTitle>
          <CardDescription>Detailed history of all bus trips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('id')}
                  >
                    Trip ID
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('busId')}
                  >
                    Bus
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('route')}
                  >
                    Route
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('duration')}
                  >
                    Duration
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('delays')}
                  >
                    Delays
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('missedStops')}
                  >
                    Missed Stops
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((trip) => {
                  const bus = buses.find(b => b.id === trip.busId)
                  return (
                    <TableRow key={trip.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{trip.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: bus?.color }}
                          ></div>
                          {bus?.name}
                        </div>
                      </TableCell>
                      <TableCell>{trip.route}</TableCell>
                      <TableCell>{trip.duration}</TableCell>
                      <TableCell>
                        {trip.delays > 0 ? (
                          <span className="text-yellow-500">{trip.delays}m</span>
                        ) : (
                          <span className="text-green-500">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {trip.missedStops > 0 ? (
                          <span className="text-red-500">{trip.missedStops}</span>
                        ) : (
                          <span className="text-green-500">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(trip.status)}>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{trip.date}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}