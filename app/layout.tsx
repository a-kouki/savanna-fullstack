import type { Metadata } from "next";
import { Geist, Geist_Mono, Grand_Hotel, Cormorant, ABeeZee, Bebas_Neue, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { baseURL } from "@/services/api";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const grandHotel = Grand_Hotel({
  weight:"400",
  variable:"--font-grand-hotel",
  subsets:["latin"],

})

const cormorant = Cormorant({
  weight:"400",
  variable:"--font-cormorant",
  subsets:["latin"],

})

const abeezee = ABeeZee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-abeezee",
  display: "swap",
})

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
})

const oswald = Oswald({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-oswald",
})

export const metadata: Metadata = {
  metadataBase:baseURL,
  title: "Marcos Veículos em Rondonópolis | Compra e Venda de Carros Seminovos",

  description:
    "Marcos Souza é vendedor de veículos em Rondonópolis. Carros seminovos revisados, procedência garantida, financiamento facilitado e atendimento direto via WhatsApp. Encontre seu próximo carro aqui.",

  keywords: [
    "Marcos Veículos",
    "vendedor de carros em Rondonópolis",
    "carros seminovos Rondonópolis",
    "comprar carro em Rondonópolis",
    "Marcos Souza vendedor",
    "Fiat Strada",
    "Volkswagen Polo",
    "Chevrolet Onix",
    "carros usados MT",
    "financiamento de veículos",
    "compra e venda de carros"
  ],

  icons: {
    icon: "/favicon.png",
  },

  category: "automotive",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  openGraph: {
    title: "Marcos Veículos | Seu próximo carro começa aqui",
    description:
      "Venda de veículos em Rondonópolis com procedência garantida. Atendimento rápido via WhatsApp.",
    images: ["/favicon.png"],
    locale: "pt_BR",
    type: "website",
  },
  alternates:{
    canonical:baseURL
  }
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal:React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" type="image/x-icon"></link>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${grandHotel.variable} ${cormorant.variable} ${abeezee.variable} ${bebas.variable} ${oswald.variable} antialiased`}
      >
        <Toaster
        position="bottom-right"
        richColors
        />
        {children}
        {modal}
      </body>
    </html>
  );
}
