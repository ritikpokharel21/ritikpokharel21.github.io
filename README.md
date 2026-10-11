# Ritik Pokharel — Portfolio Site

Static single-page portfolio for a GIS Analyst. Pure HTML/CSS/JS — no build
step, no backend. Designed for **GitHub Pages**.

## Deploy

1. Create a public repo named **`ritikpokharel21.github.io`** on GitHub
   (repo name must match the username exactly for a user site).
2. Copy the contents of this folder (`index.html`, `assets/`, `files/`,
   `robots.txt`, `sitemap.xml`, `favicon.svg`) to the repo root.
3. Commit and push to the `main` branch.
4. In the repo: **Settings → Pages → Build and deployment →**
   Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)**.
5. The site goes live at `https://ritikpokharel21.github.io/` within a few
   minutes. (Optional: add a custom domain under Settings → Pages.)

## Updating content

- **Resume:** replace `files/Ritik-Pokharel-Resume.pdf` with the latest
  export (Word → PDF). The "Download CV" buttons point at this file.
- **Photos:** swap the placeholder SVGs in `assets/img/` (each is marked
  `data-placeholder="true"`) for real JPG/PNG files and update the
  `src` attributes in `index.html`. Suggested sizes: headshot 600×600,
  project cards 800×450, gallery 800×600.
- **Certificates:** drop PDFs into `files/certs/` (see its README) and point
  the "PDF" links in the Certifications section at the real files.
- **Theme:** the light/dark toggle persists via `localStorage` and defaults
  to the visitor's OS preference.

## Structure

```
index.html            — the whole site (single page, sticky nav)
assets/css/style.css  — all styling, light + dark themes
assets/js/main.js     — theme toggle, mobile nav, counters, lazy Leaflet map
assets/img/           — placeholder SVGs (swap for real photos)
files/                — resume PDF + certs/ folder
robots.txt / sitemap.xml / favicon.svg
```

## Notes

- The Field Sites map lazy-loads Leaflet + CARTO basemap tiles only when
  scrolled into view.
- No contact form yet — email `mailto:` link only (avoids spam + backends).
- Fonts load from Google Fonts with system fallbacks; the site works offline
  except the map tiles.
