import React, { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import { Scissors, Ruler, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

// Import Assets
import fabricTexture from '../assets/fabric_texture.png';
import paisleyBorder from '../assets/paisley_border.png';
import sareeSketch from '../assets/saree_sketch.png';


// Hero Section Component
const Hero = () => {
    const { t } = useTranslation();

    return (
        <div className="relative py-12 lg:py-16 overflow-hidden">
            {/* Texture Background Overlay */}
            <div
                className="absolute inset-0 opacity-40 z-0 pointer-events-none mix-blend-multiply"
                style={{
                    backgroundImage: `url(${fabricTexture})`,
                    backgroundSize: '400px'
                }}
            ></div>

            {/* Paisley Border Top */}
            <div className="absolute top-0 left-0 w-full h-10 opacity-30 z-10 pointer-events-none"
                style={{ backgroundImage: `url(${paisleyBorder})`, backgroundSize: 'contain', backgroundRepeat: 'repeat-x' }}>
            </div>

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-20">
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl font-serif font-semibold text-brand-maroon mb-5 leading-snug">
                        {t('hero.title')} <br />
                        <span className="text-brand-teal italic">{t('hero.name')}</span>
                    </h1>
                    <p className="text-lg text-brand-charcoal mb-8 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">
                        {t('hero.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button className="bg-brand-maroon text-white px-8 py-3 rounded-xl text-lg font-medium shadow-xl hover:bg-red-900 transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            {t('hero.ctaExplore')}
                        </button>
                        <button className="bg-brand-maroon text-white px-8 py-3 rounded-xl text-lg font-medium shadow-xl hover:bg-red-900 transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            {t('hero.ctaCustom')}
                        </button>
                    </div>
                    <span className="font-bold tracking-widest uppercase mt-20  mb-4 block text-lg md:text-xl" style={{ color: "#98349aff" }}>
                        {t('brand.since')}
                    </span>

                </div>

                {/* Illustration Side */}
                <div className="md:w-1/2 mt-10 md:mt-0 relative flex justify-center transform -translate-y-6">
                    <div className="relative w-80 h-[28rem] md:w-96 md:h-[32rem] bg-brand-ivory rounded-t-full rounded-b-xl shadow-2xl overflow-hidden border-4 border-brand-gold/30 p-4">
                        <img src={sareeSketch} alt="Traditional Saree Sketch" className="w-full h-full object-cover rounded-t-full rounded-b-lg opacity-90 sepia-[.2] hover:scale-105 transition duration-700" />

                        <div className="absolute bottom-4 left-0 w-full text-center">
                            <div className="bg-white/80 backdrop-blur px-4 py-2 mx-auto inline-block rounded-lg shadow-sm border border-brand-gold/20">
                                <p className="font-serif text-brand-maroon italic text-sm">{t('hero.designLabel')} <b>{t('hero.name')}</b></p>
                            </div>
                        </div>
                    </div>

                    {/* Floating Decorative Elements */}
                    {/* <div className="absolute -z-10 top-10 right-10 w-64 h-64 bg-brand-gold rounded-full opacity-10 blur-3xl"></div> */}
                    {/* <div className="absolute -z-10 bottom-10 left-10 w-72 h-72 bg-brand-teal rounded-full opacity-10 blur-3xl"></div> */}
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border-b-4 border-brand-gold/50 group">
        <div className="w-14 h-14 bg-brand-beige rounded-full flex items-center justify-center mb-6 text-brand-maroon group-hover:bg-brand-maroon group-hover:text-white transition duration-300">
            <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h3 className="text-xl font-serif font-bold mb-3 text-brand-maroon">{title}</h3>
        <p className="text-brand-charcoal leading-relaxed">{description}</p>
    </div>
);

const Home = () => {
    const { t } = useTranslation();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await api.get('/cms/testimonial');
                setTestimonials(res.data);
            } catch (error) {
                console.error("Error fetching testimonials", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    return (
        <>
            <Hero />

            {/* Features Section */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-maroon mb-4">{t('features.title')}</h2>
                        <div className="w-32 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="max-w-2xl mx-auto text-brand-charcoal/80">
                            {t('features.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Ruler}
                            title={t('features.fit.title')}
                            description={t('features.fit.desc')}
                        />
                        <FeatureCard
                            icon={Scissors}
                            title={t('features.authentic.title')}
                            description={t('features.authentic.desc')}
                        />
                        <FeatureCard
                            icon={Award}
                            title={t('features.craftsmanship.title')}
                            description={t('features.craftsmanship.desc')}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-brand-ivory/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-maroon mb-4">{t('home.howItWorks.title') || "How It Works"}</h2>
                        <p className="text-gray-600">{t('home.howItWorks.subtitle') || "Your journey to the perfect outfit in 5 simple steps."}</p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center relative space-y-8 md:space-y-0">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-brand-gold/30 -z-10 transform -translate-y-1/2"></div>

                        {[
                            { num: 1, title: "Browse", desc: "Explore designs" },
                            { num: 2, title: "Select", desc: "Choose favorites" },
                            { num: 3, title: "Measure", desc: "Submit details" },
                            { num: 4, title: "Create", desc: "We craft it" },
                            { num: 5, title: "Deliver", desc: "To your door" }
                        ].map((step, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border border-brand-gold/20 w-48 text-center relative hover:-translate-y-2 transition duration-300">
                                <div className="w-10 h-10 bg-brand-maroon text-white font-bold rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                                    {step.num}
                                </div>
                                <h3 className="font-bold text-brand-maroon text-lg">{step.title}</h3>
                                <p className="text-sm text-gray-500">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-brand-maroon text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-4 relative z-10 overflow-hidden">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-16 text-brand-gold">Customer Reviews</h2>

                    {loading ? (
                        <p className="text-center text-brand-beige/50">Loading reviews...</p>
                    ) : testimonials.length > 0 ? (
                        <div className="flex w-[200%] animate-scroll hover:pause">
                            {[...testimonials, ...testimonials].map((testi, idx) => (
                                <div key={idx} className="w-[300px] md:w-[400px] flex-shrink-0 mx-4 bg-white/10 backdrop-blur p-8 rounded-xl border border-white/20 hover:bg-white/20 transition cursor-default">
                                    <div className="text-brand-gold text-4xl font-serif mb-4">"</div>
                                    <p className="text-lg italic mb-6 font-light text-white leading-relaxed line-clamp-3">
                                        "{testi.content}"
                                    </p>
                                    <div>
                                        <h4 className="font-bold text-xl text-brand-beige">{testi.author}</h4>
                                        <span className="text-sm text-brand-gold uppercase tracking-wider">{testi.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-brand-beige/70 text-lg italic mb-4">No reviews yet.</p>
                            <p className="text-white/60">Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ Quick Links */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-3xl font-serif font-bold text-brand-maroon mb-8">Have Questions?</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-10">
                        <a href="/faq" className="block p-4 border border-gray-200 rounded-lg hover:border-brand-maroon hover:bg-red-50 transition text-left">
                            <h4 className="font-bold text-gray-800 mb-1">How do I measure?</h4>
                            <p className="text-sm text-gray-500">View our video guide for home measurements.</p>
                        </a>
                        <a href="/faq" className="block p-4 border border-gray-200 rounded-lg hover:border-brand-maroon hover:bg-red-50 transition text-left">
                            <h4 className="font-bold text-gray-800 mb-1">Delivery Timeframes?</h4>
                            <p className="text-sm text-gray-500">Standard delivery is 7-10 days.</p>
                        </a>
                    </div>
                    <a href="/faq" className="text-brand-maroon font-bold hover:underline">View All FAQs &rarr;</a>
                </div>
            </section>

        </>
    );
};

export default Home;
