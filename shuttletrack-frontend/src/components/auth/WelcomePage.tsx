import { Bus } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface WelcomePageProps {
  onProceedToLogin: () => void
}

export function WelcomePage({ onProceedToLogin }: WelcomePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary p-4 rounded-2xl">
              <Bus className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">ShuttleTrack</h1>
            <p className="text-muted-foreground">Real-Time Campus Shuttle Tracking Platform</p>
          </div>
        </div>

        <Card className="hover-glow">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Track your campus shuttle in real-time with precise location updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Your campus shuttle tracking solution for better mobility and reduced waiting times.
              </p>
            </div>
            
            <Button onClick={onProceedToLogin} className="w-full hover-glow">
              Login to ShuttleTrack
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Designed for students, administrators, and drivers
          </p>
        </div>
      </div>
    </div>
  )
}