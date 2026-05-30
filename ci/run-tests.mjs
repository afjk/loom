import { spawn } from 'child_process';
import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
let useMacSandboxChromiumFallback = false;

async function runTests() {
  let server = null;
  let browser = null;

  try {
    // Start http-server on port 8080
    console.log('Starting http-server on port 8080...');
    server = spawn('npx', ['http-server', projectRoot, '-p', '8080', '-s'], {
      stdio: 'ignore',
      cwd: projectRoot,
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Launch Chromium
    console.log('Launching Chromium...');
    browser = await launchChromium();

    // Find all test files
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

    // Run each test file
    for (const testFile of testFiles) {
      console.log(`\nRunning ${testFile}...`);
      const url = `http://localhost:8080/${testFile}`;
      if (!browser?.isConnected()) {
        browser = await launchChromium();
      }

      let page;
      try {
        page = await browser.newPage();
      } catch (error) {
        if (!isClosedBrowserError(error)) throw error;
        browser = await launchChromium();
        page = await browser.newPage();
      }

      try {
        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for results to appear (max 30 seconds)
        let results = null;
        const startTime = Date.now();
        while (!results && Date.now() - startTime < 30000) {
          results = await page.evaluate(() => window.__loomTestResults);
          if (!results) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        if (!results) {
          console.error(`  ✗ Test results not found for ${testFile}`);
          totalFail++;
          failures.push({ file: testFile, error: 'Results timeout' });
          continue;
        }

        const { pass = 0, fail = 0, failures: testFailures = [] } = results;
        totalPass += pass;
        totalFail += fail;

        if (fail > 0) {
          console.log(`  ✓ ${pass} passed, ✗ ${fail} failed`);
          if (testFailures && testFailures.length > 0) {
            testFailures.forEach(f => {
              failures.push({ file: testFile, ...f });
            });
          }
        } else {
          console.log(`  ✓ ${pass} passed`);
        }
      } catch (error) {
        console.error(`  ✗ Error running ${testFile}: ${error.message}`);
        totalFail++;
        failures.push({ file: testFile, error: error.message });
      } finally {
        await page.close().catch(() => {});
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total: ${totalPass} passed, ${totalFail} failed`);
    console.log(`${'='.repeat(50)}`);

    if (failures.length > 0) {
      console.log('\nFailures:');
      failures.forEach(f => {
        console.log(`  - ${f.file}: ${f.error || f.message}`);
      });
    }

    process.exit(totalFail > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.kill();
    }
    if (browser) {
      await browser.close();
    }
  }
}

function isClosedBrowserError(error) {
  return /Target page, context or browser has been closed/.test(String(error?.message ?? error));
}

async function launchChromium() {
  if (useMacSandboxChromiumFallback) {
    return chromium.launch({ args: ['--single-process', '--disable-gpu'] });
  }

  try {
    return await chromium.launch();
  } catch (error) {
    const message = String(error?.message ?? error);
    const canRetryForMacSandbox =
      process.platform === 'darwin' &&
      /MachPortRendezvous|bootstrap_check_in|Permission denied/.test(message);
    if (!canRetryForMacSandbox) throw error;

    console.warn('Default Chromium launch failed in macOS sandbox; retrying with --single-process.');
    useMacSandboxChromiumFallback = true;
    return chromium.launch({ args: ['--single-process', '--disable-gpu'] });
  }
}

runTests();
