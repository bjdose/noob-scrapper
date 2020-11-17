const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const tfnode = require('@tensorflow/tfjs-node');
const fs = require('fs');

const https = require('https');

const scraperObject = {
    url: 'https://www.justo.mx',
    async scraper(browser, category){
        const multiSearchOr = (text, searchWords) => {
            return searchWords.some((el) => {
                return text.match(new RegExp(el,"i"))
              })
        }

        const imageClassification = (url) => {
            //reads the entire contents of a file.
            //readFileSync() is synchronous and blocks execution until finished.
            // const imageBuffer = fs.readFileSync(path);


            https.get(url, res => {
                // Initialise an array
                const bufs = [];
        
                // Add the data to the buffer collection
                res.on('data', function (chunk) {
                    bufs.push(chunk)
                });
        
                // This signifies the end of a request
                res.on('end', async () => {
                    // We can join all of the 'chunks' of the image together
                    const data = Buffer.concat(bufs);

                    //Given the encoded bytes of an image,
                    //it returns a 3D or 4D tensor of the decoded image. Supports BMP, GIF, JPEG and PNG formats.
                    const image = tfnode.node.decodeImage(data);

                    // Load the model.
                    const mobilenetModel = await mobilenet.load();
                    // Classify the image.
                    const predictions = await mobilenetModel.classify(image);
                    console.log('Classification Results:', predictions);
                            
                    // Then we can call our callback.
                    // callback(null, data);
                });
            })
            // Inform the callback of the error.
            .on('error', console.error);


          }

        // imageClassification('https://media.justo.mx/__sized__/products/SmartTV-1-thumbnail-255x255-70.jpg');

        let page = await browser.newPage();

        console.log(`Navigating to ${this.url}...`);

        // Navigate to the selected page
        await page.goto(this.url);

        const categories = await page.$$eval('.categories-list > ul > li > a', (links) => {
            return links.map((__) => {
                return {
                    text: __.textContent,
                    href: __.href,
                }
            });
        });
        const morecategories = await page.$$eval('.categories-list > ul > .categories-list__more .dropdown-menu > a', (links) => {
            return links.map((__) => {
                return {
                    text: __.textContent,
                    href: __.href,
                }
            });
        });

        const all = [...categories, ...morecategories];
        const selected = all.find((___) => ___.text === category);

        if (!selected) {
            return;
        }

        // Navigate to the selected category
        await page.goto(selected.href);

        let scrapedData = [];

        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage(){
            await page.waitForSelector('.list-content');
            
            // Get the link to all the required books
            let urls = await page.$$eval('.product-list-container > li', (links) => {

                // Make sure the book to be scraped is in stock
                links = links.filter(link => {
                    const price = +link
                    .querySelector('a[href] .product-card__info .product-card__price span span')
                    .textContent
                    .replace(/\n/gi, "")
                    .replace('$', "");
                    if (price <= 20) {
                        return link;
                     }
                });

                links =  links.map((el) => {
                    return {
                        name: el.querySelector('a[href] .product-card__info .product-card__name').textContent.replace(/\n/gi, ""),
                        href: el.querySelector('a[href]').href,
                        dataSrc: el.querySelector('a[href] .product-card__image img').getAttribute('data-src')
                    };
                });

                return links;
            }); 

            const conditions = [
                "tv", "television", "pantalla", "televisor", "lg", "samsung", "pulgadas", "televisor",
                "screen", "LED"
            ];

            for(link of urls){
                const query = link.dataSrc.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "").toLowerCase().trim();
                
                if (multiSearchOr(query, conditions)) {
                    console.warn('LINK!!!', link);
                }

                scrapedData.push(link);
            }

            // When all the data on this page is done, click the next button and start the scraping of the next page
            // You are going to check if this button exist first, so you know if there really is a next page.
            let nextButtonExist = false;

            try{
                const nextButton = await page.$eval('.page-item.active + .page-item > a', a => a.href);
                const nextPage = +nextButton.split('?page=')[1]

                console.info('nextpage', nextPage);

                if (isNaN(nextPage)) {
                    nextButtonExist = false;  
                } else {
                    nextButtonExist = true; 
                }
            }
            catch(err){
                nextButtonExist = false;  
            }

            if(nextButtonExist){
                await page.click('.page-item.active + .page-item > a');
                return scrapeCurrentPage(); // Call this function recursively
            }

            await page.close();

            return scrapedData;
        }

        let data = await scrapeCurrentPage();

        return data;
    }
}

module.exports = scraperObject;