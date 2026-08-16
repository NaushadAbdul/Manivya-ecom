import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black/40 backdrop-blur-lg border-t border-purple-900/30 text-slate-400 text-sm mt-20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/60 py-10 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Truck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Fast Express Delivery</h5>
              <p className="text-xs text-slate-400 mt-0.5">Real-time GPS tracking & 24h dispatch</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Verified Payments</h5>
              <p className="text-xs text-slate-400 mt-0.5">QR Code verification & COD support</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <RotateCcw className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider">7-Day Free Returns</h5>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free 100% money back guarantee</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Headphones className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider">24/7 AI Concierge</h5>
              <p className="text-xs text-slate-400 mt-0.5">Instant live chat & recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Link Columns */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo-badge.png"
              alt="MANIVYA Badge"
              className="w-10 h-10 object-contain rounded-full shadow-lg shadow-indigo-600/20"
            />
            <img
              src="/logo-light.png"
              alt="MANIVYA Enterprises"
              className="h-7 w-auto object-contain"
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            MANIVYA Enterprises is a premier AI-driven e-commerce platform offering luxury tech, smart living appliances, designer fashion, and instant location-aware delivery.
          </p>
        </div>

        <div>
          <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Quick Links</h5>
          <ul className="space-y-2.5 text-xs">
            <li><a href="/shop" className="hover:text-indigo-400 transition-colors">Browse Full Catalog</a></li>
            <li><a href="/profile?tab=orders" className="hover:text-indigo-400 transition-colors">Track Orders</a></li>
            <li><a href="/cart" className="hover:text-indigo-400 transition-colors">View Cart</a></li>
            <li><a href="/profile" className="hover:text-indigo-400 transition-colors">Account Settings</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Customer Care</h5>
          <ul className="space-y-2.5 text-xs">
            <li><a href="/profile" className="hover:text-indigo-400 transition-colors">My Profile Account</a></li>
            <li><a href="/profile?tab=orders" className="hover:text-indigo-400 transition-colors">Track Active Orders</a></li>
            <li><a href="/profile?tab=addresses" className="hover:text-indigo-400 transition-colors">Saved Shipping Addresses</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy & Cookie Policy</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Support Contact</h5>
          <div className="space-y-2 text-xs">
            <p><strong className="text-slate-200">Email:</strong> mme27082018@gmail.com</p>
            <p><strong className="text-slate-200">Phone:</strong> +91 7207554777</p>
            <p><strong className="text-slate-200">Corporate HQ & Fulfillment Hub:</strong> 25-1-13, Gajuwaka Bypass Rd, Durgavanipalem, Pedagantyada, Visakhapatnam, Gajuwaka, AP 530026</p>
          </div>
        </div>
      </div>

    </footer>
  );
};
