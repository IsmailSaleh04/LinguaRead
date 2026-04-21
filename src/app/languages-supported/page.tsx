import Link from 'next/link';
import { BookOpen, Globe, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export default function SupportedLanguagesPage() {
  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English', 
      flag: '🇬🇧',
      speakers: '1.5 billion',
      articles: '6.7 million',
    },
    { 
      code: 'es', 
      name: 'Spanish', 
      nativeName: 'Español', 
      flag: '🇪🇸',
      speakers: '559 million',
      articles: '1.8 million',
    },
    { 
      code: 'fr', 
      name: 'French', 
      nativeName: 'Français', 
      flag: '🇫🇷',
      speakers: '280 million',
      articles: '2.5 million',
    },
    { 
      code: 'de', 
      name: 'German', 
      nativeName: 'Deutsch', 
      flag: '🇩🇪',
      speakers: '134 million',
      articles: '2.7 million',
    },
    { 
      code: 'it', 
      name: 'Italian', 
      nativeName: 'Italiano', 
      flag: '🇮🇹',
      speakers: '85 million',
      articles: '1.7 million',
    },
    { 
      code: 'pt', 
      name: 'Portuguese', 
      nativeName: 'Português', 
      flag: '🇵🇹',
      speakers: '264 million',
      articles: '1.1 million',
    },
    { 
      code: 'ru', 
      name: 'Russian', 
      nativeName: 'Русский', 
      flag: '🇷🇺',
      speakers: '258 million',
      articles: '1.9 million',
    },
    { 
      code: 'zh', 
      name: 'Chinese', 
      nativeName: '中文', 
      flag: '🇨🇳',
      speakers: '1.3 billion',
      articles: '1.3 million',
    },
    { 
      code: 'ja', 
      name: 'Japanese', 
      nativeName: '日本語', 
      flag: '🇯🇵',
      speakers: '125 million',
      articles: '1.3 million',
    },
    { 
      code: 'ko', 
      name: 'Korean', 
      nativeName: '한국어', 
      flag: '🇰🇷',
      speakers: '81 million',
      articles: '600k',
    },
    { 
      code: 'ar', 
      name: 'Arabic', 
      nativeName: 'العربية', 
      flag: '🇸🇦',
      speakers: '422 million',
      articles: '1.2 million',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b-2 border-brown border-opacity-20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <BookOpen size={32} className="text-orange" />
            <span className="text-2xl font-bold text-dark">LinguaRead</span>
          </Link>
          <Link href="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Globe size={64} className="text-orange mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-dark mb-4">Supported Languages</h1>
          <p className="text-2xl text-brown">
            Learn from millions of articles in 11 different languages
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20 hover:border-orange hover:shadow-lg transition-all"
            >
              <div className="text-6xl mb-4">{lang.flag}</div>
              <h3 className="text-3xl font-bold text-dark mb-2">{lang.name}</h3>
              <p className="text-xl text-brown mb-4">{lang.nativeName}</p>
              
              <div className="space-y-2 text-brown font-semibold">
                <p className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-orange" />
                  {lang.speakers} speakers worldwide
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-orange" />
                  {lang.articles} Wikipedia articles
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-cream rounded-2xl p-12 border-2 border-brown border-opacity-20">
          <h2 className="text-3xl font-bold text-dark mb-4">Don't see your language?</h2>
          <p className="text-xl text-brown mb-6">
            We're constantly adding new languages. Let us know which language you'd like to learn!
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg">Request a Language</Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
