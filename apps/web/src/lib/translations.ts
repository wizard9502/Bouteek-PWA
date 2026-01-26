export type Language = 'en' | 'fr' | 'wo';

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
    common: {
      total: "Total",
      save: "Enregistrer",
      cancel: "Annuler",
      back: "Retour",
      search: "Rechercher",
      loading: "Chargement...",
      error: "Erreur",
      delete: "Supprimer",
      edit: "Modifier",
      view_site: "Voir le site",
      in_stock: "En Stock",
      out_of_stock: "Rupture de Stock",
      units: "unités",
      confirm_delete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
      empty_inventory: "Aucun produit trouvé. Ajoutez votre premier article pour commencer à vendre !",
      untitled: "Sans Titre",
      id_required: "ID Requis",
      active: "Actif",
      featured: "Mis en Avant",
      next: "Suivant",
      charts: {
        subscriptions: "Abonnements",
        commissions: "Commissions",
        merchants_count: "# de Marchands",
        revenue: "Revenu"
      }
    },
    sidebar: {
      dashboard: "Tableau de Bord",
      store: "Boutique",
      orders: "Commandes",
      finance: "Finance",
      profile: "Profil",
      subscription: "Abonnement",
      settings: "Paramètres",
      referrals: "Parrainage",
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
        completed: "Terminées",
        pending_verification: "Attente Vérification",
        processing: "En Traitement"
      },
      syncing: "Synchronisation des commandes...",
      no_orders: "Aucune commande trouvée.",
      new_orders_desc: "Les nouvelles commandes apparaîtront ici automatiquement.",
      new_order_toast: "Nouvelle commande reçue !",
      load_error: "Échec du chargement des commandes",
      status_marked: "Commande marquée comme",
      guest: "Invité",
      no_phone: "Pas de téléphone",
      transaction_id: "ID de Transaction",
      detail: {
        customer_info: "Informations Client",
        address_copied: "Adresse copiée !",
        phone_copied: "Téléphone copié !",
        items: "Articles de la Commande",
        payment_proof: "Preuve de Paiement",
        approved_success: "Paiement approuvé !",
        approve_error: "Échec de l'approbation",
        rejected_success: "Commande rejetée",
        reject_error: "Échec du rejet",
        approve_payment: "Approuver le Paiement",
        reject_payment: "Rejeter le Paiement",
        mark_completed: "Marquer comme Terminé",
        rejection_modal: {
          title: "Motif du Rejet",
          subtitle: "Sélectionnez un motif pour rejeter ce paiement :",
          reasons: {
            incorrect_id: "ID de Transaction Incorrect",
            amount_mismatch: "Écart de Montant",
            duplicate: "Paiement en Double",
            fraud: "Transaction Frauduleuse",
            customer_request: "Demande du Client"
          }
        }
      }
    },
    store: {
      title: "Gestion Boutique",
      subtitle: "Gérez vos produits et votre inventaire.",
      add_product: "Ajouter Produit",
      inventory: "Inventaire",
      growth_tools: "Outils de Croissance",
      search_products: "Rechercher produits...",
      advanced_filter_coming: "Filtrage avancé bientôt disponible"
    },
    storefront: {
      not_found: "Boutique non trouvée",
      cart: {
        title: "Votre Panier",
        empty: "Votre panier est vide",
        checkout: "Passer à la caisse"
      },
      checkout: {
        title: "Paiement pour",
        summary: "Résumé de la commande",
        details: "Vos Informations",
        name: "Nom Complet",
        phone: "Numéro de Téléphone",
        address: "Adresse de Livraison",
        payment: "Paiement",
        payment_instruction: "Envoyez l'argent au numéro vérifié du marchand ci-dessous, puis entrez l'ID de transaction.",
        no_payment_methods: "Le marchand n'a pas activé les paiements.",
        transaction_id: "ID de Transaction (Requis)",
        transaction_placeholder: "Collez le contenu du SMS ou l'ID de transaction ici",
        transaction_example: "Exemple : 'Trans: 123456... Paiement à Bouteek'",
        confirm_payment: "Confirmer le Paiement",
        success_toast: "Commande passée avec succès !",
        error_tx_id: "Veuillez entrer l'ID de transaction",
        error_failed: "Échec : ",
        back_to_store: "Retour à la boutique"
      },
      success: {
        title: "Confirmation de Commande",
        placed_title: "Commande Passée ! 🎉",
        placed_desc: "Merci pour votre achat. Le marchand vérifiera votre paiement et traitera votre commande.",
        order_number: "Numéro de Commande",
        status: "Statut",
        items: "Articles",
        contact_merchant: "Contacter le Marchand",
        call: "Appeler",
        whatsapp: "WhatsApp",
        continue_shopping: "Continuer mes achats",
        powered_by: "Propulsé par"
      }
    },
    finance: {
      title: "Finance & Abonnements",
      available_balance: "Solde Disponible",
      top_up: "Recharger",
      withdraw: "Retirer",
      transactions: "Transactions Récentes",
      plans: "Abonnements",
      current_plan: "Plan Actuel",
      optimizer: {
        title: "Estimateur de Ventes",
        subtitle: "Glissez pour estimer votre volume de ventes mensuel (V)",
        est_cost: "Coût Total Est.",
        save: "Économisez",
        base: "Base",
        comm: "Comm.",
        best_value: "Meilleur Choix",
        month: "mois"
      },
      tabs: {
        overview: "Vue d'ensemble",
        subscription: "Abonnements"
      },
      analytics: "Analytique",
      transfer: "Transférer",
      history_title: "Historique des Transactions",
      see_all: "Voir Tout",
      paydunya: "Pont Sécurisé PayDunya",
      amount_topup: "Montant à Recharger",
      pay: "Payer",
      sub_manager: {
        title: "Choisir un Plan",
        subtitle: "Sélectionnez le meilleur plan pour votre entreprise.",
        configure: "Configurer",
        cycle: "Cycle de Facturation",
        month: "Mois",
        months: "Mois",
        save: "Économisez",
        auto_renew: "Renouvellement Auto",
        auto_renew_desc: "Déduit automatiquement du portefeuille pour éviter toute interruption.",
        current_balance: "Solde Actuel",
        order_summary: "Résumé de la Commande",
        discount: "Réduction",
        total: "Total",
        confirm: "Confirmer l'Abonnement",
        insufficient: "Solde Bouteek Cash insuffisant.",
        success: "Abonnement mis à jour !"
      }
    },
    profile: {
      title: "Profil Marchand",
      preferences: "Préférences",
      dark_mode: "Mode Sombre",
      language: "Langue",
      support: "Support & Aide",
      notifications: "Notifications App",
      appearance: "Apparence",
      themes: {
        light: "Clair",
        dark: "Sombre",
        pink: "Rose Bouteek",
        purple: "Royal",
        ocean: "Océan",
        luxury: "Luxe Midnight",
        sunset: "Sunset"
      },
      referral_title: "Programme de Parrainage",
      referral_desc: "Définissez votre code unique pour inviter d'autres personnes.",
      redeem_referral: "Utiliser un Code de Parrainage",
      promo_code: "Code Promo",
      promo_desc: "Entrez un code promo pour bénéficier d'une réduction.",
      social_support: "Réseaux & Support",
      connect_ig: "Connecter Instagram",
      connect_tt: "Connecter TikTok",
      connect_sc: "Connecter Snapchat",
      live_chat: "Chat en Direct",
      live_chat_desc: "Obtenez une aide instantanée de notre équipe.",
      start_chat: "Démarrer la Conversation",
      sign_out: "Déconnexion Marchand",
      trust_score: "Score de Confiance",
      platinum_tier: "Palier Platinum",
      verified: "Vérifié",
      edit_profile: "Modifier Profil",
      referral_redeem_success: "Code de parrainage utilisé avec succès !",
      referral_redeem_error: "Erreur lors de l'utilisation du code.",
      promo_applied: "Code promo appliqué !",
      chat_loading: "Le chat se charge...",
      merchant_name_placeholder: "Nom du Marchand",
      online: "En Ligne",
      offline: "Hors Ligne",
      copy_code_success: "Code de parrainage copié !",
      tabs: {
        profile: "Profil & Préférences",
        referrals: "Parrainage"
      },
      referral_hero: {
        grow: "Grandir Ensemble",
        title: "Construisez votre empire avec",
        code_label: "Votre Code de Parrainage Privé",
        set_btn: "DÉFINIR"
      },
      stats: {
        total: "Total Parrainages",
        pending: "Solde En Attente"
      },
      table: {
        title: "Vos Filleuls",
        merchant: "Marchand",
        plan: "Plan",
        joined: "Inscrit",
        status: "Statut",
        active: "Actif",
        empty: "Vous n'avez parrainé personne. Partagez votre code !"
      }
    },

    settings: {
      title: "Paramètres de la Boutique",
      general: "Informations Générales",
      business_name: "Nom de l'Entreprise",
      store_slug: "Lien de la Boutique",
      referral_code: "Code de Parrainage (Privé)",
      referral_desc: "Partagez ce code pour gagner 20% de commission.",
      payment_methods: "Moyens de Paiement",
      payments_desc: "Entrez les numéros pour recevoir vos paiements.",
      wave_number: "Numéro Wave",
      om_number: "Numéro Orange Money",
      social_links: "Réseaux Sociaux",
      social_desc: "Liez vos comptes pour augmenter votre visibilité.",
      save_changes: "Enregistrer les Modifications",
      saving: "Enregistrement...",
      url_reserved: "Cette URL est réservée. Veuillez en choisir une autre.",
      placeholder_slug: "votre-boutique",
      save_success: "Paramètres enregistrés !",
      save_error: "Échec de l'enregistrement des paramètres",
      instagram: "Compte Instagram",
      tiktok: "Compte TikTok",
      snapchat: "Compte Snapchat"
    },
    listings: {
      editor: {
        steps: {
          type: "Type",
          media: "Média",
          details: "Détails",
          review: "Aperçu"
        },
        draft_found: "Brouillon Trouvé",
        draft_desc: "Vous avez une annonce non enregistrée de",
        restore_draft: "Restaurer le Brouillon",
        start_fresh: "Recommencer",
        draft_restored: "Brouillon restauré !",
        title: "Titre",
        title_placeholder: "Donnez un titre accrocheur",
        description: "Description",
        description_placeholder: "Décrivez votre annonce...",
        category: "Catégorie",
        category_placeholder: "ex: Mode, Beauté, Électronique",
        review_title: "Réviser & Publier",
        review_subtitle: "Vérifiez que tout est correct avant de publier",
        more_media: "en plus",
        publishing: "Publication...",
        publish_listing: "Publier l'Annonce",
        draft_saved: "Brouillon enregistré"
      }
    },
    growth: {
      title: "Outils de Croissance",
      seo: "Optimisation SEO",
      seo_desc: "Gérez les balises meta et la visibilité.",
      heatmaps: "Cartes Thermiques",
      heatmaps_desc: "Analytique visuelle engagement.",
      collaboration: "Collaboration d'Équipe",
      collaboration_desc: "Gérez le personnel et les permissions.",
      builder: "Constructeur de Boutique",
      builder_desc: "Personnalisation sans code.",
      inventory_sync: "Sync Inventaire",
      inventory_sync_desc: "Synchronisation multi-canaux.",
      promotions: "Moteur de Promotions",
      promotions_desc: "Gérez les codes promo et campagnes.",
      reviews: "Avis Clients",
      reviews_desc: "Modérez et répondez aux retours.",
      receipts: "Reçus Numériques",
      receipts_desc: "Personnalisez vos reçus de vente."
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
    },
    admin: {
      audit: {
        title: "Logs d'Audit",
        subtitle: "Sécurité du système et historique des actions.",
        table: {
          admin: "Admin",
          action: "Action",
          target: "Cible",
          details: "Détails",
          time: "Temps"
        },
        loading: "Chargement des logs d'audit...",
        no_logs: "Aucun log trouvé."
      }
    },
    store_home: {
      welcome: "Bienvenue sur Bouteek",
      tagline: "Le moyen le plus simple de vendre en ligne au Sénégal",
      not_found: "Boutique non trouvée | Bouteek"
    },
    landing: {
      login: "Connexion",
      mobile_apps_notice: "Les applications mobiles seront bientôt disponibles.",
      next_gen: "Nouvelle Génération d'E-commerce",
      security: "Sécurité",
      founder_quote: "Notre mission est de donner aux entrepreneurs africains les outils de classe mondiale qu'ils méritent. Bouteek n'est pas juste une application, c'est votre partenaire de croissance."
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
    common: {
      total: "Total",
      save: "Save",
      cancel: "Cancel",
      back: "Back",
      search: "Search",
      loading: "Loading...",
      error: "Error",
      delete: "Delete",
      edit: "Edit",
      view_site: "View Site",
      in_stock: "In Stock",
      out_of_stock: "Out of Stock",
      units: "units",
      confirm_delete: "Are you sure you want to delete this item?",
      empty_inventory: "No products found. Add your first item to start selling!",
      untitled: "Untitled",
      id_required: "ID Required",
      active: "Active",
      featured: "Featured",
      next: "Next",
      charts: {
        subscriptions: "Subscriptions",
        commissions: "Commissions",
        merchants_count: "# of Merchants",
        revenue: "Revenue"
      }
    },
    sidebar: {
      dashboard: "Dashboard",
      store: "Store",
      orders: "Orders",
      finance: "Finance",
      profile: "Profile",
      subscription: "Subscription",
      settings: "Settings",
      referrals: "Referrals",
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
        completed: "Completed",
        pending_verification: "Pending Verification",
        processing: "Processing"
      },
      syncing: "Syncing Orders...",
      no_orders: "No orders found.",
      new_orders_desc: "New orders will appear here automatically.",
      new_order_toast: "New order received!",
      load_error: "Failed to load orders",
      status_marked: "Order marked as",
      guest: "Guest",
      no_phone: "No phone",
      transaction_id: "Transaction ID",
      detail: {
        customer_info: "Customer Information",
        address_copied: "Address copied!",
        phone_copied: "Phone copied!",
        items: "Order Items",
        payment_proof: "Payment Proof",
        approved_success: "Payment approved!",
        approve_error: "Failed to approve payment",
        rejected_success: "Order rejected",
        reject_error: "Failed to reject order",
        approve_payment: "Approve Payment",
        reject_payment: "Reject Payment",
        mark_completed: "Mark as Completed",
        rejection_modal: {
          title: "Rejection Reason",
          subtitle: "Select a reason for rejecting this payment:",
          reasons: {
            incorrect_id: "Incorrect Transaction ID",
            amount_mismatch: "Amount Mismatch",
            duplicate: "Duplicate Payment",
            fraud: "Fraudulent Transaction",
            customer_request: "Customer Request"
          }
        }
      }
    },
    store: {
      title: "Store Management",
      subtitle: "Manage your products and inventory.",
      add_product: "Add Product",
      inventory: "Inventory",
      growth_tools: "Growth Tools",
      search_products: "Search products...",
      advanced_filter_coming: "Advanced filtering coming soon"
    },
    storefront: {
      not_found: "Store not found",
      cart: {
        title: "Your Cart",
        empty: "Your cart is empty",
        checkout: "Checkout"
      },
      checkout: {
        title: "Checkout for",
        summary: "Order Summary",
        details: "Your Details",
        name: "Full Name",
        phone: "Phone Number",
        address: "Delivery Address",
        payment: "Payment",
        payment_instruction: "Send money to the verified merchant number below, then enter the Transaction ID.",
        no_payment_methods: "Merchant has not enabled payments.",
        transaction_id: "Transaction ID (Required)",
        transaction_placeholder: "Paste SMS content or Trans ID here",
        transaction_example: "Example: 'Trans: 123456... Payment to Bouteek'",
        confirm_payment: "Confirm Payment",
        success_toast: "Order placed successfully!",
        error_tx_id: "Please enter the Transaction ID",
        error_failed: "Failed: ",
        back_to_store: "Back to Store"
      },
      success: {
        title: "Order Confirmation",
        placed_title: "Order Placed! 🎉",
        placed_desc: "Thank you for your purchase. The merchant will verify your payment and process your order.",
        order_number: "Order Number",
        status: "Status",
        items: "Items",
        contact_merchant: "Contact Merchant",
        call: "Call",
        whatsapp: "WhatsApp",
        continue_shopping: "Continue Shopping",
        powered_by: "Powered by"
      }
    },
    finance: {
      title: "Finance & Subscriptions",
      available_balance: "Available Balance",
      top_up: "Top Up",
      withdraw: "Withdraw",
      transactions: "Recent Transactions",
      plans: "Plans",
      current_plan: "Current Plan",
      optimizer: {
        title: "Sales Estimator",
        subtitle: "Slide to estimate your monthly sales volume (V)",
        est_cost: "Est. Total Cost",
        save: "Save",
        base: "Base",
        comm: "Comm.",
        best_value: "Best Value",
        month: "mo"
      },
      tabs: {
        overview: "Overview",
        subscription: "Subscriptions"
      },
      analytics: "Analytics",
      transfer: "Transfer",
      history_title: "Transaction Log",
      see_all: "See All",
      paydunya: "Secure PayDunya Bridge",
      amount_topup: "Amount to Top-Up",
      pay: "Pay",
      sub_manager: {
        title: "Choosing Plan",
        subtitle: "Select the best plan for your business.",
        configure: "Configure",
        cycle: "Billing Cycle",
        month: "Month",
        months: "Months",
        save: "Save",
        auto_renew: "Auto-Renew Subscription",
        auto_renew_desc: "Automatically deduct from wallet to prevent downtime.",
        current_balance: "Current Balance",
        order_summary: "Order Summary",
        discount: "Discount",
        total: "Total",
        confirm: "Confirm Subscription",
        insufficient: "Insufficient Bouteek Cash balance.",
        success: "Subscription updated!"
      }
    },
    profile: {
      title: "Merchant Profile",
      preferences: "Preferences",
      dark_mode: "Dark Mode",
      language: "Language",
      support: "Support & Help",
      notifications: "App Notifications",
      appearance: "Appearance",
      themes: {
        light: "Light",
        dark: "Dark",
        pink: "Bouteek Pink",
        purple: "Royal",
        ocean: "Ocean",
        luxury: "Midnight Luxury",
        sunset: "Sunset"
      },
      referral_title: "Referral Program",
      referral_desc: "Set your unique code to invite others.",
      redeem_referral: "Redeem Referral Code",
      promo_code: "Promo Code",
      promo_desc: "Enter a promo code for discounts.",
      social_support: "Social & Support",
      connect_ig: "Connect Instagram",
      connect_tt: "Connect TikTok",
      connect_sc: "Connect Snapchat",
      live_chat: "Live Chat",
      live_chat_desc: "Get instant help from our team.",
      start_chat: "Start Conversation",
      sign_out: "Sign Out Merchant",
      trust_score: "Trust Score",
      platinum_tier: "Platinum Tier",
      verified: "Verified",
      edit_profile: "Edit Profile",
      referral_redeem_success: "Referral code redeemed successfully!",
      referral_redeem_error: "Error redeeming code.",
      promo_applied: "Promo code applied!",
      chat_loading: "Chat is loading...",
      merchant_name_placeholder: "Merchant Name",
      online: "Online",
      offline: "Offline",
      copy_code_success: "Referral code copied!",
      tabs: {
        profile: "Profile & Settings",
        referrals: "Referrals"
      },
      referral_hero: {
        grow: "Grow Together",
        title: "Build your empire with",
        code_label: "Your Private Referral Code",
        set_btn: "SET"
      },
      stats: {
        total: "Total Referrals",
        pending: "Pending Balance"
      },
      table: {
        title: "Your Referrals",
        merchant: "Merchant",
        plan: "Plan",
        joined: "Joined",
        status: "Status",
        active: "Active",
        empty: "You haven't referred any merchants yet. Start sharing your code!"
      }
    },
    settings: {
      title: "Store Settings",
      general: "General Information",
      business_name: "Business Name",
      store_slug: "Store URL Slug",
      referral_code: "Referral Code (Private)",
      referral_desc: "Share this code to earn 20% commission.",
      payment_methods: "Payment Methods",
      payments_desc: "Enter the numbers where you want to receive payments.",
      payment_accounts: {
        wave_money: 'Wave Money',
        orange_money: 'Orange Money (Coming Soon)',
        card: 'Credit Card (Coming Soon)',
        // removed paydunyaccounts
      },
      social_links: "Social Links",
      social_desc: "Link your accounts to increase visibility.",
      save_changes: "Save Changes",
      saving: "Saving...",
      url_reserved: "This store URL is reserved. Please choose another one.",
      placeholder_slug: "your-store",
      save_success: "Settings saved!",
      save_error: "Failed to save settings",
      instagram: "Instagram Handle",
      tiktok: "TikTok Handle",
      snapchat: "Snapchat Handle"
    },
    listings: {
      editor: {
        steps: {
          type: "Select Type",
          media: "Add Media",
          details: "Details",
          review: "Review"
        },
        draft_found: "Draft Found",
        draft_desc: "You have an unsaved listing from",
        restore_draft: "Restore Draft",
        start_fresh: "Start Fresh",
        draft_restored: "Draft restored!",
        title: "Title",
        title_placeholder: "Give your listing a catchy title",
        description: "Description",
        description_placeholder: "Describe your listing...",
        category: "Category",
        category_placeholder: "e.g. Fashion, Beauty, Electronics",
        review_title: "Review & Publish",
        review_subtitle: "Make sure everything looks good before publishing",
        more_media: "more",
        publishing: "Publishing...",
        publish_listing: "Publish Listing",
        draft_saved: "Draft saved"
      }
    },
    growth: {
      title: "Growth Tools",
      seo: "SEO Optimization",
      seo_desc: "Manage meta tags & visibility.",
      heatmaps: "Performance Heatmaps",
      heatmaps_desc: "Visual engagement analytics.",
      collaboration: "Team Collaboration",
      collaboration_desc: "Manage staff & permissions.",
      builder: "Storefront Builder",
      builder_desc: "No-code website customization.",
      inventory_sync: "Inventory Sync",
      inventory_sync_desc: "Multi-channel synchronization.",
      promotions: "Promotions Engine",
      promotions_desc: "Manage coupons and campaigns.",
      reviews: "Customer Reviews",
      reviews_desc: "Moderate and reply to feedback.",
      receipts: "Digital Receipts",
      receipts_desc: "Customize your sales receipts."
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
    },
    admin: {
      audit: {
        title: "Audit Logs",
        subtitle: "System security and action trail.",
        table: {
          admin: "Admin",
          action: "Action",
          target: "Target",
          details: "Details",
          time: "Time"
        },
        loading: "Loading audit logs...",
        no_logs: "No logs found."
      }
    },
    store_home: {
      welcome: "Welcome to Bouteek",
      tagline: "The easiest way to sell online in Senegal",
      not_found: "Store Not Found | Bouteek"
    },
    landing: {
      login: "Log In",
      mobile_apps_notice: "Mobile apps will be available soon.",
      next_gen: "Next Gen E-commerce",
      security: "Security",
      founder_quote: "Our mission is to empower African entrepreneurs with the world-class tools they deserve. Bouteek is not just an app, it's your growth partner."
    }
  },
  wo: {
    dashboard: {
      title: "Xibaaru Butik",
      hello_merchant: "Salaamaleikum, Marcand bi 👋",
      subtitle: "Li mu ngi xéw ci sa butik tay ji.",
      search_placeholder: "Seet ndimbal, liggéey...",
      quick_operations: "Liggéey yu gaaw",
      revenue_card: {
        total_revenue: "Lépp lu mu indi",
        withdraw: "Jële xaalis",
        balance: "Sa xaalis"
      },
      stats: {
        today: "Tay",
        week: "Seméen bi",
        month: "Wér wi"
      }
    },
    common: {
      total: "Lépp",
      save: "Samm",
      cancel: "Bàyyi",
      back: "Dellu gannaaw",
      search: "Seet",
      loading: "Mu ngi ñëw...",
      error: "Njuumte",
      delete: "Far",
      edit: "Soppi",
      view_site: "Seet butik bi",
      in_stock: "Am na",
      out_of_stock: "Jeex na",
      units: "unités",
      confirm_delete: "Ndax dëgg la nga bëgg far li ?",
      empty_inventory: "Amul leneen. Dugalal sa bu jëkk !",
      untitled: "Amul tur",
      id_required: "ID laaj na",
      active: "Mu ngi dox",
      featured: "Li gën",
      next: "Kananam",
      charts: {
        subscriptions: "Abonnement",
        commissions: "Commission",
        merchants_count: "# Marcand",
        revenue: "Xaalis"
      }
    },
    sidebar: {
      dashboard: "Xibaaru Butik",
      store: "Butik",
      orders: "Ndimbal",
      finance: "Xaalis",
      profile: "Profil",
      subscription: "Abonnement",
      settings: "Melo",
      referrals: "Parrainage",
      logout: "Génn",
      storage: "Suqaliku"
    },
    orders: {
      title: "Ndimbal yi",
      subtitle: "Saytul sa ndimbal kiliyã yi.",
      tabs: {
        all: "Lépp",
        pending: "Mu ngi xaar",
        paid: "Fay na",
        completed: "Pare na",
        pending_verification: "Saytu bi",
        processing: "Mu ngi dox"
      },
      syncing: "Mu ngi may xaar...",
      no_orders: "Gisu ma ndimbal.",
      new_orders_desc: "Ndimbal yu bees yi fi lañuy ñëw.",
      new_order_toast: "Ndimbal bu bees ñëw na!",
      load_error: "Manoon mako giss",
      status_marked: "Ndimbal bi pare na ni",
      guest: "Gan",
      no_phone: "Amul téléfoon",
      transaction_id: "Nimaro natt bi",
      detail: {
        customer_info: "Xibaaru kiliyã bi",
        address_copied: "Adrees bi copi na!",
        phone_copied: "Téléfoon bi copi na!",
        items: "Li nga jënd",
        payment_proof: "Natt bi",
        approved_success: "Fay bi nangu na!",
        approve_error: "Manoon mako nangu",
        rejected_success: "Bañ na ndimbal bi",
        reject_error: "Manoon mako bañ",
        approve_payment: "Nangu fay bi",
        reject_payment: "Bañ fay bi",
        mark_completed: "Pare na",
        rejection_modal: {
          title: "Lu tax nga bañ",
          subtitle: "Tannal lu tax nga bañ fay bi :",
          reasons: {
            incorrect_id: "Nimaro natt bi baaxul",
            amount_mismatch: "Xaalis bi eméwul",
            duplicate: "Fay bi ñaar la",
            fraud: "Nax la",
            customer_request: "Kiliyã bi ko laaj"
          }
        }
      }
    },
    store: {
      title: "Saytul Butik bi",
      subtitle: "Saytul sa liggéey ak sa stock.",
      add_product: "Dugal liggéey",
      inventory: "Stock",
      growth_tools: "Liggéey yu koy magal",
      search_products: "Seet liggéey...",
      advanced_filter_coming: "Seet bu gën mu ngi ñëw"
    },
    storefront: {
      not_found: "Butik bi gisu ma ko",
      cart: {
        title: "Sa sàqu",
        empty: "Sa sàqu fëssul",
        checkout: "Fay dëggu"
      },
      checkout: {
        title: "Fay pour",
        summary: "Li nga jënd",
        details: "Sa xibaar",
        name: "Sa tur lépp",
        phone: "Sa téléfoon",
        address: "Fi ñu koy yóobbu",
        payment: "Fay bi",
        payment_instruction: "Yóonéel xaalis bi ci nimaro bi, ba pare dugal nimaro natt bi.",
        no_payment_methods: "Marcand bi itéulul fay bi.",
        transaction_id: "Nimaro natt bi (laaj na)",
        transaction_placeholder: "Dugalal nimaro natt bi fi",
        transaction_example: "Misal : 'Trans: 123456...'",
        confirm_payment: "Barkéel fay bi",
        success_toast: "Ndimbal bi dem na!",
        error_tx_id: "Dugalal nimaro natt bi",
        error_failed: "Demul : ",
        back_to_store: "Dellu ci butik bi"
      },
      success: {
        title: "Ndimbal bi baax na",
        placed_title: "Baax na! 🎉",
        placed_desc: "Jërëjëf. Marcand bi dana saytu sa fay bi.",
        order_number: "Nimaro ndimbal",
        status: "Melo",
        items: "Liggéey yi",
        contact_merchant: "Woxal marcand bi",
        call: "Wox",
        whatsapp: "WhatsApp",
        continue_shopping: "Dellu jëndaat",
        powered_by: "Ligéeyu"
      }
    },
    finance: {
      title: "Xaalis ak Abonnement",
      available_balance: "Xaalis bi nga am",
      top_up: "Dugal xaalis",
      withdraw: "Jële xaalis",
      transactions: "Liggéey yu mujj",
      plans: "Abonnement",
      current_plan: "Li nga am nii",
      optimizer: {
        title: "Seet sa magal",
        subtitle: "Gëstayal sa volume de vente (V)",
        est_cost: "Li mu lay jar lépp",
        save: "Economisé",
        base: "Base",
        comm: "Comm.",
        best_value: "Lu gën",
        month: "wér"
      },
      tabs: {
        overview: "Lépp",
        subscription: "Abonnement"
      },
      analytics: "Analytique",
      transfer: "Transfert",
      history_title: "Historique",
      see_all: "Seet lépp",
      paydunya: "PayDunya",
      amount_topup: "Montant",
      pay: "Fay",
      sub_manager: {
        title: "Tannal Plan",
        subtitle: "Tannal plan bu gën pour sa butik.",
        configure: "Ligallaat",
        cycle: "Facturation",
        month: "Wér",
        months: "Wér",
        save: "Economisé",
        auto_renew: "Renouvellement Auto",
        auto_renew_desc: "Dina fay boppam pour butik bi bañu taxaw.",
        current_balance: "Sa xaalis tay",
        order_summary: "Résumé",
        discount: "Réduction",
        total: "Lépp",
        confirm: "Nangu Abonnement",
        insufficient: "Sa xaalis eméwul.",
        success: "Abonnement baax na!"
      }
    },
    profile: {
      title: "Profil Marcand",
      preferences: "Lu la gënël",
      dark_mode: "Melo mu gudd",
      language: "Lakk",
      support: "Ndimbal",
      notifications: "Notes",
      appearance: "Melo",
      themes: {
        light: "Leer",
        dark: "Lëndëm",
        pink: "Bouteek Pink",
        purple: "Royal",
        ocean: "Géej",
        luxury: "Luxe",
        sunset: "Sunset"
      },
      referral_title: "Parrainage",
      referral_desc: "Defal sa code pour invité ñéneen.",
      redeem_referral: "Utilisé Code Parrainage",
      promo_code: "Code Promo",
      promo_desc: "Dugalal code promo pour réduction.",
      social_support: "Social & Ndimbal",
      connect_ig: "Instagram",
      connect_tt: "TikTok",
      connect_sc: "Snapchat",
      live_chat: "Chat",
      live_chat_desc: "Woxal ak ñun léegi.",
      start_chat: "Dóore wox bi",
      sign_out: "Génn",
      trust_score: "Score de Confiance",
      platinum_tier: "Palier Platinum",
      verified: "Vérifié",
      edit_profile: "Soppi Profil",
      referral_redeem_success: "Code bi baax na!",
      referral_redeem_error: "Code bi baaxul.",
      promo_applied: "Promo code baax na!",
      chat_loading: "Chat bi mu ngi ñëw...",
      merchant_name_placeholder: "Tur Marcand bi",
      online: "Mu ngi ci nekk",
      offline: "Nekkul ci nekk",
      copy_code_success: "Code bi né na copi!",
      tabs: {
        profile: "Profil & Melo",
        referrals: "Parrainage"
      },
      referral_hero: {
        grow: "Magal Ànd",
        title: "Tabaxal sa empire ak",
        code_label: "Sa Code Parrainage",
        set_btn: "DEFAL"
      },
      stats: {
        total: "Lépp Parrainage",
        pending: "Xaalis bi ci kanamam"
      },
      table: {
        title: "Sa Filleul yi",
        merchant: "Marcand",
        plan: "Plan",
        joined: "Duggu na",
        status: "Melo",
        active: "Dox na",
        empty: "Amul kénn. Partagéel sa code !"
      }
    },
    settings: {
      title: "Melo Butik",
      general: "Xibaaru Butik",
      business_name: "Tur Butik bi",
      store_slug: "Lien Butik bi",
      referral_code: "Code Parrainage",
      referral_desc: "Partagéel code bi pour am 20% commission.",
      payment_methods: "Fay bi",
      payments_desc: "Dugalal nimaro yi pour fay bi.",
      wave_number: "Nimaro Wave",
      om_number: "Nimaro Orange Money",
      social_links: "Lien Social",
      social_desc: "Defal sa lien pour ñu gën la giss.",
      save_changes: "Samm soppi yi",
      saving: "Mu ngi samm...",
      url_reserved: "Lien bi am na ko. Tannal leneen.",
      placeholder_slug: "sa-butik",
      save_success: "Samm na ko!",
      save_error: "Samm bi demul",
      instagram: "Instagram",
      tiktok: "TikTok",
      snapchat: "Snapchat"
    },
    listings: {
      editor: {
        steps: {
          type: "Tannal",
          media: "Média",
          details: "Details",
          review: "Aperçu"
        },
        draft_found: "Brouillon am na",
        draft_desc: "Am nga liggéey bu mu ngi fi :",
        restore_draft: "Dellusi Brouillon",
        start_fresh: "Dóoraat",
        draft_restored: "Dellusi na!",
        title: "Tur",
        title_placeholder: "Defal tur bu neex",
        description: "Description",
        description_placeholder: "Woxal li nga bëgg jaay...",
        category: "Catégorie",
        category_placeholder: "ex: Mode, Beauté...",
        review_title: "Saytu & Publié",
        review_subtitle: "Seetal ndax lépp baax na",
        more_media: "en plus",
        publishing: "Publication...",
        publish_listing: "Publié Liggéey bi",
        draft_saved: "Brouillon samm na"
      }
    },
    growth: {
      title: "Liggéeyu Magal",
      seo: "SEO",
      seo_desc: "Saytul meta tags.",
      heatmaps: "Heatmaps",
      heatmaps_desc: "Analytique visuelle.",
      collaboration: "Collaboration",
      collaboration_desc: "Saytul sa personnel.",
      builder: "Constructeur",
      builder_desc: "Personnalisé sa butik.",
      inventory_sync: "Sync Stock",
      inventory_sync_desc: "Sync multi-canaux.",
      promotions: "Promotions",
      promotions_desc: "Saytul sa campagne yi.",
      reviews: "Avis Kiliyã",
      reviews_desc: "Woyal sa kiliyã yi.",
      receipts: "Reçu Numérique",
      receipts_desc: "Defal sa reçu yi."
    },
    nav: {
      features: "Melo",
      payments: "Fay bi",
      pricing: "Prix",
      getStarted: "Dóore"
    },
    hero: {
      title: "Jaayal gën ak Bouteek",
      subtitle: "Liggéey lépp-ci-biir pour saytul sa njay léegi. Fay Wave ak Orange Money mu ngi ci biir.",
      cta1: "Tabax sa butik",
      cta2: "Seet démo",
      benefit1: "2 minutes lépp pare",
      benefit2: "Fay Wave & OM",
      benefit3: "Amul frais ñuy la nax"
    },
    features: {
      title: "Lépp lu nga laaj",
      subtitle: "Liggéey yu néex pour saytul sa liggéey lépp.",
      feature1: { title: "Site E-commerce", desc: "Sa site bopp mu ngi ñëw boppam." },
      feature2: { title: "Analytique", desc: "Suital sa kiliyã yi." },
      feature3: { title: "Gaaw", desc: "Liggéey bu gaaw ci téléfoon." },
      feature4: { title: "Sécurisé", desc: "Sa xibaar samm na." },
      feature5: { title: "Néex", desc: "Lépp néex na, amul technique." },
      feature6: { title: "Ndimbal 24/7", desc: "Ñu ngi fi pour ndimbal." }
    },
    testimonials: {
      title: "Gëm nañuñu",
      subtitle: "Seetal li marcand yi wox.",
      name1: "Fatou Diop",
      role1: "Vendeuse de Mode",
      testimonial1: "Bouteek soppi na samm liggéey. Mana nangu Wave dëggu!",
      name2: "Amadou Sow",
      role2: "Restaurateur",
      testimonial2: "Saytu ndimbal yi néex na trop. Ma ngi leen di nuyu.",
      name3: "Aissa Thiam",
      role3: "Cosmétique Bio",
      testimonial3: "Samm kiliyã yi bëgg nañu samm site. Jërëjëf Bouteek!"
    },
    pricing: {
      title: "Prix yu leer",
      subtitle: "Tannal plan bi lay gënële.",
      starter: "Dóore",
      starterDesc: "Pour dóore ndank.",
      launch: "Lancement",
      launchDesc: "Pour butik yi mag.",
      growth: "Croissance",
      growthDesc: "Pour liggéey yu taxaw.",
      pro: "Pro",
      proDesc: "Pour liggéey yu bari.",
      perMonth: "/wér",
      getStartedBtn: "Tannal plan bi",
      features: {
        starter: ["10 liggéey", "Site web basique", "Fay mobile"],
        launch: ["50 liggéey", "Personnalisation", "Analytique", "Ndimbal email"],
        growth: ["Liggéey lépp", "Tur butik gratis", "Analytique bu gën", "Support prioritaire"],
        pro: ["Lépp illimité", "API access", "Gestionnaire bopp", "Support 24/7"]
      }
    },
    payments: {
      title: "Fay yu néex",
      subtitle: "Nangu lépp fay local amul problème.",
      wave: "Wave",
      waveDesc: "Fay gaaw dëggu.",
      orange: "Orange Money",
      orangeDesc: "Nangu OM yi néex na.",
      flowTitle: "Naka lay doxé ?",
      flow1: "Kiliyã bi jënd na",
      flow2: "Mu tann Wave wala OM",
      flow3: "Nga am sa xaalis",
      flow4: "Nga yóobbu liggéey bi"
    },
    cta: {
      title: "Ndax pare nga ?",
      subtitle: "Àndal ak marcand yu beuri yi jaay néex ak Bouteek.",
      button: "Defal sa compte gratis",
      note: "Carte bancaire laajul"
    },
    referral: {
      title: "Programme Parrainage",
      subtitle: "Amal xaalis li nga invité ñéneen.",
      benefit1: "Commission yi muy dinka",
      benefit2: "Fay wér wu nekk",
      benefit3: "Dashboard bopp",
      cta: "Ànd ak ñun",
      description: "Invitéél marcand yi, am 20% ci li ñuy fay à vie."
    },
    appStore: {
      comingSoon: "Mu ngi ñëw léegi"
    },
    footer: {
      tagline: "Lépp pour commerce ci Afrique.",
      product: "Liggéey",
      company: "Société",
      legal: "Légal",
      about: "Ci ñun",
      blog: "Blog",
      contact: "Woxal ñun",
      privacy: "Confidentialité",
      terms: "Conditions",
      cookies: "Cookies",
      copyright: "Lépp samm na."
    },
    admin: {
      audit: {
        title: "Logs d'Audit",
        subtitle: "Sécurité ak historique.",
        table: {
          admin: "Admin",
          action: "Liggéey",
          target: "Ci kanam",
          details: "Détails",
          time: "Waqtu"
        },
        loading: "Mu ngi may xaar...",
        no_logs: "Gisu ma logs."
      }
    },
    store_home: {
      welcome: "Dalal jàmm ci Bouteek",
      tagline: "Bi gën pour jaay ci internet ci Sénégal",
      not_found: "Butik bi gisu ma ko | Bouteek"
    },
    landing: {
      login: "Duggu",
      mobile_apps_notice: "App mobile yi ñu ngi ñëw léegi.",
      next_gen: "Liggéeyu jaay yu bees",
      security: "Kàrrange",
      founder_quote: "Sunu yéene mooy jox marcand yu Afrique yi liggéey yu kotté yu ñu yelloo. Bouteek du app rek, sa àndandoo magal la."
    }
  }
};
