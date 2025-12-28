export interface BusStop {
  id: string
  name: string
  coordinates: [number, number] // [lat, lng]
}

export interface BusRoute {
  id: string
  name: string
  stops: BusStop[]
  timing: string[]
  color: string
}

export const busRoutes: BusRoute[] = [
  {
    id: 'A',
    name: 'A Bus',
    color: '#1ABC9C',
    timing: ['7:00 AM', '8:00 AM', '9:00 AM', '4:00 PM', '5:00 PM', '6:00 PM'],
    stops: [
      { id: 'nad', name: 'NAD', coordinates: [17.7231, 83.3242] },
      { id: 'gopalapatnam', name: 'Gopalapatnam', coordinates: [17.7289, 83.3156] },
      { id: 'naiduthota', name: 'Naiduthota', coordinates: [17.7345, 83.3089] },
      { id: 'vepagunta', name: 'Vepagunta', coordinates: [17.7401, 83.3023] },
      { id: 'pendurthi', name: 'Pendurthi', coordinates: [17.7456, 83.2956] },
      { id: 'anandapuram', name: 'Anandapuram', coordinates: [17.7512, 83.2889] },
      { id: 'college', name: 'College', coordinates: [17.7567, 83.2823] }
    ]
  },
  {
    id: 'N',
    name: 'N Bus',
    color: '#3498DB',
    timing: ['7:15 AM', '8:15 AM', '9:15 AM', '4:15 PM', '5:15 PM', '6:15 PM'],
    stops: [
      { id: 'nad', name: 'NAD', coordinates: [17.7231, 83.3242] },
      { id: 'gopalapatnam', name: 'Gopalapatnam', coordinates: [17.7289, 83.3156] },
      { id: 'naiduthota', name: 'Naiduthota', coordinates: [17.7345, 83.3089] },
      { id: 'vepagunta', name: 'Vepagunta', coordinates: [17.7401, 83.3023] },
      { id: 'pendurthi', name: 'Pendurthi', coordinates: [17.7456, 83.2956] },
      { id: 'kottavalasa', name: 'Kottavalasa', coordinates: [17.7523, 83.2867] },
      { id: 'college', name: 'College', coordinates: [17.7567, 83.2823] }
    ]
  },
  {
    id: 'K',
    name: 'K Bus',
    color: '#e74c3c',
    timing: ['7:30 AM', '8:30 AM', '9:30 AM', '4:30 PM', '5:30 PM', '6:30 PM'],
    stops: [
      { id: 'kotta_road', name: 'Kotta Road', coordinates: [17.7123, 83.3401] },
      { id: 'purnna_market', name: 'Purnna Market', coordinates: [17.7189, 83.3334] },
      { id: 'jagadamba', name: 'Jagadamba', coordinates: [17.7245, 83.3267] },
      { id: 'siripuram', name: 'Siripuram', coordinates: [17.7301, 83.3201] },
      { id: 'college', name: 'College', coordinates: [17.7567, 83.2823] }
    ]
  },
  {
    id: 'C',
    name: 'C Bus',
    color: '#f39c12',
    timing: ['7:45 AM', '8:45 AM', '9:45 AM', '4:45 PM', '5:45 PM', '6:45 PM'],
    stops: [
      { id: 'arasavalli_jn', name: 'Arasavalli Jn', coordinates: [18.3089, 83.9167] },
      { id: 'surya_mahal_jn', name: 'Surya Mahal Jn', coordinates: [18.3123, 83.9134] },
      { id: 'day_night_jn', name: 'Day & Night Jn', coordinates: [18.3156, 83.9101] },
      { id: 'chilakapalem', name: 'Chilakapalem', coordinates: [18.2989, 83.8967] },
      { id: 'ranasthalam', name: 'Ranasthalam', coordinates: [18.2823, 83.8801] },
      { id: 'subadhara_puram', name: 'Subadhara Puram', coordinates: [18.2656, 83.8634] },
      { id: 'college', name: 'College', coordinates: [17.7567, 83.2823] }
    ]
  }
]

export const getBusRoute = (busId: string): BusRoute | undefined => {
  return busRoutes.find(route => route.id === busId)
}

export const getAllBuses = () => {
  return busRoutes.map(route => ({
    id: route.id,
    name: route.name,
    color: route.color
  }))
}

// Mock GPS data for demo
export interface BusLocation {
  busId: string
  currentStop: string
  nextStop: string
  coordinates: [number, number]
  eta: string
  isActive: boolean
}

export const mockBusLocations: BusLocation[] = [
  {
    busId: 'A',
    currentStop: 'Gopalapatnam',
    nextStop: 'Naiduthota',
    coordinates: [17.7289, 83.3156],
    eta: '5 mins',
    isActive: true
  },
  {
    busId: 'N',
    currentStop: 'Vepagunta',
    nextStop: 'Pendurthi',
    coordinates: [17.7401, 83.3023],
    eta: '3 mins',
    isActive: true
  },
  {
    busId: 'K',
    currentStop: 'Jagadamba',
    nextStop: 'Siripuram',
    coordinates: [17.7245, 83.3267],
    eta: '7 mins',
    isActive: false
  },
  {
    busId: 'C',
    currentStop: 'Ranasthalam',
    nextStop: 'Subadhara Puram',
    coordinates: [18.2823, 83.8801],
    eta: '12 mins',
    isActive: true
  }
]