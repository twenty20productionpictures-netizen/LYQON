import { Button } from "@/components/ui/button";
import { LiconLogo } from "@/components/LiconLogo";
import { useNavigate } from "react-router-dom";
import { Video, Users, Star, Zap, Brain, Target } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50 animate-fadeInDown">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <LiconLogo size="lg" />
          <Button variant="outline" onClick={() => navigate('/login')} className="hover-lift">
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float delay-300"></div>
        
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Headline */}
            <div className="space-y-4 animate-fadeInUp">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Find Your Role or
                <span className="block bg-gradient-ai bg-clip-text text-transparent">
                  Cast Your Vision
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                The Future of Production Starts Here. AI-powered casting that connects talent with opportunity.
              </p>
            </div>

            {/* Primary Action Area */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
              <div className="group relative h-full animate-fadeInUp delay-200">
                <div className="absolute inset-0 bg-gradient-ai rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-all duration-500"></div>
                <div className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-ai transition-all duration-300 hover:scale-105 hover:-translate-y-2 h-full flex flex-col">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">I am an Actor/Talent</h3>
                  <p className="text-muted-foreground mb-6 flex-1">Discover roles that match your skills with AI-powered precision</p>
                  <Button 
                    variant="hero" 
                    size="xl" 
                    className="w-full"
                    onClick={() => navigate('/login?type=talent')}
                  >
                    Join as Talent
                  </Button>
                </div>
              </div>

              <div className="group relative h-full animate-fadeInUp delay-300">
                <div className="absolute inset-0 bg-gradient-accent rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-all duration-500"></div>
                <div className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-accent transition-all duration-300 hover:scale-105 hover:-translate-y-2 h-full flex flex-col">
                  <Video className="h-12 w-12 text-accent mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">I am a Director/Casting Agent</h3>
                  <p className="text-muted-foreground mb-6 flex-1">Find the perfect talent with intelligent matching technology</p>
                  <Button 
                    variant="accent" 
                    size="xl" 
                    className="w-full"
                    onClick={() => navigate('/login?type=director')}
                  >
                    Start Casting
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Features Showcase */}
            <div className="mt-20 space-y-12">
              <h2 className="text-3xl font-bold text-foreground animate-fadeInUp delay-400">Powered by Advanced AI</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4 animate-fadeInUp delay-500 hover-lift">
                  <div className="w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mx-auto shadow-glow-ai hover-glow-ai transition-all duration-300">
                    <Brain className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Intelligent Matching</h3>
                  <p className="text-muted-foreground">AI analyzes skills, experience, and requirements to create perfect matches</p>
                </div>
                
                <div className="text-center space-y-4 animate-fadeInUp delay-600 hover-lift">
                  <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto shadow-glow-accent hover-glow-accent transition-all duration-300">
                    <Zap className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Virtual Audition Booth</h3>
                  <p className="text-muted-foreground">Record self-tapes with real-time AI coaching and performance metrics</p>
                </div>
                
                <div className="text-center space-y-4 animate-fadeInUp delay-700 hover-lift">
                  <div className="w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mx-auto shadow-glow-ai hover-glow-ai transition-all duration-300">
                    <Target className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Advanced Search</h3>
                  <p className="text-muted-foreground">Search by emotional range, specialized skills, and voice profiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <LiconLogo />
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="text-muted-foreground/50">© 2025 LYQON. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
