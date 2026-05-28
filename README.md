# Linz Tattoo Website — Final Clean Version

Static website ready for GitHub + Netlify.

## Main files
- index.html
- css/style.css
- js/script.js
- admin/config.yml
- admin/index.html
- data/portfolio.json
- data/galleries/*.json
- data/reviews.json
- data/site.json
- img/artist/linz.jpg

## Notes
- Portfolio galleries are editable from Decap CMS under `Portfolio Galleries`.
- Each style has its own JSON file under `data/galleries/`.
- The website loads those gallery files first, with `data/portfolio.json` as fallback.
- Booking and review forms send to bylinztattoo@gmail.com through FormSubmit.
- Netlify Identity + Git Gateway must be enabled for `/admin`.
