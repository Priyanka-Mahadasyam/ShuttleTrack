import { GraduationCap, Settings, Truck, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function RoleSelection({ onRoleSelect, onBack }) {
  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Track your shuttle and provide feedback',
      icon: GraduationCap,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage routes, buses and track all shuttles',
      icon: Settings,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'driver',
      title: 'Driver',
      description: 'Share your location with students',
      icon: Truck,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="hover-glow">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Choose Your Role</h1>
          <p className="text-muted-foreground">Select how you'll be using ShuttleTrack today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <Card key={role.id} className="hover-glow cursor-pointer transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center space-y-4">
                  <div className={`w-16 h-16 ${role.bgColor} rounded-2xl flex items-center justify-center mx-auto`}>
                    <IconComponent className={`h-8 w-8 ${role.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription className="mt-2">{role.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    onClick={() => onRoleSelect(role.id)}
                    className="w-full hover-glow"
                    variant={role.id === 'student' ? 'default' : role.id === 'admin' ? 'secondary' : 'outline'}
                    style={role.id === 'driver' ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' } : {}}
                  >
                    Continue as {role.title}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You can switch roles anytime from your profile settings
          </p>
        </div>
      </div>
    </div>
  )
}