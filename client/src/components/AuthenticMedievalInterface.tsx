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
  BarChart3,
  Trophy,
  Church,
  Hammer,
  Briefcase
} from "lucide-react";
import WorldMap from "./WorldMap";
import CompanionSystem from "./CompanionSystem";
import QuestSystem from "./QuestSystem";
import type { GameState } from "@shared/schema";

interface AuthenticMedievalInterfaceProps {
  playerId: number;
}

export default function AuthenticMedievalInterface({ playerId }: AuthenticMedievalInterfaceProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [rightPanelContent, setRightPanelContent] = useState("character");

  const { data: gameState, isLoading, error } = useQuery<GameState>({
    queryKey: [`/api/game-state/${playerId}`],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center panel-medieval p-8 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-parchment font-ui">Loading your medieval realm...</p>
        </div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center panel-medieval p-8 rounded-lg">
          <p className="text-crimson mb-4 font-ui">Failed to load realm state</p>
          <Button onClick={() => window.location.reload()} className="btn-medieval">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const experienceToNext = gameState.player.level * 1000;
  const experienceProgress = (gameState.player.experience / experienceToNext) * 100;

  const leftNavigationItems = [
    { id: "overview", label: "Character", icon: User, description: "Character overview and stats" },
    { id: "map", label: "Map", icon: Map, description: "Explore the medieval world" },
    { id: "quests", label: "Quests", icon: Scroll, description: "Active and available quests" },
    { id: "companions", label: "Retinue", icon: Users, description: "Manage your companions" },
    { id: "armies", label: "Armies", icon: Sword, description: "Command your forces" },
    { id: "territories", label: "Domains", icon: Castle, description: "Your lands and holdings" },
    { id: "diplomacy", label: "Diplomacy", icon: Crown, description: "Foreign relations" },
    { id: "economy", label: "Treasury", icon: Coins, description: "Manage finances" },
    { id: "guilds", label: "Guilds", icon: Hammer, description: "Trade and craft guilds" },
    { id: "religion", label: "Faith", icon: Church, description: "Religious affairs" },
    { id: "court", label: "Court", icon: Trophy, description: "Royal court and nobles" },
  ];

  const rightPanelTabs = [
    { id: "character", label: "Character", icon: User },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "rankings", label: "Rankings", icon: Trophy },
    { id: "events", label: "Events", icon: Bell },
    { id: "groups", label: "Groups", icon: Flag },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  const calculateHealthPercentage = () => {
    return (gameState.player.health / gameState.player.maxHealth) * 100;
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Character Portrait and Title Section */}
            <div className="panel-medieval p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 heraldic-shield flex items-center justify-center">
                    <Crown className="w-8 h-8 text-gold" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-medieval text-gold">
                      {gameState.player.name}
                    </h1>
                    <p className="text-lg text-bronze font-ui">
                      {gameState.player.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-gold text-leather">
                        Level {gameState.player.level}
                      </Badge>
                      <Badge className="bg-bronze text-white">
                        Turn {gameState.player.turnNumber}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-iron font-ui mb-1">Position</div>
                  <div className="text-bronze font-ui">
                    ({gameState.player.positionX}, {gameState.player.positionY})
                  </div>
                </div>
              </div>

              {/* Attributes Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-aged-parchment p-3 rounded border-heraldic">
                  <div className="flex items-center justify-between">
                    <Heart className="w-5 h-5 text-crimson" />
                    <span className="text-xs text-iron font-ui">Health</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={calculateHealthPercentage()} className="h-2 mb-1" />
                    <div className="text-xs text-parchment font-ui">
                      {gameState.player.health}/{gameState.player.maxHealth}
                    </div>
                  </div>
                </div>

                <div className="bg-aged-parchment p-3 rounded border-heraldic">
                  <div className="flex items-center justify-between">
                    <Star className="w-5 h-5 text-gold" />
                    <span className="text-xs text-iron font-ui">Experience</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={experienceProgress} className="h-2 mb-1" />
                    <div className="text-xs text-parchment font-ui">
                      {gameState.player.experience}/{experienceToNext}
                    </div>
                  </div>
                </div>

                <div className="bg-aged-parchment p-3 rounded border-heraldic">
                  <div className="flex items-center justify-between">
                    <Shield className="w-5 h-5 text-royal" />
                    <span className="text-xs text-iron font-ui">Honor</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-lg font-ui text-parchment">{gameState.player.honor}</div>
                  </div>
                </div>

                <div className="bg-aged-parchment p-3 rounded border-heraldic">
                  <div className="flex items-center justify-between">
                    <Coins className="w-5 h-5 text-gold" />
                    <span className="text-xs text-iron font-ui">Gold</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-lg font-ui text-parchment">
                      {gameState.player.gold.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources Section */}
              <div className="border-t border-bronze pt-4">
                <h3 className="text-bronze font-ui font-bold mb-3">Royal Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-parchment font-ui">Food Stores:</span>
                    <span className="text-forest font-ui font-bold">
                      {gameState.player.food.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-parchment font-ui">Materials:</span>
                    <span className="text-iron font-ui font-bold">
                      {gameState.player.materials.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-parchment font-ui">Population:</span>
                    <span className="text-royal font-ui font-bold">
                      {gameState.player.population.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Faction Relations */}
            <div className="panel-medieval p-6 rounded-lg">
              <h3 className="text-bronze font-ui font-bold mb-4 flex items-center">
                <Flag className="w-5 h-5 mr-2" />
                Diplomatic Relations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameState.player.factionReputations && typeof gameState.player.factionReputations === 'object' && 
                  Object.entries(gameState.player.factionReputations as Record<string, number>).map(([faction, rep]) => {
                    const reputation = Number(rep) || 0;
                    return (
                      <div key={faction} className="bg-aged-parchment p-3 rounded border-heraldic">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-parchment font-ui text-sm font-bold">{faction}</span>
                          <Badge className={`${reputation >= 0 ? 'bg-forest' : 'bg-crimson'} text-white text-xs`}>
                            {reputation >= 0 ? 'Allied' : 'Hostile'}
                          </Badge>
                        </div>
                        <div className="text-lg font-ui text-parchment">
                          {reputation}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recent Events */}
            <div className="panel-medieval p-6 rounded-lg">
              <h3 className="text-bronze font-ui font-bold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Chronicle of Recent Events
              </h3>
              <ScrollArea className="h-64">
                {gameState.recentEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 mb-2 bg-aged-parchment rounded border-l-4 border-bronze">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-parchment font-ui text-sm">{event.message}</p>
                      <p className="text-iron font-ui text-xs mt-1">
                        {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
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
          <div className="panel-medieval p-8 rounded-lg text-center">
            <h3 className="text-bronze font-ui text-xl mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h3>
            <p className="text-parchment font-ui">
              This section is under construction. Our scribes are working diligently to complete it.
            </p>
          </div>
        );
    }
  };

  const renderRightPanel = () => {
    switch (rightPanelContent) {
      case "character":
        return (
          <div className="space-y-4">
            <div className="panel-medieval p-4 rounded">
              <h4 className="text-bronze font-ui font-bold mb-3">Character Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-iron font-ui">Name:</span>
                  <span className="text-parchment font-ui">{gameState.player.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron font-ui">Title:</span>
                  <span className="text-parchment font-ui">{gameState.player.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron font-ui">Level:</span>
                  <span className="text-parchment font-ui">{gameState.player.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron font-ui">Experience:</span>
                  <span className="text-parchment font-ui">{gameState.player.experience}</span>
                </div>
              </div>
            </div>

            <div className="panel-medieval p-4 rounded">
              <h4 className="text-bronze font-ui font-bold mb-3">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-iron font-ui">Companions:</span>
                  <span className="text-parchment font-ui">{gameState.companions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron font-ui">Armies:</span>
                  <span className="text-parchment font-ui">{gameState.armies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron font-ui">Territories:</span>
                  <span className="text-parchment font-ui">{gameState.territories.length}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "inventory":
        return (
          <div className="space-y-4">
            <h4 className="text-bronze font-ui font-bold">Inventory</h4>
            <ScrollArea className="h-64">
              {gameState.inventory.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 mb-2 bg-aged-parchment rounded border-heraldic">
                  <span className="text-parchment font-ui text-sm">{item.item.name}</span>
                  <Badge className="bg-bronze text-white text-xs">
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
            <h4 className="text-bronze font-ui font-bold">Recent Events</h4>
            <ScrollArea className="h-64">
              {gameState.recentEvents.slice(0, 10).map((event, index) => (
                <div key={index} className="p-3 mb-2 bg-aged-parchment rounded border-heraldic">
                  <p className="text-parchment font-ui text-xs">{event.message}</p>
                  <p className="text-iron font-ui text-xs mt-1">
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
            <p className="text-parchment font-ui text-sm">
              {rightPanelContent.charAt(0).toUpperCase() + rightPanelContent.slice(1)} panel
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-parchment font-ui">
      {/* Medieval Header with Ornate Design */}
      <header className="border-ornate bg-leather text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-leather via-bronze to-leather opacity-80"></div>
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 heraldic-shield flex items-center justify-center">
                <Crown className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-medieval text-gold">
                  Medieval Europe
                </h1>
                <p className="text-sm text-white/80">
                  The Age of Kings and Crusades
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-gold" />
                  <span className="text-white font-ui">{gameState.player.gold.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white font-ui">{gameState.player.population.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-white" />
                  <span className="text-white font-ui">{gameState.player.honor}</span>
                </div>
              </div>
              
              <Button size="sm" className="btn-medieval">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Navigation Panel */}
        <div className="w-64 panel-medieval border-r-4 border-bronze">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {leftNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start font-ui text-sm ${
                      activeTab === item.id 
                        ? "btn-medieval text-white" 
                        : "text-parchment hover:bg-leather/20 hover:text-bronze"
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
        <div className="flex-1 overflow-hidden bg-parchment">
          <ScrollArea className="h-full">
            <div className="p-6">
              {renderMainContent()}
            </div>
          </ScrollArea>
        </div>

        {/* Right Information Panel */}
        <div className="w-80 panel-medieval border-l-4 border-bronze">
          <div className="p-4">
            <div className="flex flex-wrap gap-1 mb-4">
              {rightPanelTabs.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    size="sm"
                    variant="ghost"
                    className={`font-ui text-xs ${
                      rightPanelContent === item.id 
                        ? "btn-medieval text-white" 
                        : "text-parchment hover:bg-leather/20 hover:text-bronze"
                    }`}
                    onClick={() => setRightPanelContent(item.id)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              {renderRightPanel()}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}