import { useTheme } from '../contexts/ThemeContext';

interface PrivacyPageProps {
  onNavigate: (page: string) => void;
}

export default function PrivacyPolicy({ onNavigate }: PrivacyPageProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`font-display text-4xl sm:text-5xl font-semibold mb-8 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
          Politique de <span className="text-gold">Confidentialité</span>
        </h1>

        <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              1. Collecte des données personnelles
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Kongo Kama collecte les données personnelles suivantes lors de l'inscription sur la plateforme :
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <li>Nom complet</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone (pour les paiements Mobile Money)</li>
            </ul>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Ces données sont collectées uniquement dans le cadre de l'utilisation de nos services éducatifs 
              et sont nécessaires pour la gestion de votre compte et de vos inscriptions aux cours.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              2. Utilisation des données
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Les données personnelles collectées sont utilisées pour :
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <li>La création et la gestion de votre compte utilisateur</li>
              <li>Le traitement de vos inscriptions aux cours et formations</li>
              <li>La validation des paiements et l'accès aux contenus</li>
              <li>La communication avec vous concernant nos services</li>
              <li>L'amélioration de notre plateforme et de nos contenus</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              3. Protection des données
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Kongo Kama s'engage à protéger vos données personnelles. Nous utilisons des mesures de sécurité 
              techniques et organisationnelles appropriées pour prévenir tout accès non autorisé, modification, 
              divulgation ou destruction de vos données.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Votre mot de passe est chiffré et ne peut pas être lu en clair par nos équipes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              4. Partage des données
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Kongo Kama ne vend, ne loue ni ne partage vos données personnelles avec des tiers, sauf dans 
              les cas suivants :
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <li>Avec votre consentement explicite</li>
              <li>Pour le traitement des paiements (informations nécessaires aux opérateurs Mobile Money)</li>
              <li>Pour respecter une obligation légale ou réglementaire</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              5. Durée de conservation
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Vos données personnelles sont conservées aussi longtemps que votre compte est actif. Vous pouvez 
              demander la suppression de votre compte à tout moment en nous contactant.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              6. Vos droits
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Conformément à la réglementation en vigueur, vous disposez des droits suivants :
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à la suppression de vos données</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement de vos données</li>
            </ul>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Pour exercer ces droits, vous pouvez nous contacter via WhatsApp au +242 069 254 550 ou par email 
              à contact@kongokama.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              7. Cookies
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Le site utilise des cookies pour améliorer votre expérience utilisateur, notamment pour la 
              sauvegarde de vos préférences (thème clair/sombre) et la gestion de votre session de connexion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              8. Modification de la politique
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Kongo Kama se réserve le droit de modifier cette politique de confidentialité à tout moment. 
              Toute modification sera publiée sur cette page avec la date de mise à jour.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              9. Contact
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Pour toute question relative à cette politique de confidentialité, vous pouvez nous contacter :
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <li>WhatsApp : +242 069 254 550</li>
              <li>Email : kongokama0@gmail.com</li>
            </ul>
          </section>

          <p className={`text-sm italic mt-8 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            Dernière mise à jour : Juillet 2026
          </p>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-all hover:-translate-y-0.5"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
