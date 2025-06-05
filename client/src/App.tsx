import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuctionProvider } from "@/contexts/AuctionContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { AlertsProvider } from "@/contexts/AlertsContext";
import HomePage from "@/pages/HomePage";
import AuctionFeed from "@/pages/AuctionFeed";
import AuctionDetail from "@/pages/AuctionDetail";
import Favorites from "@/pages/Favorites";
import SellCar from "@/pages/SellCar";
import MyBids from "@/pages/MyBids";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import UserData from "@/pages/UserData";
import LanguageSelector from "@/components/LanguageSelector";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Login from "@/pages/Login";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";
import { FlutterPreview } from "@/pages/FlutterPreview";
import { BottomNavigation } from "@/components/BottomNavigation";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/auctions" component={AuctionFeed} />
        <Route path="/auction/:id" component={AuctionDetail} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/sell" component={SellCar} />
        <Route path="/bids" component={MyBids} />
        <Route path="/profile" component={Profile} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/user-data" component={UserData} />
        <Route path="/language" component={LanguageSelector} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/flutter-preview" component={FlutterPreview} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserDataProvider>
            <AuctionProvider>
              <Toaster />
              <Router />
            </AuctionProvider>
          </UserDataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
