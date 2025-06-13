
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameState } from "@shared/schema";

export function useGameState(playerId: number) {
  const queryClient = useQueryClient();

  const {
    data: gameState,
    isLoading,
    error,
    refetch
  } = useQuery<GameState>({
    queryKey: ['game-state', playerId],
    queryFn: async () => {
      if (!playerId || isNaN(playerId)) {
        throw new Error("Invalid player ID");
      }

      console.log("Fetching game state for player:", playerId);
      
      const response = await fetch(`/api/game-state/${playerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Game state fetch failed:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: Failed to fetch game state`);
      }

      const data = await response.json();
      console.log("Game state fetched successfully");
      return data;
    },
    enabled: !!playerId && !isNaN(playerId),
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount} for game state fetch:`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const invalidateGameState = () => {
    queryClient.invalidateQueries({ queryKey: ['game-state', playerId] });
  };

  const updateGameState = (updates: Partial<GameState>) => {
    queryClient.setQueryData(['game-state', playerId], (oldData: GameState | undefined) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });
  };

  return {
    gameState,
    isLoading,
    error,
    refetch,
    invalidateGameState,
    updateGameState,
  };
}

export default useGameState;
