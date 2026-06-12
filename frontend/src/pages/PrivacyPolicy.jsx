import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold text-brand-maroon mb-8">Privacy Policy</h1>

                <div className="bg-white p-8 rounded-xl shadow-sm space-y-6 text-gray-700 leading-relaxed">
                    <p className="italic text-sm text-gray-500">Last Updated: December 2025</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">1. Introduction</h2>
                        <p>Welcome to Mahalxmi Tailors. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">2. Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li><strong>Identity Data:</strong> First name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> Billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Measurement Data:</strong> Custom measurements and fit preferences provided for tailoring services.</li>
                            <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>To process and deliver your order.</li>
                            <li>To manage your relationship with us.</li>
                            <li>To improve our website, products/services, marketing and customer relationships.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">4. Data Security</h2>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. Your payment information is processed securely via Razorpay and is never stored on our servers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">5. Your Rights</h2>
                        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
