const puppeteer = require('puppeteer');

async function startBrowser(){
    let browser;

    try {
        console.log("Opening the browser......");

        browser = await puppeteer.launch({
            /* executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome', */
            defaultViewport: null,
            headless: false,
            devtools: false,
            args:[
               /*  '--user-data-dir=/Users/brayansalcedo/Library/Application\ Support/Google/Chrome', */
                '--profile-directory=Default',
                '--disable-setuid-sandbox',
                '--no-sandbox'
            ]
        });

        return browser;

    } catch (err) {
        console.log("Could not create a browser instance => : ", err);
    }


}

module.exports = {
    startBrowser
};