// Phone layout guard: an inline-styled horizontal flex row that holds a control (Button, Segmented, IconButton,
// button) must be able to wrap, or on a 390 px phone inside a card the control is pushed off the edge and cut.
// Found in SignaturePad: the confirm button and the "please sign" line were cut in the NGO field app (Oct 2026).
// Reads the TSX with the TypeScript parser; no build needed. Add a component to FILES when it gets inline rows.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const FILES = ['src/components/SignaturePad.tsx'];
const CONTROLS = new Set(['Button', 'Segmented', 'IconButton', 'button']);
const failures = [];

const prop = (obj, name) => obj.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === name)?.initializer;
const text = (node) => (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined);

function holdsControl(element) {
  let found = false;
  const visit = (node) => {
    if (found) return;
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && CONTROLS.has(node.tagName.getText())) found = true;
    else ts.forEachChild(node, visit);
  };
  element.children.forEach(visit);
  return found;
}

for (const file of FILES) {
  const source = ts.createSourceFile(file, readFileSync(join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxElement(node)) {
      const style = node.openingElement.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText() === 'style');
      const obj = style?.initializer && ts.isJsxExpression(style.initializer) ? style.initializer.expression : undefined;
      if (obj && ts.isObjectLiteralExpression(obj) && text(prop(obj, 'display')) === 'flex'
          && !String(text(prop(obj, 'flexDirection')) ?? 'row').startsWith('column')
          && text(prop(obj, 'flexWrap')) !== 'wrap' && holdsControl(node)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart());
        failures.push(`${file}:${line + 1} a row with a control cannot wrap (add flexWrap: 'wrap')`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (failures.length) {
  console.error(`Component layout checks failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Component layout checks passed: control rows wrap in ${FILES.length} component(s).`);
