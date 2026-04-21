import Link from 'next/link';
import { BookOpen, Target, TrendingUp, Users, Heart, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Immersive Reading',
      description: 'Learn languages naturally through reading articles on topics you love.',
    },
    {
      icon: Target,
      title: 'Personalized Learning',
      description: 'AI-powered recommendations match articles to your exact proficiency level.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Watch your vocabulary grow and maintain learning streaks.',
    },
    {
      icon: Globe,
      title: 'Multiple Languages',
      description: 'Learn Spanish, French, German, and 8 more languages.',
    },
  ];

  const stats = [
    { number: '50,000+', label: 'Active Learners' },
    { number: '11', label: 'Languages Supported' },
    { number: '1M+', label: 'Articles Read' },
    { number: '10M+', label: 'Words Learned' },
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
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl font-bold text-dark mb-6">
            About <span className="text-orange">LinguaRead</span>
          </h1>
          <p className="text-2xl text-brown leading-relaxed">
            We believe the best way to learn a language is by reading what you love. 
            LinguaRead makes language learning natural, engaging, and effective.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-5xl font-bold text-orange mb-2">{stat.number}</p>
              <p className="text-xl text-brown font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="bg-cream rounded-2xl p-12 border-2 border-brown border-opacity-20 mb-20">
          <div className="flex items-start gap-6">
            <Heart size={48} className="text-orange flex-shrink-0" />
            <div>
              <h2 className="text-4xl font-bold text-dark mb-4">Our Mission</h2>
              <p className="text-xl text-brown leading-relaxed mb-4">
                Traditional language learning can be boring and disconnected from real-world usage. 
                We created LinguaRead to change that.
              </p>
              <p className="text-xl text-brown leading-relaxed">
                By reading articles on topics you're passionate about, you learn vocabulary in context, 
                stay motivated, and build real-world language skills. Our AI-powered platform ensures 
                every article matches your level perfectly, making learning both effective and enjoyable.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mb-20">
          <h2 className="text-4xl font-bold text-dark mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-2xl font-bold text-dark mb-3">Choose Your Language</h3>
              <p className="text-lg text-brown leading-relaxed">
                Select from 11 languages and set your proficiency level
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-2xl font-bold text-dark mb-3">Read & Learn</h3>
              <p className="text-lg text-brown leading-relaxed">
                Click words for instant translations and track your vocabulary automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-2xl font-bold text-dark mb-3">Track Progress</h3>
              <p className="text-lg text-brown leading-relaxed">
                Watch your vocabulary grow and maintain daily reading streaks
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-dark mb-12 text-center">Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-xl border-2 border-brown border-opacity-20"
              >
                <feature.icon size={40} className="text-orange mb-4" />
                <h3 className="text-2xl font-bold text-dark mb-3">{feature.title}</h3>
                <p className="text-lg text-brown leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="flex items-start gap-6 bg-white p-12 rounded-2xl border-2 border-brown border-opacity-20">
            <Users size={48} className="text-orange flex-shrink-0" />
            <div>
              <h2 className="text-4xl font-bold text-dark mb-4">Our Team</h2>
              <p className="text-xl text-brown leading-relaxed mb-4">
                LinguaRead was founded by language enthusiasts and educators who experienced 
                the frustration of traditional learning methods firsthand.
              </p>
              <p className="text-xl text-brown leading-relaxed">
                We're a small but passionate team dedicated to making language learning 
                accessible, effective, and enjoyable for everyone. Join thousands of learners 
                who are already reading their way to fluency.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-orange to-brown rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-white mb-8">Join thousands of learners reading their way to fluency</p>
          <Link href="/register">
            <Button variant="primary" size="lg" className="bg-white text-orange hover:bg-opacity-90">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
