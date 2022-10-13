// import chromedriver so that selenium can by itself open a chrome driver

import should1 from 'chai';
const should = should1.should();

//const {Builder, By, until} = require('selenium-webdriver');
import { Builder, Browser, By, Key, until } from 'selenium-webdriver';
import chromedriver from 'chromedriver';

import assert from 'assert';

// describe test
describe('Log in default user', function () {
    // it describes expected behaviour when user perfroms search on google
    it('Log in default user', async function () {
        // open chrome browser
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            // navigate to to this website
            await driver.get('http://localhost:3001/');

            // find element
            await driver.findElement(By.className('card-title'));

            // insert the login data
            await driver.findElement(By.id('username')).sendKeys('Sven1');
            await driver.findElement(By.id('pw')).sendKeys('Start', Key.ENTER);            

            /* wait for the page to load the search result untill the page
              has the title for pw table */
            await driver.wait(until.elementIsVisible(driver.findElement(By.className('card-title'))), 10000);

            // Get the pagetitle of the current Page
            let pwTableTitle = await driver.findElement(By.className('card-title')).getText();

            // assert that the current pageTitle is equal to 'Reflect run - Google Search'
            assert.strictEqual(pwTableTitle, 'Deine Passwörter');
            if (pwTableTitle) {
                console.log('Page Title:', pwTableTitle);
            }
        } 
        catch (error) {
            console.log(error);
        }
        finally {
            // close the browser
            await driver.quit();
        }
    });
});
