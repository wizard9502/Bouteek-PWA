import { useState } from 'react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AppShowcase() {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/app-screenshots/IMG_1733.PNG',
      titleFr: 'Tableau de Bord',
      titleEn: 'Dashboard',
      descFr: 'Visualisez vos ventes, revenus et performances en temps réel',
      descEn: 'View your sales, revenue and performance in real-time',
    },
    {
      image: '/app-screenshots/IMG_1738.PNG',
      titleFr: 'Analytique',
      titleEn: 'Analytics',
      descFr: 'Analysez vos métriques clés et tendances commerciales',
      descEn: 'Analyze your key metrics and business trends',
    },
    {
      image: '/app-screenshots/IMG_1737.PNG',
      titleFr: 'Abonnements',
      titleEn: 'Subscriptions',
      descFr: 'Gérez vos plans d\'abonnement et facturation',
      descEn: 'Manage your subscription plans and billing',
    },
    {
      image: '/app-screenshots/IMG_1735.PNG',
      titleFr: 'Finance',
      titleEn: 'Finance',
      descFr: 'Gérez votre Bouteek Cash et vos transactions',
      descEn: 'Manage your Bouteek Cash and transactions',
    },
    {
      image: '/app-screenshots/IMG_1736.PNG',
      titleFr: 'Parrainage',
      titleEn: 'Referral',
      descFr: 'Gagnez 20% de commissions à vie',
      descEn: 'Earn 20% commissions for life',
    },
    {
      image: '/app-screenshots/IMG_1734.PNG',
      titleFr: 'Commandes',
      titleEn: 'Orders',
      descFr: 'Gérez et suivez toutes vos commandes',
      descEn: 'Manage and track all your orders',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  const title = language === 'wo' ? currentSlideData.titleEn : language === 'fr' ? currentSlideData.titleFr : currentSlideData.titleEn;
  const description = language === 'wo' ? currentSlideData.descEn : language === 'fr' ? currentSlideData.descFr : currentSlideData.descEn;

  return (
    <section className="py-20 bg-[#f5f5f5] overflow-hidden">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Smartphone size={14} />
            <span>{language === "wo" ? "Mobile First" : language === "fr" ? "Mobile First" : "Mobile First"}</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-black mb-4 tracking-tighter">
            {language === "wo" ? "Seetal sunu solution" : language === "fr" ? "Découvrez notre solution" : "Discover our solution"}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            {language === "wo" ? "Saytul sa njay ci sa poos wala ci sa ordinateur." : language === "fr" ? "Gérez votre business depuis votre poche ou votre ordinateur." : "Manage your business from your pocket or your computer."}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={prevSlide}
            className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41] hover:text-black transition-all duration-200"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#00FF41] text-black hover:bg-[#00B824] transition-all duration-200"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 flex-wrap mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide ? 'bg-[#00FF41] w-8' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
