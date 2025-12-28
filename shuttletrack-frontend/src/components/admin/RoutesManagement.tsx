// src/components/admin/RoutesManagement.tsx
import { useState } from "react";
import { Plus, Edit, Clock, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { StopsEditor } from "./StopsEditor";
import { busRoutes, type BusRoute, type BusStop } from "../../data/routes";
import { toast } from "sonner";

/**
 * Local editable types
 */
type EditableBusStop = BusStop & {
  order?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: [number, number];
};
type EditableBusRoute = BusRoute & { stops?: EditableBusStop[]; timing?: string[] };

/**
 * Local shape expected by StopsEditor
 */
type LocalStopForEditor = {
  id: string;
  name: string;
  order?: number;
  latitude?: number;
  longitude?: number;
  [k: string]: any;
};

export function RoutesManagement() {
  const [routes, setRoutes] = useState<BusRoute[]>(busRoutes);
  const [editingRoute, setEditingRoute] = useState<EditableBusRoute | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // add-route dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRouteDraft, setNewRouteDraft] = useState<EditableBusRoute | null>(
    null
  );

  // Create a safe editable copy from a BusRoute (fills missing arrays and normalizes stops)
  const makeSafeEditableRoute = (route: BusRoute): EditableBusRoute => {
    const timing = Array.isArray(route.timing) ? [...route.timing] : [];

    const stops: EditableBusStop[] = Array.isArray(route.stops)
      ? route.stops.map((s: any, idx: number) => {
          // normalize coordinates into array [lat, lon]
          const coords =
            (s as any).coordinates ??
            ((s as any).latitude != null && (s as any).longitude != null
              ? [(s as any).latitude, (s as any).longitude]
              : (Array.isArray((s as any).coordinates) ? (s as any).coordinates : [0, 0]));
          return {
            id: s.id ?? `stop-${idx}`,
            name: s.name ?? "",
            order: (s as any).order ?? idx + 1,
            coordinates: coords as [number, number],
            latitude: Array.isArray(coords) ? coords[0] : (s as any).latitude,
            longitude: Array.isArray(coords) ? coords[1] : (s as any).longitude,
            ...(s as object),
          } as EditableBusStop;
        })
      : [];

    return { ...route, timing, stops };
  };

  const handleEditRoute = (route: BusRoute) => {
    const safe = makeSafeEditableRoute(route);
    setEditingRoute(safe);
    setIsDialogOpen(true);
  };

  const handleSaveRoute = () => {
    if (!editingRoute) return;
    setRoutes((prev) =>
      prev.map((r) => (r.id === editingRoute.id ? ({ ...editingRoute } as BusRoute) : r))
    );
    toast.success("Route updated successfully!");
    setIsDialogOpen(false);
    setEditingRoute(null);
  };

  const handleOpenAddRoute = () => {
    const draft: EditableBusRoute = {
      id: `route-${Date.now().toString(36)}`,
      name: "",
      color: "#0ea5a4",
      stops: [],
      timing: [],
    } as EditableBusRoute;
    setNewRouteDraft(draft);
    setIsAddDialogOpen(true);
  };

  const handleAddRouteSave = () => {
    if (!newRouteDraft) return;
    if (!newRouteDraft.name?.trim()) {
      toast.error("Please provide a route name");
      return;
    }
    setRoutes((prev) => [...prev, newRouteDraft as BusRoute]);
    toast.success("Route added");
    setIsAddDialogOpen(false);
    setNewRouteDraft(null);
  };

  const updateRouteTiming = (index: number, newTime: string) => {
    if (!editingRoute) return;
    const newTiming = Array.isArray(editingRoute.timing)
      ? [...editingRoute.timing]
      : [];
    newTiming[index] = newTime;
    setEditingRoute({ ...editingRoute, timing: newTiming });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Routes Management</h2>
          <p className="text-muted-foreground">Manage bus routes, stops, and timings</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleOpenAddRoute} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Route
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route) => (
          <Card key={route.id} className="hover-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: (route as any).color ?? "#666" }} />
                  {route.name}
                </CardTitle>

                <Dialog open={isDialogOpen && editingRoute?.id === route.id} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 hover-glow"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </DialogTrigger>

                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit {route.name}</DialogTitle>
                      <DialogDescription>Update route details, stops, and timings</DialogDescription>
                    </DialogHeader>

                    {editingRoute ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label>Route Name</Label>
                          <Input
                            value={editingRoute.name}
                            onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                          />
                        </div>

                        {/* StopsEditor expects LocalStopForEditor[] — convert from EditableBusStop[] */}
                        <StopsEditor
                          stops={
                            (editingRoute?.stops ?? []).map((s) => ({
                              id: (s as any).id ?? "",
                              name: s.name ?? "",
                              order: (s as any).order ?? 0,
                              latitude: Array.isArray(s.coordinates) ? s.coordinates[0] : (s as any).latitude,
                              longitude: Array.isArray(s.coordinates) ? s.coordinates[1] : (s as any).longitude,
                              ...(s as any),
                            })) as LocalStopForEditor[]
                          }

                          onStopsChange={(newStops: LocalStopForEditor[]) => {
                            const arr = Array.isArray(newStops) ? newStops : [];
                            const normalized: EditableBusStop[] = arr.map((s, idx) => {
                              const coords =
                                (s as any).coordinates ??
                                ((s as any).latitude != null && (s as any).longitude != null
                                  ? [s.latitude, s.longitude]
                                  : [0, 0]);
                              return {
                                id: (s as any).id ?? `stop-${idx}`,
                                name: s.name ?? "",
                                order: (s as any).order ?? idx + 1,
                                coordinates: coords as [number, number],
                                latitude: coords ? coords[0] : (s as any).latitude,
                                longitude: coords ? coords[1] : (s as any).longitude,
                                ...(s as object),
                              } as EditableBusStop;
                            });
                            setEditingRoute((prev) => (prev ? { ...prev, stops: normalized } : prev));
                          }}
                        />

                        <div className="space-y-3">
                          <Label>Bus Timings</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(editingRoute.timing ?? []).map((time, index) => (
                              <Input key={index} value={time} onChange={(e) => updateRouteTiming(index, e.target.value)} placeholder="e.g., 7:00 AM" />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingRoute(null); }}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveRoute} className="hover-glow">Save Changes</Button>
                        </div>
                      </div>
                    ) : (
                      <div>Loading...</div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <CardDescription>{route.stops?.length ?? 0} stops covered on this route</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  Route Path
                </div>
                <div className="space-y-2">
                  {route.stops?.map((stop, index) => (
                    <div key={(stop as any).id ?? index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{(stop as any).name}</div>
                      </div>
                      {index < (route.stops?.length ?? 0) - 1 && <div className="text-muted-foreground">→</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-secondary" />
                  Daily Timings
                </div>
                <div className="flex flex-wrap gap-1">
                  {(route.timing ?? []).map((time, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{time}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Route Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription>Create a new route with stops and timings</DialogDescription>
          </DialogHeader>

          {newRouteDraft ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Route Name</Label>
                <Input value={newRouteDraft.name} onChange={(e) => setNewRouteDraft({ ...newRouteDraft, name: e.target.value })} />
              </div>

              <div>
                <Label>Color (hex)</Label>
                <Input value={(newRouteDraft as any).color} onChange={(e) => setNewRouteDraft({ ...newRouteDraft, color: e.target.value })} />
              </div>

              <div>
                <Label>Stops</Label>
                <StopsEditor
                  stops={((newRouteDraft.stops ?? []) as EditableBusStop[]).map((s, idx) => ({
                    id: s.id ?? `stop-${idx}`,
                    name: s.name ?? "",
                    order: (s as any).order ?? idx + 1,
                    latitude: Array.isArray(s.coordinates) ? s.coordinates[0] : (s as any).latitude,
                    longitude: Array.isArray(s.coordinates) ? s.coordinates[1] : (s as any).longitude,
                  }))}
                  onStopsChange={(arr: LocalStopForEditor[]) => {
                    const normalized: EditableBusStop[] = arr.map((s, idx) => {
                      const coords =
                        (s as any).coordinates ??
                        ((s as any).latitude != null && (s as any).longitude != null
                          ? [s.latitude, s.longitude]
                          : [0, 0]);
                      return {
                        id: (s as any).id ?? `stop-${idx}`,
                        name: s.name ?? "",
                        order: (s as any).order ?? idx + 1,
                        coordinates: coords as [number, number],
                        latitude: coords[0],
                        longitude: coords[1],
                      };
                    });
                    setNewRouteDraft((prev) => prev ? { ...prev, stops: normalized } : prev);
                  }}
                />
              </div>

              <div>
                <Label>Timings (comma separated)</Label>
                <Input value={(newRouteDraft.timing ?? []).join(", ")} onChange={(e) => setNewRouteDraft({ ...newRouteDraft, timing: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} placeholder="07:00 AM, 08:00 AM" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setNewRouteDraft(null); }}>Cancel</Button>
                <Button onClick={handleAddRouteSave}>Add Route</Button>
              </div>
            </div>
          ) : (
            <div>Preparing...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RoutesManagement;
