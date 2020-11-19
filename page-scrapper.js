

const fs = require('fs');
const axios = require('axios');

const scraperObject = {
    url: 'https://www.justo.mx',
    async scraper(browser, category){

        const multiSearchOr = (text, searchWords) => {
            return searchWords.some((el) => {
                return text.match(new RegExp(el,"i"))
              })
        }

        const download = (uri, filename) => {
            axios.get(uri, { responseType: "stream" } )  
            .then(response => {  
                response.data.pipe(fs.createWriteStream(filename));  
            })  
                .catch(error => {  
                console.log('uri error:',error);  
            });  
        }

        let page = await browser.newPage();

        console.log(`Navigating to ${this.url}...`);

        // Navigate to the selected page
        await page.goto(this.url);

        const cookies = {
            'name': 'postal_code',
            'value': '06470'
        };

        await page.setCookie(cookies);

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
                    
                    const element = link
                    .querySelector('a[href] .product-card__info .product-card__price span span');
                    let price;

                    if (element) {
                        price = +element.textContent.replace(/\n/gi, "").replace('$', "");
                    } else {
                        price = 9999;
                    }

                    if (price <= 20) {
                        return link;
                     }

                });

                links =  links.map((el) => {
                    return {
                        name: el.querySelector('a[href] .product-card__info .product-card__name').textContent.replace(/\n/gi, ""),
                        href: el.querySelector('a[href]').href,
                        dataSrc: el.querySelector('a[href] .product-card__image img').getAttribute('data-src'),
                        price: el.querySelector('a[href] .product-card__info .product-card__price span span')
                            .textContent
                            .replace(/\n/gi, "")
                            .replace('$', "")
                    };
                });

                return links;
            }); 

            const conditions = [
                "asador", "asadores", "asador", "parrilla", "carbon", "carb", "grill", "parrillera", "barbecue", "bbq",
                "asado", "carne", "barbacoa"
            ];

            for(link of urls){
                const src = link.dataSrc.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "").toLowerCase().trim();
                const name = link.name.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "").toLowerCase().trim();
                const href = link.href.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "").toLowerCase().trim();

                if (link.price === 1) {
                    console.warn('LINK FOUND WITH PRICE 1 =>>>', link);
                }
                
                if (multiSearchOr(src, conditions) || multiSearchOr(name, conditions) || multiSearchOr(href, conditions)) {
                    console.warn('LINK FOUND', link);
                    download(link.dataSrc, `./images/match/${Date.now()}.${src.split('.').pop()}`);
                } else {
                    download(link.dataSrc, `./images/no-match/${Date.now()}.${src.split('.').pop()}`);
                }

                scrapedData.push(link);
            }

            // When all the data on this page is done, click the next button and start the scraping of the next page
            // You are going to check if this button exist first, so you know if there really is a next page.
            let nextButtonExist = false;

            try{
                const nextButton = await page.$eval('.page-item.active + .page-item > a', a => a.href);
                const nextPage = +nextButton.split('?page=')[1]

                console.info(`${category} next page =>`, nextPage);

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