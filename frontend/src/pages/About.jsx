import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, Clock, Users, Award } from 'lucide-react';
import aaiImage from '../assets/aai.jpeg';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="pt-4 pb-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">

                {/* Hero Section */}
                <div className="text-left mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-maroon mb-6">Weaving Tradition Since 2004</h1>
                    <span className="text-center text-brand-gold font-bold tracking-widest uppercase mb-2 block">Our Heritage</span>
                    <p className="text-center max-w-5xl mx-auto text-brand-charcoal text-lg">
                        At Mahalaxmi Tailors, we don't just stitch clothes; we craft heirlooms. Specialized in authentic Maharashtrian attire, we bring decades of mastery to every fold and stitch.
                    </p>
                </div>

                {/* Story Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-maroon transform translate-x-4 translate-y-4 rounded-xl opacity-10"></div>
                        <img
                            src={aaiImage}
                            alt="Master Tailor at work"
                            className="relative rounded-xl shadow-lg w-full h-96 object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-brand-maroon mb-8">The Master Tailor's Touch</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Founded by {t('hero.name')}, Mahalaxmi Tailors began as a small boutique in Mangrulpir with a singular vision: to preserve the elegance of the traditional Patals while adapting it for the modern woman.
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Over the years, we have served over 5,000 satisfied customers, earning recognition for our precision, culturally accurate styling, and ability to customize designs that flatter every silhouette.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Award className="text-brand-gold shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-800">Award Winning</h4>
                                    <p className="text-sm text-gray-500">Recognized for excellence in ethnic wear.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="text-brand-gold shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-800">Expert Team</h4>
                                    <p className="text-sm text-gray-500">Dedicated artisans & designers with 20+ years exp.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Steps */}
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-brand-gold/20 mb-16">
                    <h2 className="text-3xl font-serif font-bold text-brand-maroon mb-12 text-center">Our Crafting Process</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: Scissors, title: "1. Consultation", desc: "We discuss your style preferences and event needs." },
                            { icon: Ruler, title: "2. Measurement", desc: "Precise body measurements for a flawless fit." },
                            { icon: Clock, title: "3. Crafting", desc: "Meticulous cutting and stitching by experts." },
                            { icon: Award, title: "4. Final Fitting", desc: "Ensuring every detail is perfect before delivery." }
                        ].map((step, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-16 h-16 bg-brand-ivory rounded-full mx-auto mb-4 flex items-center justify-center text-brand-maroon group-hover:bg-brand-maroon group-hover:text-white transition">
                                    <step.icon size={32} />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-500">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Import helper
import { Ruler } from 'lucide-react';

export default About;
