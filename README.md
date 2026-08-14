# mi-cv — Currículum web de backend junior

Web en vivo: **https://cordevro-cv.netlify.app**

Proyecto personal: currículum vitae en formato web con estética de terminal/backend.
En pantalla se muestra el CV como una sesión de terminal; el botón **Descargar PDF**
genera un documento A4 minimalista en blanco y negro con estilo de plantilla profesional.

## Requisitos

- Node.js >= 22.12

## Web (Astro)

Los datos del CV viven en **`web/src/data/cv.json`**. Para ampliar o actualizar el
CV solo tienes que editar ese archivo y reconstruir: añade/elimina proyectos, skills,
soft skills, formación o idiomas sin tocar el código.

```bash
npm install
npm run dev:web      # desarrollo en http://localhost:4321
npm run build:web    # genera web/dist
npm run preview:web  # previsualiza el build
```

## Descarga en PDF

El botón *Descargar PDF* descarga un documento estático **`web/public/cv.pdf`**,
generado aparte con estética minimalista profesional: **A4, fondo blanco,
blanco/negro y grises**, cabecera centrada (nombre, rol, perfil y contacto),
cuerpo en dos columnas con los títulos de sección a la izquierda (Formación,
Experiencia, Proyectos, Habilidades e Idiomas) y reglas horizontales finas.

Para regenerarlo cuando cambies `cv.json`:

```bash
npm run pdf     # renderiza web/public/cv.pdf con Playwright + Chromium
```

(Requiere instalar el navegador la primera vez: `npx playwright install chromium`.)
El PDF se versiona en el repo y se sirve estáticamente con el resto de la web.

## Publicar la web

La web es estática, sirve en Netlify, GitHub Pages, Vercel, etc.

En **Netlify** (desde la raíz del repo):
- Build command: `npm run build:web`
- Publish directory: `web/dist`
- Node version: usa Node 22 (`.nvmrc`)

Actualiza también `site` en `web/astro.config.mjs` con tu dominio real.

## Añadir o modificar datos del CV

1. Edita `web/src/data/cv.json`.
2. `npm run build:web` y publica.

El esquema es: `person` (datos de contacto), `bio`, `skills` (grupos de chips),
`softSkills` (habilidades blandas), `projects` (con `tech`, `highlights` y `status`),
`education`, `languages` y `trajectory` (el recorrido industrial → backend).
