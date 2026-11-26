# NeighbourNet (demo)

Static demo: no server, no Firebase yet. Posts are saved in each visitor's own browser (localStorage), so people do not see each other's posts yet. Use it to test the screens and flow.

## Put it on your website
1. Copy this folder into your website repo, so you have `noticeboard/index.html`, `style.css`, `app.js`.
2. Commit and push. It will be at `yourname.github.io/your-repo/noticeboard/`.
3. Link to that address from your site.

## Edit
- `SITES` at the top of `app.js`: your list of sites (streets, extensions or sections) in your area.
- `ADMIN_PIN`: demo only. Anyone can read it in the code. Real approval security needs Firebase security rules.

## Next step
Replace the load/save functions in `app.js` with Firestore calls so everyone shares the same posts. Do that in a NEW Firebase project, not the gift-draw one.

Note: the page loads Bootstrap from a CDN (cdn.jsdelivr.net), so it needs an internet connection.
- `logo-mark.svg`: the logo icon used in the top bar and as the browser tab icon. Keep it in the same folder as `index.html`.

## Photos
Files in `images/` came from Unsplash (free licence). Keep the Unsplash link and photographer name for each one here:
- `hero-street.webp`: street scene (banner). Source link: [add]
- `water.webp`: tap. Source link: [add]
- `power.webp`: worker on a pole. Source link: [add]
- `business.webp`: apples at a stall (cropped to remove faces). Source link: [add]
Do not call the street photo "Kagiso" unless it really is.

## Locations
Every province, municipality, metro, city and town has its own folder with an `index.json` listing what is inside it. Extensions and sections are the smallest unit, so they are just lines in their town's list.

```
locations/
  index.json                          the 9 provinces
  gauteng/
    index.json                        Gauteng's municipalities
    city-of-johannesburg/index.json   a metro: add its suburbs and townships here
    west-rand-district/
      index.json
      mogale-city/
        index.json
        kagiso/index.json             Kagiso's extensions
        krugersdorp/index.json
```
- A place with a `"dir"` value has its own folder inside the current one. The page loads that folder only when someone picks the place.
- A folder with `{"c": []}` is an empty placeholder. If the file is missing, the page treats the place as empty and carries on, so you can create placeholders as you need them.
- To add places inside a place, put them in that place's `index.json`. To give one of those new places its own folder, make a folder named like it (lowercase, dashes) with an `index.json`, and add `"dir": "that-name/"` and a `"kids"` label (what to call the places inside it) to its entry.
- Never change a place's `id` after people have posted with it. Names can change.
- The lists were written from memory. Check municipality names against the Municipal Demarcation Board before going live. Towns and extensions in Gauteng are samples.
- The page only loads these files when opened from the web (GitHub Pages), not by double-clicking `index.html`.
- In admin mode, "Add an area here" saves new areas in this browser only (demo). With Firebase they will be shared.
- Posts store the full chosen path, so picking "Gauteng" shows everything in Gauteng, and picking "Kagiso" shows only Kagiso.

## Share preview, SEO and installing
- In `index.html`, replace `https://YOUR-USERNAME.github.io/YOUR-REPO/noticeboard/` in the three `og:url`, `og:image` lines with your real address. Without this, WhatsApp will not show the preview picture (`images/og-share.jpg`).
- Test a link by pasting it into a WhatsApp chat to yourself. WhatsApp remembers old previews for a while, so test after you have set the final address.
- `manifest.webmanifest` and the icons in `images/` let people use "Add to Home Screen" and get an app-style icon.
- When you buy your domain: add a `robots.txt` and `sitemap.xml` at the top of the site, and register the site in Google Search Console (free).
- Dark mode: the button is in the footer. The choice is remembered on that device.
