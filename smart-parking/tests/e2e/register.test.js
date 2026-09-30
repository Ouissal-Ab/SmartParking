const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function registerNewUser() {
  const driver = await new Builder().forBrowser('chrome').build();

  // Generate a unique email so the test can run multiple times
  const stamp = Date.now();
  const email = `test_${stamp}@parking.com`;
  const plate = `${stamp.toString().slice(-5)}-X-99`;

  try {
    console.log('→ Opening register page');
    await driver.get(`${BASE_URL}/register`);

    console.log('→ Filling form');
    await driver.findElement(By.css('input[name="prenom"]')).sendKeys('Test');
    await driver.findElement(By.css('input[name="nom"]')).sendKeys('User');
    await driver.findElement(By.css('input[name="email"]')).sendKeys(email);
    await driver.findElement(By.css('input[name="telephone"]')).sendKeys('0612345678');
    await driver.findElement(By.css('input[name="immatriculation"]')).sendKeys(plate);
    await driver.findElement(By.css('input[name="password"]')).sendKeys('test1234');
    await driver.findElement(By.css('input[name="confirmPassword"]')).sendKeys('test1234');

    console.log(`→ Submitting registration (email: ${email})`);
    await driver.findElement(By.css('button[type="submit"]')).click();

    console.log('→ Waiting for redirect to /login');
    await driver.wait(until.urlContains('/login'), 30_000);

    const finalUrl = await driver.getCurrentUrl();
    assert.ok(finalUrl.includes('/login'), `Expected /login, got: ${finalUrl}`);
    console.log(`✅ Registration successful — redirected to ${finalUrl}`);
  } finally {
    await driver.quit();
  }
}

module.exports = { registerNewUser };