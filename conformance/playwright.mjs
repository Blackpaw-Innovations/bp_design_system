import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const rules = JSON.parse(readFileSync(new URL('./experience-rules.json', import.meta.url), 'utf8'));

const REQUIRED_STATES = ['loading', 'empty', 'error', 'populated', 'disabled', 'permission'];
const REQUIRED_HEADERS = ['content-security-policy', 'x-content-type-options', 'referrer-policy'];

function assertManifest(config) {
  if (!config?.browser?.routes?.length) throw new Error('DS-05: browser.routes must declare every route.');
  if (!config.browser.coreTasks?.length) throw new Error('DS-11: browser.coreTasks must declare at least one golden path.');
  const paths = new Set(config.browser.routes.map((route) => route.path));
  for (const route of config.browser.routes) {
    for (const field of ['archetype', 'roles', 'dataAuthority']) {
      if (!route[field] || (Array.isArray(route[field]) && !route[field].length)) {
        throw new Error(`DS-05: ${route.path} is missing ${field}.`);
      }
    }
    if (route.parent && !paths.has(route.parent)) throw new Error(`DS-05: ${route.path} has undeclared parent ${route.parent}.`);
    const absent = REQUIRED_STATES.filter((state) => !route.states?.includes(state));
    if (absent.length) throw new Error(`DS-07: ${route.path} is missing states: ${absent.join(', ')}.`);
  }
  for (const task of config.browser.coreTasks) {
    if (task.steps.length > rules.staticDefaults.maxCoreTaskSteps) {
      throw new Error(`DS-11: ${task.name} exceeds ${rules.staticDefaults.maxCoreTaskSteps} meaningful steps.`);
    }
  }
}

function attachRuntimeGuards(page, failures) {
  page.on('pageerror', (error) => failures.push(`page error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console error: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 500) failures.push(`HTTP ${response.status()}: ${response.url()}`);
  });
}

async function auditDom(page, viewport) {
  return page.evaluate(({ minimumTouchTargetPx, maxHorizontalOverflowPx, mobile }) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const named = (element) => element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent?.trim();
    const controls = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')].filter(visible);
    const unnamed = controls.filter((element) => !named(element) && !(element instanceof HTMLInputElement && element.labels?.length));
    const tiny = mobile ? controls.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width < minimumTouchTargetPx || rect.height < minimumTouchTargetPx;
    }) : [];
    const duplicateIds = [...document.querySelectorAll('[id]')]
      .map((element) => element.id)
      .filter((id, index, ids) => id && ids.indexOf(id) !== index);
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth;
    const deceptive = [...document.querySelectorAll('*')].filter((element) => {
      if (!visible(element) || getComputedStyle(element).cursor !== 'pointer') return false;
      return !element.matches('button, a[href], input, select, textarea, summary, label, [role="button"], [role="link"], [tabindex]') && !element.closest('button, a[href], label, summary');
    });
    return {
      overflow,
      unnamed: unnamed.slice(0, 10).map((element) => element.outerHTML.slice(0, 180)),
      tiny: tiny.slice(0, 10).map((element) => `${element.tagName.toLowerCase()}:${named(element) || '(unnamed)'}`),
      duplicateIds: [...new Set(duplicateIds)],
      deceptive: deceptive.slice(0, 10).map((element) => element.outerHTML.slice(0, 180)),
      headingCount: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main, [role="main"]').length,
      title: document.title,
      textLength: document.body.innerText.trim().length,
      maxHorizontalOverflowPx,
    };
  }, {
    minimumTouchTargetPx: rules.staticDefaults.minimumTouchTargetPx,
    maxHorizontalOverflowPx: rules.staticDefaults.maxHorizontalOverflowPx,
    mobile: viewport.width < 600,
  });
}

export function defineBlackpawConformance(config) {
  assertManifest(config);
  const routes = config.browser.routes;
  const viewports = rules.staticDefaults.requiredViewports.map(([width, height]) => ({ width, height }));

  test.describe('Blackpaw experience conformance', () => {
    for (const viewport of viewports) {
      for (const route of routes) {
        test(`${route.name} · ${viewport.width}x${viewport.height}`, async ({ browser }, testInfo) => {
          const contextOptions = { viewport };
          if (route.auth === 'required') {
            const baseUrl = String(testInfo.project.use.baseURL || '');
            const localTarget = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/|$)/.test(baseUrl);
            if (!config.browser.authenticatedStorageState && !localTarget) throw new Error(`DS-12: ${route.path} needs authenticatedStorageState evidence.`);
            if (config.browser.authenticatedStorageState) contextOptions.storageState = config.browser.authenticatedStorageState;
          }
          const context = await browser.newContext(contextOptions);
          const page = await context.newPage();
          const failures = [];
          attachRuntimeGuards(page, failures);
          const response = await page.goto(route.path, { waitUntil: 'networkidle' });
          expect(response?.status(), 'DS-13 route response').toBeLessThan(400);
          if (route.auth === 'required') expect(new URL(page.url()).pathname, 'DS-05 protected route must not bounce to login').not.toBe('/login');
          const audit = await auditDom(page, viewport);
          await testInfo.attach('blackpaw-dom-audit', { body: JSON.stringify(audit, null, 2), contentType: 'application/json' });
          expect(audit.textLength, 'DS-13 blank page').toBeGreaterThan(20);
          expect(audit.title, 'DS-09 document title').not.toBe('');
          expect(audit.mainCount, 'DS-09 main landmark').toBe(1);
          expect(audit.headingCount, 'DS-09 one page heading').toBe(1);
          expect(audit.unnamed, 'DS-09 unnamed controls').toEqual([]);
          expect(audit.duplicateIds, 'DS-09 duplicate ids').toEqual([]);
          expect(audit.deceptive, 'DS-06 deceptive click affordances').toEqual([]);
          expect(audit.overflow, 'DS-08 horizontal overflow').toBeLessThanOrEqual(audit.maxHorizontalOverflowPx);
          expect(audit.tiny, 'DS-08/09 mobile targets below 44px').toEqual([]);
          expect(failures, 'DS-13 runtime failures').toEqual([]);
          await expect(page).toHaveScreenshot(`${route.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${viewport.width}.png`, { fullPage: true });
          await context.close();
        });
      }
    }

    for (const task of config.browser.coreTasks) {
      test(`core task · ${task.name}`, async ({ page }) => {
        await page.goto(task.startPath, { waitUntil: 'networkidle' });
        for (const step of task.steps) await page.getByRole(step.role, { name: step.name }).click();
        await expect(page).toHaveURL(new RegExp(task.expectedPath));
      });
    }

    test('production delivery', async ({ request }) => {
      test.skip(!config.browser.productionUrl, 'Production URL is not declared.');
      const response = await request.get(config.browser.productionUrl);
      expect(response.status(), 'DS-13 production response').toBeLessThan(400);
      const body = await response.text();
      expect(body).not.toContain('/@vite/client');
      expect(body).not.toMatch(/<script[^>]+src=["']\/src\//);
      const headers = response.headers();
      for (const header of REQUIRED_HEADERS) expect(headers[header], `DS-13 missing ${header}`).toBeTruthy();
    });
  });
}
