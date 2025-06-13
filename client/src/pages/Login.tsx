import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Sword } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const player = await response.json();
        localStorage.setItem("currentPlayer", JSON.stringify(player));
        setLocation("/");
      } else {
        const error = await response.text();
        toast({
          title: isLogin ? "Login failed" : "Registration failed",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-amber-50 border-amber-800 border-2 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Shield className="h-16 w-16 text-amber-800" />
                <Sword className="h-12 w-12 text-amber-600 absolute top-2 left-2" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-amber-900 font-serif">
              Crusader Knights Revival
            </CardTitle>
            <CardDescription className="text-amber-700 font-serif">
              {isLogin ? "Enter your realm" : "Join the crusade"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-amber-900 font-serif font-semibold">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white border-amber-600 focus:border-amber-800 font-serif"
                  placeholder="Enter your knight's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900 font-serif font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-amber-600 focus:border-amber-800 font-serif"
                  placeholder="Enter your secret"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-serif font-bold py-3 text-lg"
              >
                {loading ? "..." : (isLogin ? "Enter Realm" : "Join Crusade")}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-amber-700 hover:text-amber-900 font-serif underline"
              >
                {isLogin ? "Need to join the crusade?" : "Already have a realm?"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}