import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FAQ() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData = {
    fr: [
      {
        question: "Quels sont les frais de Bouteek?",
        answer: "Bouteek propose quatre plans tarifaires: Starter (2,000 XOF/mois), Launch (5,000 XOF/mois), Growth (12,500 XOF/mois) et Pro (20,000 XOF/mois). Chaque plan inclut une commission par transaction. Il n'y a pas de frais cachés et vous pouvez changer de plan ou annuler à tout moment."
      },
      {
        question: "Combien de temps faut-il pour mettre en place ma boutique?",
        answer: "Vous pouvez créer votre boutique en moins de 10 minutes. Il suffit de vous inscrire, d'ajouter vos produits et de configurer vos préférences de paiement. Votre boutique sera immédiatement en ligne et prête à accepter les commandes."
      },
      {
        question: "Quelles méthodes de paiement acceptez-vous?",
        answer: "Nous acceptons Wave et Orange Money. Les clients peuvent payer directement via leur compte mobile money, et les fonds sont versés directement sur votre compte. Aucun intermédiaire, aucun délai."
      },
      {
        question: "Combien de temps faut-il pour recevoir mes paiements?",
        answer: "Les paiements sont versés instantanément sur votre compte Wave ou Orange Money. Vous recevez l'argent en temps réel dès que le client effectue le paiement. Pas d'attente, pas de retard."
      },
      {
        question: "Puis-je gérer plusieurs boutiques avec un compte?",
        answer: "Oui, vous pouvez créer et gérer plusieurs boutiques avec un seul compte Bouteek. Chaque boutique a son propre tableau de bord, ses propres produits et ses propres statistiques de vente."
      },
      {
        question: "Que se passe-t-il si je n'ai plus de solde Bouteek Cash?",
        answer: "Si votre solde Bouteek Cash est épuisé, votre boutique sera temporairement mise en pause. Vous pouvez recharger votre solde à tout moment pour reprendre les ventes. Aucune donnée n'est perdue."
      },
      {
        question: "Puis-je vendre des produits numériques ou uniquement physiques?",
        answer: "Vous pouvez vendre à la fois des produits physiques et numériques. Bouteek supporte tous les types de produits: vêtements, électronique, services, téléchargements numériques, etc."
      },
      {
        question: "Comment puis-je obtenir du support?",
        answer: "Nous offrons du support par email pour tous les plans. Les plans Launch et supérieurs incluent le support WhatsApp. Le plan Pro inclut le support VIP avec réponse prioritaire. Contactez-nous à support@bouteek.com."
      },
      {
        question: "Mes données sont-elles sécurisées?",
        answer: "Oui, absolument. Nous utilisons le chiffrement AES-256, conformité PCI DSS, et des audits de sécurité réguliers. Vos données et celles de vos clients sont protégées par les plus hauts standards de sécurité."
      },
      {
        question: "Puis-je annuler mon abonnement à tout moment?",
        answer: "Oui, vous pouvez annuler votre abonnement à tout moment sans pénalité. Cependant, les mois d'abonnement entamés et le solde Bouteek Cash consommé ne sont pas remboursables."
      }
    ],
    en: [
      {
        question: "What are Bouteek's fees?",
        answer: "Bouteek offers four pricing plans: Starter (2,000 XOF/month), Launch (5,000 XOF/month), Growth (12,500 XOF/month), and Pro (20,000 XOF/month). Each plan includes a per-transaction commission. There are no hidden fees, and you can change plans or cancel anytime."
      },
      {
        question: "How long does it take to set up my store?",
        answer: "You can create your store in less than 10 minutes. Simply sign up, add your products, and configure your payment preferences. Your store will be live and ready to accept orders immediately."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept Wave and Orange Money. Customers can pay directly from their mobile money account, and funds are transferred directly to your account. No intermediaries, no delays."
      },
      {
        question: "How long does it take to receive my payments?",
        answer: "Payments are transferred instantly to your Wave or Orange Money account. You receive the money in real-time as soon as the customer makes the payment. No waiting, no delays."
      },
      {
        question: "Can I manage multiple stores with one account?",
        answer: "Yes, you can create and manage multiple stores with a single Bouteek account. Each store has its own dashboard, products, and sales statistics."
      },
      {
        question: "What happens if I run out of Bouteek Cash?",
        answer: "If your Bouteek Cash balance is depleted, your store will be temporarily paused. You can recharge your balance anytime to resume sales. No data is lost."
      },
      {
        question: "Can I sell digital products or only physical ones?",
        answer: "You can sell both physical and digital products. Bouteek supports all product types: clothing, electronics, services, digital downloads, and more."
      },
      {
        question: "How can I get support?",
        answer: "We offer email support for all plans. Launch and higher plans include WhatsApp support. The Pro plan includes VIP support with priority response. Contact us at support@bouteek.com."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, absolutely. We use AES-256 encryption, PCI DSS compliance, and regular security audits. Your data and your customers' data are protected by the highest security standards."
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription anytime without penalty. However, commenced subscription months and consumed Bouteek Cash balance are non-refundable."
      }
    ],
    wo: [
      {
        question: "Bari na paas bi ci Bouteek?",
        answer: "Bouteek dafa am ñenti xajat yu fés: Starter (2,000 XOF/wér), Launch (5,000 XOF/wér), Growth (12,500 XOF/wér) ak Pro (20,000 XOF/wér). Plan bu nekk dafa am kers bu néew. Amul fay yu la nax."
      },
      {
        question: "Waqtu bu tollu ban laa soxla pour tabax sam butik?",
        answer: "Mën nga tabax sa butik ci lu néew 10 minutes. Duggu rek, defal sa liggéey yi ak naka ngay fayé. Sa butik mu ngi ci biir internet léegi."
      },
      {
        question: "Ban fay yi ngay nangu?",
        answer: "Waaw, Wave ak Orange Money. Kiliyã yi mën nañu fay ci sen téléfoon bopp, xaalis bi di ñëw fite ci sa compte. Amul kénn ci biir."
      },
      {
        question: "Waqtu bu tollu ban laay am sam fay?",
        answer: "Fay bi mu ngi ñëw léegi ci sa compte Wave wala Orange Money. Xaalis bi dang koy giss fite kiliyã bi payé rek. Amul xaar."
      }
    ]
  };

  const content = {
    fr: {
      title: "Questions Fréquemment Posées",
      subtitle: "Trouvez les réponses aux questions les plus courantes des marchands Bouteek."
    },
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to the most common questions from Bouteek merchants."
    },
    wo: {
      title: "Laaj yu Bari",
      subtitle: "Seetal tontu yu bari Marcand yu Bouteek yi di laaj."
    }
  };

  const currentContent = content[language as keyof typeof content];
  const currentFAQ = faqData[language as keyof typeof faqData];

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">{currentContent.title}</h2>
          <p className="text-xl text-gray-700">{currentContent.subtitle}</p>
        </div>

        <div className="space-y-4">
          {currentFAQ.map((item, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#00FF41] transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-black text-left">{item.question}</h3>
                <ChevronDown
                  size={24}
                  className={`text-[#00FF41] flex-shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#00FF41] rounded-xl p-8 text-black text-center">
          <h3 className="text-2xl font-bold mb-4">
            {language === "fr" ? "Vous avez d'autres questions?" : "Still have questions?"}
          </h3>
          <p className="mb-6">
            {language === "fr"
              ? "Notre équipe de support est prête à vous aider. Contactez-nous à support@bouteek.com ou via WhatsApp."
              : "Our support team is ready to help. Contact us at support@bouteek.com or via WhatsApp."}
          </p>
          <a
            href="mailto:support@bouteek.com"
            className="inline-block px-8 py-3 bg-black text-[#00FF41] font-bold rounded-lg hover:bg-gray-900 transition-colors"
          >
            {language === "wo" ? "Woxal ñun" : language === "fr" ? "Nous Contacter" : "Contact Us"}
          </a>
        </div>
      </div>
    </section>
  );
}
