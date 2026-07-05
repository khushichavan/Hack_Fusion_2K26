import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const labelMap: Record<string, string> = {
  app: "Home",
  dashboard: "Dashboard",
  map: "Live Map",
  prediction: "Prediction",
  analytics: "Analytics",
  cameras: "Cameras",
  alerts: "Alert Center",
  history: "History",
  settings: "Settings",
  profile: "Profile",
  admin: "Admin",
};

export function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Link
        to="/app/dashboard"
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        const label = labelMap[part] ?? part;
        if (part === "app") {
          return <ChevronRight key={path} className="h-3.5 w-3.5" />;
        }
        return (
          <Fragment key={path}>
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={path} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </Fragment>
        );
      })}
    </nav>
  );
}
