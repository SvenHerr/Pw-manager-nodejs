//const should = require('chai').should();
import should1 from 'chai';
const should = should1.should();

//const {Builder, By, until} = require('selenium-webdriver');
import {Builder, Browser, By,Key, until} from 'selenium-webdriver';
import chromedriver from 'chromedriver';

// import chromedriver so that selenium can by itself open a chrome driver

(async function openChromeTest() {
    // open chrome browser
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // go to example website
        await driver.get('https://example.com/');
    } finally {
    // close the chrome browser
        await driver.quit();
    }
})();
