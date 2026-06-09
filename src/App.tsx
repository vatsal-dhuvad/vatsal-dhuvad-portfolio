import { Switch, Route, Router as WouterRouter } from "wouter";
import Portfolio from "@/pages/Portfolio";
import Admin from "@/pages/Admin";
import { ToastContainer } from "@/components/Toast";
import CustomCursor from "@/components/CustomCursor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Portfolio} />
      <Route path="/admin" component={Admin} />
      <Route>
        <Portfolio />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <CustomCursor />
      <Router />
      <ToastContainer />
    </WouterRouter>
  );
}

export default App;
