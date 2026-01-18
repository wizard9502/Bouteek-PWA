import { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewsletterSignup() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage(language === "fr" ? "Veuillez entrer une adresse email valide" : "Please enter a valid email address");
      return;
    }

    setStatus("loading");

    try {
      // Simulate API call - in production, this would send to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store email in localStorage for demo purposes
      const subscribers = JSON.parse(localStorage.getItem("bouteek_subscribers") || "[]");
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem("bouteek_subscribers", JSON.stringify(subscribers));
      }

      setStatus("success");
      setMessage(language === "fr" ? "Merci de vous être inscrit!" : "Thank you for subscribing!");
      setEmail("");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(language === "fr" ? "Une erreur est survenue. Veuillez réessayer." : "An error occurred. Please try again.");
    }
  };

  const content = {
    fr: {
      title: "Restez informé",
      subtitle: "Recevez les dernières nouvelles et mises à jour de Bouteek directement dans votre boîte mail.",
      placeholder: "Votre adresse email",
      button: "S'inscrire"
    },
    en: {
      title: "Stay Updated",
      subtitle: "Get the latest news and updates from Bouteek delivered to your inbox.",
      placeholder: "Your email address",
      button: "Subscribe"
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <div className="bg-[#00D632] rounded-xl p-8 text-black">
      <h3 className="text-2xl font-bold mb-2">{currentContent.title}</h3>
      <p className="text-sm mb-6 opacity-90">{currentContent.subtitle}</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Mail size={18} className="absolute left-3 top-3 text-black opacity-50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={currentContent.placeholder}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              disabled={status === "loading"}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2 bg-black text-[#00D632] font-bold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "..." : currentContent.button}
          </button>
        </div>

        {status === "success" && (
          <div className="flex items-center gap-2 text-black text-sm">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-black text-sm">
            <AlertCircle size={18} />
            <span>{message}</span>
          </div>
        )}
      </form>
    </div>
  );
}
