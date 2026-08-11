# Repo notes

Static personal academic website. No build step: HTML + `css/main.css` + `js/*.js`,
with all content in `data/*.json`. Run `./preview.sh` to serve it at
http://localhost:8080.

## Cache-busting

The HTML pages load scripts with a version query (`js/me.js?v=5`). After editing
any file under `js/`, bump that number in every page that loads it — otherwise
browsers keep serving the old copy and the change appears to have no effect.

## Adding a publication

Add the entry to `data/publication.json` and include a `date` field set to the
insertion date, captured from the system clock (`date +%F`) — never ask the user
for it:

```json
{
  "title": "...",
  "authors": ["Yiming Lin", "..."],
  "conference": "Preprint",
  "year": 2026,
  "date": "2026-08-11",
  "paper_link": "https://arxiv.org/abs/...",
  "code_link": null,
  "video": null
}
```

`date` is used for ranking only and is never displayed — the badge shows just
`conference, year`. Sorting (in both `js/publications.js` and the About-page
preview in `js/me.js`): year descending, then dated entries before undated ones
(newest date first), then undated entries alphabetically by title. Older entries
have no `date` and keep their existing order.
