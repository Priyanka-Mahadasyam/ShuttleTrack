import { useState } from 'react'
import { Save, Users, Bus, Clock, Bell } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner@2.0.3'

export function Settings() {
  const [settings, setSettings] = useState({
    systemName: 'ShuttleTrack',
    maxBuses: 10,
    trackingInterval: 30,
    notificationsEnabled: true,
    autoRefresh: true,
    emergencyContact: '+91 9876543210',
    supportEmail: 'support@shuttletrack.edu',
    maintenanceMode: false,
    announcements: 'System is running normally. All buses are operational.'
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Settings saved successfully!')
    setIsSaving(false)
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
          <p className="text-muted-foreground">Configure system preferences and parameters</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="hover-glow">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              General Settings
            </CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => updateSetting('systemName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={settings.emergencyContact}
                onChange={(e) => updateSetting('emergencyContact', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable tracking for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bus Management */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-secondary" />
              Bus Management
            </CardTitle>
            <CardDescription>Configure bus-related settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxBuses">Maximum Number of Buses</Label>
              <Input
                id="maxBuses"
                type="number"
                value={settings.maxBuses}
                onChange={(e) => updateSetting('maxBuses', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingInterval">Tracking Update Interval (seconds)</Label>
              <Input
                id="trackingInterval"
                type="number"
                value={settings.trackingInterval}
                onChange={(e) => updateSetting('trackingInterval', parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh bus locations
                </p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Notifications
            </CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications to users
                </p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcements">System Announcements</Label>
              <Textarea
                id="announcements"
                value={settings.announcements}
                onChange={(e) => updateSetting('announcements', e.target.value)}
                placeholder="Enter any system-wide announcements..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Active Buses</div>
                <div className="text-2xl font-bold text-primary">4</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Routes</div>
                <div className="text-2xl font-bold text-secondary">4</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Users</div>
                <div className="text-2xl font-bold text-accent">156</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">System Uptime</div>
                <div className="text-2xl font-bold text-foreground">99.9%</div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-1">Last Database Backup</div>
              <div className="text-sm text-muted-foreground">
                January 15, 2024 at 3:00 AM
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-1">Server Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-500">All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="hover-glow">
              Backup Database
            </Button>
            <Button variant="outline" className="hover-glow">
              Clear Cache
            </Button>
            <Button variant="outline" className="hover-glow">
              Export Logs
            </Button>
            <Button variant="outline" className="hover-glow">
              System Health Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}