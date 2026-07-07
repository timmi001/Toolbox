import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface LineItem { id: number; label: string; amount: string; }

let nextId = 10;

const DEFAULT_INCOME: LineItem[] = [
  { id: 1, label: 'Salary', amount: '5000' },
  { id: 2, label: 'Freelance', amount: '500' },
];
const DEFAULT_EXPENSES: LineItem[] = [
  { id: 3, label: 'Rent / Mortgage', amount: '1500' },
  { id: 4, label: 'Groceries', amount: '400' },
  { id: 5, label: 'Utilities', amount: '150' },
  { id: 6, label: 'Transport', amount: '200' },
  { id: 7, label: 'Insurance', amount: '100' },
  { id: 8, label: 'Entertainment', amount: '150' },
  { id: 9, label: 'Savings', amount: '500' },
];

function ItemList({ title, items, setItems, color }: { title: string; items: LineItem[]; setItems: (i: LineItem[]) => void; color: string }) {
  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  function add() { setItems([...items, { id: ++nextId, label: '', amount: '' }]); }
  function remove(id: number) { setItems(items.filter(i => i.id !== id)); }
  function update(id: number, key: keyof LineItem, val: string) {
    setItems(items.map(i => i.id === id ? { ...i, [key]: val } : i));
  }

  return (
    <div className="flex-1">
      <div className={`flex items-center justify-between mb-2`}>
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className={`text-sm font-bold ${color}`}>${total.toLocaleString('en-US',{maximumFractionDigits:2})}</span>
      </div>
      <div className="space-y-2 mb-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-2 items-center">
            <Input placeholder="Label" value={item.label} onChange={e => update(item.id, 'label', e.target.value)} className="flex-1 h-8 text-sm" />
            <Input type="number" min={0} placeholder="0" value={item.amount} onChange={e => update(item.id, 'amount', e.target.value)} className="w-28 h-8 text-sm" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500" onClick={() => remove(item.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add} className="w-full h-8 text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add item
      </Button>
    </div>
  );
}

export default function BudgetPlanner() {
  const tool = getToolBySlug('budget-planner')!;
  const [income, setIncome] = useState<LineItem[]>(DEFAULT_INCOME);
  const [expenses, setExpenses] = useState<LineItem[]>(DEFAULT_EXPENSES);

  const totalIncome = income.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  return (
    <ToolLayout tool={tool} instructions="Add your monthly income sources and expenses to see your budget balance.">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <ItemList title="Monthly Income" items={income} setItems={setIncome} color="text-green-500" />
        <ItemList title="Monthly Expenses" items={expenses} setItems={setExpenses} color="text-red-500" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Income', value: `$${totalIncome.toLocaleString('en-US',{maximumFractionDigits:2})}`, cls: 'text-green-600 dark:text-green-400' },
          { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString('en-US',{maximumFractionDigits:2})}`, cls: 'text-red-600 dark:text-red-400' },
          { label: 'Balance', value: `${balance >= 0 ? '+' : ''}$${balance.toLocaleString('en-US',{maximumFractionDigits:2})}`, cls: balance >= 0 ? 'text-primary' : 'text-red-500', hi: true },
        ].map(({ label, value, cls, hi }) => (
          <div key={label} className={`text-center p-4 rounded-xl border ${hi ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-lg font-bold ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bar */}
      {totalIncome > 0 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Expenses {((totalExpenses/totalIncome)*100).toFixed(1)}%</span>
            <span>Savings {savingsRate.toFixed(1)}%</span>
          </div>
          <div className="h-4 rounded-full bg-muted/20 overflow-hidden flex">
            <div className="bg-red-400 h-full transition-all" style={{ width: `${Math.min((totalExpenses/totalIncome)*100, 100)}%` }} />
            {balance > 0 && <div className="bg-primary h-full transition-all" style={{ width: `${Math.min((balance/totalIncome)*100, 100)}%` }} />}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
