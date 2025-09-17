import { ReactNode } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero a tutto schermo */}
      <Hero />

      {/* Dashboard sotto */}
      <main className="flex-1 px-6 md:px-16 py-10 w-full max-w-screen-2xl mx-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
}