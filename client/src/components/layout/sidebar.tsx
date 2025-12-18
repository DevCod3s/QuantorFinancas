import { useAuth } from "@/hooks/useAuth";
import { TABS } from "@/types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user } = useAuth();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <aside className={`sidebar bg-sidebar shadow-lg w-64 flex-shrink-0 sidebar-transition ${sidebarOpen ? 'active' : ''}`}>
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Quantor</h1>
            <p className="text-sm text-muted-foreground">Gestão Inteligente</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {TABS.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <i className={`${tab.icon} w-5 mr-3`}></i>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3 px-4 py-3">
          <img 
            src={(user as any)?.profileImageUrl || (user as any)?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
            alt="Foto do usuário" 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">
              {(user as any)?.name 
                ? `${(user as any).name}` 
                : ((user as any)?.firstName && (user as any)?.lastName 
                  ? `${(user as any).firstName} ${(user as any).lastName}` 
                  : (user as any)?.email || 'Usuário')}
            </p>
            <p className="text-xs text-muted-foreground">
              {(user as any)?.email || 'email@exemplo.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
