import ts from 'typescript';
import fs from 'fs';
import path from 'path';

/* ---------------------------------------------------------------
   Playwright‑only API usage report
----------------------------------------------------------------*/
interface ApiUsage { count: number; }
const apiUsage = new Map<string, ApiUsage>();

const PLAYWRIGHT_PATH = /node_modules[\\/](?:@playwright|playwright)/i;

function record(name: string) {
  const e = apiUsage.get(name) ?? { count: 0 };
  e.count++;
  apiUsage.set(name, e);
}

/* Symbol/type helpers */
function fromPlaywright(sym?: ts.Symbol): boolean {
  if (!sym) return false;
  return (sym.declarations ?? []).some(d => PLAYWRIGHT_PATH.test(d.getSourceFile().fileName));
}
function typeIsPlaywright(t: ts.Type): boolean {
  return fromPlaywright(t.getSymbol() ?? t.aliasSymbol);
}

/* ---------------------------------------------------------------
   Analyse a single test file
----------------------------------------------------------------*/
function analyseFile(file: string) {
  const program = ts.createProgram([file], { allowJs: true, checkJs: true });
  const checker = program.getTypeChecker();
  const src     = program.getSourceFile(file);
  if (!src) return;

  const walk = (n: ts.Node): void => {
    // method calls – either obj.method() or plain func()
    if (ts.isCallExpression(n)) {
      // obj.method()
      if (ts.isPropertyAccessExpression(n.expression) || ts.isPropertyAccessChain(n.expression)) {
        const pa        = n.expression;
        const recvType  = checker.getTypeAtLocation(pa.expression);
        if (typeIsPlaywright(recvType)) {
          const classNm = checker.typeToString(recvType);
          record(`${classNm}.${pa.name.getText(src)}`);
        }
      }
      // func()
      else if (ts.isIdentifier(n.expression)) {
        const sym = checker.getSymbolAtLocation(n.expression);
        if (fromPlaywright(sym)) record(n.expression.text);
      }
    }
    // standalone property access – e.g. devices['Pixel 5']
    else if (ts.isPropertyAccessExpression(n)) {
      const lhsSym = checker.getSymbolAtLocation(n.expression);
      if (fromPlaywright(lhsSym)) record(n.getText(src));
    }
    ts.forEachChild(n, walk);
  };
  walk(src);
}

/* ---------------------------------------------------------------
   Recursively scan the specs folder and print the report
----------------------------------------------------------------*/
function analyseDir(root = './specs') {
  const recurse = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) recurse(full);
      else if (stat.isFile() && /\.spec\.(?:js|ts)$/.test(entry)) analyseFile(full);
    }
  };
  recurse(root);

  console.log('Playwright API Usage:\n' + JSON.stringify(Object.fromEntries(apiUsage), null, 2));
}

analyseDir();
