import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Bell,
  Settings,
  ChevronRight
} from "lucide-react";
import WorldMap from "./WorldMap";
import CompanionSystem from "./CompanionSystem";
import QuestSystem from "./QuestSystem";
import type { GameState } from "@shared/schema";

interface EnhancedGameInterfaceProps {
  playerId: number;
}

export default function EnhancedGameInterface({ playerId }: EnhancedGameInterfaceProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: gameState, isLoading, error } = useQuery<GameState>({
    queryKey: [`/api/game-state/${playerId}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your realm...</p>
        </div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load game state</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const experienceToNext = gameState.player.level * 1000;
  const experienceProgress = (gameState.player.experience / experienceToNext) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                <h1 className="text-xl font-bold text-yellow-400">Crusader Knights Revival</h1>
              </div>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                {gameState.player.title}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">{gameState.player.gold.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-white">{gameState.player.population.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-white">{gameState.player.honor}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-gray-600">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Player Status Bar */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-3">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">Health:</span>
              </div>
              <div className="flex-1">
                <Progress value={(gameState.player.health / gameState.player.maxHealth) * 100} className="h-2" />
                <span className="text-xs text-gray-400">{gameState.player.health}/{gameState.player.maxHealth}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Level {gameState.player.level}:</span>
              </div>
              <div className="flex-1">
                <Progress value={experienceProgress} className="h-2" />
                <span className="text-xs text-gray-400">{gameState.player.experience}/{experienceToNext}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Sword className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-300">Armies:</span>
              </div>
              <span className="text-sm text-white">{gameState.armies.length}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Position:</span>
              </div>
              <span className="text-sm text-white">({gameState.player.positionX}, {gameState.player.positionY})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              World Map
            </TabsTrigger>
            <TabsTrigger value="companions" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Companions
            </TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Quests
            </TabsTrigger>
            <TabsTrigger value="armies" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Armies
            </TabsTrigger>
            <TabsTrigger value="territories" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Territories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Player Overview */}
              <Card className="col-span-2 p-6 bg-gray-900 border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Noble {gameState.player.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Title:</span>
                      <span className="text-white">{gameState.player.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span className="text-white">{gameState.player.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Honor:</span>
                      <span className="text-white">{gameState.player.honor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Turn:</span>
                      <span className="text-white">{gameState.player.turnNumber}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gold:</span>
                      <span className="text-yellow-400">{gameState.player.gold.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Food:</span>
                      <span className="text-green-400">{gameState.player.food.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Materials:</span>
                      <span className="text-blue-400">{gameState.player.materials.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Population:</span>
                      <span className="text-purple-400">{gameState.player.population.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 bg-gray-900 border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">Companions:</span>
                    </div>
                    <span className="text-white">{gameState.companions.length}/6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sword className="w-4 h-4 text-red-400" />
                      <span className="text-gray-400">Armies:</span>
                    </div>
                    <span className="text-white">{gameState.armies.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Map className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Territories:</span>
                    </div>
                    <span className="text-white">{gameState.territories.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Scroll className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Active Quests:</span>
                    </div>
                    <span className="text-white">{gameState.activeQuests.length}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Events */}
            <Card className="p-6 bg-gray-900 border-gray-700">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Recent Events</h3>
              <div className="space-y-3">
                {gameState.recentEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{event.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.createdAt!).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        event.importance === "high" ? "border-red-400 text-red-400" :
                        event.importance === "normal" ? "border-yellow-400 text-yellow-400" :
                        "border-gray-400 text-gray-400"
                      }`}
                    >
                      {event.type}
                    </Badge>
                  </div>
                ))}
                {gameState.recentEvents.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No recent events</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <WorldMap gameState={gameState} />
          </TabsContent>

          <TabsContent value="companions">
            <CompanionSystem gameState={gameState} />
          </TabsContent>

          <TabsContent value="quests">
            <QuestSystem gameState={gameState} />
          </TabsContent>

          <TabsContent value="armies" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-yellow-400">Army Management</h3>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
                Recruit Army
              </Button>
            </div>
            
            <div className="grid gap-4">
              {gameState.armies.map((army) => (
                <Card key={army.id} className="p-4 bg-gray-900 border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{army.name}</h4>
                      <p className="text-sm text-gray-400">{army.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">{army.totalStrength}</div>
                      <div className="text-xs text-gray-400">Total Strength</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <div className="text-gray-400">Heavy Infantry</div>
                      <div className="text-white">{army.heavyInfantry}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Archers</div>
                      <div className="text-white">{army.archers}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Cavalry</div>
                      <div className="text-white">{army.cavalry}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Siege Engines</div>
                      <div className="text-white">{army.siegeEngines}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant="outline" className="text-xs">
                      {army.status}
                    </Badge>
                    <div className="text-xs text-gray-400">
                      Upkeep: {army.upkeepCost} gold/turn
                    </div>
                  </div>
                </Card>
              ))}
              
              {gameState.armies.length === 0 && (
                <Card className="p-8 bg-gray-900 border-gray-700 text-center">
                  <Sword className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No armies recruited</p>
                  <p className="text-xs text-gray-500 mt-2">Build armies to defend your realm and go on crusades</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="territories" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-yellow-400">Territory Management</h3>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
                Expand Territory
              </Button>
            </div>
            
            <div className="grid gap-4">
              {gameState.territories.map((territory) => (
                <Card key={territory.id} className="p-4 bg-gray-900 border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{territory.name}</h4>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {territory.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-400">{territory.taxIncome}</div>
                      <div className="text-xs text-gray-400">Gold/Turn</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <div className="text-gray-400">Population</div>
                      <div className="text-white">{territory.population.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Garrison</div>
                      <div className="text-white">{territory.garrison}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Fortification</div>
                      <div className="text-white">Level {territory.fortificationLevel}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-xs text-gray-400 mb-2">Buildings</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(territory.buildings as Record<string, number>).map(([building, level]) => (
                        <Badge key={building} variant="secondary" className="text-xs">
                          {building} {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
              
              {gameState.territories.length === 0 && (
                <Card className="p-8 bg-gray-900 border-gray-700 text-center">
                  <Map className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No territories controlled</p>
                  <p className="text-xs text-gray-500 mt-2">Expand your realm by conquering new territories</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}