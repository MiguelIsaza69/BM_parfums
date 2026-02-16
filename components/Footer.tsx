"use client";

import { Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 p-12 md:p-20 border-b border-white/10">
                {/* Brand */}
                <div>
                    <h2 className="text-4xl font-black mb-6">BM.</h2>
                    <p className="text-sm text-neutral-400 max-w-xs font-mono">
                        AVANT-GARDE PERFUMERY.<br />
                        EST. 2026<br />
                        MEDELLIN, COLOMBIA
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-12 font-mono text-sm">
                    <ul>
                        <li className="mb-4 text-muted uppercase tracking-widest text-xs">Shop</li>
                        <li className="mb-2"><a href="#" className="hover:text-gold">All Products</a></li>
                        <li className="mb-2"><a href="#" className="hover:text-gold">New Arrivals</a></li>
                        <li className="mb-2"><a href="#" className="hover:text-gold">Best Sellers</a></li>
                    </ul>
                    <ul>
                        <li className="mb-4 text-muted uppercase tracking-widest text-xs">Support</li>
                        <li className="mb-2"><a href="#" className="hover:text-gold">Contact Us</a></li>
                        <li className="mb-2"><a href="#" className="hover:text-gold">Shipping</a></li>
                        <li className="mb-2"><a href="#" className="hover:text-gold">Returns</a></li>
                    </ul>
                </div>

                {/* Social / Newsletter */}
                <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-muted mb-6">Connect</h4>
                    <div className="flex gap-4 mb-8">
                        <a href="#" className="hover:text-gold transition-colors"><Instagram /></a>
                        <a href="#" className="hover:text-gold transition-colors"><Twitter /></a>
                        <a href="#" className="hover:text-gold transition-colors"><Facebook /></a>
                    </div>

                    <div className="flex border-b border-white/20 pb-2">
                        <input type="email" placeholder="SUBSCRIBE FOR ALERTS" className="bg-transparent outline-none w-full font-mono text-sm placeholder:text-neutral-600" />
                        <button className="text-gold font-bold uppercase text-xs">Join</button>
                    </div>
                </div>
            </div>

            <div className="p-6 text-center text-xs text-neutral-600 font-mono uppercase">
                &copy; 2026 BM PARFUMS. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
}
