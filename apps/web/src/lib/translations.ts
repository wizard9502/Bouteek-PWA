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
    profile: {
      title: "Profil Marchand",
      preferences: "Préférences",
      dark_mode: "Mode Sombre",
      language: "Langue",
      support: "Support"
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
    }
  }
};
