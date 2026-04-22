import React from 'react';

const ColorPreview = ({ title, description, primary, secondary, accent, bg }: { 
  title: string, 
  description: string, 
  primary: string, 
  secondary: string, 
  accent: string, 
  bg: string 
}) => (
  <div className="p-8 rounded-xl border mb-12" style={{ backgroundColor: bg }}>
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2" style={{ color: primary }}>{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Beispiel-Karte */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: primary, color: 'white' }}>
            <span className="font-bold text-xl">♔</span>
          </div>
          <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: accent, color: primary }}>
            AKTIV
          </span>
        </div>
        <h3 className="font-bold text-slate-900">Vereinsmeisterschaft</h3>
        <p className="text-sm text-slate-500 mb-4">Runde 5 von 9 • 18:00 Uhr</p>
        <button className="w-full py-2 rounded-md font-medium transition-opacity hover:opacity-90" style={{ backgroundColor: primary, color: 'white' }}>
          Details ansehen
        </button>
      </div>

      {/* Button-Variationen */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Interaktion</h4>
        <button className="w-full py-2 px-4 rounded border-2 font-semibold transition-colors" style={{ borderColor: primary, color: primary }}>
          Sekundär Aktion
        </button>
        <button className="w-full py-2 px-4 rounded font-semibold underline" style={{ color: primary }}>
          Text Link
        </button>
      </div>

      {/* Farb-Palette */}
      <div className="flex gap-2 h-full items-end">
        <div className="flex-1 h-20 rounded shadow-inner" style={{ backgroundColor: primary }} title="Primary"></div>
        <div className="flex-1 h-20 rounded shadow-inner" style={{ backgroundColor: secondary }} title="Secondary"></div>
        <div className="flex-1 h-20 rounded shadow-inner" style={{ backgroundColor: accent }} title="Accent"></div>
      </div>
    </div>
  </div>
);

export default function DesignTestPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Design-Vorschau: <span className="text-slate-500">Schachverein</span>
          </h1>
          <p className="text-lg text-slate-600">
            Farbpaletten für ein seriöses, zuverlässiges und vertrauenswürdiges Auftreten.
          </p>
        </header>

        {/* 1. Midnight Navy */}
        <ColorPreview 
          title="1. Midnight Navy & Slate"
          description="Der Standard für Autorität und Vertrauen. Wirkt professionell, stabil und modern."
          primary="oklch(0.25 0.05 240)"
          secondary="oklch(0.45 0.03 240)"
          accent="oklch(0.92 0.02 240)"
          bg="white"
        />

        {/* 2. Forest Green */}
        <ColorPreview 
          title="2. Royal Forest & Ivory"
          description="Klassisch, naturverbunden und beständig. Erinnert an traditionelle Clubzimmer."
          primary="oklch(0.28 0.05 160)"
          secondary="oklch(0.45 0.04 160)"
          accent="oklch(0.95 0.02 160)"
          bg="oklch(0.98 0.01 160)"
        />

        {/* 3. Deep Burgundy */}
        <ColorPreview 
          title="3. Noble Burgundy & Gold"
          description="Exzellenz und akademischer Anspruch. Wirkt edel und geschichtsbewusst."
          primary="oklch(0.25 0.08 20)"
          secondary="oklch(0.4 0.1 20)"
          accent="oklch(0.9 0.05 60)"
          bg="white"
        />

        {/* 4. Modern Monochrome */}
        <ColorPreview 
          title="4. Pure Monochrome"
          description="Fokussiert auf das Wesentliche. Wie das Schachbrett selbst: Klar, logisch, kompromisslos."
          primary="oklch(0.15 0 0)"
          secondary="oklch(0.4 0 0)"
          accent="oklch(0.9 0 0)"
          bg="white"
        />
        
        <footer className="text-center text-slate-400 text-sm mt-12">
          Alle Farben sind in OKLCH definiert für maximale Farbtreue und Kontrast.
        </footer>
      </div>
    </div>
  );
}
