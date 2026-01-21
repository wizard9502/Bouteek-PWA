import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AppStoreButtons() {
  const { language } = useLanguage();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  return (
    <>
      <div className="flex gap-4 pt-4 flex-wrap">
        {/* Apple App Store Button */}
        <button
          onClick={handleClick}
          className="hover:opacity-80 transition-opacity"
          title="Download on the App Store"
        >
          <img src="/app-store-badge.png" alt="Download on the App Store" className="h-14" />
        </button>

        {/* Google Play Store Button */}
        <button
          onClick={handleClick}
          className="hover:opacity-80 transition-opacity"
          title="Get it on Google Play"
        >
          <img src="/google-play-badge.png" alt="Get it on Google Play" className="h-14" />
        </button>
      </div>

      {/* Coming Soon Overlay */}
      {showComingSoon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 pointer-events-none">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <p className="text-2xl font-bold text-black mb-2">
              {language === "wo" ? "Mu ngi ñëw léegi" : language === "fr" ? "Bientôt disponible" : "Coming Soon"}
            </p>
            <p className="text-gray-600">
              {language === "wo"
                ? "App mobile bi mu ngi ñëw léegi"
                : language === "fr"
                  ? "L'application mobile sera bientôt disponible"
                  : "The mobile app will be available soon"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
