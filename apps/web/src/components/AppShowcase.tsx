import { useState } from 'react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppShowcase() {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "dashboard",
      webImage: '/screenshots/dashboard-web.png',
      mobileImage: '/screenshots/dashboard-mobile.png',
      titleFr: 'Tableau de Bord',
      titleEn: 'Dashboard',
      descFr: 'Une vue d\'ensemble de votre business en temps réel.',
      descEn: 'A real-time overview of your complete business.',
      features: [
        { fr: "Suivi des ventes en direct", en: "Live sales tracking" },
        { fr: "Métriques de croissance", en: "Growth metrics" },
        { fr: "Alertes de stock bas", en: "Low stock alerts" }
      ]
    },
    {
      id: "orders",
      webImage: '/screenshots/orders-web.png',
      mobileImage: '/screenshots/orders-mobile.png',
      titleFr: 'Gestion des Commandes',
      titleEn: 'Order Management',
      descFr: 'Gérez vos commandes de la réception à la livraison.',
      descEn: 'Manage orders from receipt to delivery.',
      features: [
        { fr: "Statuts de commande en temps réel", en: "Real-time order statuses" },
        { fr: "Détails clients", en: "Customer details" },
        { fr: "Historique complet", en: "Complete history" }
      ]
    },
    {
      id: "store",
      webImage: '/screenshots/store-web.png',
      mobileImage: '/screenshots/store-mobile.png',
      titleFr: 'Votre Boutique',
      titleEn: 'Your Store',
      descFr: 'Gérez votre catalogue de produits et services facilement.',
      descEn: 'Manage your product and service catalog easily.',
      features: [
        { fr: "Gestion de stock", en: "Inventory management" },
        { fr: "Personnalisation du thème", en: "Theme customization" },
        { fr: "Support multi-services", en: "Multi-service support" }
      ]
    },
    {
      id: "finance",
      webImage: '/screenshots/finance-web.png',
      mobileImage: '/screenshots/finance-mobile.png',
      titleFr: 'Finance & Wallet',
      titleEn: 'Finance & Wallet',
      descFr: 'Suivez vos revenus et gérez votre solde Bouteek Cash.',
      descEn: 'Track revenue and manage your Bouteek Cash balance.',
      features: [
        { fr: "Recharge via Wave/OM", en: "Top-up via Wave/OM" },
        { fr: "Retraits rapides", en: "Fast withdrawals" },
        { fr: "Historique des transactions", en: "Transaction history" }
      ]
    },
    {
      id: "referrals",
      webImage: '/screenshots/referrals-web.png',
      mobileImage: '/screenshots/referrals-mobile.png',
      titleFr: 'Parrainage',
      titleEn: 'Referrals',
      descFr: 'Invitez d\'autres marchands et gagnez des commissions à vie.',
      descEn: 'Invite merchants and earn lifetime commissions.',
      features: [
        { fr: "20% de commission à vie", en: "20% lifetime commission" },
        { fr: "Liens de partage uniques", en: "Unique sharing links" },
        { fr: "Suivi des affiliés", en: "Affiliate tracking" }
      ]
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="py-20 bg-zinc-50 overflow-hidden relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <Smartphone size={14} className="text-[#00FF41]" />
            <span>{language === "wo" ? "Mobile & Web" : language === "fr" ? "Mobile & Web" : "Mobile & Web"}</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-black tracking-tighter">
            {language === "wo" ? "Seetal sunu solution" : language === "fr" ? "Découvrez notre solution" : "Discover our solution"}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            {language === "wo" ? "Saytul sa njay ci sa poos wala ci sa ordinateur." : language === "fr" ? "Une expérience unifiée sur tous vos appareils." : "A unified experience across all your devices."}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">

          {/* Text Content */}
          <div className="order-2 lg:order-1 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-3xl font-black text-zinc-900 mb-2">
                    {language === 'fr' ? currentSlideData.titleFr : currentSlideData.titleEn}
                  </h3>
                  <p className="text-xl text-zinc-500 font-medium">
                    {language === 'fr' ? currentSlideData.descFr : currentSlideData.descEn}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentSlideData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41]">
                        <CheckCircle2 size={16} strokeWidth={3} />
                      </div>
                      <span className="font-bold text-zinc-700">
                        {language === 'fr' ? feature.fr : feature.en}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full border-2 border-zinc-200 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all duration-300"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-[#00FF41]' : 'w-2 bg-zinc-200'}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#00FF41] hover:text-black transition-all duration-300"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Screenshots Display */}
          <div className="order-1 lg:order-2 relative h-[500px] lg:h-[600px] flex items-center justify-center perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="relative w-full h-full flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >

                {/* Web Screenshot (Background) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-1/2 w-[90%] md:w-[70%] max-w-[600px] aspect-video bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden z-10">
                  <div className="h-6 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <img src={currentSlideData.webImage} alt={`${currentSlideData.titleEn} Web`} className="w-full h-full object-cover object-top" />
                </div>

                {/* Mobile Screenshot (Foreground) */}
                <div className="absolute top-1/2 left-1/2 translate-x-[20%] -translate-y-[40%] w-[30%] md:w-[25%] max-w-[200px] aspect-[9/19] bg-black rounded-[2rem] shadow-2xl border-[6px] border-black overflow-hidden z-20 ring-1 ring-white/20">
                  <div className="absolute top-0 w-full h-6 bg-black z-10 rounded-t-[1.5rem]" />
                  <img src={currentSlideData.mobileImage} alt={`${currentSlideData.titleEn} Mobile`} className="w-full h-full object-cover object-top" />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full" />
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
