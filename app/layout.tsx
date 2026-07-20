import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GEOAgenda REURB",
  description: "Agendamento de atendimento do Programa Minha Casa Legal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
