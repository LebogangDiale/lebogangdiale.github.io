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
