import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sword, Crown, TreePine, Mountain, Waves, Clock, Coins, Pickaxe, Castle, Home, Building, Shield, Users, Gem } from "lucide-react";
import type { GameState } from "@shared/schema";
import { formatTimeRemaining } from "@/lib/gameUtils";

// Helper function to get terrain colors
const getTerrainColor = (terrain: string) => {
  switch (terrain) {
    case 'plains':
      return 'bg-green-600';
    case 'forest':
      return 'bg-green-800';
    case 'hills':
      return 'bg-yellow-700';
    case 'mountains':
      return 'bg-gray-600';
    case 'water':
      return 'bg-blue-600';
    case 'swamp':
      return 'bg-green-900';
    default:
      return 'bg-gray-500';
  }
};

interface WorldMapProps {
  gameState: GameState;
}

export default function WorldMap({ gameState }: WorldMapProps) {
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [hoverTimer, setHoverTimer] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const queryClient = useQueryClient();

  // Update current time every second for ETA calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const moveMutation = useMutation({
    mutationFn: async ({ x, y }: { x: number; y: number }) => {
      const response = await apiRequest("POST", `/api/players/${gameState.player.id}/move`, { x, y });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${gameState.player.id}`] });
      setSelectedTile(null);
    },
  });

  const getTerrainStyle = (terrain: string) => {
    switch (terrain) {
      case "plains": 
        return {
          background: "linear-gradient(45deg, #86efac 25%, #84cc16 25%, #84cc16 50%, #86efac 50%, #86efac 75%, #84cc16 75%)",
          backgroundSize: "8px 8px"
        };
      case "forest": 
        return {
          background: "linear-gradient(45deg, #166534 25%, #15803d 25%, #15803d 50%, #166534 50%, #166534 75%, #15803d 75%)",
          backgroundSize: "6px 6px"
        };
      case "mountains": 
        return {
          background: "linear-gradient(45deg, #d1d5db 25%, #9ca3af 25%, #9ca3af 50%, #d1d5db 50%, #d1d5db 75%, #9ca3af 75%)",
          backgroundSize: "10px 10px"
        };
      case "water": 
        return {
          background: "linear-gradient(45deg, #3b82f6 25%, #1d4ed8 25%, #1d4ed8 50%, #3b82f6 50%, #3b82f6 75%, #1d4ed8 75%)",
          backgroundSize: "4px 4px"
        };
      case "desert": 
        return {
          background: "linear-gradient(45deg, #fbbf24 25%, #f59e0b 25%, #f59e0b 50%, #fbbf24 50%, #fbbf24 75%, #f59e0b 75%)",
          backgroundSize: "12px 12px"
        };
      case "swamp": 
        return {
          background: "linear-gradient(45deg, #365314 25%, #4d7c0f 25%, #4d7c0f 50%, #365314 50%, #365314 75%, #4d7c0f 75%)",
          backgroundSize: "7px 7px"
        };
      case "hills":
        return {
          background: "linear-gradient(45deg, #92400e 25%, #b45309 25%, #b45309 50%, #92400e 50%, #92400e 75%, #b45309 75%)",
          backgroundSize: "9px 9px"
        };
      default: 
        return {
          background: "linear-gradient(45deg, #86efac 25%, #84cc16 25%, #84cc16 50%, #86efac 50%, #86efac 75%, #84cc16 75%)",
          backgroundSize: "8px 8px"
        };
    }
  };

  const getTerrainDifficulty = (terrain: string) => {
    switch (terrain) {
      case "plains": return 1;
      case "forest": return 2;
      case "hills": return 2;
      case "desert": return 2;
      case "swamp": return 3;
      case "mountains": return 4;
      case "water": return 5;
      default: return 1;
    }
  };

  const getResourceIcon = (tile: any) => {
    if (!tile.resources || typeof tile.resources !== 'object') return null;
    
    const resources = tile.resources as any;
    
    // Check for rare resources first
    if (resources.gems) return <Gem className="w-2 h-2 text-purple-400" />;
    if (resources.gold) return <Coins className="w-2 h-2 text-yellow-400" />;
    if (resources.iron) return <Pickaxe className="w-2 h-2 text-gray-400" />;
    if (resources.wood) return <TreePine className="w-2 h-2 text-amber-600" />;
    if (resources.stone) return <Mountain className="w-2 h-2 text-gray-500" />;
    
    return null;
  };

  const getBuildingIcon = (tile: any) => {
    if (!tile.buildings || typeof tile.buildings !== 'object') return null;
    
    const buildings = tile.buildings as any;
    
    if (buildings.castle) return <Castle className="w-5 h-5 text-red-500 drop-shadow-lg" />;
    if (buildings.city) return <Building className="w-4 h-4 text-blue-500 drop-shadow-lg" />;
    if (buildings.town) return <Home className="w-4 h-4 text-green-500 drop-shadow-lg" />;
    if (buildings.village) return <Home className="w-3 h-3 text-yellow-500 drop-shadow-lg" />;
    
    return null;
  };

  const getSettlementName = (tile: any) => {
    if (!tile.buildings || typeof tile.buildings !== 'object') return null;
    
    const buildings = tile.buildings as any;
    const settlementNames = [
      "Ironhold", "Goldbrook", "Stormwatch", "Greenhill", "Brightwater",
      "Redstone", "Oakenford", "Silverdale", "Blackwater", "Whitehaven"
    ];
    
    // Use tile position to generate consistent names
    const nameIndex = (tile.x + tile.y * 7) % settlementNames.length;
    const baseName = settlementNames[nameIndex];
    
    if (buildings.castle) return `${baseName} Castle`;
    if (buildings.city) return `${baseName} City`;
    if (buildings.town) return `${baseName} Town`;
    if (buildings.village) return `${baseName} Village`;
    
    return null;
  };

  const handleTileHover = (x: number, y: number) => {
    setHoveredTile({ x, y });
    if (hoverTimer) clearTimeout(hoverTimer);
    const timer = window.setTimeout(() => {
      // Show detailed tile info after 1 second
    }, 1000);
    setHoverTimer(timer);
  };

  const handleTileLeave = () => {
    setHoveredTile(null);
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  const handleTileClick = (x: number, y: number) => {
    if (x === gameState.player.positionX && y === gameState.player.positionY) {
      return; // Can't move to current position
    }
    setSelectedTile({ x, y });
  };

  const handleMove = () => {
    if (selectedTile) {
      moveMutation.mutate(selectedTile);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-yellow-400">World Map</h3>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">
            Position: ({gameState.player.positionX}, {gameState.player.positionY})
          </span>
        </div>
      </div>

      <Card className="p-4 bg-gray-900 border-gray-700">
        <div className="grid grid-cols-11 gap-0 max-w-4xl mx-auto border border-gray-600">
          {gameState.mapTiles.map((tile) => {
            const isPlayerPosition = tile.x === gameState.player.positionX && tile.y === gameState.player.positionY;
            const isSelected = selectedTile?.x === tile.x && selectedTile?.y === tile.y;
            const isHovered = hoveredTile?.x === tile.x && hoveredTile?.y === tile.y;
            const hasArmy = gameState.nearbyArmies.some(army => army.positionX === tile.x && army.positionY === tile.y);
            const terrainStyle = getTerrainStyle(tile.terrain);
            const difficulty = getTerrainDifficulty(tile.terrain);
            const resourceIcon = getResourceIcon(tile);
            const buildingIcon = getBuildingIcon(tile);

            return (
              <button
                key={`${tile.x}-${tile.y}`}
                onClick={() => handleTileClick(tile.x, tile.y)}
                onMouseEnter={() => handleTileHover(tile.x, tile.y)}
                onMouseLeave={handleTileLeave}
                className={`
                  relative w-16 h-16 transition-all duration-200 border-0
                  ${isSelected ? "ring-2 ring-yellow-400 z-10" : ""}
                  ${isHovered ? "z-20 brightness-110" : ""}
                  ${!tile.isExplored ? "opacity-50" : ""}
                `}
                style={terrainStyle}
                title={`${tile.terrain} (${tile.x}, ${tile.y}) - Difficulty: ${difficulty}`}
              >
                {/* Terrain difficulty indicator */}
                <div className="absolute top-0 left-0 w-2 h-2 flex">
                  {Array.from({ length: difficulty }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 h-1 bg-red-500 border border-red-800 opacity-70"
                    />
                  ))}
                </div>

                {/* Resource indicator */}
                {resourceIcon && (
                  <div className="absolute top-0 right-0 p-0.5 bg-black bg-opacity-40 rounded-bl">
                    {resourceIcon}
                  </div>
                )}

                {/* Buildings - Priority display */}
                {buildingIcon && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {buildingIcon}
                  </div>
                )}
                
                {/* Player position - Knight icon */}
                {isPlayerPosition && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-500 drop-shadow-lg" />
                  </div>
                )}
                
                {/* Army positions - Troop icons */}
                {hasArmy && !isPlayerPosition && (
                  <div className="absolute top-1 right-1">
                    <Users className="w-4 h-4 text-red-400 drop-shadow-lg" />
                  </div>
                )}

                {/* Quest givers */}
                {tile.hasQuestGiver && (
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-green-400 rounded-full"></div>
                )}

                {/* Hover information overlay */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs p-2 rounded shadow-lg border border-gray-600 z-30 whitespace-nowrap min-w-32">
                    {getSettlementName(tile) && (
                      <div className="font-bold text-blue-400 mb-1">{getSettlementName(tile)}</div>
                    )}
                    <div className="font-semibold capitalize">{tile.terrain}</div>
                    <div>Position: ({tile.x}, {tile.y})</div>
                    <div>Difficulty: {difficulty}/5</div>
                    {resourceIcon && tile.resources && (
                      <div className="text-yellow-400">
                        Resources: {Object.entries(tile.resources as any).map(([key, value]) => 
                          `${key}: ${value}`
                        ).join(", ")}
                      </div>
                    )}
                    {tile.hasQuestGiver && (
                      <div className="text-green-400">
                        Quest Giver Available
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Army Movement ETA Display */}
        {gameState.player.isMoving && gameState.player.moveEndTime && (
          <div className="mt-4 p-3 bg-blue-900 rounded border border-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">Moving to ({gameState.player.movingToX}, {gameState.player.movingToY})</span>
              </div>
              <div className="text-sm font-mono text-blue-400">
                ETA: {formatTimeRemaining(gameState.player.moveEndTime)}
              </div>
            </div>
          </div>
        )}

        {selectedTile && (
          <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  Selected: ({selectedTile.x}, {selectedTile.y})
                </p>
                <p className="text-xs text-gray-400">
                  Distance: {Math.abs(selectedTile.x - gameState.player.positionX) + Math.abs(selectedTile.y - gameState.player.positionY)} tiles
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTile(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleMove}
                  disabled={moveMutation.isPending || gameState.player.isMoving}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black"
                >
                  {moveMutation.isPending ? "Moving..." : gameState.player.isMoving ? "Already Moving" : "Move"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3 bg-gray-900 border-gray-700">
          <h4 className="text-sm font-medium text-yellow-400 mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">Your Position</span>
            </div>
            <div className="flex items-center space-x-2">
              <Castle className="w-3 h-3 text-red-500" />
              <span className="text-gray-300">Castle</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-3 h-3 text-blue-500" />
              <span className="text-gray-300">City</span>
            </div>
            <div className="flex items-center space-x-2">
              <Home className="w-3 h-3 text-green-500" />
              <span className="text-gray-300">Town/Village</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-red-400" />
              <span className="text-gray-300">Army</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Quest Giver</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gray-900 border-gray-700">
          <h4 className="text-sm font-medium text-yellow-400 mb-2">Nearby Armies</h4>
          <div className="space-y-1">
            {gameState.nearbyArmies.slice(0, 3).map((army) => (
              <div key={army.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate">{army.name}</span>
                <Badge variant="outline" className="text-xs">
                  {army.totalStrength}
                </Badge>
              </div>
            ))}
            {gameState.nearbyArmies.length === 0 && (
              <p className="text-xs text-gray-500">No armies nearby</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}