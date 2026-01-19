"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X, Check, Zap, Lock, Smartphone, Globe, TrendingUp, Instagram, Music } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


import { translations } from "@/lib/translations";
import NewsletterSignup from "@/components/NewsletterSignup";
import FAQ from "@/components/FAQ";
import MerchantMetrics from "@/components/MerchantMetrics";
import AppStoreButtons from "@/components/AppStoreButtons";
import AppShowcase from "@/components/AppShowcase";

import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

function HomeContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAppStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  const t_obj = translations[language];

  const pricingPlans = [
    {
      name: t_obj.pricing.starter,
      price: "2,000 XOF",
      description: t_obj.pricing.starterDesc,
      features: t_obj.pricing.features.starter,
      highlighted: false
    },
    {
      name: t_obj.pricing.launch,
      price: "5,000 XOF",
      description: t_obj.pricing.launchDesc,
      features: t_obj.pricing.features.launch,
      highlighted: true
    },
    {
      name: t_obj.pricing.growth,
      price: "12,500 XOF",
      description: t_obj.pricing.growthDesc,
      features: t_obj.pricing.features.growth,
      highlighted: false
    },
    {
      name: t_obj.pricing.pro,
      price: "20,000 XOF",
      description: t_obj.pricing.proDesc,
      features: t_obj.pricing.features.pro,
      highlighted: false
    }
  ];


  const features = [
    {
      icon: <Globe size={32} />,
      title: t_obj.features.feature1.title,
      description: t_obj.features.feature1.desc
    },
    {
      icon: <TrendingUp size={32} />,
      title: t_obj.features.feature2.title,
      description: t_obj.features.feature2.desc
    },
    {
      icon: <Zap size={32} />,
      title: t_obj.features.feature3.title,
      description: t_obj.features.feature3.desc
    },
    {
      icon: <Lock size={32} />,
      title: t_obj.features.feature4.title,
      description: t_obj.features.feature4.desc
    },
    {
      icon: <Check size={32} />,
      title: t_obj.features.feature5.title,
      description: t_obj.features.feature5.desc
    },
    {
      icon: <ArrowRight size={32} />,
      title: t_obj.features.feature6.title,
      description: t_obj.features.feature6.desc
    }
  ];

  const testimonials = [
    {
      name: t_obj.testimonials.name1,
      role: t_obj.testimonials.role1,
      quote: t_obj.testimonials.testimonial1
    },
    {
      name: t_obj.testimonials.name2,
      role: t_obj.testimonials.role2,
      quote: t_obj.testimonials.testimonial2
    },
    {
      name: t_obj.testimonials.name3,
      role: t_obj.testimonials.role3,
      quote: t_obj.testimonials.testimonial3
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Coming Soon Overlay */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center animate-in scale-in duration-300">
            <h3 className="text-2xl font-bold text-black mb-2">{t_obj.appStore.comingSoon}</h3>
            <p className="text-gray-600">{language === "fr" ? "Les applications mobiles seront bientôt disponibles." : "Mobile apps will be available soon."}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b" : "bg-transparent"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/bouteek-logo.jpg" alt="Bouteek" className="h-10 w-10 rounded-lg shadow-lg" />
            <span className="text-2xl font-black text-black tracking-tighter">Bouteek</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">{t_obj.nav.features}</a>
            <a href="#payments" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">{t_obj.nav.payments}</a>
            <a href="#pricing" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">{t_obj.nav.pricing}</a>

            <div className="flex items-center gap-4 ml-4">
              <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
                <button
                  onClick={() => setLanguage("fr")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${language === "fr" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${language === "en" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                  EN
                </button>
              </div>
              <a href="/auth" className="text-sm font-black text-black hover:text-[#00D632] transition-colors ml-4">
                {language === "fr" ? "Connexion" : "Log In"}
              </a>
              <Button className="h-11 px-8 rounded-full bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-black/90 shadow-xl transition-all" onClick={() => window.location.href = '/auth'}>
                {t_obj.nav.getStarted}
              </Button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 scale-90">
              <button
                onClick={() => setLanguage("fr")}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === "fr" ? "bg-white shadow-sm text-black" : "text-gray-400"}`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === "en" ? "bg-white shadow-sm text-black" : "text-gray-400"}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full shadow-lg"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-20 left-0 w-full bg-white border-b shadow-2xl p-8 space-y-8 flex flex-col items-center text-center"
            >
              <div className="flex flex-col gap-6 text-xl font-black">
                <a href="#features" onClick={() => setIsMenuOpen(false)}>{t_obj.nav.features}</a>
                <a href="#payments" onClick={() => setIsMenuOpen(false)}>{t_obj.nav.payments}</a>
                <a href="#pricing" onClick={() => setIsMenuOpen(false)}>{t_obj.nav.pricing}</a>
              </div>
              <div className="h-px w-full bg-gray-100" />
              <div className="flex flex-col gap-4 w-full">
                <Button className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-sm" onClick={() => window.location.href = '/auth'}>
                  {t_obj.nav.getStarted}
                </Button>
                <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm" onClick={() => window.location.href = '/auth'}>
                  {language === "fr" ? "Connexion" : "Log In"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>


      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-10">
          {/* Senegalese Flag Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#FDEF42_0%,_transparent_50%),_radial-gradient(circle_at_0%_0%,_#00853F_0%,_transparent_50%),_radial-gradient(circle_at_100%_0%,_#E31B23_0%,_transparent_50%)] blur-3xl opacity-40"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center max-w-5xl">
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div>
              <div className="flex flex-col items-center mb-8">
                <div className="inline-flex items-center gap-2 bg-black/5 text-black/60 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-black/5">
                  <span>Incubated by Ninety5 Ventures</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#00D632]/10 text-[#00D632] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-[#00D632]/20">
                  <Zap size={14} fill="currentColor" />
                  <span>{language === "fr" ? "Nouvelle Génération d'E-commerce" : "Next Gen E-commerce"}</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black mb-8 leading-[0.9] tracking-tighter">
                {t_obj.hero.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
                {t_obj.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                className="h-16 px-12 rounded-2xl bg-black text-white font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-3"
                onClick={() => window.location.href = '/auth'}
              >
                {t_obj.hero.cta1} <ArrowRight size={24} />
              </Button>
              <Button
                variant="outline"
                className="h-16 px-12 rounded-2xl border-black/10 bg-white/50 backdrop-blur font-black text-lg uppercase tracking-widest hover:bg-gray-50 transition-all"
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t_obj.hero.cta2}
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-10 pt-10 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00D632]/20 flex items-center justify-center text-[#00D632]"><Check size={20} /></div>
                <span className="text-sm font-black uppercase tracking-widest text-gray-500">{t_obj.hero.benefit1}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00D632]/20 flex items-center justify-center text-[#00D632]"><Check size={20} /></div>
                <span className="text-sm font-black uppercase tracking-widest text-gray-500">{t_obj.hero.benefit2}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00D632]/20 flex items-center justify-center text-[#00D632]"><Check size={20} /></div>
                <span className="text-sm font-black uppercase tracking-widest text-gray-500">{t_obj.hero.benefit3}</span>
              </div>
            </div>

            {/* App Store Icons */}
            <div className="pt-10">
              <AppStoreButtons />
            </div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black text-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">{t_obj.features.title}</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t_obj.features.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-[#1a1a1a] rounded-xl p-8 hover:bg-[#252525] transition-colors duration-300 border border-[#333]">
                <div className="text-[#00D632] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <AppShowcase />

      {/* Payment Partners Section */}
      <section id="payments" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">{t_obj.payments.title}</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {t_obj.payments.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-[#f5f5f5] rounded-xl p-8 border-l-4 border-[#00D632]">
                <div className="flex items-start gap-4">
                  <img src="/wave-logo.png" alt="Wave" className="h-16 w-16 rounded-lg flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">{t_obj.payments.wave}</h3>
                    <p className="text-gray-700">{t_obj.payments.waveDesc}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#f5f5f5] rounded-xl p-8 border-l-4 border-[#FF9500]">
                <div className="flex items-start gap-4">
                  <img src="/orange-money-logo.png" alt="Orange Money" className="h-16 w-16 rounded-lg flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">{t_obj.payments.orange}</h3>
                    <p className="text-gray-700">{t_obj.payments.orangeDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#00D632] to-[#00a825] rounded-2xl p-12 text-black">
              <h3 className="text-2xl font-bold mb-6">{t_obj.payments.flowTitle}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-black text-[#00D632] rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">1</div>
                  <p className="font-semibold text-sm">{t_obj.payments.flow1}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-black text-[#00D632] rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">2</div>
                  <p className="font-semibold text-sm">{t_obj.payments.flow2}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-black text-[#00D632] rounded-full w-10 h-10 flex items-center justify-center font-bold">3</div>
                  <p className="font-semibold">{t_obj.payments.flow3}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-black text-[#00D632] rounded-full w-10 h-10 flex items-center justify-center font-bold">4</div>
                  <p className="font-semibold">{t_obj.payments.flow4}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">{t_obj.testimonials.title}</h2>
            <p className="text-xl text-gray-700">{t_obj.testimonials.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#00D632] rounded-full flex items-center justify-center text-white font-bold text-lg">{testimonial.name.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-black">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">{t_obj.pricing.title}</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {t_obj.pricing.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div key={idx} className={`rounded-xl p-8 transition-all ${plan.highlighted ? "bg-[#00D632] text-black scale-105 shadow-2xl" : "bg-[#f5f5f5] text-black border-2 border-gray-200"}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-black/80" : "text-gray-600"}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm ml-2">{t_obj.pricing.perMonth}</span>
                </div>
                <button
                  className={`w-full font-black py-4 rounded-2xl mb-6 transition-all uppercase tracking-widest text-xs shadow-lg hover:scale-105 active:scale-95 ${plan.highlighted ? "bg-black text-[#00D632]" : "bg-black text-white text-white"}`}
                  onClick={() => window.location.href = '/auth'}
                >
                  {t_obj.pricing.getStartedBtn}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <Check size={20} className={plan.highlighted ? "text-black" : "text-[#00D632]"} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>      {/* Merchant Metrics */}
      <MerchantMetrics />

      {/* CTA Section */}
      <section className="py-20 bg-[#00D632] text-black">       <div className="container text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">{t_obj.cta.title}</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {t_obj.cta.subtitle}
        </p>
        <button
          className="h-16 px-12 rounded-2xl bg-black text-[#00D632] font-black text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-2 mx-auto"
          onClick={() => window.location.href = '/auth'}
        >
          {t_obj.cta.button} <ArrowRight size={24} />
        </button>

        <p className="text-gray-400 mt-4">{t_obj.cta.note}</p>
      </div>
      </section>

      {/* Referral Section */}
      <section className="py-20 bg-black border-t border-b border-[#00D632]/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Content */}
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {t_obj.referral.title}
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  {t_obj.referral.subtitle}
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00D632] flex items-center justify-center flex-shrink-0 mt-1">
                      <Check size={16} className="text-black" />
                    </div>
                    <span className="text-gray-300">{t_obj.referral.benefit1}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00D632] flex items-center justify-center flex-shrink-0 mt-1">
                      <Check size={16} className="text-black" />
                    </div>
                    <span className="text-gray-300">{t_obj.referral.benefit2}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00D632] flex items-center justify-center flex-shrink-0 mt-1">
                      <Check size={16} className="text-black" />
                    </div>
                    <span className="text-gray-300">{t_obj.referral.benefit3}</span>
                  </div>
                </div>
                <button
                  className="h-16 px-12 rounded-2xl bg-[#00D632] text-black font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                  onClick={() => window.location.href = '/auth'}
                >
                  {t_obj.referral.cta}
                  <ArrowRight size={20} />
                </button>

              </div>

              {/* Right side - Visual */}
              <div className="bg-gradient-to-br from-[#00D632]/30 to-[#00D632]/10 rounded-2xl p-8 border border-[#00D632]/50 shadow-lg shadow-[#00D632]/20">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#00D632] mb-2">20%</div>
                    <div className="text-gray-300">{language === "fr" ? "Commission" : "Commission"}</div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#00D632] to-transparent"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">∞</div>
                    <div className="text-gray-300">{language === "fr" ? "À vie" : "For Life"}</div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#00D632] to-transparent"></div>
                  <p className="text-center text-gray-400 text-sm">
                    {t_obj.referral.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Newsletter Signup Section */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="container max-w-2xl">
          <NewsletterSignup />
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img src="/founder.jpg" alt="Mohamed Sow" className="w-24 h-24 rounded-full mx-auto object-cover mb-4 shadow-xl" onError={(e) => {
              // Fallback if image missing
              e.currentTarget.src = "https://ui-avatars.com/api/?name=Mohamed+Sow&background=000&color=fff";
            }} />
            <h3 className="text-2xl font-bold text-black">Mohamed Sow</h3>
            <p className="text-[#00D632] font-black uppercase tracking-widest text-xs">Founder & CEO</p>
          </div>
          <p className="text-xl text-gray-700 italic leading-relaxed">
            "{language === "fr"
              ? "Notre mission est de donner aux entrepreneurs africains les outils de classe mondiale qu'ils méritent. Bouteek n'est pas juste une application, c'est votre partenaire de croissance."
              : "Our mission is to empower African entrepreneurs with the world-class tools they deserve. Bouteek is not just an app, it's your growth partner."}"
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-gray-400 py-16 border-t border-gray-800">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">            <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/bouteek-logo.jpg" alt="Bouteek" className="h-8 w-8 rounded" />
              <span className="font-bold text-white">Bouteek</span>
            </div>
            <p className="text-sm">{t_obj.footer.tagline}</p>
          </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t_obj.footer.product}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#00D632] transition-colors">{t_obj.nav.features}</a></li>
                <li><a href="#" className="hover:text-[#00D632] transition-colors">{t_obj.nav.pricing}</a></li>
                <li><a href="#" className="hover:text-[#00D632] transition-colors">{language === "fr" ? "Sécurité" : "Security"}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t_obj.footer.company}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#00D632] transition-colors">{t_obj.footer.about}</a></li>
                <li><a href="#" className="hover:text-[#00D632] transition-colors">{t_obj.footer.blog}</a></li>
                <li><a href="#" className="hover:text-[#00D632] transition-colors">{t_obj.footer.contact}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t_obj.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/security" className="hover:text-[#00D632] transition-colors">{language === "fr" ? "Sécurité" : "Security"}</a></li>
                <li><a href="/privacy" className="hover:text-[#00D632] transition-colors">{t_obj.footer.privacy}</a></li>
                <li><a href="/terms" className="hover:text-[#00D632] transition-colors">{t_obj.footer.terms}</a></li>
                <li><a href="/cookies" className="hover:text-[#00D632] transition-colors">{t_obj.footer.cookies}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; 2025 Bouteek. {t_obj.footer.copyright}</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://instagram.com/bouteek.shop" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" title="Instagram">
                <Instagram size={24} className="text-gray-400 hover:text-[#00D632]" />
              </a>
              <a href="https://snapchat.com/add/bouteek.shop" target="_blank" rel="noopener noreferrer" className="hover:text-[#00D632] transition-colors text-gray-400 font-bold text-sm" title="Snapchat">
                Snapchat
              </a>
              <a href="https://tiktok.com/@bouteek.shop" target="_blank" rel="noopener noreferrer" className="hover:text-[#00D632] transition-colors text-gray-400 font-bold text-sm" title="TikTok">
                TikTok
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
