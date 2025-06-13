import { Shield, Castle, Swords, Crown, TrendingUp, Globe, Coins, Wheat, Hammer, Users } from "lucide-react";
import type { GameState } from "@shared/schema";

interface SidebarProps {
  gameState: GameState;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ gameState, activeTab, onTabChange }: SidebarProps) {
  const player = gameState?.player;

  const navItems = [
    { id: "overview", label: "Overview", icon: Crown },
    { id: "territories", label: "Territories", icon: Castle },
    { id: "armies", label: "Armies", icon: Shield },
    { id: "crusades", label: "Crusades", icon: Swords },
    { id: "economy", label: "Economy", icon: TrendingUp },
    { id: "diplomacy", label: "Diplomacy", icon: Globe },
  ];

  return (
    <div className="w-64 bg-medieval-slate border-r border-medieval-bronze/30 flex flex-col">
      {/* Player Info */}
      <div className="p-4 border-b border-medieval-bronze/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-medieval-crimson rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-medieval-gold" />
          </div>
          <div>
            <h3 className="font-medieval text-lg text-medieval-gold">
              {player?.name || "Unknown"}
            </h3>
            <p className="text-sm text-medieval-beige opacity-75">
              {player?.title || "Knight"}
            </p>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-medieval-beige/70">Honor:</span>
          <span className="text-medieval-gold ml-1 font-semibold">{player?.honor || 0}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded transition-colors ${
                activeTab === item.id
                  ? "bg-medieval-crimson text-white"
                  : "text-medieval-beige hover:bg-medieval-bronze/20"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-ui">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Resources Panel */}
      <div className="p-4 border-t border-medieval-bronze/30 mt-auto">
        <h4 className="font-medieval text-medieval-gold mb-3">Resources</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Coins className="w-4 h-4 text-medieval-gold mr-2" />
            <span>{player?.gold?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center">
            <Wheat className="w-4 h-4 text-medieval-bronze mr-2" />
            <span>{player?.food?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center">
            <Hammer className="w-4 h-4 text-medieval-gray mr-2" />
            <span>{player?.materials?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 text-medieval-beige mr-2" />
            <span>{player?.population?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}