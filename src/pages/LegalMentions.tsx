import { useTheme } from '../contexts/ThemeContext';

interface LegalPageProps {
  onNavigate: (page: string) => void;
}

export default function LegalMentions({ onNavigate }: LegalPageProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
          Mentions Légales
        </h1>

        <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              1. Éditeur du site
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Le site <strong className="text-amber-500">KongoKama.com</strong> est édité par l'organisation Kongo Kama, 
              école d'enseignement de la Kongologie, de la langue Kikongo et de la spiritualité ancestrale Kongo.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <strong className={isDark ? 'text-stone-100' : 'text-stone-800'}>Responsable de la publication :</strong> Mbuta Sita Toma, 
              fondateur et instructeur principal de Kongo Kama.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              2. Hébergement
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Le site est hébergé par <strong className="text-amber-500">Netlify, Inc.</strong>, situé aux États-Unis. 
              La base de données est hébergée par <strong className="text-amber-500">Supabase</strong> (service de base de données PostgreSQL).
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              3. Propriété intellectuelle
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              L'ensemble du contenu présent sur le site KongoKama.com (textes, images, vidéos, audio, logos, icônes) 
              est la propriété exclusive de Kongo Kama et de Mbuta Sita Toma, sauf mention contraire.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents 
              éléments est strictement interdite sans l'accord écrit préalable de Kongo Kama.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              4. Limitation de responsabilité
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Kongo Kama s'efforce d'assurer l'exactitude des informations diffusées sur le site, mais ne peut 
              garantir l'absence d'erreurs ou d'omissions.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Les informations fournies sont à titre indicatif et ne constituent pas un conseil personnalisé. 
              L'utilisation des informations du site se fait sous la responsabilité exclusive de l'utilisateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              5. Liens hypertextes
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Le site peut contenir des liens vers d'autres sites internet. Kongo Kama n'exerce aucun contrôle 
              sur le contenu de ces sites externes et décline toute responsabilité quant à leur contenu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              6. Contact
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter via :
            </p>
            <ul className={`list-disc list-inside space-y-2 mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <li>WhatsApp : +242 069 254 550</li>
              <li>Email : kongokama0@gmail.com</li>
            </ul>
          </section>
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
