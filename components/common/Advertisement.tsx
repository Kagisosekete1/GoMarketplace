
import React from 'react';

export type AdType = 'mtn' | 'fnb' | 'checkers' | 'takealot' | 'vodacom' | 'shoprite' | 'picknpay';

interface AdProps {
    type: AdType | AdType[];
}

const adDetails: Record<AdType, { url: string; component: React.FC }> = {
    mtn: {
        url: 'https://www.mtn.co.za',
        component: () => (
            <div className="bg-[#ffcc00] text-neutral rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img src="https://logo.clearbit.com/mtn.com" alt="MTN Logo" className="w-12 h-12" />
                    <div>
                        <p className="text-xs font-bold border border-neutral/50 rounded-full px-2 py-0.5 inline-block">Ad</p>
                        <h3 className="text-lg font-extrabold text-blue-900">Superfast 5G Internet</h3>
                        <p className="text-sm text-neutral/90">Power your home and business.</p>
                    </div>
                </div>
                <button className="bg-blue-900 text-white font-bold py-2 px-5 rounded-full text-sm whitespace-nowrap hover:bg-blue-800 transition-colors">Learn More</button>
            </div>
        )
    },
    fnb: {
        url: 'https://www.fnb.co.za/loans/personal-loan.html',
        component: () => (
            <div className="bg-[#00A19A] text-neutral-content rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                     <svg className="w-10 h-10 text-white shrink-0" viewBox="0 0 100 100"><path fill="currentColor" d="M50,15.5c-2.8,0-5.1,1.5-6.5,3.6l-5.6-3.3C41.7,11,45.6,8,50,8c7.3,0,13.2,5.9,13.2,13.2c0,7.3-5.9,13.2-13.2,13.2 c-7.3,0-13.2-5.9-13.2-13.2c0-1.8,0.4-3.6,1.1-5.2l-6-3.5c-1.8,3.2-2.9,6.9-2.9,10.8c0,11,8.9,19.9,19.9,19.9 c11,0,19.9-8.9,19.9-19.9C69.9,24.4,61,15.5,50,15.5z M50,84.5c2.8,0,5.1-1.5,6.5,3.6l5.6,3.3C58.3,89,54.4,92,50,92 c-7.3,0-13.2-5.9-13.2-13.2c0-7.3,5.9-13.2,13.2-13.2c7.3,0,13.2,5.9,13.2,13.2c0,1.8-0.4,3.6-1.1,5.2l6,3.5 c1.8-3.2,2.9,6.9,2.9-10.8c0-11-8.9-19.9-19.9-19.9c-11,0-19.9,8.9-19.9,19.9C30.1,75.6,39,84.5,50,84.5z"/></svg>
                    <div>
                        <p className="text-xs font-semibold text-white/80">Ad by FNB</p>
                        <h4 className="font-bold text-lg text-white">Need a loan for that?</h4>
                    </div>
                </div>
                <button className="bg-white text-[#00A19A] text-sm font-bold py-2 px-5 rounded-full whitespace-nowrap hover:bg-gray-200 transition-colors">Get a Quote</button>
            </div>
        )
    },
    checkers: {
        url: 'https://www.checkers.co.za/sixty60',
        component: () => (
            <div className="bg-white text-neutral rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img src="https://seeklogo.com/images/C/checkers-sixty-60-logo-A56653E955-seeklogo.com.png" alt="Checkers Sixty60 Logo" className="h-12 w-auto object-contain" />
                    <div>
                        <p className="text-xs font-bold border border-neutral/30 rounded-full px-2 py-0.5 inline-block">Ad</p>
                        <h3 className="text-lg font-extrabold text-neutral">Groceries. Delivered.</h3>
                    </div>
                </div>
                <button className="bg-[#00A39D] text-white font-bold text-sm py-2 px-5 rounded-full whitespace-nowrap hover:bg-[#008f8a] transition-colors">Shop Now</button>
            </div>
        )
    },
    takealot: {
        url: 'https://www.takealot.com',
        component: () => (
             <div className="bg-[#0B3A7E] text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Takealot_logo.svg" alt="Takealot Logo" className="h-10 w-auto object-contain" />
                    <div>
                        <p className="text-xs font-bold border border-white/50 rounded-full px-2 py-0.5 inline-block">Ad</p>
                        <h3 className="text-lg font-extrabold text-white">Daily Deals, Delivered.</h3>
                    </div>
                </div>
                <button className="bg-white text-[#0B3A7E] font-bold text-sm py-2 px-5 rounded-full whitespace-nowrap hover:bg-gray-200 transition-colors self-start">Shop Deals</button>
            </div>
        )
    },
    vodacom: {
        url: 'https://www.vodacom.co.za',
        component: () => (
            <div className="bg-[#E60000] text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-white/80">Ad by Vodacom</p>
                    <h3 className="text-lg font-extrabold text-white">Unbeatable iPhone Deals.</h3>
                </div>
                <button className="bg-white text-[#E60000] font-bold py-2 px-5 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors self-start">Explore</button>
            </div>
        )
    },
    shoprite: {
        url: 'https://www.shoprite.co.za',
        component: () => (
             <div className="bg-[#FFC60B] text-black rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <img src="https://logo.clearbit.com/shoprite.co.za" alt="Shoprite Logo" className="w-12 h-12 object-contain" />
                    <div className="border-l border-black/20 pl-3">
                        <p className="text-xs font-bold">Ad</p>
                        <h3 className="text-lg font-extrabold text-[#D92312]">Lowest Prices Guaranteed.</h3>
                    </div>
                </div>
                <button className="bg-[#D92312] text-white font-bold py-2 px-5 rounded-full text-sm whitespace-nowrap hover:bg-red-700 transition-colors">View Deals</button>
            </div>
        )
    },
    picknpay: {
        url: 'https://www.pnp.co.za',
        component: () => (
            <div className="bg-white text-neutral rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img src="https://logo.clearbit.com/pnp.co.za" alt="Pick n Pay Logo" className="w-12 h-12 object-contain" />
                    <div>
                        <p className="text-xs font-bold border border-neutral/30 rounded-full px-2 py-0.5 inline-block">Ad</p>
                        <h3 className="text-lg font-extrabold text-[#00549f]">Fresh groceries, delivered.</h3>
                    </div>
                </div>
                <button className="bg-[#00549f] text-white font-bold py-2 px-5 text-sm rounded-full whitespace-nowrap hover:bg-blue-800 transition-colors">Order Now</button>
            </div>
        )
    }
};

const Advertisement: React.FC<AdProps> = ({ type }) => {
    // Remove carousel logic. If an array is passed, just show the first ad to prevent breaking the app.
    const adTypeToShow = Array.isArray(type) ? type[0] : type;

    if (!adTypeToShow || !adDetails[adTypeToShow]) {
        return null;
    }

    const { url, component: AdComponent } = adDetails[adTypeToShow];

    const handleAdClick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div 
            onClick={handleAdClick}
            className="cursor-pointer"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAdClick()}
            aria-label={`Advertisement for ${adTypeToShow}. Click to learn more.`}
        >
            <AdComponent />
        </div>
    );
};

export default Advertisement;
