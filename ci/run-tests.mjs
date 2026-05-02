import { spawn } from 'child_process';
import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function runTests() {
  let server = null;
  let browser = null;

  try {
    console.log('Starting http-server on port 8080...');
    server = spawn('npx', ['http-server', projectRoot, '-p', '8080', '-s'], {
      stdio: 'ignore',
      cwd: projectRoot,
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Launching Chromium...');
    browser = await chromium.launch();

    const testDir = path.join(projectRoot, 'test');
    const testFiles = readdirSync(testDir)
      .filter(file => file.endsWith('.test.html'))
      .map(file => `test/${file}`);

    if (testFiles.length === 0) {
      console.error('No test files found');
      process.exit(1);
    }

    let totalPass = 0;
    let totalFail = 0;
    const failures = [];

    for (const testFile of testFiles) {
      console.log(`\nRunning ${testFile}...`);
      const url = `http://localhost:8080/${testFile}`;
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: 'load', timeout: 15000 });

        const results = await page.waitForFunction(
          () => window.__loomTestResults,
          { timeout: 30000 }
        ).then(handle => handle.jsonValue());

        const { pass = 0, fail = 0, failures: testFailures = [] } = results;
        totalPass += pass;
        totalFail += fail;

        if (fail > 0) {
          console.log(`  ✓ ${pass} passed, ✗ ${fail} failed`);
          testFailures.forEach(f => failures.push({ file: testFile, ...f }));
        } else {
          console.log(`  ✓ ${pass} passed`);
        }
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        totalFail++;
        failures.push({ file: testFile, error: error.message });
      } finally {
        await page.close();
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total: ${totalPass} passed, ${totalFail} failed`);
    console.log(`${'='.repeat(50)}`);

    if (failures.length > 0) {
      console.log('\nFailures:');
      failures.forEach(f => {
        console.log(`  - ${f.file}: ${f.name || ''} ${f.error || f.message || ''}`);
      });
    }

    process.exit(totalFail > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (server) server.kill();
    if (browser) await browser.close();
  }
}

runTests();
