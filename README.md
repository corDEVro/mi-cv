# mi-cv — Currículum web de backend junior

Web en vivo: **https://cordevro-cv.netlify.app**

Proyecto personal: currículum vitae en formato web con estética de terminal/backend,
diseñado para que quien lo visite pueda **descargárselo en PDF con los mismos estilos**.

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

La web usa **CSS `@media print`**: el botón *Descargar PDF* abre el diálogo de impresión
del navegador con los mismos estilos (estructura, tipografía monoespaciada y colores).
Elige *Guardar como PDF* y listo. En pantalla se ve con fondo oscuro; en el PDF se
invierte a fondo blanco para que la tinta no se desperdicie y sea legible.

## Publicar la web

La web es estática, sirve en Netlify, GitHub Pages, Vercel, etc.

En **Netlify** (desde la raíz del repo):
- Build command: `npm run build:web`
- Publish directory: `web/dist`

Actualiza también `site` en `web/astro.config.mjs` con tu dominio real.

## Añadir o modificar datos del CV

1. Edita `web/src/data/cv.json`.
2. `npm run build:web` y publica.

El esquema es: `person` (datos de contacto), `bio`, `skills` (grupos de chips),
`softSkills` (habilidades blandas), `projects` (con `tech`, `highlights` y `status`),
`education`, `languages` y `trajectory` (el recorrido industrial → backend).
