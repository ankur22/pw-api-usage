import ts from 'typescript';
import fs from 'fs';
import path from 'path';

/* ---------------------------------------------------------------
   Playwright API usage grouped by *type* (Page, Locator, …)
   — Clean, compilable version (no duplicate helpers)
----------------------------------------------------------------*/

// Map< ClassName, Map< MethodName, count > >
const usage = new Map<string, Map<string, number>>();
const PLAYWRIGHT_PATH = /node_modules[\\/](?:@playwright|playwright)/i;

/* helpers -------------------------------------------------------*/
function fromPlaywright(sym: ts.Symbol | undefined, checker: ts.TypeChecker): boolean {
  if (!sym) return false;
  // Follow import aliases back to the originating declaration
  if (sym.flags & ts.SymbolFlags.Alias) {
    try { sym = checker.getAliasedSymbol(sym); } catch {/* not aliasable */}
  }
  return (sym.declarations ?? []).some(d => PLAYWRIGHT_PATH.test(d.getSourceFile().fileName));
}

function typeIsPlaywright(t: ts.Type, checker: ts.TypeChecker): boolean {
  const sym = t.getSymbol() ?? t.aliasSymbol;
  return fromPlaywright(sym, checker);
}

function addUsage(cls: string, method: string): void {
  const byClass = usage.get(cls) ?? new Map<string, number>();
  byClass.set(method, (byClass.get(method) ?? 0) + 1);
  usage.set(cls, byClass);
}

/* ---------------------------------------------------------------
   Analyse one spec file
----------------------------------------------------------------*/
function analyseFile(file: string): void {
  const program = ts.createProgram([file], { allowJs: true, checkJs: true });
  const checker = program.getTypeChecker();
  const src     = program.getSourceFile(file);
  if (!src) return;

  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      // obj.method()
      if (ts.isPropertyAccessExpression(n.expression) || ts.isPropertyAccessChain(n.expression)) {
        const pa       = n.expression;
        const recvType = checker.getTypeAtLocation(pa.expression);
        if (typeIsPlaywright(recvType, checker)) {
          const classNm = checker.typeToString(recvType);
          addUsage(classNm, pa.name.getText(src));
        }
      }
      // plainFunc()
      else if (ts.isIdentifier(n.expression)) {
        const sym = checker.getSymbolAtLocation(n.expression);
        if (fromPlaywright(sym, checker)) addUsage('(functions)', n.expression.text);
      }
    } else if (ts.isPropertyAccessExpression(n)) {
      // e.g. devices['Pixel 5'] — treat lhs as a PW value
      const lhsSym = checker.getSymbolAtLocation(n.expression);
      if (fromPlaywright(lhsSym, checker)) addUsage('(properties)', n.getText(src));
    }
    ts.forEachChild(n, visit);
  };

  visit(src);
}

/* ---------------------------------------------------------------
   Walk the specs directory
----------------------------------------------------------------*/
function analyseDir(root = './specs'): void {
  const walkDir = (dir: string): void => {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const st   = fs.statSync(full);
      if (st.isDirectory()) walkDir(full);
      else if (st.isFile() && /\.spec\.(?:js|ts)$/.test(entry)) analyseFile(full);
    }
  };
  walkDir(root);

  // pretty-print grouped result
  const result: Record<string, Record<string, number>> = {};
  for (const [cls, methods] of usage) {
    result[cls] = Object.fromEntries(Array.from(methods.entries()).sort());
  }
  console.log('Playwright API Usage (grouped by type):\n' + JSON.stringify(result, null, 2));
}

analyseDir();
