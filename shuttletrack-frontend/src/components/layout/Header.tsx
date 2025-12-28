import { Bus, Menu, User, LogOut } from 'lucide-react'
import { Button } from '../ui/button'

interface HeaderProps {
  currentUser?: string
  currentRole?: string
  onLogout?: () => void
  onMenuToggle?: () => void
  showMenu?: boolean
}

export function Header({ currentUser, currentRole, onLogout, onMenuToggle, showMenu }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {showMenu && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Bus className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">ShuttleTrack</h1>
            <p className="text-xs text-muted-foreground">Real-Time Campus Shuttle</p>
          </div>
        </div>
      </div>
      
      {currentUser && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">{currentUser}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentRole}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}