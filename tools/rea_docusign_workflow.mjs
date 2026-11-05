#!/usr/bin/env node
/**
 * REA DocuSign Parity & Reconstruction Toolkit
 * Integrates morluto/rea with SignFlow to reverse-engineer and recreate DocuSign features.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const REA_CLI = path.resolve(ROOT_DIR, 'node_modules', 'rea-agents', 'scripts', 'rea.mjs');

function runReaCommand(args) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Executing REA: node ${path.relative(ROOT_DIR, REA_CLI)} ${args.join(' ')}\n`);
    const proc = spawn(process.execPath, [REA_CLI, ...args], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });

    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`REA exited with code ${code}`));
    });

    proc.on('error', err => reject(err));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'help';

  switch (action) {
    case 'doctor':
      await runReaCommand(['doctor', '--json']);
      break;

    case 'analyze-web': {
      const url = args[1] || 'https://app.docusign.com';
      console.log(`🎯 Analyzing Web Target with REA: ${url}`);
      await runReaCommand(['analyze-web-bundle', '--url', url, '--format', 'md']);
      break;
    }

    case 'inspect-har': {
      const harFile = args[1];
      if (!harFile || !fs.existsSync(harFile)) {
        console.error('❌ Error: Provide a path to an existing .har capture file.');
        process.exit(1);
      }
      console.log(`📡 Inspecting DocuSign API Traffic from HAR: ${harFile}`);
      await runReaCommand(['inspect-web-network-capture', '--file', harFile, '--format', 'json']);
      break;
    }

    case 'build-ledger': {
      const evidenceFile = args[1];
      if (!evidenceFile || !fs.existsSync(evidenceFile)) {
        console.error('❌ Error: Provide a valid REA Evidence JSON file.');
        process.exit(1);
      }
      console.log(`📑 Generating Reconstruction Obligation Ledger for DocuSign Parity...`);
      await runReaCommand(['build-reconstruction-obligation-ledger', '--evidence', evidenceFile]);
      break;
    }

    case 'help':
    default:
      console.log(`
======================================================================
  SignFlow + REA (morluto/rea) DocuSign Reconstruction Toolkit
======================================================================

Usage:
  node tools/rea_docusign_workflow.mjs <action> [options]
  npm run rea <rea-command> [options]

Actions:
  doctor                     Run REA environment health checks
  analyze-web <url>          Capture & analyze web bundle (default: https://app.docusign.com)
  inspect-har <path.har>     Inspect DocuSign network traffic from HAR capture
  build-ledger <evidence>    Generate evidence-backed DocuSign reconstruction ledger

Direct REA CLI:
  npx rea --help             List all 175 REA commands & 229 MCP tools
  npx rea doctor             Check analysis engines and agent registrations
  npm run rea:mcp            Launch REA stdio Model Context Protocol server

Documentation:
  See docs/DOCUSIGN_RECREATION_GUIDE.md for end-to-end recreation workflows.
======================================================================
`);
      break;
  }
}

main().catch(err => {
  console.error('\n❌ Execution failed:', err.message);
  process.exit(1);
});
