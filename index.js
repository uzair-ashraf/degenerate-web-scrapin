const scrape = require('website-scraper');
const path = require('path');

const options = {
  urls: ['https://ww3.mangafox.online/oshikake-twin-tail/vol-1-chapter-1-daily-life-a-1125652206975555'],
  directory: path.join(__dirname, '/manga-fox'),
  sources: [
    {selector: 'img', attr: 'src'}
  ]
};

(async () => {
  try {
  const result = await scrape(options);
  } catch (err) {
    console.error(err)
  }
})()
