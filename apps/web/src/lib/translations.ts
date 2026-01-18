export type Language = 'en' | 'fr';

export const translations = {
  fr: {
    dashboard: {
      title: "Tableau de Bord",
      hello_merchant: "Bonjour, Marchand 👋",
      subtitle: "Voici ce qui se passe dans votre boutique aujourd'hui.",
      search_placeholder: "Rechercher commandes, produits...",
      quick_operations: "Opérations Rapides",
      revenue_card: {
        total_revenue: "Revenu Total",
        withdraw: "Retirer Fonds",
        balance: "Solde"
      },
      stats: {
        today: "Aujourd'hui",
        week: "Cette Semaine",
        month: "Ce Mois"
      }
    },
    sidebar: {
      dashboard: "Tableau de Bord",
      store: "Boutique",
      orders: "Commandes",
      finance: "Finance",
      profile: "Profil",
      logout: "Déconnexion",
      storage: "Stockage"
    },
    orders: {
      title: "Gestion Commandes",
      subtitle: "Suivez et gérez vos commandes clients.",
      tabs: {
        all: "Toutes",
        pending: "En Attente",
        paid: "Payées",
        completed: "Terminées"
      }
    },
    store: {
      title: "Gestion Boutique",
      subtitle: "Gérez vos produits et votre inventaire.",
      add_product: "Ajouter Produit",
      inventory: "Inventaire",
      growth_tools: "Outils de Croissance"
    },
    finance: {
      title: "Finance & Abonnements",
      available_balance: "Solde Disponible",
      top_up: "Recharger",
      withdraw: "Retirer",
      transactions: "Transactions Récentes",
      plans: "Abonnements",
      current_plan: "Plan Actuel"
    },
    nav: {
      features: "Fonctionnalités",
      payments: "Paiements",
      pricing: "Tarifs",
      getStarted: "Commencer"
    },
    hero: {
      title: "Vendez plus avec Bouteek",
      subtitle: "La plateforme tout-en-un pour gérer votre commerce en ligne et hors ligne. Paiements mobiles intégrés (Wave, Orange Money) et gestion simplifiée.",
      cta1: "Créer ma boutique",
      cta2: "Voir démo",
      benefit1: "Configuration en 2 minutes",
      benefit2: "Paiements Wave & OM",
      benefit3: "0 frais cachés"
    },
    features: {
      title: "Tout ce dont vous avez besoin",
      subtitle: "Des outils puissants pour gérer votre activité de A à Z.",
      feature1: { title: "Site E-commerce", desc: "Votre propre site web professionnel généré automatiquement." },
      feature2: { title: "Analytique", desc: "Suivez vos ventes et clients en temps réel." },
      feature3: { title: "Rapide", desc: "Optimisé pour la vitesse et le mobile." },
      feature4: { title: "Sécurisé", desc: "Vos données et paiements sont protégés." },
      feature5: { title: "Facile", desc: "Aucune compétence technique requise." },
      feature6: { title: "Support 24/7", desc: "Une équipe dédiée pour vous aider." }
    },
    testimonials: {
      title: "Ils nous font confiance",
      subtitle: "Découvrez ce que les marchands disent de nous.",
      name1: "Fatou Diop",
      role1: "Vendeuse de Mode",
      testimonial1: "Bouteek a transformé mon business. Je peux accepter Wave directement !",
      name2: "Amadou Sow",
      role2: "Restaurateur",
      testimonial2: "La gestion des commandes est super simple. Je recommande.",
      name3: "Aissa Thiam",
      role3: "Cosmétique Bio",
      testimonial3: "Mes clientes adorent mon nouveau site. Merci Bouteek !"
    },
    pricing: {
      title: "Des tarifs transparents",
      subtitle: "Choisissez le plan qui correspond à votre croissance.",
      starter: "Démarrage",
      starterDesc: "Pour commencer tranquillement.",
      launch: "Lancement",
      launchDesc: "Pour les boutiques en croissance.",
      growth: "Croissance",
      growthDesc: "Pour les business établis.",
      pro: "Pro",
      proDesc: "Pour les grands volumes.",
      perMonth: "/mois",
      getStartedBtn: "Choisir ce plan",
      features: {
        starter: ["Jusqu'à 10 produits", "Site web basique", "Paiements mobiles"],
        launch: ["Jusqu'à 50 produits", "Personnalisation avancée", "Analytique basique", "Support email"],
        growth: ["Produits illimités", "Nom de domaine offert", "Analytique avancée", "Support prioritaire"],
        pro: ["Tout illimité", "API access", "Gestionnaire dédié", "Support 24/7"]
      }
    },
    payments: {
      title: "Paiements Simplifiés",
      subtitle: "Acceptez tous les paiements locaux sans friction.",
      wave: "Wave",
      waveDesc: "Intégration native pour des paiements instantanés.",
      orange: "Orange Money",
      orangeDesc: "Acceptez OM facilement sur votre boutique.",
      flowTitle: "Comment ça marche ?",
      flow1: "Le client commande",
      flow2: "Il choisit Wave ou OM",
      flow3: "Vous recevez les fonds",
      flow4: "Vous livrez le produit"
    },
    cta: {
      title: "Prêt à vous lancer ?",
      subtitle: "Rejoignez des milliers de marchands qui vendent mieux avec Bouteek.",
      button: "Créer mon compte gratuit",
      note: "Pas de carte bancaire requise"
    },
    referral: {
      title: "Programme de Parrainage",
      subtitle: "Gagnez de l'argent en invitant d'autres marchands.",
      benefit1: "Commissions récurrentes",
      benefit2: "Paiements mensuels",
      benefit3: "Tableau de bord dédié",
      cta: "Devenir Partenaire",
      description: "Invitez des marchands et gagnez 20% de leur abonnement à vie."
    },
    appStore: {
      comingSoon: "Bientôt disponible"
    },
    footer: {
      tagline: "La solution commerce pour l'Afrique.",
      product: "Produit",
      company: "Entreprise",
      legal: "Légal",
      about: "À propos",
      blog: "Blog",
      contact: "Contact",
      privacy: "Confidentialité",
      terms: "Conditions",
      cookies: "Cookies",
      copyright: "Tous droits réservés."
    }
  },
  en: {
    dashboard: {
      title: "Dashboard",
      hello_merchant: "Hello, Merchant 👋",
      subtitle: "Here's what's happening with your store today.",
      search_placeholder: "Search orders, products...",
      quick_operations: "Quick Operations",
      revenue_card: {
        total_revenue: "Total Revenue",
        withdraw: "Withdraw Funds",
        balance: "Balance"
      },
      stats: {
        today: "Today",
        week: "This Week",
        month: "This Month"
      }
    },
    sidebar: {
      dashboard: "Dashboard",
      store: "Store",
      orders: "Orders",
      finance: "Finance",
      profile: "Profile",
      logout: "Sign Out",
      storage: "Storage"
    },
    orders: {
      title: "Order Management",
      subtitle: "Track and manage your customer orders.",
      tabs: {
        all: "All",
        pending: "Pending",
        paid: "Paid",
        completed: "Completed"
      }
    },
    store: {
      title: "Store Management",
      subtitle: "Manage your products and inventory.",
      add_product: "Add Product",
      inventory: "Inventory",
      growth_tools: "Growth Tools"
    },
    finance: {
      title: "Finance & Subscriptions",
      available_balance: "Available Balance",
      top_up: "Top Up",
      withdraw: "Withdraw",
      transactions: "Recent Transactions",
      plans: "Plans",
      current_plan: "Current Plan"
    },
    profile: {
      title: "Merchant Profile",
      preferences: "Preferences",
      dark_mode: "Dark Mode",
      language: "Language",
      support: "Support"
    },
    nav: {
      features: "Features",
      payments: "Payments",
      pricing: "Pricing",
      getStarted: "Get Started"
    },
    hero: {
      title: "Sell more with Bouteek",
      subtitle: "The all-in-one platform to manage your business online and offline. Integrated mobile payments (Wave, Orange Money) and simplified management.",
      cta1: "Create my store",
      cta2: "View demo",
      benefit1: "Setup in 2 minutes",
      benefit2: "Wave & OM Payments",
      benefit3: "No hidden fees"
    },
    features: {
      title: "Everything you need",
      subtitle: "Powerful tools to manage your business from A to Z.",
      feature1: { title: "E-commerce Site", desc: "Your own professional website generated automatically." },
      feature2: { title: "Analytics", desc: "Track sales and customers in real-time." },
      feature3: { title: "Fast", desc: "Optimized for speed and mobile." },
      feature4: { title: "Secure", desc: "Your data and payments are protected." },
      feature5: { title: "Easy", desc: "No technical skills required." },
      feature6: { title: "24/7 Support", desc: "A dedicated team to help you." }
    },
    testimonials: {
      title: "They trust us",
      subtitle: "See what merchants are saying about us.",
      name1: "Fatou Diop",
      role1: "Fashion Seller",
      testimonial1: "Bouteek transformed my business. I can accept Wave directly!",
      name2: "Amadou Sow",
      role2: "Restaurant Owner",
      testimonial2: "Order management is super simple. I recommend it.",
      name3: "Aissa Thiam",
      role3: "Organic Cosmetics",
      testimonial3: "My customers love my new site. Thanks Bouteek!"
    },
    pricing: {
      title: "Transparent Pricing",
      subtitle: "Choose the plan that fits your growth.",
      starter: "Starter",
      starterDesc: "To start smoothly.",
      launch: "Launch",
      launchDesc: "For growing stores.",
      growth: "Growth",
      growthDesc: "For established businesses.",
      pro: "Pro",
      proDesc: "For large volumes.",
      perMonth: "/month",
      getStartedBtn: "Choose this plan",
      features: {
        starter: ["Up to 10 products", "Basic website", "Mobile payments"],
        launch: ["Up to 50 products", "Advanced customization", "Basic analytics", "Email support"],
        growth: ["Unlimited products", "Free domain name", "Advanced analytics", "Priority support"],
        pro: ["Unlimited everything", "API access", "Dedicated manager", "24/7 Support"]
      }
    },
    payments: {
      title: "Simplified Payments",
      subtitle: "Accept all local payments without friction.",
      wave: "Wave",
      waveDesc: "Native integration for instant payments.",
      orange: "Orange Money",
      orangeDesc: "Accept OM easily on your store.",
      flowTitle: "How it works?",
      flow1: "Customer orders",
      flow2: "Chooses Wave or OM",
      flow3: "You receive funds",
      flow4: "You deliver product"
    },
    cta: {
      title: "Ready to start?",
      subtitle: "Join thousands of merchants selling better with Bouteek.",
      button: "Create free account",
      note: "No credit card required"
    },
    referral: {
      title: "Referral Program",
      subtitle: "Earn money by inviting other merchants.",
      benefit1: "Recurring commissions",
      benefit2: "Monthly payments",
      benefit3: "Dedicated dashboard",
      cta: "Become a Partner",
      description: "Invite merchants and earn 20% of their subscription for life."
    },
    appStore: {
      comingSoon: "Coming Soon"
    },
    footer: {
      tagline: "The commerce solution for Africa.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
      copyright: "All rights reserved."
    }
  }
};
