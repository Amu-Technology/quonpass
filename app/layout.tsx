import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from './providers/SessionProvider';
import { UserProvider } from './providers/UserProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quonpass",
  description: "久遠チョコレートの販売実績管理・発注管理システム「Quonpass」",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
