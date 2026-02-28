'use client';

import { useEffect } from 'react';
import { RefreshCcw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    const handleHardReload = () => {
        // Force a reload bypassing cache as much as possible
        window.location.href = window.location.pathname + '?v=' + new Date().getTime();
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
                <AlertCircle size={40} className="text-red-500" />
            </div>

            <h1 className="text-4xl md:text-5xl font-serif mb-4 italic tracking-tight">¡Vaya! Algo salió mal.</h1>
            <p className="text-neutral-500 font-mono text-xs uppercase tracking-[4px] mb-12 max-w-md leading-loose">
                Hubo un error al cargar esta sección. Por favor, intenta recargar la página.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                    onClick={handleHardReload}
                    className="flex-1 bg-gold text-black font-bold uppercase py-4 px-8 hover:bg-white transition-all flex items-center justify-center gap-3 font-mono tracking-widest shadow-lg shadow-gold/10"
                >
                    <RefreshCcw size={18} />
                    Recargar Página
                </button>

                <Link href="/" className="flex-1">
                    <button className="w-full border border-white/20 text-white font-mono uppercase py-4 px-8 hover:border-gold hover:text-gold transition-colors tracking-widest flex items-center justify-center gap-2">
                        <Home size={18} />
                        Ir al Inicio
                    </button>
                </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <pre className="mt-12 p-4 bg-neutral-900 border border-white/10 text-red-400 text-[10px] font-mono overflow-auto max-w-full text-left rounded">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                </pre>
            )}
        </main>
    );
}
