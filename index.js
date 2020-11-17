const browserObject = require('./browser');
const scraperController = require('./justo-controller');

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
Promise.all(
    scraperController(browserInstance, 'Hogar y Limpieza', '0'),
    scraperController(browserInstance, 'Despensa', '1'),
);