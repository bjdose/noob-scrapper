const pageScraper = require('./page-scrapper');
const fs = require('fs');

async function scrapeAll(browserInstance, category){
    let browser;
    let index;
    try{
        browser = await browserInstance;
        index = category.replace(/\s/g, "").toLowerCase();
        let scrapedData = {};

        console.info('index', index);

        console.time('task');

        // Call the scraper for different set of books to be scraped
        scrapedData[index] = await pageScraper.scraper(browser, category);
 
        await browser.close();

        fs.writeFile(`./data/${index}.json`, JSON.stringify(scrapedData), 'utf8', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(`The data has been scraped and saved successfully! View it at ./${index}.json`);
            console.timeEnd('task');
        });


    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, category) => scrapeAll(browserInstance, category)