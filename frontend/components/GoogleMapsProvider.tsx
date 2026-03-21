"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useLoadScript, Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places"];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  if (!apiKey) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center backdrop-blur-sm">
        <div className="mb-4 text-4xl">🔑</div>
        <h3 className="mb-2 text-lg font-bold text-amber-400">Configuração de Mapa Pendente</h3>
        <p className="max-w-md text-sm text-[var(--ink-muted)] leading-relaxed">
          A chave do Google Maps não foi encontrada. Se você está no Netlify, verifique se a variável 
          <code className="mx-1 rounded bg-white/10 px-1 py-0.5 font-mono text-white">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> 
          está configurada corretamente.
        </p>
      </div>
    );
  }

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
}
