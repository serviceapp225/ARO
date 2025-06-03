import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuctionProvider } from "@/contexts/AuctionContext";
import HomePage from "@/pages/HomePage";
import AuctionFeed from "@/pages/AuctionFeed";
import AuctionDetail from "@/pages/AuctionDetail";
import Search from "@/pages/Search";
import SellCar from "@/pages/SellCar";
import MyBids from "@/pages/MyBids";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";
import { BottomNavigation } from "@/components/BottomNavigation";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/auctions" component={AuctionFeed} />
        <Route path="/auction/:id" component={AuctionDetail} />
        <Route path="/search" component={Search} />
        <Route path="/sell" component={SellCar} />
        <Route path="/bids" component={MyBids} />
        <Route path="/profile" component={Profile} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminPanel} />
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
          <AuctionProvider>
            <Toaster />
            <Router />
          </AuctionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
