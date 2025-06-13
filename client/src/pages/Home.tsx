import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import CrusaderKnightsInterface from "@/components/CrusaderKnightsInterface";

export default function Home() {
  const [, setLocation] = useLocation();
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    const storedPlayer = localStorage.getItem("currentPlayer");
    if (!storedPlayer) {
      setLocation("/login");
      return;
    }

    try {
      const player = JSON.parse(storedPlayer);
      if (player?.id) {
        setPlayerId(player.id);
      } else {
        localStorage.removeItem("currentPlayer");
        setLocation("/login");
      }
    } catch (error) {
      console.error("Failed to parse player data:", error);
      localStorage.removeItem("currentPlayer");
      setLocation("/login");
    }
  }, [setLocation]);

  if (playerId === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <div className="text-center text-amber-100 font-serif">
          <p className="text-lg">Loading your realm...</p>
        </div>
      </div>
    );
  }

  return <CrusaderKnightsInterface playerId={playerId} />;
}