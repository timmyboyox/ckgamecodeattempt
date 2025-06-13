import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scroll, 
  Sword, 
  Package, 
  Shield, 
  MapPin, 
  Clock, 
  Crown,
  Star,
  Users,
  Target
} from "lucide-react";
import type { GameState, Quest, PlayerQuest } from "@shared/schema";

interface QuestSystemProps {
  gameState: GameState;
}

export default function QuestSystem({ gameState }: QuestSystemProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const queryClient = useQueryClient();

  const acceptQuestMutation = useMutation({
    mutationFn: async (questData: any) => {
      const response = await apiRequest("POST", "/api/player-quests", questData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${gameState.player.id}`] });
      setSelectedQuest(null);
    },
  });

  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case "kill": return <Sword className="w-4 h-4 text-red-400" />;
      case "deliver": return <Package className="w-4 h-4 text-blue-400" />;
      case "escort": return <Shield className="w-4 h-4 text-green-400" />;
      case "gather": return <Target className="w-4 h-4 text-yellow-400" />;
      case "explore": return <MapPin className="w-4 h-4 text-purple-400" />;
      default: return <Scroll className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400 border-green-400";
      case "medium": return "text-yellow-400 border-yellow-400";
      case "hard": return "text-orange-400 border-orange-400";
      case "legendary": return "text-red-400 border-red-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  const canAcceptQuest = (quest: Quest) => {
    return gameState.player.level >= quest.requiredLevel && 
           !gameState.activeQuests.some(aq => aq.questId === quest.id);
  };

  const handleAcceptQuest = (quest: Quest) => {
    const availableArmy = gameState.armies.find(army => 
      army.status === "idle" && army.totalStrength >= quest.requiredTroops
    );

    if (!availableArmy) {
      return; // Could show a toast about needing an available army
    }

    acceptQuestMutation.mutate({
      playerId: gameState.player.id,
      questId: quest.id,
      armyId: availableArmy.id,
    });
  };

  const getTimeRemaining = (endTime: Date | string | null) => {
    if (!endTime) return "Unknown";
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Completed";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scroll className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-yellow-400">Quests</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Active: {gameState.activeQuests.length}</span>
          <span>•</span>
          <span>Available: {gameState.availableQuests.length}</span>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="active" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
            Active Quests
          </TabsTrigger>
          <TabsTrigger value="available" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
            Available Quests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {gameState.activeQuests.length === 0 ? (
            <Card className="p-6 bg-gray-900 border-gray-700 text-center">
              <Scroll className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No active quests</p>
              <p className="text-xs text-gray-500 mt-1">Accept quests to begin your adventures</p>
            </Card>
          ) : (
            gameState.activeQuests.map((playerQuest) => {
              const quest = gameState.availableQuests.find(q => q.id === playerQuest.questId);
              if (!quest) return null;

              return (
                <Card key={playerQuest.id} className="p-4 bg-gray-900 border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getQuestTypeIcon(quest.questType)}
                      <h4 className="font-medium text-white">{quest.name}</h4>
                      <Badge variant="outline" className={getDifficultyColor(quest.difficulty)}>
                        {quest.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeRemaining(playerQuest.endTime)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{quest.description}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-300">{playerQuest.currentObjective + 1} / {(quest.objectives as any[]).length || 1}</span>
                    </div>
                    <Progress 
                      value={((playerQuest.currentObjective + 1) / ((quest.objectives as any[]).length || 1)) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-300">{quest.goldReward}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-blue-400" />
                        <span className="text-gray-300">{quest.experienceReward} XP</span>
                      </div>
                      {quest.honorReward > 0 && (
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3 text-purple-400" />
                          <span className="text-gray-300">{quest.honorReward} Honor</span>
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={playerQuest.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {playerQuest.status}
                    </Badge>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-3">
          {gameState.availableQuests.length === 0 ? (
            <Card className="p-6 bg-gray-900 border-gray-700 text-center">
              <Scroll className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No quests available</p>
              <p className="text-xs text-gray-500 mt-1">Check back later for new opportunities</p>
            </Card>
          ) : (
            gameState.availableQuests.map((quest) => (
              <Card 
                key={quest.id} 
                className={`p-4 cursor-pointer transition-all duration-200 
                  ${selectedQuest?.id === quest.id ? "bg-gray-800 border-yellow-400" : "bg-gray-900 border-gray-700"}
                  ${!canAcceptQuest(quest) ? "opacity-60" : "hover:bg-gray-800"}`}
                onClick={() => setSelectedQuest(selectedQuest?.id === quest.id ? null : quest)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getQuestTypeIcon(quest.questType)}
                    <h4 className="font-medium text-white">{quest.name}</h4>
                    <Badge variant="outline" className={getDifficultyColor(quest.difficulty)}>
                      {quest.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{quest.duration}h</span>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">{quest.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="text-gray-300">{quest.goldReward}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-300">{quest.experienceReward} XP</span>
                    </div>
                    {quest.honorReward > 0 && (
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-purple-400" />
                        <span className="text-gray-300">{quest.honorReward} Honor</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Level {quest.requiredLevel}+</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{quest.requiredTroops} troops</span>
                    </div>
                  </div>
                  <span className="text-gray-500">by {quest.questGiverName}</span>
                </div>

                {selectedQuest?.id === quest.id && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-xs">
                        {!canAcceptQuest(quest) && (
                          <p className="text-red-400">
                            {gameState.player.level < quest.requiredLevel 
                              ? `Requires level ${quest.requiredLevel}` 
                              : "Already accepted or no suitable army"}
                          </p>
                        )}
                        {quest.positionX && quest.positionY && (
                          <p className="text-gray-400">
                            Location: ({quest.positionX}, {quest.positionY})
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptQuest(quest)}
                        disabled={!canAcceptQuest(quest) || acceptQuestMutation.isPending}
                        className="bg-yellow-600 hover:bg-yellow-700 text-black"
                      >
                        {acceptQuestMutation.isPending ? "Accepting..." : "Accept Quest"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}