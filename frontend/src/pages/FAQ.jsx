import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
    const [fetchedFaqs, setFetchedFaqs] = useState([]);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await api.get('/cms/faq');
                setFetchedFaqs(res.data);
            } catch (error) {
                console.error("Error fetching FAQs", error);
            }
        };
        fetchFaqs();
    }, []);

    // FAQ Data Structure (Static + Dynamic)
    const staticFaqData = [
        {
            category: "Measurements & Fitting",
            questions: [
                { q: "How do I provide measurements?", a: "You can visit our boutique for professional measurement, or use our online video guide to measure yourself at home and submit via the profile dashboard." },
                { q: "What if the measurements are incorrect?", a: "We offer one free alteration within 15 days of delivery if the fit is not perfect due to our error." },
            ]
        },
        {
            category: "Customization & Designs",
            questions: [
                { q: "Can I customize any design?", a: "Yes! All our Rajlaxmi and Peshwai designs can be customized with different fabrics, borders, and blouse styles." },
                { q: "Do you recreate sarees from photos?", a: "Absolutely. Share a photo via WhatsApp or the 'Custom Stitching' form, and our master tailor will assess functionality and cost." },
            ]
        },
        {
            category: "Shipping & Delivery",
            questions: [
                { q: "What is the delivery timeframe?", a: "Standard stitching takes 7-10 days. Express delivery (3 days) is available for an additional charge." },
                { q: "Do you ship internationally?", a: "Yes, we ship specifically to the USA, UK, and UAE. Shipping charges vary by weight and destination." },
            ]
        }
    ];

    // Merge Dynamic FAQs
    const faqData = [...staticFaqData];
    if (fetchedFaqs.length > 0) {
        // Map CMS format to UI format
        const dynamicQuestions = fetchedFaqs.map(item => ({
            q: item.question,
            a: item.content
        }));

        // Add to "General Inquiries" or append to lists
        faqData.unshift({
            category: "General Inquiries & Recent Updates",
            questions: dynamicQuestions
        });
    }

    const [openIndex, setOpenIndex] = useState(null);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="pt-4 pb-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-brand-maroon mb-4">Frequently Asked Questions</h1>
                    <p className="text-gray-600">Find answers to common questions about our stitching, shipping, and customization.</p>
                </div>

                <div className="space-y-8">
                    {faqData.map((section, catIdx) => (
                        <div key={catIdx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-brand-ivory p-4 border-b border-gray-100">
                                <h3 className="font-bold text-brand-maroon flex items-center gap-2">
                                    <HelpCircle size={18} /> {section.category}
                                </h3>
                            </div>
                            <div>
                                {section.questions.map((item, qIdx) => {
                                    const uniqueId = `${catIdx}-${qIdx}`;
                                    const isOpen = openIndex === uniqueId;

                                    return (
                                        <div key={qIdx} className="border-b border-gray-50 last:border-0">
                                            <button
                                                onClick={() => toggleAccordion(uniqueId)}
                                                className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition"
                                            >
                                                <span className={`font-medium ${isOpen ? 'text-brand-maroon' : 'text-gray-800'}`}>
                                                    {item.q}
                                                </span>
                                                {isOpen ? <ChevronUp size={20} className="text-brand-maroon" /> : <ChevronDown size={20} className="text-gray-400" />}
                                            </button>

                                            {isOpen && (
                                                <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-fadeIn">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12 bg-brand-maroon/5 p-8 rounded-xl">
                    <p className="text-gray-800 font-medium mb-4">Still have questions?</p>
                    <a href="/contact" className="inline-block bg-brand-maroon text-white px-6 py-2 rounded-full hover:bg-red-900 transition"> Contact Support </a>
                </div>

            </div>
        </div>
    );
};

export default FAQ;
