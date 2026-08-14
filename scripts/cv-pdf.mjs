// Genera web/public/cv.pdf (CV minimalista blanco y negro) desde web/src/data/cv.json
// Uso: npm run pdf
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const cv = JSON.parse(readFileSync(path.join(root, 'web/src/data/cv.json'), 'utf8'));

const { person } = cv;

const esc = (s) =>
	String(s)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');

const sentences = cv.bio
	.split(/(?<=\.)\s+/)
	.map((s) => s.trim())
	.filter(Boolean);
const perfil = [sentences[0], sentences.at(-1)].join(' ');

const trayecto = [];
let cur = null;
for (const line of cv.trajectory.lines) {
	if (line.includes('|')) {
		cur = { title: line, items: [] };
		trayecto.push(cur);
	} else if (cur) {
		cur.items.push(line);
	}
}

const projects = cv.projects.slice(0, 4).map((p) => ({
	name: esc(p.name),
	status: esc(p.status),
	tagline: esc(p.tagline),
	tech: esc(p.tech.join(', ')),
	highlights: p.highlights.slice(0, 2).map(esc),
}));

const skillGroups = [
	{ label: 'Lenguajes', items: cv.skills.lenguajes },
	{ label: 'Frameworks', items: cv.skills.frameworks },
	{ label: 'Bases de datos', items: cv.skills.basesDeDatos },
	{ label: 'DevOps y herramientas', items: cv.skills.devopsYHerramientas },
	{ label: 'Frontend', items: cv.skills.complementario },
].map((g) => ({ label: esc(g.label), items: g.items.map(esc) }));

const contact = [
	esc(person.location),
	esc(person.email),
	esc(person.github.replace('https://', '')),
	esc(person.linkedin.replace('https://www.', '')),
];

const rows = [];

rows.push(`
	<div class="row">
		<div class="sec">Formación</div>
		<div class="body">
			${cv.education
				.map(
					(e) => `
			<div class="item">
				<h3>${esc(e.period)} · ${esc(e.title)}</h3>
				<div class="sub">${esc(e.institution)}</div>
			</div>`
				)
				.join('')}
		</div>
	</div>`);

rows.push(`
	<div class="row">
		<div class="sec">Experiencia</div>
		<div class="body">
			${trayecto
				.map(
					(g) => `
			<div class="proj">
				<h3>${esc(g.title)}</h3>
				<ul class="bullets">
					${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}
				</ul>
			</div>`
				)
				.join('')}
		</div>
	</div>`);

rows.push(`
	<div class="row">
		<div class="sec">Proyectos</div>
		<div class="body">
			${projects
				.map(
					(p) => `
			<div class="proj">
				<h3>${p.name} <span class="status">— ${p.status}</span></h3>
				<div class="sub">${p.tagline}</div>
				<div class="tech">${p.tech}</div>
				<ul class="bullets">
					${p.highlights.map((h) => `<li>${h}</li>`).join('')}
				</ul>
			</div>`
				)
				.join('')}
		</div>
	</div>`);

rows.push(`
	<div class="row">
		<div class="sec">Habilidades</div>
		<div class="body">
			${skillGroups
				.map(
					(g) => `
			<div class="skill"><b>${g.label}:</b> ${g.items.join(', ')}</div>`
				)
				.join('')}
		</div>
	</div>`);

rows.push(`
	<div class="row">
		<div class="sec">Idiomas</div>
		<div class="body">
			${cv.languages
				.map(
					(l) => `
			<div class="lang"><b>${esc(l.language)}</b> — ${esc(l.level)}</div>`
				)
				.join('')}
		</div>
	</div>`);

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>CV ${esc(person.name)}</title>
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	html, body {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}
	body {
		font-family: 'Liberation Sans', 'DejaVu Sans', 'Noto Sans', Arial, sans-serif;
		color: #222222;
		font-size: 8.6pt;
		line-height: 1.5;
	}
	.wrap { max-width: 184mm; margin: 0 auto; }

	.head { text-align: center; border-bottom: 1.5px solid #111111; padding-bottom: 9px; }
	.head h1 {
		font-size: 21pt;
		font-weight: 700;
		letter-spacing: 0.03em;
		color: #111111;
		line-height: 1.15;
	}
	.head .role {
		margin-top: 3px;
		font-size: 10pt;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.26em;
		color: #444444;
	}
	.head .profile {
		margin: 7px auto 0;
		max-width: 170mm;
		font-size: 8.4pt;
		color: #444444;
		line-height: 1.55;
	}
	.head .contact { margin-top: 7px; font-size: 8.2pt; color: #111111; }
	.head .contact .sep { color: #9a9a9a; }

	.row {
		display: grid;
		grid-template-columns: 30mm 1fr;
		gap: 0 7mm;
		padding: 8px 0;
		border-bottom: 0.8px solid #d6d6d6;
		break-inside: avoid;
		page-break-inside: avoid;
	}
	.row:last-child { border-bottom: none; }
	.sec {
		font-size: 9.5pt;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #111111;
		padding-top: 1px;
	}

	.body h3 { font-size: 9pt; font-weight: 700; color: #111111; margin-bottom: 1px; }
	.body .sub { color: #666666; font-size: 8.2pt; }
	ul.bullets { margin: 2px 0 0 13px; padding: 0; }
	ul.bullets li { color: #333333; }
	.item { margin-bottom: 6px; break-inside: avoid; page-break-inside: avoid; }
	.item:last-child { margin-bottom: 0; }
	.proj { margin-bottom: 7px; break-inside: avoid; page-break-inside: avoid; }
	.proj:last-child { margin-bottom: 0; }
	.proj .status { color: #888888; font-size: 8pt; font-weight: 400; }
	.tech { color: #666666; font-size: 7.8pt; margin-top: 1px; }
	.skill { margin-bottom: 2px; }
	.skill b { color: #111111; }
	.lang { margin-bottom: 2px; }
	.lang b { color: #111111; }
</style>
</head>
<body>
	<div class="wrap">
		<header class="head">
			<h1>${esc(person.name)}</h1>
			<div class="role">${esc(person.role)}</div>
			<p class="profile">${esc(perfil)}</p>
			<div class="contact">
				${contact.map((c, i) => (i ? `<span class="sep"> · </span>${c}` : c)).join('')}
			</div>
		</header>
		${rows.join('')}
	</div>
</body>
</html>`;

const out = path.join(root, 'web', 'public', 'cv.pdf');
const browser = await chromium.launch();
try {
	const page = await browser.newPage();
	await page.setContent(html, { waitUntil: 'load' });
	const pdf = await page.pdf({
		format: 'A4',
		printBackground: true,
		margin: { top: '11mm', bottom: '11mm', left: '13mm', right: '13mm' },
	});
	writeFileSync(out, pdf);
	console.log('PDF generado:', out, `(${pdf.length} bytes)`);
} finally {
	await browser.close();
}
