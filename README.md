# Sri Krishna Iron Works — website

Website for **srikrishnaironworks.com**. Plain HTML/CSS/JS with no build step, no server and no monthly fees.

## Pages

| File | Page |
|---|---|
| `index.html` | Homepage |
| `construction.html` | Services (warehouses, PEB, sheds, fabrication, roofing, mezzanines, platforms, canopies) |
| `products.html` | Fabricated steel products |
| `projects.html` | Project portfolio with filters and photo galleries |
| `about.html` | Story (since 1925), owners, capabilities, quality |
| `contact.html` | Quote form (sends via WhatsApp), contact details, map |
| `404.html` | Not-found page |

## How the quote form works

When a visitor taps **Send on WhatsApp**, WhatsApp opens with all their form details written into
one message to +91 98421 40007. They press Send, and the enquiry arrives in your WhatsApp. Visitors can
attach drawings or site photos in the same chat. Nothing is stored on any server.

## Editing

| What | Where |
|---|---|
| Phone, WhatsApp, email, address, hours, map | `js/config.js` |
| Projects (add new ones, photos, location, year) | `js/projects-data.js` + photos in `img/projects/` |
| Text on any page | the matching `.html` file |
| Colours / fonts | top of `css/styles.css` |

Before adding new project photos, resize them to about 1600px wide and compress them (for example at https://squoosh.app).

Stock photos in `img/stock/` are from Unsplash (free for commercial use, no credit required).
Replace them with your own workshop and project photos whenever you can.

## Preview on your computer

```bash
cd steel-website
npx serve .
# open the address it prints (e.g. http://localhost:3000)
```

Links use clean addresses (`/about`, not `about.html`). GitHub Pages and `npx serve` both
understand these; `python3 -m http.server` does not, so links between pages won't work with it.

## Publish on GitHub Pages (free)

1. Create a repository on github.com (e.g. `srikrishnaironworks`) and upload every file in this folder,
   including the hidden `.nojekyll` file.
2. **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)` → Save.
3. In about a minute the site is live at `https://<your-username>.github.io/srikrishnaironworks/`.

## Connect the domain srikrishnaironworks.com

1. Buy the domain (see the cheapest options below).
2. GitHub repo → **Settings → Pages → Custom domain** → enter `srikrishnaironworks.com` → Save.
3. At the registrar, add these DNS records:
   - `CNAME`  `www`  →  `<your-username>.github.io`
   - `A`  `@`  →  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. Wait for DNS to update (from a few minutes up to a few hours), then tick **Enforce HTTPS**.
5. Add the site to Google Search Console and submit `https://srikrishnaironworks.com/sitemap.xml`.
6. Create or claim the **Google Business Profile** for the workshop, and add the website link to it.
   For "steel fabrication Madurai" searches, this matters more than anything else.
