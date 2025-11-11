import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center space-y-6 animate-scale-in">
        <div className="relative">
          <div className="h-24 w-24 mx-auto rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
            <span className="text-5xl font-bold text-primary-foreground">L</span>
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent animate-fade-in">
          Lendly
        </h1>
        <div className="flex gap-2 justify-center">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
