import { Target, Users, Award, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'

export function About() {
  const teamMembers = [
    {
      name: 'Priyanka',
      role: 'Full Stack Developer',
      initials: 'P',
      description: 'UI/UX design and React development'
    },
    {
      name: 'Renuka',
      role: 'Research Team', 
      initials: 'R',
      description: 'Research and development'
    }
  ]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">About ShuttleTrack</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A real-time campus shuttle tracking platform designed to improve campus mobility.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="hover-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
            <CardDescription>
              Revolutionizing campus transportation through technology
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg leading-relaxed">
              ShuttleTrack was created to solve the common problem of uncertain shuttle arrival times on college campuses. 
              Our platform provides real-time tracking and seamless communication between students, drivers, and administrators.
            </p>
          </CardContent>
        </Card>

        {/* Vision Section */}
        <Card className="hover-glow">
          <CardHeader className="text-center">
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              To create efficient and reliable campus transportation systems that enhance student mobility and reduce waiting times.
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="hover-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Meet Our Team</CardTitle>
            <CardDescription>
              The dedicated developers behind ShuttleTrack
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center space-y-4">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-2">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}