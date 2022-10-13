// import chromedriver so that selenium can by itself open a chrome driver

import should1 from 'chai';
const should = should1.should();

//const {Builder, By, until} = require('selenium-webdriver');
import { Builder, Browser, By, Key, until } from 'selenium-webdriver';
import chromedriver from 'chromedriver';

import assert from 'assert';
import helper from './helper/helper.js';

// describe test
describe('Log in default user', function () {
    // it describes expected behaviour when user perfroms search on google
    it('Log in default user', async function () {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            assert.strictEqual(await helper.login(driver), true);
        } 
        catch (error) {
            console.log(error);
        }finally {
            // close the browser
            await driver.quit();
        }
    });
});
