import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import WhoisLookupPage from "@/pages/tools/WhoisLookupPage";

// Lazy load pages for better performance
const HomePage = React.lazy(() => import("@/pages/HomePage"));
const ToolsPage = React.lazy(() => import("@/pages/ToolsPage"));
const DnsToolPage = React.lazy(() => import("@/pages/tools/DnsToolPage"));
const UrlConverterPage = React.lazy(() => import("@/pages/tools/UrlConverterPage")); // New ✅
const WhoisTestPage = React.lazy(() => import("@/pages/tools/WhoisTestPage"));


// Loading component
function PageLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <MainLayout>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/dns-lookup" element={<DnsToolPage />} />
              <Route path="/tools/url-converter" element={<UrlConverterPage />} /> {/* ✅ New */}
	      <Route path="/tools/whois-test" element={<WhoisTestPage />} />
	      <Route path="/tools/whois-lookup" element={<WhoisLookupPage />} />
              <Route
                path="*"
                element={
                  <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold">Page Not Found</h2>
                    <p className="text-muted-foreground">
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </MainLayout>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
