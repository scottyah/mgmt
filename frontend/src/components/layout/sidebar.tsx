import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  KeyRound,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/auth-context";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/licenses", icon: KeyRound, label: "Licenses" },
  { to: "/certs", icon: ShieldCheck, label: "Certificates" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthContext();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b px-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="size-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">
            OSA Suite
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const linkContent = (
            <>
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger
                  render={
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }: { isActive: boolean }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )
                      }
                    />
                  }
                >
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )
              }
            >
              {linkContent}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t p-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn("w-full", !collapsed && "justify-start gap-3")}
        >
          {isDark ? (
            <Sun className="size-4 shrink-0" />
          ) : (
            <Moon className="size-4 shrink-0" />
          )}
          {!collapsed && (
            <span className="text-sm">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </Button>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={onToggle}
          className={cn("w-full", !collapsed && "justify-start gap-3")}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <PanelLeftClose className="size-4 shrink-0" />
          )}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </Button>

        <Separator />

        {/* User section */}
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "justify-center" : "px-2"
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase">
            {user?.username?.charAt(0) ?? "?"}
          </div>
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between">
              <span className="truncate text-sm font-medium">
                {user?.username}
              </span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon-xs" onClick={logout} />
                  }
                >
                  <LogOut className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
