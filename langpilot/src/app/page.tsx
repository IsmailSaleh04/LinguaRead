"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { BookOpen, TrendingUp, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b-2 border-brown border-opacity-20">
        <div className="max-w-7xl mx-auto px-3 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen size={32} className="text-orange" />
            <h1 className="text-2xl font-bold text-dark">LinguaRead</h1>
          </div>
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
        <div className="text-center max-w-4xl mx-auto mb-15">
          <h2 className="text-6xl font-bold text-dark mb-6 leading-tight">
            Learn Languages by <span className="text-orange">Reading</span>
          </h2>
          <p className="text-xl text-brown mb-10 leading-relaxed">
            Master new languages through immersive reading. Track your
            vocabulary, discover articles at your level, and watch your progress
            grow.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border-2 border-brown border-opacity-20">
            <div className="mb-4">
              <BookOpen size={40} className="text-orange" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-3">
              Smart Articles
            </h3>
            <p className="text-brown text-lg leading-relaxed">
              Read articles perfectly matched to your level with instant word
              translations
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border-2 border-brown border-opacity-20">
            <div className="mb-4">
              <TrendingUp size={40} className="text-orange" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-3">
              Track Progress
            </h3>
            <p className="text-brown text-lg leading-relaxed">
              Watch your vocabulary grow and maintain learning streaks
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border-2 border-brown border-opacity-20">
            <div className="mb-4">
              <Target size={40} className="text-orange" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-3">Personalized</h3>
            <p className="text-brown text-lg leading-relaxed">
              AI-powered recommendations based on your interests and level
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
