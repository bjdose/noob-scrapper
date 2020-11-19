const browserObject = require('./browser');
const scraperController = require('./justo-controller');

//Start the browser and create a browser instance
const browserInstance = browserObject.startBrowser();

const args = process.argv.slice(2);

// Pass the browser instance to the scraper controller
scraperController(browserInstance, args[0]);