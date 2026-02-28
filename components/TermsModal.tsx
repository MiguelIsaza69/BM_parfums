"use client";

import { X } from "lucide-react";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-neutral-900 border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-neutral-900 border-b border-white/5 p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-serif text-white uppercase tracking-widest italic">Términos y Condiciones</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 text-neutral-400 font-mono text-sm leading-relaxed space-y-6">
                    <section>
                        <h3 className="text-gold uppercase tracking-widest mb-3 text-xs">1. Introducción</h3>
                        <p>
                            Bienvenido a BM Parfums. Al acceder y utilizar nuestro sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso, que junto con nuestra política de privacidad rigen la relación de BM Parfums con usted en relación con este sitio web.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-gold uppercase tracking-widest mb-3 text-xs">2. Elegibilidad</h3>
                        <p>
                            Nuestros servicios están destinados únicamente a personas mayores de 18 años. Al registrarse, usted garantiza que es mayor de edad y tiene capacidad legal para contratar.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-gold uppercase tracking-widest mb-3 text-xs">3. Productos y Calidad</h3>
                        <p>
                            En BM Parfums ofrecemos tres categorías de productos claramente identificadas:
                            <br /><br />
                            • **Original**: Perfumería de marca 100% auténtica.<br />
                            • **1.1 (High Quality)**: Réplicas de la más alta fidelidad en fragancia y presentación.<br />
                            • **Inspiración**: Fragancias inspiradas en marcas reconocidas con excelente fijación.<br /><br />
                            El cliente reconoce entender la diferencia entre estas calidades al momento de la compra.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-gold uppercase tracking-widest mb-3 text-xs">4. Pedidos y Envíos</h3>
                        <p>
                            Los pedidos están sujetos a disponibilidad de stock. Todo pedido será procesado tras la confirmación del pago. El tiempo estimado de entrega es de 3 a 5 días hábiles a nivel nacional (Colombia), salvo situaciones de fuerza mayor ajenas a la empresa.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-gold uppercase tracking-widest mb-3 text-xs">5. Pagos</h3>
                        <p>
                            Utilizamos pasarelas de pago seguras (como Wompi). No almacenamos información sensible de sus tarjetas de crédito o débito. Cualquier error en el proceso de pago debe ser reportado inmediatamente a su entidad bancaria y a nuestra línea de soporte.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-gold uppercase tracking-widest mb-3 text-xs">6. Privacidad y Comunicaciones</h3>
                        <p>
                            Su privacidad es fundamental. Los datos recopilados durante el registro y compra se utilizarán exclusivamente para la gestión de sus pedidos.
                            <br /><br />
                            Al registrarse en **BM Parfums**, usted acepta y otorga su consentimiento expreso para recibir comunicaciones promocionales, boletines informativos y ofertas exclusivas relacionadas con nuestros productos a través del correo electrónico proporcionado. Puede solicitar dejar de recibir estas comunicaciones en cualquier momento contactándonos.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-gold uppercase tracking-widest mb-3 text-xs">7. Modificaciones</h3>
                        <p>
                            BM Parfums se reserva el derecho de modificar estos términos en cualquier momento sin previo aviso. Es responsabilidad del usuario revisarlos periódicamente.
                        </p>
                    </section>

                    <div className="pt-8 text-center text-[10px] text-neutral-600 border-t border-white/5 uppercase tracking-[2px]">
                        Última actualización: Febrero 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
