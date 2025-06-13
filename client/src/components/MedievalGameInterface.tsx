import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, 
  Shield, 
  Coins, 
  Users, 
  Sword,
  Map,
  Scroll,
  Star,
  Heart,
  Settings,
  Castle,
  Flag,
  Compass,
  BookOpen,
  Swords,
  MessageSquare,
  Bell,
  User,
  Package,
  Zap,
  Target,
  Globe,
  ChevronRight,
  Home,
  BarChart3
} from "lucide-react";
import WorldMap from "./WorldMap";
import CompanionSystem from "./CompanionSystem";
import QuestSystem from "./QuestSystem";
import type { GameState } from "@shared/schema";

interface MedievalGameInterfaceProps {
  playerId: number;
}

export default function MedievalGameInterface({ playerId }: MedievalGameInterfaceProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [rightPanelContent, setRightPanelContent] = useState("stats");

  const { data: gameState, isLoading, error } = useQuery<GameState>({
    queryKey: [`/api/game-state/${playerId}`],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medieval-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medieval-gold mx-auto mb-4"></div>
          <p className="text-medieval-beige font-ui">Loading your realm...</p>
        </div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-medieval-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-medieval-crimson mb-4 font-ui">Failed to load game state</p>
          <Button onClick={() => window.location.reload()} className="bg-medieval-bronze hover:bg-medieval-bronze/80">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const experienceToNext = gameState.player.level * 1000;
  const experienceProgress = (gameState.player.experience / experienceToNext) * 100;

  const leftSidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "map", label: "World Map", icon: Map },
    { id: "quests", label: "Quests", icon: Scroll },
    { id: "companions", label: "Companions", icon: Users },
    { id: "armies", label: "Armies", icon: Sword },
    { id: "territories", label: "Territories", icon: Flag },
    { id: "crusades", label: "Crusades", icon: Castle },
    { id: "diplomacy", label: "Diplomacy", icon: Crown },
    { id: "economy", label: "Economy", icon: Coins },
    { id: "guilds", label: "Guilds", icon: Shield },
    { id: "tavern", label: "Tavern", icon: MessageSquare },
  ];

  const rightPanelItems = [
    { id: "stats", label: "Character Stats", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "reputation", label: "Reputation", icon: Star },
    { id: "events", label: "Recent Events", icon: Bell },
    { id: "notifications", label: "Notifications", icon: Zap },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const calculateHealthPercentage = () => {
    return (gameState.player.health / gameState.player.maxHealth) * 100;
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h1 className="text-4xl font-medieval text-medieval-gold mb-2 medieval-glow">
                {gameState.player.name}
              </h1>
              <p className="text-xl text-medieval-beige font-ui">
                {gameState.player.title} of the Realm
              </p>
              <Badge className="mt-2 bg-medieval-bronze text-medieval-dark">
                Level {gameState.player.level}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-medieval-brown/30 border-medieval-bronze/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-medieval-gold font-ui">
                    <Crown className="w-5 h-5" />
                    Royal Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Honor:</span>
                    <span className="text-medieval-gold font-ui">{gameState.player.honor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Turn:</span>
                    <span className="text-medieval-bronze font-ui">{gameState.player.turnNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Position:</span>
                    <span className="text-medieval-bronze font-ui">
                      ({gameState.player.positionX}, {gameState.player.positionY})
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-medieval-slate/20 border-medieval-bronze/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-medieval-gold font-ui">
                    <Coins className="w-5 h-5" />
                    Treasury
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Gold:</span>
                    <span className="text-medieval-gold font-ui">{gameState.player.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Food:</span>
                    <span className="text-green-400 font-ui">{gameState.player.food.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Materials:</span>
                    <span className="text-blue-400 font-ui">{gameState.player.materials.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-medieval-brown/30 border-medieval-bronze/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-medieval-gold font-ui">
                    <Users className="w-5 h-5" />
                    Population
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Citizens:</span>
                    <span className="text-medieval-bronze font-ui">{gameState.player.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Companions:</span>
                    <span className="text-medieval-bronze font-ui">{gameState.companions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige font-ui">Armies:</span>
                    <span className="text-medieval-bronze font-ui">{gameState.armies.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-medieval-slate/20 border-medieval-bronze/50">
              <CardHeader>
                <CardTitle className="text-medieval-gold font-ui">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {gameState.recentEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <div className="w-2 h-2 bg-medieval-bronze rounded-full mt-2"></div>
                      <div>
                        <p className="text-medieval-beige font-ui text-sm">{event.message}</p>
                        <p className="text-medieval-gray font-ui text-xs">
                          {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        );
      case "map":
        return <WorldMap gameState={gameState} />;
      case "quests":
        return <QuestSystem gameState={gameState} />;
      case "companions":
        return <CompanionSystem gameState={gameState} />;
      default:
        return (
          <div className="text-center py-20">
            <p className="text-medieval-beige font-ui text-lg">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel coming soon...
            </p>
          </div>
        );
    }
  };

  const renderRightPanel = () => {
    switch (rightPanelContent) {
      case "stats":
        return (
          <div className="space-y-4">
            <Card className="bg-medieval-brown/30 border-medieval-bronze/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-medieval-gold font-ui text-sm">Health</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={calculateHealthPercentage()} className="mb-2" />
                <p className="text-xs text-medieval-beige font-ui">
                  {gameState.player.health} / {gameState.player.maxHealth}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-medieval-slate/20 border-medieval-bronze/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-medieval-gold font-ui text-sm">Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={experienceProgress} className="mb-2" />
                <p className="text-xs text-medieval-beige font-ui">
                  {gameState.player.experience} / {experienceToNext}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-medieval-brown/30 border-medieval-bronze/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-medieval-gold font-ui text-sm">Faction Relations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gameState.player.factionReputations && typeof gameState.player.factionReputations === 'object' && 
                  Object.entries(gameState.player.factionReputations).map(([faction, rep]) => (
                  <div key={faction} className="flex justify-between text-xs">
                    <span className="text-medieval-beige font-ui">{faction}:</span>
                    <span className={`font-ui ${typeof rep === 'number' && rep >= 0 ? 'text-green-400' : 'text-medieval-crimson'}`}>
                      {typeof rep === 'number' ? rep : 0}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      case "inventory":
        return (
          <div className="space-y-4">
            <h3 className="text-medieval-gold font-ui text-sm font-bold">Inventory</h3>
            <ScrollArea className="h-64">
              {gameState.inventory.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 rounded bg-medieval-brown/20 mb-2">
                  <span className="text-medieval-beige font-ui text-xs">{item.item.name}</span>
                  <Badge className="bg-medieval-bronze text-medieval-dark text-xs">
                    {item.quantity}
                  </Badge>
                </div>
              ))}
            </ScrollArea>
          </div>
        );
      case "events":
        return (
          <div className="space-y-4">
            <h3 className="text-medieval-gold font-ui text-sm font-bold">Recent Events</h3>
            <ScrollArea className="h-64">
              {gameState.recentEvents.slice(0, 10).map((event, index) => (
                <div key={index} className="py-2 px-3 rounded bg-medieval-slate/20 mb-2">
                  <p className="text-medieval-beige font-ui text-xs">{event.message}</p>
                  <p className="text-medieval-gray font-ui text-xs mt-1">
                    {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Recent'}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-medieval-beige font-ui text-sm">
              {rightPanelContent.charAt(0).toUpperCase() + rightPanelContent.slice(1)} panel
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-medieval-dark font-ui">
      {/* Header */}
      <header className="bg-medieval-brown/30 border-b-2 border-medieval-bronze/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Crown className="w-8 h-8 text-medieval-gold" />
            <h1 className="text-2xl font-medieval text-medieval-gold medieval-glow">
              Crusader Knights Revival
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Coins className="w-4 h-4 text-medieval-gold" />
                <span className="text-medieval-beige font-ui">{gameState.player.gold.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-medieval-beige font-ui">{gameState.player.population.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-medieval-beige font-ui">{gameState.player.honor}</span>
              </div>
            </div>
            
            <Button size="sm" className="bg-medieval-bronze hover:bg-medieval-bronze/80">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-64 bg-medieval-brown/30 border-r-2 border-medieval-bronze/50">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {leftSidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start font-ui ${
                      activeTab === item.id 
                        ? "bg-medieval-bronze text-medieval-dark" 
                        : "text-medieval-beige hover:bg-medieval-bronze/20"
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {renderMainContent()}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-medieval-slate/20 border-l-2 border-medieval-bronze/50">
          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {rightPanelItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    size="sm"
                    variant={rightPanelContent === item.id ? "default" : "ghost"}
                    className={`font-ui text-xs ${
                      rightPanelContent === item.id 
                        ? "bg-medieval-bronze text-medieval-dark" 
                        : "text-medieval-beige hover:bg-medieval-bronze/20"
                    }`}
                    onClick={() => setRightPanelContent(item.id)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {item.label.split(' ')[0]}
                  </Button>
                );
              })}
            </div>
            
            <ScrollArea className="h-[calc(100vh-180px)]">
              {renderRightPanel()}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}