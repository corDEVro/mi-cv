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

const perfil = esc(cv.summary);

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
trayecto.forEach((g) => { if (g.items.length > 4) g.items = g.items.slice(0, 4); });

const projects = cv.projects.filter((p) => p.status === 'Completo').map((p) => ({
	name: esc(p.name),
	status: esc(p.status),
	tagline: esc(p.tagline),
	tech: esc(p.tech.join(', ')),
		highlights: p.highlights.slice(0, 1).map(esc),
	github: p.links?.github || '',
	live: p.links?.live || '',
}));

const inDevProjects = cv.projects.filter((p) => p.status === 'En desarrollo').map((p) => ({
	name: esc(p.name),
	tagline: esc(p.tagline),
	github: p.links?.github || '',
}));

const skillGroups = [
	{ label: 'Lenguajes', items: cv.skills.lenguajes },
	{ label: 'Frameworks', items: cv.skills.frameworks },
	{ label: 'Bases de datos', items: cv.skills.basesDeDatos },
	{ label: 'DevOps y herramientas', items: cv.skills.devopsYHerramientas },
	{ label: 'Frontend', items: cv.skills.complementario },
].map((g) => ({ label: esc(g.label), items: g.items.map(esc) }));

const iconPaths = {
	mail: 'M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
	github:
		'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2',
	linkedin:
		'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2a6 6 0 0 1 2-2ZM2 9h4v12H2zM4 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z',
	map: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
	link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
	external:
		'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3',
};
const icon = (name) =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[name]}"/></svg>`;

const contact = [
	{ label: esc(person.email), href: `mailto:${person.email}`, icon: 'mail' },
	{ label: esc(person.github.replace('https://', '')), href: person.github, icon: 'github' },
	{
		label: esc(person.linkedin.replace('https://www.', '')),
		href: person.linkedin,
		icon: 'linkedin',
	},
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
				<div class="plinks">
					${p.github ? `<a class="plink" href="${p.github}">${icon('github')}<span>${esc(p.github.replace('https://', ''))}</span></a>` : ''}
					${p.live ? `<a class="plink" href="${p.live}">${icon('external')}<span>${esc(p.live.replace('https://', ''))}</span></a>` : ''}
				</div>
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
		<div class="sec">En desarrollo</div>
		<div class="body">
			${inDevProjects
				.map(
					(p) => `
			<div class="proj proj-dev">
				<h3>${p.name}</h3>
				<div class="sub">${p.tagline}</div>
				<div class="plinks">
					${p.github ? `<a class="plink" href="${p.github}">${icon('github')}<span>${esc(p.github.replace('https://', ''))}</span></a>` : ''}
				</div>
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
		font-size: 8.2pt;
		line-height: 1.45;
	}
	.wrap { max-width: 184mm; margin: 0 auto; }
	.topbar {
		height: 4px;
		margin-bottom: 6px;
		background: linear-gradient(90deg, #a8dadc, #2a3b4c);
		border-radius: 2px;
	}

	.head { text-align: center; border-bottom: 1.5px solid #2a3b4c; padding-bottom: 7px; }
	.head h1 {
		font-size: 21pt;
		font-weight: 700;
		letter-spacing: 0.03em;
		color: #2a3b4c;
		line-height: 1.15;
	}
	.head .role {
		margin-top: 3px;
		font-size: 10pt;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.26em;
		color: #6b7a8a;
	}
	.head .profile {
		margin: 5px auto 0;
		max-width: 170mm;
		font-size: 7.8pt;
		color: #444444;
		line-height: 1.5;
	}
	.head .location {
		margin-top: 5px;
		font-size: 8.4pt;
		font-weight: 600;
		color: #2a3b4c;
	}
	.head .location svg { margin-right: 5px; color: #a8dadc; }
	.head .contact { margin-top: 3px; font-size: 8.2pt; }
	.head .clink {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: #2a3b4c;
		text-decoration: none;
	}
	.head .clink svg { color: #a8dadc; }
	.head .sep { margin: 0 6px; color: #a8dadc; }

	.row {
		display: grid;
		grid-template-columns: 28mm 1fr;
		gap: 0 6mm;
		padding: 4px 0;
		border-bottom: 0.8px solid #e0e6ed;
		break-inside: avoid;
		page-break-inside: avoid;
	}
	.row:last-child { border-bottom: none; }
	.sec {
		font-size: 9.5pt;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #2a3b4c;
		padding-top: 1px;
	}
	.sec::after {
		content: '';
		display: block;
		width: 16px;
		height: 2px;
		margin-top: 3px;
		border-radius: 1px;
		background: #a8dadc;
	}

	.body h3 { font-size: 9pt; font-weight: 700; color: #2a3b4c; margin-bottom: 1px; }
	.body .sub { color: #666666; font-size: 8.2pt; }
	ul.bullets { margin: 2px 0 0 13px; padding: 0; }
	ul.bullets li { color: #333333; }
	ul.bullets li::marker { color: #2a3b4c; }
	.item { margin-bottom: 4px; break-inside: avoid; page-break-inside: avoid; }
	.item:last-child { margin-bottom: 0; }
	.proj { margin-bottom: 4px; break-inside: avoid; page-break-inside: avoid; }
	.proj:last-child { margin-bottom: 0; }
	.proj .status { color: #6b7a8a; font-size: 8pt; font-weight: 400; }
	.tech { color: #7a8794; font-size: 7.8pt; margin-top: 1px; }
	.links { color: #5a6a7a; font-size: 7.5pt; margin-top: 2px; }
	.links a { color: #2563eb; text-decoration: underline; }
	.plinks { margin-top: 2px; }
	.plink {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #2a3b4c;
		text-decoration: none;
		font-size: 7.5pt;
	}
	.plink svg { color: #a8dadc; width: 10px; height: 10px; }
	.proj-dev { margin-bottom: 3px; }
	.proj-dev .sub { font-size: 7.8pt; }
	.skill { margin-bottom: 2px; }
	.skill b { color: #2a3b4c; }
	.lang { margin-bottom: 2px; }
	.lang b { color: #2a3b4c; }
</style>
</head>
<body>
	<div class="wrap">
		<div class="topbar"></div>
		<header class="head">
			<h1>${esc(person.name)}</h1>
			<div class="role">${esc(person.role)}</div>
			<p class="profile">${perfil}</p>
			<div class="location">${icon('map')} ${esc(person.location)}</div>
			<div class="contact">
				${contact
					.map((c) => `<a class="clink" href="${esc(c.href)}">${icon(c.icon)}<span>${c.label}</span></a>`)
					.join('<span class="sep">·</span>')}
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
		margin: { top: '8mm', bottom: '8mm', left: '12mm', right: '12mm' },
	});
	writeFileSync(out, pdf);
	console.log('PDF generado:', out, `(${pdf.length} bytes)`);
} finally {
	await browser.close();
}
