import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { AuthProvider } from "../components/AuthProvider";

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata = {
  title: "Prospect Lead",
  description: "Prospecção local com dados públicos enriquecidos"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={space.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
