// import chromedriver so that selenium can by itself open a chrome driver

import assert from 'assert';
import chromedriver from 'chromedriver';
import {Browser, Builder} from 'selenium-webdriver';

import helper from './helper/helper.js';

// describe test
describe('Test Login and Logout', function() {
  // it describes expected behaviour when user perfroms search on google
  let driver;
  before(async function() {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
    driver.manage().window().maximize();
  });

  after(async function() { await driver.quit(); });

  it('Log in default user', async function() {
    try {
      let loginStatus = await helper.login(driver);
      loginStatus.should.be.true;
    } catch (error) {
      console.log(error);
    }
  });

  it('Logout user', async function() {
    try {
      let loginStatus = await helper.logout(driver);
      loginStatus.should.be.true;
    } catch (error) {
      console.log(error);
    }
  });
});
