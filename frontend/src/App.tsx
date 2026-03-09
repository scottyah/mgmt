import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/layout/protected-route";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ProjectsListPage from "@/pages/projects-list";
import ProjectDetailPage from "@/pages/project-detail";
import LicensesListPage from "@/pages/licenses-list";
import CertsListPage from "@/pages/certs-list";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider delay={300}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route
                  path="/projects/:key"
                  element={<ProjectDetailPage />}
                />
                <Route path="/licenses" element={<LicensesListPage />} />
                <Route path="/certs" element={<CertsListPage />} />
              </Route>
              <Route
                path="*"
                element={
                  <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-muted-foreground">Page not found</p>
                    <Link
                      to="/"
                      className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                }
              />
            </Routes>
            <Toaster richColors closeButton position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
