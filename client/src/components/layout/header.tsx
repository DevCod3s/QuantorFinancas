import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description: string;
  onMenuClick: () => void;
}

export default function Header({ title, description, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          className="md:hidden p-2"
          onClick={onMenuClick}
        >
          <i className="fas fa-bars text-muted-foreground"></i>
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="p-2 relative">
            <i className="fas fa-bell text-muted-foreground"></i>
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </Button>
          
          <div className="w-px h-6 bg-border"></div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/api/logout'}
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
