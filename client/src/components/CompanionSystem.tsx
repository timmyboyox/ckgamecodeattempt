import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Sword, 
  Heart, 
  Star, 
  Users, 
  Crown,
  Target,
  Zap,
  Plus
} from "lucide-react";
import type { GameState, Companion } from "@shared/schema";

interface CompanionSystemProps {
  gameState: GameState;
}

export default function CompanionSystem({ gameState }: CompanionSystemProps) {
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const queryClient = useQueryClient();

  const recruitMutation = useMutation({
    mutationFn: async (companionData: any) => {
      const response = await apiRequest("POST", "/api/companions", companionData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${gameState.player.id}`] });
    },
  });

  const getClassIcon = (companionClass: string) => {
    switch (companionClass) {
      case "Warrior": return <Sword className="w-4 h-4 text-red-400" />;
      case "Archer": return <Target className="w-4 h-4 text-green-400" />;
      case "Mage": return <Zap className="w-4 h-4 text-purple-400" />;
      default: return <Shield className="w-4 h-4 text-blue-400" />;
    }
  };

  const getClassColor = (companionClass: string) => {
    switch (companionClass) {
      case "Warrior": return "border-red-500 bg-red-900/20";
      case "Archer": return "border-green-500 bg-green-900/20";
      case "Mage": return "border-purple-500 bg-purple-900/20";
      default: return "border-blue-500 bg-blue-900/20";
    }
  };

  const recruitRandomCompanion = () => {
    const classes = ["Warrior", "Archer", "Mage", "Squire"];
    const names = ["Sir Marcus", "Lady Elena", "Brother Thomas", "Captain Roderick", "Sage Morgana"];
    const backgrounds = [
      "A veteran of many battles, scarred but wise.",
      "Young but eager to prove their worth in service.",
      "A noble seeking redemption through adventure.",
      "A scholar turned adventurer, seeking ancient knowledge.",
      "A former outlaw seeking a chance at honor."
    ];

    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    const baseStats = {
      Warrior: { health: 80, attack: 15, defense: 12 },
      Archer: { health: 60, attack: 12, defense: 8 },
      Mage: { health: 50, attack: 18, defense: 6 },
      Squire: { health: 70, attack: 10, defense: 10 }
    };

    const stats = baseStats[randomClass as keyof typeof baseStats];

    recruitMutation.mutate({
      playerId: gameState.player.id,
      name: randomName,
      class: randomClass,
      health: stats.health,
      maxHealth: stats.health,
      attack: stats.attack,
      defense: stats.defense,
      wealth: Math.floor(Math.random() * 200) + 50,
      background: randomBackground,
      loyalty: Math.floor(Math.random() * 30) + 40,
      morale: Math.floor(Math.random() * 30) + 50,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-yellow-400">Companions</h3>
          <Badge variant="outline" className="text-xs">
            {gameState.companions.length}/6
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={recruitRandomCompanion}
          disabled={recruitMutation.isPending || gameState.companions.length >= 6}
          className="bg-yellow-600 hover:bg-yellow-700 text-black"
        >
          <Plus className="w-4 h-4 mr-1" />
          Recruit
        </Button>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="roster" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
            Roster
          </TabsTrigger>
          <TabsTrigger value="management" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
            Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-3">
          <div className="grid gap-3">
            {gameState.companions.length === 0 ? (
              <Card className="p-6 bg-gray-900 border-gray-700 text-center">
                <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No companions recruited yet</p>
                <p className="text-xs text-gray-500 mt-1">Recruit companions to aid in your quests</p>
              </Card>
            ) : (
              gameState.companions.map((companion) => (
                <Card
                  key={companion.id}
                  className={`p-4 cursor-pointer transition-all duration-200 ${getClassColor(companion.class)} 
                    ${selectedCompanion?.id === companion.id ? "ring-2 ring-yellow-400" : ""}`}
                  onClick={() => setSelectedCompanion(selectedCompanion?.id === companion.id ? null : companion)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`${getClassColor(companion.class)} text-white`}>
                        {getClassIcon(companion.class)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-white truncate">{companion.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          Lv.{companion.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {companion.class}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-red-400" />
                          <span className="text-gray-300">{companion.health}/{companion.maxHealth}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Sword className="w-3 h-3 text-orange-400" />
                          <span className="text-gray-300">{companion.attack}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3 text-blue-400" />
                          <span className="text-gray-300">{companion.defense}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Loyalty</span>
                          <span className="text-gray-300">{companion.loyalty}%</span>
                        </div>
                        <Progress value={companion.loyalty} className="h-1" />
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Morale</span>
                          <span className="text-gray-300">{companion.morale}%</span>
                        </div>
                        <Progress value={companion.morale} className="h-1" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      <Badge 
                        variant={companion.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {companion.isActive ? "Active" : "Resting"}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-yellow-400">
                        <Crown className="w-3 h-3" />
                        <span>{companion.wealth}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCompanion?.id === companion.id && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-300 italic">{companion.background}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Equipment
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Skills
                        </Button>
                        <Button 
                          size="sm" 
                          variant={companion.isActive ? "secondary" : "default"} 
                          className="text-xs"
                        >
                          {companion.isActive ? "Rest" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gray-900 border-gray-700">
              <h4 className="text-sm font-medium text-yellow-400 mb-3">Companion Stats</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Companions:</span>
                  <span className="text-white">{gameState.companions.length}/6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-white">{gameState.companions.filter(c => c.isActive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Level:</span>
                  <span className="text-white">
                    {gameState.companions.length > 0 
                      ? Math.round(gameState.companions.reduce((sum, c) => sum + c.level, 0) / gameState.companions.length)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Wealth:</span>
                  <span className="text-yellow-400">
                    {gameState.companions.reduce((sum, c) => sum + c.wealth, 0)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gray-900 border-gray-700">
              <h4 className="text-sm font-medium text-yellow-400 mb-3">Class Distribution</h4>
              <div className="space-y-2 text-xs">
                {["Warrior", "Archer", "Mage", "Squire"].map(className => {
                  const count = gameState.companions.filter(c => c.class === className).length;
                  return (
                    <div key={className} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getClassIcon(className)}
                        <span className="text-gray-400">{className}:</span>
                      </div>
                      <span className="text-white">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-gray-900 border-gray-700">
            <h4 className="text-sm font-medium text-yellow-400 mb-3">Recruitment Tips</h4>
            <div className="space-y-2 text-xs text-gray-300">
              <p>• Warriors excel in melee combat and have high health</p>
              <p>• Archers provide ranged support and mobility</p>
              <p>• Mages deal high damage but are fragile</p>
              <p>• Keep companion morale and loyalty high for better performance</p>
              <p>• Active companions can join quests and provide bonuses</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}