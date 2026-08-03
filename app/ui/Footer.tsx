import Link from "next/link";

const INSTAGRAM_URL = "https://instagram.com/TU_USUARIO"; // reemplazar
const WHATSAPP_URL = "https://wa.me/5491137801717";

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      
      <div className="mx-auto grid max-w-screen-xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Tu Dietética</h3>

          <p className="text-sm text-gray-600">
            Productos saludables, suplementos, alimentos naturales y bebidas.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Navegación</h4>

          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/products">Catálogo</Link></li>
            <li><Link href="/kits">Kits</Link></li>            
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Contacto</h4>

          <ul className="space-y-2 text-sm text-gray-600">
            <li>📍 Dirección</li>            
            <li>✉️ Email</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Seguinos</h4>

          <div className="flex gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full border p-2 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="rounded-full border p-2 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38c1.45.79 3.08 1.21 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0012.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 012.42 5.82c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.2-1.15l-.3-.18-3.14.82.84-3.06-.19-.32a8.18 8.18 0 01-1.25-4.35c0-4.54 3.7-8.23 8.24-8.23m-3.48 4.24c-.16 0-.42.06-.64.31-.22.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.7 2.73 4.28 3.71.6.23 1.06.36 1.42.47.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.14-1.19-.06-.1-.22-.16-.46-.28-.24-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.16.24-.64.81-.78.98-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.85-.2-.48-.4-.42-.56-.42h-.35" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Tu Dietética. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
