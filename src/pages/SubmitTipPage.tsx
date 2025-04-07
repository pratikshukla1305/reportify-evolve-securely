
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TipForm from '@/components/helpus/TipForm';

const SubmitTipPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Submit a Tip About a Wanted Individual
            </h1>
            <p className="text-gray-600 mb-8">
              Your information will be securely transmitted to law enforcement. You may choose to remain anonymous.
            </p>
            
            <TipForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubmitTipPage;
