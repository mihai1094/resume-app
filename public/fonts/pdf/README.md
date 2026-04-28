# PDF Font Assets

These WOFF2 subsets are vendored for server-side PDF rendering only.
`lib/fonts/pdf-fonts.ts` filters `font-faces.css` per render so each PDF gets
only the fonts required by its template and customization.

Keep this directory independent from `.next`; Next/Turbopack font chunk names
are build artifacts and are not a stable runtime API.
