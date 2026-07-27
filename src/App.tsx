import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import Portfolio from "@/pages/Portfolio";
import { ToastContainer } from "@/components/Toast";
import MotionCursor from "@/components/MotionCursor";

const Admin = lazy(() => import("@/pages/Admin"));

function AdminFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-0)", color: "var(--text-1)" }}>
      Loading admin...
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Portfolio} />
      <Route path="/admin">
        <Suspense fallback={<AdminFallback />}>
          <Admin />
        </Suspense>
      </Route>
      <Route>
        <Portfolio />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <MotionCursor />
      <Router />
      <ToastContainer />
    </WouterRouter>
  );
}

export default App;
