import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Castle, Shield, Swords, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import type { GameState } from "@shared/schema";

interface OverviewTabProps {
  gameState: GameState;
  onSwitchTab: (tab: string) => void;
}

export default function OverviewTab({ gameState, onSwitchTab }: OverviewTabProps) {
  const { player } = gameState || {};
  const territories = gameState?.territories || [];
  const armies = gameState?.armies || [];
  const crusades = gameState?.crusades || [];
  const recentEvents = gameState?.recentEvents || [];

  const totalIncome = territories?.reduce((sum, t) => sum + t.taxIncome, 0) || 0;
  const totalUpkeep = armies?.reduce((sum, a) => sum + a.upkeepCost, 0) || 0;
  const netIncome = totalIncome - totalUpkeep;

  const activeCrusades = crusades.filter(c => c.status === "active");
  const idleArmies = armies.filter(a => a.status === "idle");

  return (
    <div className="p-6 space-y-6 bg-medieval-dark min-h-full">
      <div className="flex justify-between items-center">
        <h1 className="font-medieval text-3xl text-medieval-gold">
          Welcome back, {player?.name || "Knight"}
        </h1>
        <Badge variant="outline" className="text-medieval-gold border-medieval-gold">
          Turn {player?.turnNumber || 1}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Territories</CardTitle>
            <Castle className="h-4 w-4 text-medieval-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{territories.length}</div>
            <p className="text-xs text-medieval-beige opacity-75">
              Total population: {territories.reduce((sum, t) => sum + (t.population || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Armies</CardTitle>
            <Shield className="h-4 w-4 text-medieval-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{armies.length}</div>
            <p className="text-xs text-medieval-beige opacity-75">
              {idleArmies.length} idle, {armies.length - idleArmies.length} deployed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Active Crusades</CardTitle>
            <Swords className="h-4 w-4 text-medieval-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeCrusades.length}</div>
            <p className="text-xs text-medieval-beige opacity-75">
              {crusades.filter(c => c.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-medieval-gold" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netIncome >= 0 ? '+' : ''}{netIncome}
            </div>
            <p className="text-xs text-medieval-beige opacity-75">
              {totalIncome} income - {totalUpkeep} upkeep
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-medieval-slate border-medieval-bronze/30">
        <CardHeader>
          <CardTitle className="text-medieval-gold">Quick Actions</CardTitle>
          <CardDescription className="text-medieval-beige">
            Manage your realm efficiently
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => onSwitchTab("armies")}
              className="bg-medieval-crimson hover:bg-medieval-crimson/80"
            >
              <Shield className="w-4 h-4 mr-2" />
              Recruit Army
            </Button>
            <Button 
              onClick={() => onSwitchTab("crusades")}
              className="bg-medieval-bronze hover:bg-medieval-bronze/80"
            >
              <Swords className="w-4 h-4 mr-2" />
              Launch Crusade
            </Button>
            <Button 
              onClick={() => onSwitchTab("territories")}
              className="bg-medieval-gold hover:bg-medieval-gold/80 text-medieval-dark"
            >
              <Castle className="w-4 h-4 mr-2" />
              Upgrade Buildings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="bg-medieval-slate border-medieval-bronze/30">
        <CardHeader>
          <CardTitle className="text-medieval-gold">Recent Events</CardTitle>
          <CardDescription className="text-medieval-beige">
            Latest happenings in your realm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-medieval-dark/50 rounded">
                  <div className="flex-shrink-0 w-2 h-2 bg-medieval-gold rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-medieval-beige text-sm">{event.message}</p>
                    <p className="text-xs text-medieval-beige opacity-50 mt-1">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Unknown time'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-medieval-beige opacity-75">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>No recent events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {(netIncome < 0 || idleArmies.length === 0) && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {netIncome < 0 && (
              <div className="flex items-center space-x-2 text-red-300">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm">Your realm is losing gold each turn!</span>
              </div>
            )}
            {idleArmies.length === 0 && armies.length > 0 && (
              <div className="flex items-center space-x-2 text-yellow-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">All armies are deployed. Consider recruiting more.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}