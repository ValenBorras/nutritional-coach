import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal/95 text-mist-white pt-16 pb-8">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-soft-rose flex items-center justify-center">
                <span className="font-marcellus text-xl text-charcoal">NG</span>
              </div>
              <span className="font-marcellus text-2xl text-mist-white">
                NutriGuide
              </span>
            </div>
            <p className="text-mist-white/70 mb-6">
              Tu coach nutricional de IA 24/7, personalizado a tus necesidades y
              alineado con la orientación de tu nutricionista.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-mist-white/10 flex items-center justify-center text-mist-white hover:bg-mist-white/20 transition-colors"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-mist-white/10 flex items-center justify-center text-mist-white hover:bg-mist-white/20 transition-colors"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-mist-white/10 flex items-center justify-center text-mist-white hover:bg-mist-white/20 transition-colors"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-mist-white/10 flex items-center justify-center text-mist-white hover:bg-mist-white/20 transition-colors"
              >
                <Linkedin size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-marcellus text-lg text-mist-white mb-4">
              Recursos
            </h3>
            <ul className="space-y-3">
              {[
                "Blog",
                "Guía Nutricional",
                "Historias de Éxito",
                "Preguntas Frecuentes",
                "Soporte",
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-mist-white/70 hover:text-coral transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-marcellus text-lg text-mist-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                "Términos de Servicio",
                "Política de Privacidad",
                "Política de Cookies",
                "Cumplimiento GDPR",
                "Accesibilidad",
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-mist-white/70 hover:text-coral transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-mist-white/10 pt-8 text-center text-mist-white/60 text-sm">
          <p>© {currentYear} NutriGuide. Todos los derechos reservados.</p>
          <p className="mt-2">
            NutriGuide no es un sustituto del consejo médico profesional.
            Siempre consulta con profesionales de la salud para preocupaciones
            médicas.
          </p>
        </div>
      </div>
    </footer>
  );
}
