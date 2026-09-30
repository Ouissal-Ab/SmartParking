const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const USER_EMAIL = process.env.USER_EMAIL || 'Yousra@gmail.com';
const USER_PASSWORD = process.env.USER_PASSWORD || 'yousra1234';
const PARKING_ID = process.env.PARKING_ID || '3';

async function loginAndReserveWithCard() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    // 1. Login
    console.log('→ Login as user');
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.css('input[type="email"]')).sendKeys(USER_EMAIL);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(USER_PASSWORD);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/dashboard'), 10_000);

    // 2. Go straight to the reserve page for a known parking
    console.log(`→ Open reserve page for parking ${PARKING_ID}`);
    await driver.get(`${BASE_URL}/reserve/${PARKING_ID}`);

    // 3. Wait for the spot grid to render and pick the first FREE (enabled) spot
    console.log('→ Pick first available spot');
    await driver.wait(
      until.elementLocated(By.css('button:not([disabled])[type="button"]')),
      10_000,
    );
    const spotButtons = await driver.findElements(
      By.xpath("//button[@type='button' and not(@disabled) and string-length(normalize-space(text())) > 0 and string-length(normalize-space(text())) < 6]"),
    );
    let picked = false;
    for (const btn of spotButtons) {
      const txt = (await btn.getText()).trim();
      // Spot numbers are short numeric/alphanumeric; skip nav buttons
      if (/^[A-Z]?\d+$/.test(txt)) {
        await btn.click();
        console.log(`   picked spot: ${txt}`);
        picked = true;
        break;
      }
    }
    assert.ok(picked, 'No free spot found to click');

    // 4. Click "Suivant" → step 1 (récap)
    console.log('→ Step 1: Suivant');
    await clickButtonByText(driver, 'Suivant');

    // 5. Click "Suivant" → step 2 (ready)
    console.log('→ Step 2: Suivant');
    await clickButtonByText(driver, 'Suivant');

    // 6. Click "Procéder au paiement" → /payment
    console.log('→ Step 3: Procéder au paiement');
    await clickButtonByText(driver, 'Procéder au paiement');
    await driver.wait(until.urlContains('/payment'), 10_000);

    // 7. Choose "Carte" payment method (default, but click to be explicit)
    console.log('→ Choose Carte');
    await clickButtonByText(driver, 'Carte');

    // 8. Fill the card form
    console.log('→ Fill card form');
    await driver.findElement(By.css('input[name="cardName"]')).sendKeys('Test User');
    await driver.findElement(By.css('input[name="cardNumber"]')).sendKeys('4242 4242 4242 4242');
    await driver.findElement(By.css('input[name="expiry"]')).sendKeys('12/29');
    await driver.findElement(By.css('input[name="cvv"]')).sendKeys('123');

    // 9. Submit payment — button label starts with "Payer"
    console.log('→ Click Payer');
    await clickButtonByTextContains(driver, 'Payer');

    // 9. Expect redirect to /confirmation
    console.log('→ Waiting for confirmation page');
    await driver.wait(until.urlContains('/confirmation'), 100_000);

    const finalUrl = await driver.getCurrentUrl();
    assert.ok(finalUrl.includes('/confirmation'), `Expected /confirmation, got: ${finalUrl}`);
    console.log(`✅ Reservation + Card payment successful — ${finalUrl}`);
  } finally {
    await driver.quit();
  }
}

async function clickButtonByText(driver, text) {
  const btn = await driver.wait(
    until.elementLocated(By.xpath(`//button[normalize-space(text())='${text}']`)),
    10_000,
  );
  await driver.wait(until.elementIsEnabled(btn), 5_000);
  await btn.click();
}

async function clickButtonByTextContains(driver, substring) {
  const btn = await driver.wait(
    until.elementLocated(By.xpath(`//button[contains(normalize-space(.), "${substring}")]`)),
    10_000,
  );
  await driver.wait(until.elementIsEnabled(btn), 5_000);
  await btn.click();
}

module.exports = { loginAndReserveWithCard };