#!/usr/bin/env node

const { spawn } = require('child_process');

// Run vitest with specific configuration to avoid interactive mode
const vitestProcess = spawn('npx', ['vitest', 'run', '--reporter=verbose'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    CI: 'true',
    NODE_ENV: 'test',
  },
});

vitestProcess.on('close', code => {
  console.log(`Tests completed with exit code: ${code}`);
  process.exit(code);
});

vitestProcess.on('error', error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
