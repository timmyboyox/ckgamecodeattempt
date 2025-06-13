import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Sword, Crown, Castle, Users, Scroll, Coins, Heart, Star, Map, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { GameState } from "@shared/schema";

interface CrusaderKnightsInterfaceProps {
  playerId: number;
}

export default function CrusaderKnightsInterface({ playerId }: CrusaderKnightsInterfaceProps) {
  const [activeTab, setActiveTab] = useState("character");
  const queryClient = useQueryClient();

  const { data: gameState, isLoading } = useQuery<GameState>({
    queryKey: [`/api/game-state/${playerId}`],
    enabled: !!playerId,
  });

  const recruitArmyMutation = useMutation({
    mutationFn: async (data: { armyType: string; cost: number }) => {
      const res = await apiRequest("POST", "/api/recruit-army", {
        playerId,
        ...data
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${playerId}`] });
    }
  });

  const hireCompanionMutation = useMutation({
    mutationFn: async (data: { companionType: string; cost: number }) => {
      const res = await apiRequest("POST", "/api/hire-companion", {
        playerId,
        ...data
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${playerId}`] });
    }
  });

  const handleRecruitArmy = (armyType: string, cost: number) => {
    if (gameState && gameState.player.gold >= cost) {
      recruitArmyMutation.mutate({ armyType, cost });
    }
  };

  const handleHireCompanion = (companionType: string, cost: number) => {
    if (gameState && gameState.player.gold >= cost) {
      hireCompanionMutation.mutate({ companionType, cost });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel">
          <div className="text-center">
            <Castle className="w-12 h-12 text-amber-700 mx-auto mb-4 animate-pulse" />
            <p className="text-lg">Loading your realm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel">
          <div className="text-center">
            <p className="text-lg">Failed to load game state</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "character", label: "Character", icon: Shield },
    { id: "inventory", label: "Inventory", icon: Scroll },
    { id: "map", label: "World Map", icon: Map },
    { id: "quests", label: "Quests", icon: Crown },
    { id: "companions", label: "Companions", icon: Users },
    { id: "guild", label: "Guild", icon: Castle },
    { id: "tavern", label: "Tavern", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen">
      {/* Medieval Header Banner */}
      <header className="header-banner">
        <h1 className="site-title">Crusader Knights Revival</h1>
      </header>

      {/* Resource Bar */}
      <div className="resource-bar-container">
        <div>Gold: <strong>{gameState.player.gold}</strong></div>
        <div>Food: <strong>{gameState.player.food}</strong></div>
        <div>Materials: <strong>{gameState.player.materials}</strong></div>
        <div>Population: <strong>{gameState.player.population}</strong></div>
      </div>

      <div className="main-wrapper">
        <main className="main-content">
          {/* Navigation Panel */}
          <div className="panel nav-container clearfix">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-4 h-4 inline-block mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="panel">
            {activeTab === "character" && (
              <div>
                <h2>Character Details</h2>
                <table className="medieval-table w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Attribute</th>
                      <th className="text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Name:</td>
                      <td>{gameState.player.name}</td>
                    </tr>
                    <tr>
                      <td>House:</td>
                      <td>{gameState.player.username}</td>
                    </tr>
                    <tr>
                      <td>Position:</td>
                      <td>({gameState.player.positionX}, {gameState.player.positionY})</td>
                    </tr>
                    <tr>
                      <td>Level:</td>
                      <td>{gameState.player.level}</td>
                    </tr>
                    <tr>
                      <td>Experience:</td>
                      <td>{gameState.player.experience}</td>
                    </tr>
                    <tr>
                      <td>Health:</td>
                      <td>{gameState.player.health}/{gameState.player.maxHealth}</td>
                    </tr>
                    <tr>
                      <td>Honor:</td>
                      <td>{gameState.player.honor}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "inventory" && (
              <div>
                <h2>Inventory</h2>
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div key={i} className="inventory-slot">
                      {gameState.inventory[i] && (
                        <div className="text-xs text-center">
                          {gameState.inventory[i].item.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "map" && (
              <div>
                <h2>World Map</h2>
                <div className="medieval-card p-4">
                  <div className="grid grid-cols-10 gap-1 mb-4" style={{ aspectRatio: '4/3' }}>
                    {Array.from({ length: 80 }, (_, i) => {
                      const x = i % 10;
                      const y = Math.floor(i / 10);
                      const isPlayerLocation = x === gameState.player.positionX && y === gameState.player.positionY;
                      const terrain = Math.random() > 0.7 ? 'mountain' : Math.random() > 0.5 ? 'forest' : 'plains';
                      
                      return (
                        <div
                          key={i}
                          className={`
                            w-8 h-8 border border-amber-700 text-xs flex items-center justify-center cursor-pointer
                            ${terrain === 'mountain' ? 'bg-gray-600' : terrain === 'forest' ? 'bg-green-800' : 'bg-yellow-800'}
                            ${isPlayerLocation ? 'ring-2 ring-red-500' : ''}
                          `}
                          title={`(${x}, ${y}) ${terrain}`}
                        >
                          {isPlayerLocation && <Crown className="w-3 h-3 text-red-500" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-800 mr-2"></div>
                      <span>Plains</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-800 mr-2"></div>
                      <span>Forest</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-600 mr-2"></div>
                      <span>Mountains</span>
                    </div>
                    <div className="flex items-center">
                      <Crown className="w-4 h-4 text-red-500 mr-2" />
                      <span>Your Position</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "companions" && (
              <div>
                <h2>Companions</h2>
                <div className="space-y-2">
                  {gameState.companions.map((companion, index) => (
                    <div key={index} className="medieval-card p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{companion.name}</span>
                        <span className="text-sm">Lv.{companion.level}</span>
                      </div>
                      <div className="text-sm">{companion.class}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "quests" && (
              <div>
                <h2>Available Quests</h2>
                <div className="space-y-4">
                  <div className="medieval-card p-4">
                    <h3 className="font-bold text-amber-300">Defend the Border</h3>
                    <p className="text-sm mb-2">Protect merchant caravans from bandits.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gold">Reward: 100 Gold</span>
                      <button className="nav-btn">Accept Quest</button>
                    </div>
                  </div>
                  <div className="medieval-card p-4">
                    <h3 className="font-bold text-amber-300">Reclaim Lost Territory</h3>
                    <p className="text-sm mb-2">Drive out enemy forces from ancient lands.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gold">Reward: 200 Gold, Honor +5</span>
                      <button className="nav-btn">Accept Quest</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "guild" && (
              <div>
                <h2>Guild Hall</h2>
                <div className="space-y-4">
                  <div className="medieval-card p-4">
                    <h3 className="font-bold text-amber-300">Hire Companions</h3>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="w-16 h-20 bg-gray-500 rounded mx-auto mb-2"></div>
                        <p className="text-sm">Squire</p>
                        <p className="text-gold text-xs">50 Gold</p>
                        <button 
                          className="nav-btn text-xs mt-2"
                          onClick={() => handleHireCompanion("squire", 50)}
                          disabled={!gameState || gameState.player.gold < 50 || hireCompanionMutation.isPending}
                        >
                          {hireCompanionMutation.isPending ? "Hiring..." : "Hire"}
                        </button>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-20 bg-gray-600 rounded mx-auto mb-2"></div>
                        <p className="text-sm">Knight</p>
                        <p className="text-gold text-xs">150 Gold</p>
                        <button 
                          className="nav-btn text-xs mt-2"
                          onClick={() => handleHireCompanion("knight", 150)}
                          disabled={!gameState || gameState.player.gold < 150 || hireCompanionMutation.isPending}
                        >
                          {hireCompanionMutation.isPending ? "Hiring..." : "Hire"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tavern" && (
              <div>
                <h2>The King's Tavern</h2>
                <div className="space-y-4">
                  <div className="medieval-card p-4">
                    <h3 className="font-bold text-amber-300">Player Messages</h3>
                    <div className="space-y-2 mt-3">
                      <div className="p-2 bg-brown-900 rounded">
                        <p className="text-sm"><strong>Lord Blackwood:</strong> Seeking alliance against northern raiders</p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                      <div className="p-2 bg-brown-900 rounded">
                        <p className="text-sm"><strong>Lady Ashford:</strong> Trading silk for iron, fair prices</p>
                        <p className="text-xs text-gray-400">5 hours ago</p>
                      </div>
                    </div>
                    <input className="chat-input mt-3" placeholder="Send message to all players..." />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="chat-panel" id="chat"></div>
          <input className="chat-input" placeholder="Global Chat…" />
        </main>

        <aside className="sidebar">
          <h3>Player Info</h3>
          <div className="character-portrait w-24 h-32 mx-auto mb-4">
            <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-600 rounded flex items-center justify-center">
              <Shield className="w-12 h-12 text-gray-700" />
            </div>
          </div>
          <p>Name: <strong>{gameState.player.name}</strong></p>
          <p>Level: <strong>{gameState.player.level}</strong></p>
          <p>Title: <strong>{gameState.player.title}</strong></p>
          
          <h4 className="mt-4 mb-2">Reputation:</h4>
          <ul className="space-y-1">
            <li>Honor: <span className="font-bold text-amber-300">{gameState.player.honor}</span></li>
            <li>Turn: <span className="font-bold text-blue-300">{gameState.player.turnNumber}</span></li>
          </ul>

          <h4 className="mt-4 mb-2">Military Forces</h4>
          <div className="space-y-2">
            <div className="text-sm p-2 medieval-card">
              <div className="flex justify-between">
                <span>Armies:</span>
                <span className="font-bold text-red-400">{gameState.armies.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Territories:</span>
                <span className="font-bold text-green-400">{gameState.territories.length}</span>
              </div>
            </div>
          </div>

          <h4 className="mt-4 mb-2">Companions ({gameState.companions.length})</h4>
          <div className="space-y-2">
            {gameState.companions.slice(0, 3).map((companion, index) => (
              <div key={index} className="text-sm p-2 medieval-card">
                <div className="font-bold text-amber-200">{companion.name}</div>
                <div className="text-amber-400">{companion.class} Lv.{companion.level}</div>
                <div className="text-xs text-gray-400">
                  Health: {companion.health}/{companion.maxHealth}
                </div>
              </div>
            ))}
          </div>

          <h4 className="mt-4 mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button 
              className="nav-btn w-full text-sm"
              onClick={() => handleRecruitArmy("footman", 100)}
              disabled={!gameState || gameState.player.gold < 100 || recruitArmyMutation.isPending}
            >
              <Sword className="w-3 h-3 inline mr-2" />
              {recruitArmyMutation.isPending ? "Recruiting..." : "Recruit Army (100g)"}
            </button>
            <button 
              className="nav-btn w-full text-sm"
              onClick={() => setActiveTab("map")}
            >
              <Castle className="w-3 h-3 inline mr-2" />
              View Map
            </button>
            <button 
              className="nav-btn w-full text-sm"
              onClick={() => setActiveTab("tavern")}
            >
              <MessageSquare className="w-3 h-3 inline mr-2" />
              Send Message
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}