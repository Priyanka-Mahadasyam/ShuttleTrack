import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface Stop {
  id: string
  name: string
}

interface StopsEditorProps {
  stops: Stop[]
  onStopsChange: (stops: Stop[]) => void
}

export function StopsEditor({ stops, onStopsChange }: StopsEditorProps) {
  const [newStopName, setNewStopName] = useState('')

  const addStop = () => {
    if (newStopName.trim()) {
      const newStop: Stop = {
        id: `stop-${Date.now()}`,
        name: newStopName.trim()
      }
      onStopsChange([...stops, newStop])
      setNewStopName('')
    }
  }

  const removeStop = (stopId: string) => {
    onStopsChange(stops.filter(stop => stop.id !== stopId))
  }

  const updateStopName = (stopId: string, name: string) => {
    onStopsChange(stops.map(stop => 
      stop.id === stopId ? { ...stop, name } : stop
    ))
  }

  const moveStop = (fromIndex: number, toIndex: number) => {
    const newStops = [...stops]
    const [movedStop] = newStops.splice(fromIndex, 1)
    newStops.splice(toIndex, 0, movedStop)
    onStopsChange(newStops)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Route Stops</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter stop name"
            value={newStopName}
            onChange={(e) => setNewStopName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addStop()}
            className="w-48"
          />
          <Button onClick={addStop} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Stop
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {stops.map((stop, index) => (
          <Card key={stop.id} className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 cursor-move">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                  {index + 1}
                </div>
              </div>
              
              <Input
                value={stop.name}
                onChange={(e) => updateStopName(stop.id, e.target.value)}
                className="flex-1"
                placeholder="Stop name"
              />
              
              <div className="flex gap-1">
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStop(index, index - 1)}
                    title="Move up"
                  >
                    ↑
                  </Button>
                )}
                {index < stops.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStop(index, index + 1)}
                    title="Move down"
                  >
                    ↓
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStop(stop.id)}
                  title="Remove stop"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {stops.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No stops added yet. Add your first stop above.</p>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground">
        Total stops: {stops.length}
      </div>
    </div>
  )
}