import React from 'react';
import { SubscriptionPlan } from '../types';

interface SubscriptionScreenProps {
  onBack: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onBack, onSelectPlan }) => {
  return (
    <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in">
      <header className="bg-base-100 dark:bg-dark-base-100 shadow-md sticky top-0 z-10">
        <div className="container mx-auto p-4 flex items-center">
          <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
        </div>
      </header>
      <main className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-base-content dark:text-dark-base-content">GoMarket Subscription Plans</h2>
          <p className="text-base-content/70 dark:text-dark-base-content/70 mt-2">Choose the plan that fits your business</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Free Plan */}
          <div className="bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-md p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-base-content dark:text-dark-base-content">Free (Starter)</h3>
            <p className="text-4xl font-bold text-base-content dark:text-dark-base-content mt-4">R0<span className="text-lg font-normal">/month</span></p>
            <ul className="mt-6 space-y-3 text-base-content/80 dark:text-dark-base-content/80 flex-1">
              <li><span className="text-green-500 mr-2">✔</span> Up to 10 product listings</li>
              <li><span className="text-green-500 mr-2">✔</span> Standard commission per order</li>
              <li><span className="text-green-500 mr-2">✔</span> Basic marketplace tools</li>
            </ul>
            <button className="mt-6 bg-base-200 dark:bg-dark-base-300 text-base-content/70 dark:text-dark-base-content/70 font-semibold py-2 px-4 rounded-xl cursor-default" disabled>Your Current Plan</button>
          </div>

          {/* Pro Plan */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-500 rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300">Pro Plan</h3>
              <span className="bg-yellow-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">Most Popular</span>
            </div>
            <p className="text-4xl font-bold text-yellow-900 dark:text-yellow-200 mt-4">R50<span className="text-lg font-normal">/month</span></p>
            <ul className="mt-6 space-y-3 text-yellow-800 dark:text-yellow-300 flex-1">
              <li><span className="text-yellow-600 dark:text-yellow-400 mr-2">✔</span> Unlimited product listings</li>
              <li><span className="text-yellow-600 dark:text-yellow-400 mr-2">✔</span> Reduced commission fees</li>
              <li><span className="text-yellow-600 dark:text-yellow-400 mr-2">✔</span> Featured in search results</li>
              <li><span className="text-yellow-600 dark:text-yellow-400 mr-2">✔</span> Vendor analytics & reports</li>
            </ul>
            <button onClick={() => onSelectPlan(SubscriptionPlan.PRO)} className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-xl transition-colors">Choose Pro</button>
          </div>

          {/* Premier Plan */}
          <div className="bg-base-100 dark:bg-dark-base-100 rounded-2xl shadow-md p-6 flex flex-col">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-base-content dark:text-dark-base-content">Premier Plan</h3>
                <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Best Value</span>
              </div>
            <p className="text-4xl font-bold text-base-content dark:text-dark-base-content mt-4">R150<span className="text-lg font-normal">/month</span></p>
            <ul className="mt-6 space-y-3 text-base-content/80 dark:text-dark-base-content/80 flex-1">
              <li><span className="text-green-500 mr-2">✔</span> Unlimited product listings</li>
              <li><span className="text-green-500 mr-2">✔</span> Lowest commission fees</li>
              <li><span className="text-green-500 mr-2">✔</span> Premium homepage visibility</li>
              <li><span className="text-green-500 mr-2">✔</span> Dedicated vendor support</li>
              <li><span className="text-green-500 mr-2">✔</span> Early access to new features</li>
            </ul>
            <button onClick={() => onSelectPlan(SubscriptionPlan.PREMIER)} className="mt-6 bg-neutral hover:bg-neutral-focus text-primary-content font-semibold py-2 px-4 rounded-xl transition-colors">Choose Premier</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionScreen;