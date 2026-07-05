import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';

const BUTTONS = [
  ['sin', 'cos', 'tan', 'log'],
  ['√', 'x²', 'xʸ', '1/x'],
  ['π', 'e', '(', ')'],
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', '.', '±', '+'],
  ['C', '⌫', '%', '='],
];

export default function ScientificCalculator() {
  const tool = getToolBySlug('scientific-calculator')!;
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

  function toRad(deg: number) { return (deg * Math.PI) / 180; }

  function handleBtn(btn: string) {
    if (btn === 'C') { setDisplay('0'); setExpression(''); return; }
    if (btn === '⌫') { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return; }
    if (btn === '=') {
      try {
        const expr = (expression + display)
          .replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-')
          .replace(/π/g, String(Math.PI)).replace(/e/g, String(Math.E));
        const result = Function('"use strict"; return (' + expr + ')')();
        setDisplay(String(parseFloat(result.toFixed(10))));
        setExpression('');
      } catch { setDisplay('Error'); }
      return;
    }
    if (btn === '±') { setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d); return; }
    if (btn === '%') { setDisplay(d => String(parseFloat(d) / 100)); return; }
    if (btn === 'x²') { setDisplay(d => String(Math.pow(parseFloat(d), 2))); return; }
    if (btn === '√') { setDisplay(d => String(Math.sqrt(parseFloat(d)))); return; }
    if (btn === '1/x') { setDisplay(d => String(1 / parseFloat(d))); return; }
    if (btn === 'sin') { setDisplay(d => String(Math.sin(angleMode === 'deg' ? toRad(parseFloat(d)) : parseFloat(d)))); return; }
    if (btn === 'cos') { setDisplay(d => String(Math.cos(angleMode === 'deg' ? toRad(parseFloat(d)) : parseFloat(d)))); return; }
    if (btn === 'tan') { setDisplay(d => String(Math.tan(angleMode === 'deg' ? toRad(parseFloat(d)) : parseFloat(d)))); return; }
    if (btn === 'log') { setDisplay(d => String(Math.log10(parseFloat(d)))); return; }
    if (btn === 'xʸ') { setExpression(expression + display + '**'); setDisplay('0'); return; }
    if (['+', '−', '×', '÷'].includes(btn)) { setExpression(expression + display + btn); setDisplay('0'); return; }
    if (btn === '(' || btn === ')') { setExpression(expression + btn); return; }
    if (btn === 'π') { setDisplay(String(Math.PI)); return; }
    if (btn === 'e') { setDisplay(String(Math.E)); return; }
    setDisplay(d => d === '0' ? btn : d + btn);
  }

  return (
    <ToolLayout tool={tool} instructions="Use the calculator buttons for arithmetic and scientific functions.">
      <div className="max-w-xs mx-auto">
        <div className="flex justify-end gap-2 mb-2">
          {(['deg', 'rad'] as const).map(m => (
            <button key={m} onClick={() => setAngleMode(m)} className={`text-xs px-2 py-1 rounded ${angleMode === m ? 'bg-primary text-black' : 'bg-muted/30 text-muted-foreground'}`}>{m.toUpperCase()}</button>
          ))}
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-2 text-right">
          <div className="text-sm text-muted-foreground font-mono min-h-[20px]">{expression}</div>
          <div className="text-4xl font-bold font-mono truncate">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {BUTTONS.flat().map((btn, i) => (
            <button key={i} onClick={() => handleBtn(btn)} className={`p-3 rounded-lg font-mono text-sm font-medium transition-colors
              ${btn === '=' ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
                ['C', '⌫'].includes(btn) ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                ['÷', '×', '−', '+'].includes(btn) ? 'bg-primary/20 text-primary hover:bg-primary/30' :
                'bg-muted/30 hover:bg-muted/50'}`}>
              {btn}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
