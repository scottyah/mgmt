import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  projects: "Projects",
  licenses: "Licenses",
  certs: "Certificates",
};

export function TopBar() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/" },
  ];

  if (segments.length > 0) {
    let path = "";
    for (const seg of segments) {
      path += `/${seg}`;
      const label = ROUTE_LABELS[seg] ?? decodeURIComponent(seg);
      crumbs.push({ label, href: path });
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-background px-6">
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
