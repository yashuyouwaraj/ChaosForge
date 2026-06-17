/**
 * 🔥 HTTP METHOD VERIFICATION TEST
 * Tests POST, PUT, PATCH, DELETE operations
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token';
const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'test-project-123';
const TEST_RUN_ID = process.env.TEST_RUN_ID || 'test-run-123';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't throw on any status
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const log = (type, method, endpoint, status, details = '') => {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'NOTFOUND' ? '⚠️' : 'ℹ️';
  const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  
  console.log(`${icon} ${color}${method.padEnd(6)}${colors.reset} ${endpoint.padEnd(40)} ${colors.gray}[${status}]${colors.reset} ${details}`);
};

async function runTests() {
  console.log('\n' + colors.blue + '╔════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║          HTTP METHOD VERIFICATION TEST SUITE                    ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════════════════════════╝' + colors.reset + '\n');

  const results = {
    post: [],
    get: [],
    put: [],
    patch: [],
    delete: [],
  };

  // ===========================
  // 1. POST TESTS
  // ===========================
  console.log(colors.cyan + '📮 POST OPERATIONS' + colors.reset);
  console.log(colors.gray + '─'.repeat(70) + colors.reset);

  // Test POST /test/:projectId
  try {
    const response = await client.post(`/test/${TEST_PROJECT_ID}`, {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      config: {
        pattern: 'constant-rate',
        rate: 5,
        concurrency: 1,
        durationSec: 2,
      },
      headers: { 'User-Agent': 'Test' },
      body: null,
    });

    if (response.status === 200 && response.data.runId) {
      log('POST', 'POST', '/test/:projectId', 'PASS', `runId: ${response.data.runId}`);
      results.post.push({ endpoint: '/test/:projectId', status: 'PASS', statusCode: 200 });
      global.testRunId = response.data.runId; // Save for later tests
    } else {
      log('POST', 'POST', '/test/:projectId', 'FAIL', `Status: ${response.status}`);
      results.post.push({ endpoint: '/test/:projectId', status: 'FAIL', statusCode: response.status });
    }
  } catch (err) {
    log('POST', 'POST', '/test/:projectId', 'FAIL', err.message);
    results.post.push({ endpoint: '/test/:projectId', status: 'FAIL', error: err.message });
  }

  // Test POST /projects
  try {
    const response = await client.post(`/projects`, {
      name: `Test Project ${Date.now()}`,
    });

    if (response.status === 200) {
      log('POST', 'POST', '/projects', 'PASS', `Project created`);
      results.post.push({ endpoint: '/projects', status: 'PASS', statusCode: 200 });
    } else {
      log('POST', 'POST', '/projects', 'FAIL', `Status: ${response.status}`);
      results.post.push({ endpoint: '/projects', status: 'FAIL', statusCode: response.status });
    }
  } catch (err) {
    log('POST', 'POST', '/projects', 'FAIL', err.message);
    results.post.push({ endpoint: '/projects', status: 'FAIL', error: err.message });
  }

  console.log();

  // ===========================
  // 2. GET TESTS
  // ===========================
  console.log(colors.cyan + '📖 GET OPERATIONS' + colors.reset);
  console.log(colors.gray + '─'.repeat(70) + colors.reset);

  // Test GET /runs/:projectId
  try {
    const response = await client.get(`/runs/${TEST_PROJECT_ID}`);

    if (response.status === 200 && Array.isArray(response.data)) {
      log('GET', 'GET', '/runs/:projectId', 'PASS', `Retrieved ${response.data.length} runs`);
      results.get.push({ endpoint: '/runs/:projectId', status: 'PASS', statusCode: 200 });
    } else {
      log('GET', 'GET', '/runs/:projectId', 'FAIL', `Status: ${response.status}`);
      results.get.push({ endpoint: '/runs/:projectId', status: 'FAIL', statusCode: response.status });
    }
  } catch (err) {
    log('GET', 'GET', '/runs/:projectId', 'FAIL', err.message);
    results.get.push({ endpoint: '/runs/:projectId', status: 'FAIL', error: err.message });
  }

  // Test GET /runs/details/:runId
  if (global.testRunId) {
    try {
      const response = await client.get(`/runs/details/${global.testRunId}`);

      if (response.status === 200 && response.data.runId) {
        log('GET', 'GET', '/runs/details/:runId', 'PASS', `Retrieved run`);
        results.get.push({ endpoint: '/runs/details/:runId', status: 'PASS', statusCode: 200 });
      } else {
        log('GET', 'GET', '/runs/details/:runId', 'FAIL', `Status: ${response.status}`);
        results.get.push({ endpoint: '/runs/details/:runId', status: 'FAIL', statusCode: response.status });
      }
    } catch (err) {
      log('GET', 'GET', '/runs/details/:runId', 'FAIL', err.message);
      results.get.push({ endpoint: '/runs/details/:runId', status: 'FAIL', error: err.message });
    }
  } else {
    log('GET', 'GET', '/runs/details/:runId', 'NOTFOUND', 'No test runId available');
  }

  // Test GET /projects
  try {
    const response = await client.get(`/projects`);

    if (response.status === 200 && Array.isArray(response.data)) {
      log('GET', 'GET', '/projects', 'PASS', `Retrieved ${response.data.length} projects`);
      results.get.push({ endpoint: '/projects', status: 'PASS', statusCode: 200 });
    } else {
      log('GET', 'GET', '/projects', 'FAIL', `Status: ${response.status}`);
      results.get.push({ endpoint: '/projects', status: 'FAIL', statusCode: response.status });
    }
  } catch (err) {
    log('GET', 'GET', '/projects', 'FAIL', err.message);
    results.get.push({ endpoint: '/projects', status: 'FAIL', error: err.message });
  }

  console.log();

  // ===========================
  // 3. PUT TESTS
  // ===========================
  console.log(colors.cyan + '🔧 PUT OPERATIONS' + colors.reset);
  console.log(colors.gray + '─'.repeat(70) + colors.reset);

  // Test PUT /runs/:runId
  if (global.testRunId) {
    try {
      const response = await client.put(`/runs/${global.testRunId}`, {
        status: 'paused',
        config: { rate: 10 },
      });

      if (response.status === 200) {
        log('PUT', 'PUT', '/runs/:runId', 'PASS', `Run updated`);
        results.put.push({ endpoint: '/runs/:runId', status: 'PASS', statusCode: 200 });
      } else if (response.status === 404) {
        log('PUT', 'PUT', '/runs/:runId', 'NOTFOUND', `Endpoint not implemented (404)`);
        results.put.push({ endpoint: '/runs/:runId', status: 'NOTFOUND', statusCode: 404 });
      } else {
        log('PUT', 'PUT', '/runs/:runId', 'FAIL', `Status: ${response.status}`);
        results.put.push({ endpoint: '/runs/:runId', status: 'FAIL', statusCode: response.status });
      }
    } catch (err) {
      log('PUT', 'PUT', '/runs/:runId', 'FAIL', err.message);
      results.put.push({ endpoint: '/runs/:runId', status: 'FAIL', error: err.message });
    }
  } else {
    log('PUT', 'PUT', '/runs/:runId', 'NOTFOUND', 'No test runId available');
  }

  // Test PUT /projects/:id
  try {
    const response = await client.put(`/projects/${TEST_PROJECT_ID}`, {
      name: 'Updated Project Name',
    });

    if (response.status === 200) {
      log('PUT', 'PUT', '/projects/:id', 'PASS', `Project updated`);
      results.put.push({ endpoint: '/projects/:id', status: 'PASS', statusCode: 200 });
    } else if (response.status === 404) {
      log('PUT', 'PUT', '/projects/:id', 'NOTFOUND', `Endpoint not implemented (404)`);
      results.put.push({ endpoint: '/projects/:id', status: 'NOTFOUND', statusCode: 404 });
    } else {
      log('PUT', 'PUT', '/projects/:id', 'FAIL', `Status: ${response.status}`);
      results.put.push({ endpoint: '/projects/:id', status: 'FAIL', statusCode: response.status });
    }
  } catch (err) {
    log('PUT', 'PUT', '/projects/:id', 'FAIL', err.message);
    results.put.push({ endpoint: '/projects/:id', status: 'FAIL', error: err.message });
  }

  console.log();

  // ===========================
  // 4. PATCH TESTS
  // ===========================
  console.log(colors.cyan + '📝 PATCH OPERATIONS' + colors.reset);
  console.log(colors.gray + '─'.repeat(70) + colors.reset);

  // Test PATCH /runs/:runId
  if (global.testRunId) {
    try {
      const response = await client.patch(`/runs/${global.testRunId}`, {
        status: 'paused',
      });

      if (response.status === 200) {
        log('PATCH', 'PATCH', '/runs/:runId', 'PASS', `Run patched`);
        results.patch.push({ endpoint: '/runs/:runId', status: 'PASS', statusCode: 200 });
      } else if (response.status === 404) {
        log('PATCH', 'PATCH', '/runs/:runId', 'NOTFOUND', `Endpoint not implemented (404)`);
        results.patch.push({ endpoint: '/runs/:runId', status: 'NOTFOUND', statusCode: 404 });
      } else {
        log('PATCH', 'PATCH', '/runs/:runId', 'FAIL', `Status: ${response.status}`);
        results.patch.push({ endpoint: '/runs/:runId', status: 'FAIL', statusCode: response.status });
      }
    } catch (err) {
      log('PATCH', 'PATCH', '/runs/:runId', 'FAIL', err.message);
      results.patch.push({ endpoint: '/runs/:runId', status: 'FAIL', error: err.message });
    }
  } else {
    log('PATCH', 'PATCH', '/runs/:runId', 'NOTFOUND', 'No test runId available');
  }

  // Test PATCH /projects/:id
  try {
    const response = await client.patch(`/projects/${TEST_PROJECT_ID}`, {
      name: 'Patched Project Name',
    });

    if (response.status === 200) {
      log('PATCH', 'PATCH', '/projects/:id', 'PASS', `Project patched`);
      results.patch.push({ endpoint: '/projects/:id', status: 'PASS', statusCode: 200 });
    } else if (response.status === 404) {
      log('PATCH', 'PATCH', '/projects/:id', 'NOTFOUND', `Endpoint not implemented (404)`);
      results.patch.push({ endpoint: '/projects/:id', status: 'NOTFOUND', statusCode: 404 });
    } else {
      log('PATCH', 'PATCH', '/projects/:id', 'FAIL', `Status: ${response.status}`);
      results.patch.push({ endpoint: '/projects/:id', status: 'FAIL', statusCode: response.status });
    }
  } catch (err) {
    log('PATCH', 'PATCH', '/projects/:id', 'FAIL', err.message);
    results.patch.push({ endpoint: '/projects/:id', status: 'FAIL', error: err.message });
  }

  console.log();

  // ===========================
  // 5. DELETE TESTS
  // ===========================
  console.log(colors.cyan + '🗑️  DELETE OPERATIONS' + colors.reset);
  console.log(colors.gray + '─'.repeat(70) + colors.reset);

  // Test DELETE /runs/:runId
  if (global.testRunId) {
    try {
      const response = await client.delete(`/runs/${global.testRunId}`);

      if (response.status === 200 || response.status === 204) {
        log('DELETE', 'DELETE', '/runs/:runId', 'PASS', `Run deleted`);
        results.delete.push({ endpoint: '/runs/:runId', status: 'PASS', statusCode: response.status });
      } else if (response.status === 404) {
        log('DELETE', 'DELETE', '/runs/:runId', 'NOTFOUND', `Endpoint not implemented (404)`);
        results.delete.push({ endpoint: '/runs/:runId', status: 'NOTFOUND', statusCode: 404 });
      } else {
        log('DELETE', 'DELETE', '/runs/:runId', 'FAIL', `Status: ${response.status}`);
        results.delete.push({ endpoint: '/runs/:runId', status: 'FAIL', statusCode: response.status });
      }
    } catch (err) {
      log('DELETE', 'DELETE', '/runs/:runId', 'FAIL', err.message);
      results.delete.push({ endpoint: '/runs/:runId', status: 'FAIL', error: err.message });
    }
  } else {
    log('DELETE', 'DELETE', '/runs/:runId', 'NOTFOUND', 'No test runId available');
  }

  // Test DELETE /projects/:id
  try {
    const response = await client.delete(`/projects/${TEST_PROJECT_ID}`);

    if (response.status === 200 || response.status === 204) {
      log('DELETE', 'DELETE', '/projects/:id', 'PASS', `Project deleted`);
      results.delete.push({ endpoint: '/projects/:id', status: 'PASS', statusCode: response.status });
    } else if (response.status === 404) {
      log('DELETE', 'DELETE', '/projects/:id', 'NOTFOUND', `Endpoint not implemented (404)`);
      results.delete.push({ endpoint: '/projects/:id', status: 'NOTFOUND', statusCode: 404 });
    } else {
      log('DELETE', 'DELETE', '/projects/:id', 'FAIL', `Status: ${response.status}`);
      results.delete.push({ endpoint: '/projects/:id', status: 'FAIL', statusCode: response.status });
    }
  } catch (err) {
    log('DELETE', 'DELETE', '/projects/:id', 'FAIL', err.message);
    results.delete.push({ endpoint: '/projects/:id', status: 'FAIL', error: err.message });
  }

  console.log();

  // ===========================
  // SUMMARY
  // ===========================
  printSummary(results);
}

function printSummary(results) {
  console.log(colors.blue + '╔════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║                         TEST SUMMARY                           ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════════════════════════╝' + colors.reset + '\n');

  const summary = {
    POST: { pass: 0, fail: 0, notfound: 0 },
    GET: { pass: 0, fail: 0, notfound: 0 },
    PUT: { pass: 0, fail: 0, notfound: 0 },
    PATCH: { pass: 0, fail: 0, notfound: 0 },
    DELETE: { pass: 0, fail: 0, notfound: 0 },
  };

  const allResults = [
    { method: 'POST', results: results.post },
    { method: 'GET', results: results.get },
    { method: 'PUT', results: results.put },
    { method: 'PATCH', results: results.patch },
    { method: 'DELETE', results: results.delete },
  ];

  allResults.forEach(({ method, results: methodResults }) => {
    console.log(colors.cyan + `${method}:` + colors.reset);
    methodResults.forEach((result) => {
      const status = result.status.toUpperCase();
      if (status === 'PASS') {
        summary[method].pass++;
        console.log(`  ${colors.green}✅ PASS${colors.reset}   - ${result.endpoint}`);
      } else if (status === 'FAIL') {
        summary[method].fail++;
        console.log(`  ${colors.red}❌ FAIL${colors.reset}   - ${result.endpoint} (${result.error || `Status ${result.statusCode}`})`);
      } else if (status === 'NOTFOUND') {
        summary[method].notfound++;
        console.log(`  ${colors.yellow}⚠️  NOTFOUND${colors.reset} - ${result.endpoint} (Endpoint not implemented)`);
      }
    });
    console.log();
  });

  console.log(colors.blue + '─'.repeat(70) + colors.reset);
  console.log(colors.blue + 'IMPLEMENTATION STATUS:' + colors.reset);
  console.log();

  Object.entries(summary).forEach(([method, counts]) => {
    const total = counts.pass + counts.fail + counts.notfound;
    if (counts.pass === total) {
      console.log(`  ${colors.green}✅ ${method}${colors.reset}    - Fully Implemented (${counts.pass}/${total})`);
    } else if (counts.pass > 0) {
      console.log(`  ${colors.yellow}⚠️  ${method}${colors.reset}    - Partially Implemented (${counts.pass}/${total} working)`);
    } else if (counts.notfound > 0) {
      console.log(`  ${colors.yellow}⚠️  ${method}${colors.reset}    - Not Implemented (${counts.notfound} endpoints)`);
    } else {
      console.log(`  ${colors.red}❌ ${method}${colors.reset}    - Failed (${counts.fail}/${total})`);
    }
  });

  console.log();
}

// Run tests
runTests().catch(console.error);
