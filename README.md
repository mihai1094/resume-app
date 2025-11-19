# Resume - Next.js + shadcn/ui

Proiect Next.js cu TypeScript, Tailwind CSS și shadcn/ui.

## Tehnologii

- **Next.js 14** - React framework cu App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componente UI reutilizabile

## Instalare

Dependențele sunt deja instalate. Dacă ai nevoie să reinstalezi:

```bash
npm install
```

## Rulare

Pentru development:

```bash
npm run dev
```

Aplicația va rula pe [http://localhost:3000](http://localhost:3000)

## Build pentru producție

```bash
npm run build
npm start
```

## Componente shadcn/ui

Proiectul include deja următoarele componente:
- `Button` - în `components/ui/button.tsx`
- `Card` - în `components/ui/card.tsx`

Pentru a adăuga mai multe componente shadcn/ui, poți folosi:

```bash
npx shadcn@latest add [component-name]
```

## Documentație

Documentația proiectului este organizată în directorul [`docs/`](./docs/):
- **SEO** - Ghiduri de implementare SEO (`docs/seo/`)
- **Roadmap** - Planificare funcționalități (`docs/roadmap/`)
- **Development** - Ghiduri de dezvoltare și arhitectură (`docs/development/`)

Vezi [`docs/README.md`](./docs/README.md) pentru detalii complete.

## Structura proiectului

```
Resume/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles cu Tailwind
├── components/       # Componente React
│   └── ui/          # Componente shadcn/ui
├── docs/            # Documentație proiect
├── lib/             # Utilities
│   └── utils.ts     # Funcții helper (cn, etc.)
└── components.json  # Configurație shadcn/ui
```

