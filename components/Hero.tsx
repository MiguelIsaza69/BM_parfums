"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// Fallback slides
const defaultSlides = [
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1595425207086-6245a44358a6?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1616422321453-294c65e23653?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1594035910387-fea4779426e9?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1512777576255-a876cea05f88?auto=format&fit=crop&q=80&w=1000"
];

export function Hero() {
    const [current, setCurrent] = useState(0);
    const [heroSlides, setHeroSlides] = useState<string[]>([]);



    useEffect(() => {
        let mounted = true;

        const fetchSlides = async () => {
            try {
                console.log("Fetching hero slides...");
                const { data, error } = await supabase
                    .from('hero_slides')
                    .select('image_url')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching hero slides:", error);
                    return;
                }

                if (mounted && data && data.length > 0) {
                    console.log("Hero slides loaded:", data.length);
                    setHeroSlides(data.map(item => item.image_url));
                } else if (mounted) {
                    console.log("No hero slides found.");
                    // Do not set defaults if it's empty, or user sees wrong images. 
                    // Better to show black or nothing than "wrong" images.
                }
            } catch (err) {
                console.error("Unexpected error in hero fetch:", err);
            }
        };

        fetchSlides();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [heroSlides]);

    return (
        <section className="relative h-screen w-full flex flex-col justify-center items-center text-center overflow-hidden border-b border-white/10">
            {/* Background Carousel */}
            <div className="absolute inset-0 z-0">
                {heroSlides.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <Image
                            src={src}
                            alt="Hero Background"
                            fill
                            className="object-cover transition-all duration-700"
                            priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center max-w-4xl px-4">
                <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold uppercase italic leading-[0.85] mix-blend-difference text-white tracking-tighter">
                    Bold.<br />Modern.<br />
                </h1>

                <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
                    <p className="font-mono text-sm md:text-base border-l-2 border-gold pl-4 text-left max-w-md text-gray-300">
                        REDEFINING OLFACTORY PERFECTION FOR THE AVANT-GARDE.
                    </p>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 animate-bounce">
                <span className="font-mono text-xs tracking-widest text-muted">SCROLL</span>
            </div>
        </section>
    );
}
