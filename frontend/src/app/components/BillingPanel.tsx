import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CreditCard, DollarSign, TrendingUp, Download, Search, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';

type BillingPanelProps = {
  isAdmin: boolean;
  actorRole: string;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function BillingPanel({ isAdmin, actorRole, apiFetch }: BillingPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalRevenue: number | null; dailyRevenue: number | null; thisMonth: number | null; pending: number | null; overdue: number | null }>({
    totalRevenue: null, dailyRevenue: null, thisMonth: null, pending: null, overdue: null,
  });
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const API_BASE = 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, txnRes] = await Promise.all([
        apiFetch(`${API_BASE}/billing/overview`),
        apiFetch(`${API_BASE}/billing/transactions`),
      ]);
      const overview = await overviewRes.json();
      const txns = await txnRes.json();
      setStats({
        totalRevenue: overview.totalRevenue ?? null,
        dailyRevenue: overview.dailyRevenue ?? null,
        thisMonth: overview.thisMonth ?? null,
        pending: overview.pending ?? null,
        overdue: overview.overdue ?? null,
      });
      setPricingPlans(overview.pricingPlans ?? []);
      setTransactions(txns.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const runBillingCycle = async () => {
    const res = await apiFetch(`${API_BASE}/billing/run-cycle`, {
      method: 'POST',
      body: JSON.stringify({ period: 'April 2026' }),
    });
    const data = await res.json();
    setActionMessage(res.ok ? `Created ${data.createdInvoices} learner invoices` : data.message || 'Run cycle failed');
    if (res.ok) await fetchData();
  };

  const payTransaction = async (id: string) => {
    const res = await apiFetch(`${API_BASE}/payments/${id}/request`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Paid', method: 'BKPay' } : t)));
      setActionMessage(`Payment success for ${id} (${data.bkpayRef})`);
    } else {
      setActionMessage(data.message || 'Payment failed');
    }
  };

  const resetDailyRevenue = async () => {
    const res = await apiFetch(`${API_BASE}/billing/reset-daily`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) { setActionMessage('Daily revenue has been reset.'); await fetchData(); }
    else setActionMessage(data.message || 'Reset failed');
  };

  const resetMonthlyRevenue = async () => {
    const res = await apiFetch(`${API_BASE}/billing/reset-monthly`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) { setActionMessage('Monthly revenue has been reset.'); await fetchData(); }
    else setActionMessage(data.message || 'Reset failed');
  };

  const updatePolicy = async (category: string) => {
    const hourly = Number(window.prompt(`New hourly price for ${category}`, '5000'));
    if (Number.isNaN(hourly)) return;
    const res = await apiFetch(`${API_BASE}/admin/pricing-policies/${encodeURIComponent(category)}`, {
      method: 'PATCH',
      body: JSON.stringify({ hourly }),
    });
    const data = await res.json();
    setActionMessage(res.ok ? `Updated ${category} hourly to ₫${hourly.toLocaleString()}` : data.message || 'Update failed');
    if (res.ok) setPricingPlans((prev) => prev.map((p) => (p.category === data.category ? data : p)));
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((txn) => [txn.id, txn.userName, txn.userId, txn.date, txn.period].join(' ').toLowerCase().includes(q));
  }, [transactions, searchQuery]);

  if (!isAdmin && actorRole !== 'OPERATOR') {
    return (
      <Card>
        <CardHeader><CardTitle>Your Parking Account</CardTitle><CardDescription>View your individual usage and balance.</CardDescription></CardHeader>
        <CardContent>
          <p className="text-slate-500 italic">Financial logs and system-wide revenue are restricted to Administrators.</p>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {pricingPlans.map((plan) => (
              <div key={plan.category} className="p-3 border rounded">
                <div className="font-bold">{plan.category}</div>
                <div className="text-blue-600">₫{plan.hourly}/hour</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: stats.totalRevenue },
          { label: 'This Month', value: stats.thisMonth },
          { label: 'Pending', value: stats.pending },
          { label: 'Overdue', value: stats.overdue },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="text-sm text-slate-600">{label}</div>
              <div className="text-2xl font-bold">₫{value?.toLocaleString() ?? '-'}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Pricing Management</CardTitle><CardDescription>Configure hourly parking rates</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          {pricingPlans.map((plan) => (
            <div key={plan.category} className="p-4 border rounded relative">
              <div className="font-bold">{plan.category}</div>
              <div className="text-lg">₫{plan.hourly}/h</div>
              {isAdmin && (
                <Button size="sm" className="mt-2 w-full" onClick={() => updatePolicy(plan.category)}>Edit Price</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader><CardTitle>Admin Controls</CardTitle><CardDescription>System-wide billing operations</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button onClick={runBillingCycle} variant="outline">Run Monthly Billing Cycle</Button>
              <Button onClick={resetDailyRevenue} variant="destructive">Reset Daily Revenue</Button>
              <Button onClick={resetMonthlyRevenue} variant="destructive">Reset Monthly Revenue</Button>
            </div>
            {actionMessage && <p className="text-sm text-slate-600">{actionMessage}</p>}
          </CardContent>
        </Card>
      )}

      {/* Transactions table */}
      <Card>
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {['ID', 'User', 'Type', 'Amount', 'Period', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">{t.id}</td>
                    <td className="py-3 px-4"><div className="text-sm font-medium">{t.userName}</div><div className="text-xs text-slate-400">{t.userId}</div></td>
                    <td className="py-3 px-4 text-sm">{t.type}</td>
                    <td className="py-3 px-4 text-sm font-medium">₫{t.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{t.period}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={t.status === 'Paid' ? 'bg-green-100 text-green-700' : t.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{t.date}</td>
                    <td className="py-3 px-4">
                      {t.status !== 'Paid' && (
                        <Button size="sm" variant="outline" onClick={() => payTransaction(t.id)}>Pay</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
