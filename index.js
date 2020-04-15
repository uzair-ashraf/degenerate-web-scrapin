// const scrape = require('website-scraper');
// const path = require('path');

// const options = {
//   urls: ['https://ww3.mangafox.online/oshikake-twin-tail/vol-1-chapter-1-daily-life-a-1125652206975555'],
//   directory: path.join(__dirname, '/manga-fox'),
//   sources: [
//     {selector: 'img', attr: 'src'}
//   ]
// };

// (async () => {
//   try {
//   const result = await scrape(options);
//   } catch (err) {
//     console.error(err)
//   }
// })()

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const imagesToPdf = require("images-to-pdf")

let imagesPathList = [];

async function mangaPandaDownloader(url, pathName) {
  try {
    const baseUrl = 'http://www.mangapanda.com'
    const response = await fetch(url)
    const body = await response.text()
    const $ = cheerio.load(body);
    const imgContainer = $('#imgholder')
    let pageIndex = 0;
    let nextUrl = $(imgContainer[0].children[pageIndex]).attr('href')
    console.log(nextUrl)
    if(!nextUrl) {
      // Sometimes the page renders with a large image button
      // This causes the structure to change
      // So will need to modify the indexes of the elements once nextUrl fails
      pageIndex = 2
      nextUrl = $(imgContainer[0].children[pageIndex]).attr('href')
      console.log(nextUrl)
      if(!nextUrl) {
        console.log('completed')
        convertMangaToPDF(pathName)
        return;
      }
    }
    const pageUrl = $(imgContainer[0].children[pageIndex].children[0]).attr('src')
    const pageTitle = $(imgContainer[0].children[pageIndex].children[0]).attr('alt')
    // If the pathname is falsy it means we never had one and its the first time
    // the function is called. So we can give it a pathname once instead of
    // doing it every time, this also lets us pass it to the conversion function
    if(!pathName) {
      pathName = new URL(url).pathname.split('/')[1]
    }
    if (!fs.existsSync(pathName)) {
      fs.mkdirSync(pathName);
    }
    const fileResponse = await fetch(pageUrl)
    const filePath = path.join(__dirname, `${pathName}/${pageTitle}.jpg`)
    imagesPathList.push(filePath);
    const fileStream = fs.createWriteStream(filePath)
    await new Promise((resolve, reject) => {
      fileResponse.body.pipe(fileStream);
      fileResponse.body.on("error", err => {
        console.log("There was an error.")
        reject(err)
      })
      fileStream.on("finish", () => {
        console.log(`Downloaded ${pageTitle} successfully`)
        resolve()
      })
    })
    return mangaPandaDownloader(`${baseUrl}${nextUrl}`, pathName)
  } catch(err) {
    console.error(err)
  }
}

async function convertMangaToPDF(directory) {
  try {
    await imagesToPdf(imagesPathList, path.join(__dirname, `${directory}/${directory}.pdf`));
    imagesPathList = [];
    console.log("Pdf generated successfully")
  } catch(err) {
    console.error(err)
  }
}

//Take the url of the first chapter of the manga
mangaPandaDownloader('http://www.mangapanda.com/kitsune-no-oyome-chan/1', null)
