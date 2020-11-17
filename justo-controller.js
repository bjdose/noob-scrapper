const pageScraper = require('./justo-scrapper');
const fs = require('fs');

async function scrapeAll(browserInstance, category, index){
    let browser;
    try{
        browser = await browserInstance;
        let scrapedData = {};

        console.time('abc');

        scrapedData[index] = await pageScraper.scraper(browser, category);

        // Call the scraper for different set of books to be scraped
        /* scrapedData['despensa'] = await pageScraper.scraper(browser, 'Despensa');
        scrapedData['fruits'] = await pageScraper.scraper(browser, 'Frutas, Verduras y Granel');
        scrapedData['meat'] = await pageScraper.scraper(browser, 'Carnes y Pescados');
        scrapedData['higiene'] = await pageScraper.scraper(browser, 'Higiene Personal y Belleza'); */
        /* scrapedData['hogar'] = await pageScraper.scraper(browser, 'Hogar y Limpieza'); */
        /* scrapedData['beer'] = await pageScraper.scraper(browser, 'Cerveza, Vinos y Licores');
        scrapedData['drinks'] = await pageScraper.scraper(browser, 'Bebidas');
        scrapedData['frozen'] = await pageScraper.scraper(browser, 'Congelados');
        scrapedData['frooozen'] = await pageScraper.scraper(browser, 'Refrigeradores');
        scrapedData['pharma'] = await pageScraper.scraper(browser, 'Farmacia');
        scrapedData['pets'] = await pageScraper.scraper(browser, 'Mascotas');
        scrapedData['gift'] = await pageScraper.scraper(browser, 'Gift Cards'); */
 
        await browser.close();

        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The data has been scraped and saved successfully! View it at './data.json'");
            console.timeEnd('abc');
        });


    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, category, index) => scrapeAll(browserInstance, category, index)