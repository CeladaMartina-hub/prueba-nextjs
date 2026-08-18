import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { Metadata } from "next";
import Header from "./ui/header";
import PublicChrome from "./ui/public-chrome";

//%s reemplace el título de la página, si no hay título, se mostrará el valor por defecto
export const metadata: Metadata = {
  title: {
    template: "%s | Ecobocado.LL",
    default: "Ecobocado.LL",
  },
  description: "Descubre nuestros productos ecológicos y sostenibles.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Header />
        {children}
        <PublicChrome />
      </body>
    </html>
  );
}
