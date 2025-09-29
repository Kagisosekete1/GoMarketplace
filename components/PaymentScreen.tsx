import React, { useState, useMemo } from 'react';
import { SubscriptionPlan, User } from '../types';
import Spinner from './common/Spinner';

interface PaymentScreenProps {
  plan: SubscriptionPlan;
  user: User;
  onBack: () => void;
  onPaymentSuccess: () => void;
}

const planDetails = {
    [SubscriptionPlan.PRO]: {
        price: 600,
        name: 'GoMarket Pro'
    },
    [SubscriptionPlan.PREMIER]: {
        price: 1800,
        name: 'GoMarket Premier'
    },
    [SubscriptionPlan.FREE]: {
        price: 0,
        name: 'GoMarket Free'
    }
};

const TAX_RATE = 0.15; // 15% mock tax

const PaymentScreen: React.FC<PaymentScreenProps> = ({ plan, user, onBack, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showManualPayment, setShowManualPayment] = useState(false);

    const { name, price } = planDetails[plan];
    const userEmail = `${user.username}@example.com`;

    const priceDetails = useMemo(() => {
        const subtotal = price;
        const currentDiscount = subtotal * discount;
        const taxableAmount = subtotal - currentDiscount;
        const tax = taxableAmount * TAX_RATE;
        const total = taxableAmount + tax;
        return { subtotal, currentDiscount, tax, total };
    }, [price, discount]);

    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === 'SAVE20') {
            setDiscount(0.20); // 20% discount
        } else {
            alert('Invalid promotion code.');
        }
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                onPaymentSuccess();
            }, 2500);
        }, 2000);
    };

    const inputClasses = "w-full px-3 py-2 bg-base-200 dark:bg-dark-base-200 border border-base-300 dark:border-dark-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

    return (
        <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 animate-fade-in">
            <header className="bg-base-100 dark:bg-dark-base-100 shadow-md sticky top-0 z-10">
                <div className="container mx-auto p-4 flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors" aria-label="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">Checkout</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-lg">
                <div className="bg-base-100 dark:bg-dark-base-100 p-6 md:p-8 rounded-lg shadow-xl">
                    {isSuccess ? (
                        <div className="text-center py-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-success mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                            <p className="text-base-content/70 dark:text-dark-base-content/70">Welcome to {name}. You'll be redirected shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePayment}>
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold">{name}</h2>
                                <p className="text-base-content/70 dark:text-dark-base-content/70">Billed annually</p>
                            </div>

                            <div className="space-y-2 text-sm border-y border-base-200 dark:border-dark-base-300 py-4">
                                <div className="flex justify-between items-center"><span className="text-base-content/80 dark:text-dark-base-content/80">Subtotal</span><span className="font-medium">R{priceDetails.subtotal.toFixed(2)}</span></div>
                                {priceDetails.currentDiscount > 0 && <div className="flex justify-between items-center text-success"><span>Discount (20%)</span><span className="font-medium">-R{priceDetails.currentDiscount.toFixed(2)}</span></div>}
                                <div className="flex justify-between items-center"><span className="text-base-content/80 dark:text-dark-base-content/80">Tax (15%)</span><span className="font-medium">R{priceDetails.tax.toFixed(2)}</span></div>
                            </div>

                            <div className="flex justify-between font-bold text-lg py-4">
                                <span>Total due today</span>
                                <span>R{priceDetails.total.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex gap-2 my-4">
                                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Add promotion code" className={inputClasses}/>
                                <button type="button" onClick={handleApplyPromo} className="font-semibold py-2 px-4 rounded-lg bg-base-200 dark:bg-dark-base-200 hover:bg-base-300 dark:hover:bg-dark-base-300 transition-colors whitespace-nowrap">Apply</button>
                            </div>
                            
                            {!showManualPayment && (
                                <div className="text-center p-4 bg-base-200/50 dark:bg-dark-base-300/50 rounded-lg animate-fade-in">
                                    <p className="font-semibold">it’s you</p>
                                    <p className="text-sm my-3">Enter the code sent to your phone to use your saved information.</p>
                                    <input type="text" placeholder="••••••" maxLength={6} className={`${inputClasses} text-center tracking-[0.5em] max-w-xs mx-auto`} />
                                    <button type="button" className="text-sm my-3 text-primary hover:underline">Send code to email instead</button>
                                    <p className="text-xs text-base-content/60 dark:text-dark-base-content/60">Logging in as {userEmail}</p>
                                </div>
                            )}

                            {showManualPayment && (
                                <div className="space-y-4 my-4 animate-fade-in">
                                    <div>
                                        <label htmlFor="card-number" className="block text-sm font-bold mb-1">Card Number</label>
                                        <input type="text" id="card-number" placeholder="•••• •••• •••• ••••" className={inputClasses} required />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="expiry" className="block text-sm font-bold mb-1">Expiry Date</label>
                                            <input type="text" id="expiry" placeholder="MM / YY" className={inputClasses} required />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="cvc" className="block text-sm font-bold mb-1">CVC</label>
                                            <input type="text" id="cvc" placeholder="•••" className={inputClasses} required />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-6 space-y-3">
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 font-bold rounded-lg text-white bg-accent hover:bg-accent-focus disabled:bg-base-300 dark:disabled:bg-dark-base-300 transition-colors">
                                    {isLoading ? <Spinner size="sm" /> : `Pay R${priceDetails.total.toFixed(2)}`}
                                </button>
                                <button type="button" onClick={() => setShowManualPayment(!showManualPayment)} className="w-full text-center py-2 text-primary font-semibold text-sm hover:underline">
                                {showManualPayment ? 'Pay with Link instead' : 'Pay without Link'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PaymentScreen;