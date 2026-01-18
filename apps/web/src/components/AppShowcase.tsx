import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const title = language === 'fr' ? currentSlideData.titleFr : currentSlideData.titleEn;
  const description = language === 'fr' ? currentSlideData.descFr : currentSlideData.descEn;

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'fr' ? 'Découvrez l\'Application' : 'Discover the App'}
          </h2>
          <p className="text-xl text-gray-400">
            {language === 'fr'
              ? 'Une plateforme complète pour gérer votre boutique'
              : 'A complete platform to manage your store'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
          {/* Mobile Screenshot */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="relative mx-auto max-w-sm">
              <img
                src={currentSlideData.image}
                alt={title}
                className="w-full h-auto rounded-3xl shadow-2xl border-4 border-[#00D632]"
              />
            </div>
          </div>

          {/* Feature Description */}
          <div className="flex-1 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{title}</h3>
            <p className="text-lg text-gray-300 mb-8">{description}</p>

            {/* Slide Counter */}
            <div className="mb-8">
              <div className="text-sm text-gray-400 mb-2">
                {currentSlide + 1} / {slides.length}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#00D632] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={prevSlide}
                className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#00D632] text-[#00D632] hover:bg-[#00D632] hover:text-black transition-all duration-200"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#00D632] text-black hover:bg-[#00B824] transition-all duration-200"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 flex-wrap">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-[#00D632] w-8' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
