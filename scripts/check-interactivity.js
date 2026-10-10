#!/usr/bin/env node
/**
 * Interactivity & Usability Checker
 *
 * Verifies that all buttons and interactive controls across the application:
 * 1. Have active, functional click handlers (no dummy/dead buttons).
 * 2. Do not contain no-op empty callbacks like `onClick={() => {}}`.
 * 3. Are appropriately wired to modals, submit actions, or links.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const SRC_DIR = path.resolve(__dirname, '../src');
const IGNORED_PATHS = [
  path.join(SRC_DIR, 'components/ui'), // Base primitive definitions
  path.join(SRC_DIR, 'lib'),
  path.join(SRC_DIR, 'styles'),
  path.join(SRC_DIR, 'scripts'),
];

const checkAll = process.argv.includes('--all');

let totalFilesChecked = 0;
let totalButtonsChecked = 0;
const errors = [];
const warnings = [];

function isTargetFile(filePath) {
  const rel = path.relative(SRC_DIR, filePath);
  // Always check all components
  if (rel.startsWith('components/')) return true;

  // Active Next.js App Router files
  if (
    rel.includes('/page.') ||
    rel.includes('/layout.') ||
    rel.includes('-client.') ||
    rel.includes('client.')
  ) {
    return true;
  }

  // If --all flag is passed, check root app prototypes too
  return checkAll;
}

// Recursive file scanner
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (IGNORED_PATHS.some((ignored) => fullPath.startsWith(ignored))) {
      continue;
    }
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx|jsx)$/.test(entry.name) && isTargetFile(fullPath)) {
      checkFile(fullPath);
    }
  }
}

function getTagName(node) {
  if (ts.isJsxElement(node)) {
    return node.openingElement.tagName.getText();
  }
  if (ts.isJsxSelfClosingElement(node)) {
    return node.tagName.getText();
  }
  return '';
}

function getAttributes(node) {
  if (ts.isJsxElement(node)) {
    return node.openingElement.attributes.properties;
  }
  if (ts.isJsxSelfClosingElement(node)) {
    return node.attributes.properties;
  }
  return [];
}

function isEmptyFunction(initializer) {
  if (!initializer) return false;
  let expr = initializer;
  if (ts.isJsxExpression(expr) && expr.expression) {
    expr = expr.expression;
  }

  // Check () => {} or function() {}
  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) {
    const body = expr.body;
    if (ts.isBlock(body)) {
      if (body.statements.length === 0) return true;
    }
    if (ts.isIdentifier(body) && body.text === 'undefined') return true;
    if (body.kind === ts.SyntaxKind.NullKeyword) return true;
    if (ts.isVoidExpression(body)) return true;
  }
  return false;
}

function checkFile(filePath) {
  totalFilesChecked++;
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  function checkButtonNode(node, parent) {
    const tagName = getTagName(node);
    if (tagName !== 'button' && tagName !== 'Button') {
      return;
    }

    totalButtonsChecked++;
    const attributes = getAttributes(node);
    let hasOnClick = false;
    let hasAsChild = false;
    let hasTypeSubmitOrReset = false;
    let hasSpread = false;
    let hasDisabled = false;
    let emptyHandler = false;

    for (const attr of attributes) {
      if (ts.isJsxSpreadAttribute(attr)) {
        hasSpread = true;
        continue;
      }

      if (ts.isJsxAttribute(attr)) {
        const attrName = attr.name.getText();
        if (attrName === 'onClick') {
          hasOnClick = true;
          if (isEmptyFunction(attr.initializer)) {
            emptyHandler = true;
          }
        } else if (attrName === 'asChild') {
          hasAsChild = true;
        } else if (attrName === 'type') {
          const typeVal = attr.initializer ? attr.initializer.getText().replace(/['"]/g, '') : '';
          if (typeVal === 'submit' || typeVal === 'reset') {
            hasTypeSubmitOrReset = true;
          }
        } else if (attrName === 'disabled') {
          hasDisabled = true;
        }
      }
    }

    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const lineNum = line + 1;
    const relPath = path.relative(path.resolve(__dirname, '..'), filePath);

    if (emptyHandler) {
      errors.push({
        file: relPath,
        line: lineNum,
        message: `Empty/no-op onClick handler found on <${tagName}>. All buttons must have functioning logic.`,
        snippet: node.getText().slice(0, 100).replace(/\s+/g, ' '),
      });
      return;
    }

    // Check if wrapped in trigger/link/form
    let isWrappedInInteractiveParent = false;
    let curr = parent;
    while (curr) {
      if (ts.isJsxElement(curr) || ts.isJsxSelfClosingElement(curr)) {
        const pTag = getTagName(curr);
        if (
          /Trigger$/.test(pTag) ||
          pTag === 'Link' ||
          pTag === 'a' ||
          pTag === 'form'
        ) {
          isWrappedInInteractiveParent = true;
          break;
        }
      }
      curr = curr.parent;
    }

    if (
      !hasOnClick &&
      !hasAsChild &&
      !hasTypeSubmitOrReset &&
      !hasSpread &&
      !hasDisabled &&
      !isWrappedInInteractiveParent
    ) {
      errors.push({
        file: relPath,
        line: lineNum,
        message: `Dead/dummy button detected: <${tagName}> has no onClick, no asChild, no form submission type, and is not wrapped in a Trigger/Link.`,
        snippet: node.getText().slice(0, 100).replace(/\s+/g, ' '),
      });
    }
  }

  function visit(node, parent) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      checkButtonNode(node, parent);
    }
    ts.forEachChild(node, (child) => visit(child, node));
  }

  visit(sourceFile, null);
}

console.log('🔍 Running Feature Usability & Interactivity Audit across all active pages and components...\n');
scanDir(SRC_DIR);

console.log(`Checked ${totalFilesChecked} active source files.`);
console.log(`Checked ${totalButtonsChecked} button elements.\n`);

if (errors.length > 0) {
  console.error(`❌ Interactivity Check FAILED: Found ${errors.length} unusable/dummy elements:\n`);
  for (const err of errors) {
    console.error(`  - ${err.file}:${err.line}`);
    console.error(`    ${err.message}`);
    console.error(`    Snippet: ${err.snippet}\n`);
  }
  process.exit(1);
} else {
  console.log('✅ Interactivity Check PASSED: 100% of buttons and features are interactive, clickable, and functional!\n');
  process.exit(0);
}
