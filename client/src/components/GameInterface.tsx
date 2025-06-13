import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./Sidebar";
import OverviewTab from "./OverviewTab";
import TerritoriesTab from "./TerritoriesTab";
import ArmiesTab from "./ArmiesTab";
import CrusadesTab from "./CrusadesTab";
import EconomyTab from "./EconomyTab";
import DiplomacyTab from "./DiplomacyTab";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Clock, Shield, AlertTriangle } from "lucide-react";
import type { GameState } from "@shared/schema";

interface GameInterfaceProps {
  playerId: number;
}

export default function GameInterface({ playerId }: GameInterfaceProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gameState, isLoading, error } = useQuery<GameState>({
    queryKey: ['/api/game-state', playerId],
    queryFn: async () => {
      const response = await fetch(`/api/game-state/${playerId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Player not found, clear localStorage and redirect to login
          localStorage.removeItem("currentPlayer");
          window.location.href = "/login";
          throw new Error("Player not found - redirecting to login");
        }
        throw new Error(`Failed to fetch game state: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (player not found)
      if (error.message.includes("Player not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const endTurnMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/end-turn", { playerId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state', playerId] });
      toast({
        title: "Turn ended",
        description: `Net income: ${data.netIncome} gold`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to end turn",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medieval-dark flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-medieval-gold animate-pulse mb-4" />
          <p className="text-medieval-beige">Loading your realm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-medieval-dark flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <p className="text-medieval-beige">Failed to load game state</p>
          <p className="text-red-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!gameState || !gameState.player) {
    return (
      <div className="min-h-screen bg-medieval-dark flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <p className="text-medieval-beige">No game data found</p>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab gameState={gameState} onSwitchTab={setActiveTab} />;
      case "territories":
        return <TerritoriesTab gameState={gameState} />;
      case "armies":
        return <ArmiesTab gameState={gameState} />;
      case "crusades":
        return <CrusadesTab gameState={gameState} />;
      case "economy":
        return <EconomyTab gameState={gameState} />;
      case "diplomacy":
        return <DiplomacyTab gameState={gameState} />;
      default:
        return <OverviewTab gameState={gameState} onSwitchTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-medieval-dark">
      <Sidebar 
        gameState={gameState} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Status Bar */}
        <div className="bg-medieval-slate/50 border-b border-medieval-bronze/30 p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <div className="text-sm">
                <span className="text-medieval-beige opacity-75">Turn:</span>
                <span className="text-medieval-gold font-semibold ml-1">{gameState.player?.turnNumber || 1}</span>
              </div>
              <div className="text-sm">
                <span className="text-medieval-beige opacity-75">Honor:</span>
                <span className="text-medieval-gold font-semibold ml-1">{gameState.player?.honor || 0}</span>
              </div>
              <div className="text-sm">
                <span className="text-medieval-beige opacity-75">Level:</span>
                <span className="text-medieval-gold font-semibold ml-1">{gameState.player?.level || 1}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => endTurnMutation.mutate()}
                disabled={endTurnMutation.isPending}
                className="px-4 py-2 bg-medieval-crimson hover:bg-medieval-crimson/80 text-white font-ui text-sm"
              >
                {endTurnMutation.isPending ? (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "End Turn"
                )}
              </Button>
              <Button 
                variant="outline"
                className="px-4 py-2 bg-medieval-bronze hover:bg-medieval-bronze/80 text-white border-medieval-bronze font-ui text-sm"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}