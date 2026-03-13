import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Container,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Ship,
} from "lucide-react";
import { useState } from "react";
import { ActorRole, type UserProfile } from "../backend.d";
import { useMessages } from "../hooks/useQueries";

const roleLabels: Record<ActorRole, string> = {
  [ActorRole.admin]: "Administrator",
  [ActorRole.customsOfficer]: "Customs Officer",
  [ActorRole.shippingLine]: "Shipping Line",
  [ActorRole.portAgent]: "Port Agent",
};

const roleColors: Record<ActorRole, string> = {
  [ActorRole.admin]: "bg-purple-500/20 text-purple-200",
  [ActorRole.customsOfficer]: "bg-amber-500/20 text-amber-200",
  [ActorRole.shippingLine]: "bg-teal-500/20 text-teal-200",
  [ActorRole.portAgent]: "bg-blue-500/20 text-blue-200",
};

interface LayoutProps {
  profile: UserProfile;
  onLogout: () => void;
  children: React.ReactNode;
}

export function Layout({ profile, onLogout, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: messages = [] } = useMessages();
  const unreadCount = messages.filter((m) => !m.isRead).length;

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      ocid: "nav.dashboard.link",
    },
    {
      to: "/cargo",
      label: "Cargo Tracking",
      icon: Container,
      ocid: "nav.cargo.link",
    },
    {
      to: "/documents",
      label: "Documents",
      icon: FileText,
      ocid: "nav.documents.link",
    },
    {
      to: "/messages",
      label: "Messages",
      icon: MessageSquare,
      ocid: "nav.messages.link",
      badge: unreadCount,
    },
    {
      to: "/reports",
      label: "Reports",
      icon: BarChart3,
      ocid: "nav.reports.link",
    },
  ];

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-20 md:hidden w-full h-full border-0 p-0 cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-30 h-full bg-sidebar shadow-sidebar
          flex flex-col sidebar-transition
          ${
            sidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0 md:w-64"
          }
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sidebar-foreground text-lg leading-none">
              PortSync
            </h1>
            <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">
              Port Community System
            </p>
          </div>
        </div>

        {/* User profile */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-accent-foreground">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sidebar-foreground font-semibold text-sm truncate">
                {profile.name}
              </p>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${roleColors[profile.role]}`}
              >
                {roleLabels[profile.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-ocid={item.ocid}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-accent text-accent-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:text-white hover:bg-sidebar-accent gap-2"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-accent" />
            <span className="font-display font-bold text-foreground">
              PortSync
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
