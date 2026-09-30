const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@parking.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function loginAsAdmin() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    console.log('→ Opening login page');
    await driver.get(`${BASE_URL}/login`);

    console.log('→ Filling form');
    await driver.findElement(By.css('input[type="email"]')).sendKeys(ADMIN_EMAIL);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(ADMIN_PASSWORD);

    console.log('→ Submitting');
    await driver.findElement(By.css('button[type="submit"]')).click();

    console.log('→ Waiting for redirect');
    await driver.wait(until.urlContains('/admin'), 10_000);

    const finalUrl = await driver.getCurrentUrl();
    assert.ok(finalUrl.includes('/admin'), `Expected /admin in URL, got: ${finalUrl}`);
    console.log(`✅ Login successful — redirected to ${finalUrl}`);
  } finally {
    await driver.quit();
  }
}

async function loginWithInvalidPassword() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    console.log('→ Opening login page (invalid case)');
    await driver.get(`${BASE_URL}/login`);

    await driver.findElement(By.css('input[type="email"]')).sendKeys(ADMIN_EMAIL);
    await driver.findElement(By.css('input[type="password"]')).sendKeys('wrong-password-123');
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Wait a bit for the error toast to appear, URL should NOT change
    await driver.sleep(2000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/login'), `Expected to stay on /login, got: ${url}`);
    console.log('✅ Invalid login correctly rejected — still on /login');
  } finally {
    await driver.quit();
  }
}

module.exports = { loginAsAdmin, loginWithInvalidPassword };