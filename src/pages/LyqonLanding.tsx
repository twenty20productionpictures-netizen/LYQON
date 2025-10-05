import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import "./LyqonLanding.css";

const LyqonLanding = () => {
  const navigate = useNavigate();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        if (!hasScrolled) {
          setHasScrolled(true);
          setTimeout(() => {
            setShowContent(true);
          }, 800);
        }
      } else {
        if (hasScrolled) {
          setHasScrolled(false);
          setShowContent(false);
        }
      }

      // Animate elements on scroll
      const elements = document.querySelectorAll('.fade-up, .section-title, .stat-card, .review-card, .company-badge');
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        
        if (isVisible && !animatedElements.has(element.className)) {
          element.classList.add('visible');
          setAnimatedElements(prev => new Set(prev).add(element.className));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolled, animatedElements]);

  const handleLoginClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };


  return (
    <div className={`lyqon-landing ${isTransitioning ? 'transitioning' : ''}`}>
      {/* Paint Flash Overlay */}
      {isTransitioning && (
        <div className="paint-flash-overlay" />
      )}

      {/* Navigation Bar */}
      <nav className={`lyqon-nav ${hasScrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className={`nav-links ${showContent ? 'visible' : ''}`}>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoginClick}
              className="login-btn"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-background" />
        
        <div className={`hero-center-logo ${hasScrolled ? 'scrolled' : ''}`}>
          <h1 className="center-logo-text">LYQON</h1>
        </div>

        <div className={`hero-content ${showContent ? 'visible' : ''}`}>
          <h2 className="hero-subtitle">The Future of Casting</h2>
          <Button 
            size="lg" 
            className="explore-btn"
            onClick={() => {
              document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore
            <ChevronDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Content Sections */}
      <div id="content" className="content-sections">
        {/* Stats Section */}
        <section className="content-section stats-section">
          <div className="section-grid">
            <div className="stat-card fade-up">
              <h3 className="stat-number">50K+</h3>
              <p className="stat-label">Active Talent</p>
            </div>
            <div className="stat-card fade-up delay-100">
              <h3 className="stat-number">10K+</h3>
              <p className="stat-label">Successful Castings</p>
            </div>
            <div className="stat-card fade-up delay-200">
              <h3 className="stat-number">95%</h3>
              <p className="stat-label">Satisfaction Rate</p>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="content-section reviews-section">
          <h2 className="section-title fade-up">What Our Users Say</h2>
          <div className="reviews-grid">
            <div className="review-card fade-up delay-100">
              <p className="review-text">"LYQON revolutionized our casting process. The AI matching is incredibly accurate."</p>
              <p className="review-author">— Sarah Johnson, Casting Director</p>
            </div>
            <div className="review-card fade-up delay-200">
              <p className="review-text">"Found my breakthrough role through LYQON. The platform is intuitive and powerful."</p>
              <p className="review-author">— Michael Chen, Actor</p>
            </div>
            <div className="review-card fade-up delay-300">
              <p className="review-text">"The virtual audition booth feature saved us weeks of in-person screenings."</p>
              <p className="review-author">— Emma Rodriguez, Director</p>
            </div>
          </div>
        </section>

        {/* Companies Section */}
        <section className="content-section companies-section">
          <h2 className="section-title fade-up">Trusted By Industry Leaders</h2>
          <div className="companies-grid fade-up delay-100">
            <div className="company-badge">Warner Bros</div>
            <div className="company-badge">Netflix</div>
            <div className="company-badge">Universal</div>
            <div className="company-badge">Paramount</div>
            <div className="company-badge">A24</div>
            <div className="company-badge">Focus Features</div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="content-section cta-section">
          <div className="cta-content fade-up">
            <h2 className="cta-title">Join the Future of Casting</h2>
            <p className="cta-subtitle">Start your journey with LYQON today</p>
            <div className="cta-buttons">
              <Button 
                size="xl" 
                variant="hero"
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => navigate('/login?type=talent'), 1500);
                }}
                className="cta-btn"
              >
                Join as Talent
              </Button>
              <Button 
                size="xl" 
                variant="accent"
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => navigate('/login?type=director'), 1500);
                }}
                className="cta-btn"
              >
                Start Casting
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LyqonLanding;
