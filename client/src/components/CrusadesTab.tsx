import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Swords, Clock, Target, Award } from "lucide-react";
import type { GameState } from "@shared/schema";

interface CrusadesTabProps {
  gameState: GameState;
}

export default function CrusadesTab({ gameState }: CrusadesTabProps) {
  const { crusades = [] } = gameState || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-yellow-600";
      case "completed": return "bg-green-600";
      case "failed": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const activeCrusades = crusades.filter(c => c.status === "active");
  const completedCrusades = crusades.filter(c => c.status === "completed");

  return (
    <div className="p-6 space-y-6 bg-medieval-dark min-h-full">
      <div className="flex justify-between items-center">
        <h1 className="font-medieval text-3xl text-medieval-gold">Crusades</h1>
        <div className="flex space-x-2">
          <Badge variant="outline" className="text-medieval-gold border-medieval-gold">
            {activeCrusades.length} active
          </Badge>
          <Button className="bg-medieval-crimson hover:bg-medieval-crimson/80">
            <Swords className="w-4 h-4 mr-2" />
            Launch New Crusade
          </Button>
        </div>
      </div>

      {/* Active Crusades */}
      {activeCrusades.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-medieval text-xl text-medieval-gold">Active Crusades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCrusades.map((crusade) => (
              <Card key={crusade.id} className="bg-medieval-slate border-medieval-bronze/30">
                <CardHeader>
                  <CardTitle className="text-medieval-gold flex items-center justify-between">
                    <div className="flex items-center">
                      <Swords className="w-5 h-5 mr-2" />
                      {crusade.name}
                    </div>
                    <Badge className={`${getStatusColor(crusade.status)} text-white capitalize`}>
                      {crusade.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-medieval-beige">
                    {crusade.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-medieval-beige">Progress</span>
                      <span className="text-white">{crusade.progress || 0}%</span>
                    </div>
                    <Progress value={crusade.progress || 0} className="w-full" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-medieval-gold" />
                      <span className="text-medieval-beige">Target:</span>
                      <span className="text-white">{crusade.targetLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-medieval-bronze" />
                      <span className="text-medieval-beige">Objective:</span>
                      <span className="text-white capitalize">{crusade.objective}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-medieval-gray" />
                      <span className="text-medieval-beige">Duration:</span>
                      <span className="text-white">{crusade.duration}h</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-medieval-bronze/30">
                    <Button size="sm" variant="outline" className="w-full border-medieval-bronze text-medieval-beige">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Crusades */}
      {completedCrusades.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-medieval text-xl text-medieval-gold">Completed Crusades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCrusades.slice(0, 6).map((crusade) => (
              <Card key={crusade.id} className="bg-medieval-slate/50 border-medieval-bronze/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-medieval-gold text-lg">
                    {crusade.name}
                  </CardTitle>
                  <Badge className={`${getStatusColor(crusade.status)} text-white w-fit`}>
                    {crusade.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-medieval-beige">Target:</span>
                      <span className="text-white">{crusade.targetLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-medieval-beige">Objective:</span>
                      <span className="text-white capitalize">{crusade.objective}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Crusades */}
      {crusades.length === 0 && (
        <div className="text-center py-12">
          <Swords className="w-16 h-16 mx-auto text-medieval-gold opacity-50 mb-4" />
          <h2 className="font-medieval text-2xl text-medieval-gold mb-2">No Crusades</h2>
          <p className="text-medieval-beige opacity-75 mb-4">You haven't launched any crusades yet.</p>
          <Button className="bg-medieval-crimson hover:bg-medieval-crimson/80">
            Launch Your First Crusade
          </Button>
        </div>
      )}
    </div>
  );
}