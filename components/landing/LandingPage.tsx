'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { trackHeaderNavClick, trackCTAClick, trackAppOpened, trackFeedbackSubmitted } from '@/lib/posthog';

export const LandingPage = () => {
  const router = useRouter();
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedbackOrigin, setFeedbackOrigin] = useState<'landing_page' | 'footer'>('landing_page');

  const handleEnterApp = () => {
    trackAppOpened();
    router.push('/application');
  };

  const scrollToSection = (sectionId: string) => {
    trackHeaderNavClick(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    try {
      await api.submitFeedback({
        origin: feedbackOrigin,
        feedback_text: feedbackText.trim(),
      });
      trackFeedbackSubmitted(feedbackOrigin, undefined, !!feedbackText.trim());
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedbackText('');
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedbackText('');
      }, 3000);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gray-900">EPI</span>
              <span className="text-gray-500 font-light italic">Assist</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('why')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">De ce EPIAssist?</button>
            <button onClick={() => scrollToSection('documents')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Documente disponibile</button>
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Despre noi</button>
            <button onClick={() => scrollToSection('footer')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Contact</button>
            <button onClick={() => scrollToSection('feedback')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Feedback</button>
            <button
              onClick={() => { trackCTAClick('header'); handleEnterApp(); }}
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark active:bg-[#5E2916] transition-colors shadow-sm"
            >
              Deschide legislația
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-white shadow-2xl z-50 md:hidden animate-slide-in">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Meniu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-600" aria-label="Close menu">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-4">
                <button onClick={() => scrollToSection('why')} className="block w-full text-left text-base font-medium text-gray-600 hover:text-primary py-2">De ce EPIAssist?</button>
                <button onClick={() => scrollToSection('documents')} className="block w-full text-left text-base font-medium text-gray-600 hover:text-primary py-2">Documente disponibile</button>
                <button onClick={() => scrollToSection('about')} className="block w-full text-left text-base font-medium text-gray-600 hover:text-primary py-2">Despre noi</button>
                <button onClick={() => scrollToSection('footer')} className="block w-full text-left text-base font-medium text-gray-600 hover:text-primary py-2">Contact</button>
                <button onClick={() => scrollToSection('feedback')} className="block w-full text-left text-base font-medium text-gray-600 hover:text-primary py-2">Feedback</button>
                <button
                  onClick={() => { trackCTAClick('mobile_menu'); setIsMobileMenuOpen(false); handleEnterApp(); }}
                  className="block w-full px-5 py-3 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary-dark active:bg-[#5E2916] transition-colors shadow-sm mt-4"
                >
                  Deschide legislația
                </button>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section className="min-h-screen pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bg-warm-light to-white flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-primary italic">Legislația medicală</span>
                <br />
                <span className="text-gray-900">într-un singur loc</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                Curat, organizat, ușor de navigat și cu asistență AI.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Accesează cu ușurință ordinele de care ai nevoie: <strong>Ordin Nr. 1101/2016</strong>, <strong>Nr. 1761/2021</strong>, <strong>Nr. 428/2020</strong>, <strong>Nr. 914/2006</strong> și altele. Toate într-un singur loc, formatate uniform, cu anexă pentru navigare rapidă și asistență AI.
              </p>
              <button
                onClick={() => { trackCTAClick('hero'); handleEnterApp(); }}
                className="px-8 py-3 sm:px-10 sm:py-4 bg-primary text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-primary-dark active:bg-[#5E2916] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Deschide legislația &rarr;
              </button>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-primary/20">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Ne-ar plăcea să ne spuneți părerea
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Acesta este un proiect încă în dezvoltare. Dacă vă place și considerați că vă este de folos, vă rugăm să ne spuneți părerea dumneavoastră. <strong>Ce vă place? Ce nu vă place? Ce poate fi îmbunătățit?</strong> Ne-ar fi de mare ajutor pentru a putea livra un produs de calitate. Vă mulțumim!
              </p>
              <form onSubmit={(e) => { setFeedbackOrigin('landing_page'); handleFeedbackSubmit(e); }} className="space-y-3 sm:space-y-4">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Scrieți aici feedback-ul dumneavoastră..."
                  className="w-full h-28 sm:h-32 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                  disabled={feedbackSubmitted}
                />
                <button
                  type="submit"
                  disabled={!feedbackText.trim() || feedbackSubmitted}
                  className="w-full px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:bg-[#5E2916] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {feedbackSubmitted ? 'Mulțumim pentru feedback!' : 'Trimite feedback'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Why EPIAssist Section */}
      <section id="why" className="min-h-screen py-12 sm:py-16 lg:py-0 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-bg-warm-light flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              De ce <span className="text-primary">EPI</span><span className="text-gray-500 italic">Assist</span>?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border-2 border-gray-200">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">&#10060;</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Înainte</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4 text-gray-700">
                {[
                  'Documentele erau în PDF pe calculator și telefon',
                  'Rătăcite și greu de găsit când aveai nevoie urgentă',
                  'Neuniform formatate și dificil de citit',
                  'Navigare complicată prin documente lungi',
                  'Timp pierdut la interpretarea textelor legale',
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm sm:text-base lg:text-lg">
                    <span className="text-red-500 mr-2 sm:mr-3 mt-1 text-lg sm:text-xl flex-shrink-0">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border-2 border-primary">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">&#10003;</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Acum cu EPIAssist</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4 text-white">
                {[
                  { bold: 'Aceleași documente oficiale', rest: ' - surse verificate' },
                  { bold: 'La un loc', rest: ' - toate într-o singură platformă' },
                  { bold: 'Curat', rest: ' - formatare uniformă și profesională' },
                  { bold: 'Ușor de navigat', rest: ' - cuprins interactiv generat automat' },
                  { bold: 'Asistență AI', rest: ' - răspunsuri instant bazate pe legislație' },
                  { bold: 'Acces de oriunde', rest: ' - web, telefon, tabletă, desktop' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm sm:text-base lg:text-lg">
                    <span className="mr-2 sm:mr-3 mt-1 text-lg sm:text-xl flex-shrink-0">&#10003;</span>
                    <span><strong>{item.bold}</strong>{item.rest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section id="documents" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Documente Disponibile</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">Acces instant la ordine și legi esențiale pentru practica medicală</p>
          </div>

          <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10 lg:mb-12">
            <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-lg border-2 border-primary/20">
              <img src="/screenshots/desktop-screenshot.png" alt="Interfață EPIAssist pe Desktop" className="w-full h-auto object-cover" />
            </div>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-lg border-2 border-primary/20">
                <img src="/screenshots/mobile-screenshot-1.png" alt="EPIAssist pe telefon - Vizualizare document" className="w-full h-auto object-cover" />
              </div>
              <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-lg border-2 border-primary/20">
                <img src="/screenshots/mobile-screenshot-2.png" alt="EPIAssist pe telefon - Asistent AI" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-bg-warm-light to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-primary/20 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Ordine și Legi Incluse</h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {[
                { num: '1', name: 'ORDIN Nr. 1101/2016' },
                { num: '2', name: 'ORDIN Nr. 1761/2021' },
                { num: '3', name: 'ORDIN Nr. 428/2020' },
                { num: '4', name: 'ORDIN Nr. 914/2006' },
              ].map((doc) => (
                <div key={doc.num} className="flex items-center space-x-2 sm:space-x-3 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-primary/20">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm sm:text-base">{doc.num}</span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">{doc.name}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm sm:text-base text-gray-600 mt-4 sm:mt-6 px-4">
              + multe alte documente legislative esențiale pentru medicina din România
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bg-warm-light to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Despre Noi</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">Doi tineri profesioniști români care au văzut o problemă și au creat soluția</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                EPI Assist a pornit dintr-o nevoie reală identificată în practica medicală zilnică. Medicii rezidenți și specialiștii se confruntă constant cu necesitatea de a consulta rapid diferite ordine și legi, dar documentele oficiale sunt greu de accesat, formatate neuniform și dificil de navigat, mai ales pe dispozitive mobile.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                Combinând experiența medicală cu expertiza tehnologică, am creat o platformă care transformă aceste documente în resurse ușor accesibile, cu navigare inteligentă și asistență AI pentru interpretare rapidă.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                <strong>Scopul nostru</strong> este să economisim timpul medicilor și să îmbunătățim accesul la informație în sistemul medical românesc.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border-2 border-primary/20 text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Dr. Lucian Boghian</h3>
                <p className="text-primary font-medium text-xs sm:text-sm mb-1 sm:mb-2">Medic Rezident</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Rezident Epidemiologie<br/>Doctorand în Științe Medicale</p>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border-2 border-[#6A5E3E]/20 text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#6A5E3E] to-[#5E2916] rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Andrei Bălan</h3>
                <p className="text-[#6A5E3E] font-medium text-xs sm:text-sm mb-1 sm:mb-2">Software Engineer</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Absolvent FII UAIC<br/>Specialist Web & AI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-bg-warm-light to-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 border-2 border-primary/20">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Spuneți-ne părerea dumneavoastră
              </h2>
              <p className="text-base sm:text-lg text-gray-600 px-4">
                Feedback-ul vostru ne ajută să îmbunătățim platforma pentru toți medicii din România
              </p>
            </div>
            <form onSubmit={(e) => { setFeedbackOrigin('footer'); handleFeedbackSubmit(e); }} className="space-y-3 sm:space-y-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Ce vă place? Ce nu vă place? Ce poate fi îmbunătățit?"
                className="w-full h-32 sm:h-40 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                disabled={feedbackSubmitted}
              />
              <button
                type="submit"
                disabled={!feedbackText.trim() || feedbackSubmitted}
                className="w-full px-6 py-3 sm:px-8 sm:py-4 bg-primary text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-primary-dark active:bg-[#5E2916] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
              >
                {feedbackSubmitted ? 'Mulțumim pentru feedback!' : 'Trimite feedback'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Gata să Începi?</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Accesează instant legislația medicală de care ai nevoie. Fără înregistrare, fără costuri ascunse.
          </p>
          <button
            onClick={() => { trackCTAClick('cta_section'); handleEnterApp(); }}
            className="px-8 py-3 sm:px-10 sm:py-4 lg:py-5 bg-white text-primary text-base sm:text-lg font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all shadow-2xl transform hover:scale-105"
          >
            Deschide legislația &rarr;
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-[#5E2916] text-gray-300 py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg"></div>
                <span className="text-lg sm:text-xl font-bold text-white">EPI<span className="font-light italic">Assist</span></span>
              </div>
              <p className="text-xs sm:text-sm">Legislația medicală la îndemână pentru toți medicii din România.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Contact</h4>
              <p className="text-xs sm:text-sm mb-1">Email: contact@epiassist.ro</p>
              <p className="text-xs sm:text-sm">Iași, România</p>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Legal</h4>
              <p className="text-xs sm:text-sm mb-1">&copy; 2024 EPI Assist</p>
              <p className="text-xs sm:text-sm">Toate drepturile rezervate</p>
            </div>
          </div>
          <div className="border-t border-primary/30 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>Creat cu dragoste pentru medicii din România de Dr. Lucian Boghian și Andrei Bălan</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
