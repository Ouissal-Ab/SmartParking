const { registerNewUser } = require('./register.test.js');

const tests = [
  { name: 'Register new user', fn: registerNewUser }
];

(async () => {
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    console.log(`\n=== ${name} ===`);
    try {
      await fn();
      passed++;
    } catch (err) {
      failed++;
      console.error(`❌ FAILED: ${name}`);
      console.error(err.message || err);
    }
  }

  console.log(`\n=========================`);
  console.log(`Passed: ${passed} / ${tests.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`=========================`);

  process.exit(failed === 0 ? 0 : 1);
})();