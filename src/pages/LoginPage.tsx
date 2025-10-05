import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiconLogo } from "@/components/LiconLogo";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Loader2, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<'talent' | 'director'>('talent');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'talent' || type === 'director') {
      setUserType(type);
      setIsLogin(false); // If coming from landing page buttons, show signup
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, userType, fullName);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float delay-300"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/80 animate-fadeInDown">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <LiconLogo size="lg" />
          <Button variant="ghost" onClick={() => navigate('/')} className="hover-lift">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto animate-fadeInUp delay-200">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-elegant hover:shadow-glow-ai transition-all duration-500">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                {isLogin ? 'Welcome Back' : 'Join LYQON'}
              </CardTitle>
              <p className="text-muted-foreground">
                {isLogin 
                  ? 'Sign in to access your dashboard' 
                  : 'Create your account to get started'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-background/50 border-border text-foreground"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-background/50 border-border text-foreground transition-all duration-300 focus:shadow-ai"
                        required
                      />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-background/50 border-border text-foreground transition-all duration-300 focus:shadow-ai"
                        required
                        minLength={6}
                      />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label className="text-foreground">I am a...</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={userType === 'talent' ? 'default' : 'outline'}
                        onClick={() => setUserType('talent')}
                        className="transition-all duration-300 hover:scale-105"
                      >
                        Talent/Actor
                      </Button>
                      <Button
                        type="button"
                        variant={userType === 'director' ? 'accent' : 'outline'}
                        onClick={() => setUserType('director')}
                        className="transition-all duration-300 hover:scale-105"
                      >
                        Director/Agent
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>{isLogin ? 'Sign In' : 'Create Account'}</>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/talent')}
                  className="w-full hover-lift"
                >
                  Demo as Talent
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/director')}
                  className="w-full hover-lift"
                >
                  Demo as Director
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}