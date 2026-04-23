import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Send
} from 'lucide-react';

type BillingPanelProps = {
  isAdmin: boolean;
  actorRole: string;
};

export default function BillingPanel({ isAdmin, actorRole }: BillingPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, thisMonth: 0, pending: 0, overdue: 0 });
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, txnRes] = await Promise.all([
          fetch(`${API_BASE}/billing/overview`),
          fetch(`${API_BASE}/billing/transactions`),
        ]);
        const overview = await overviewRes.json();
        const txns = await txnRes.json();
        setStats({
          totalRevenue: overview.totalRevenue ?? 0,
          thisMonth: overview.thisMonth ?? 0,
          pending: overview.pending ?? 0,
          overdue: overview.overdue ?? 0,
        });
        setPricingPlans(overview.pricingPlans ?? []);
        setTransactions(txns.items ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const runBillingCycle = async () => {
    const res = await fetch(`${API_BASE}/billing/run-cycle`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-role': actorRole || 'END_USER' },
      body: JSON.stringify({ period: 'April 2026' }),
    });
    const data = await res.json();
    setActionMessage(res.ok ? `Created ${data.createdInvoices} learner invoices` : data.message || 'Run cycle failed');
  };

  const payTransaction = async (id: string) => {
    const res = await fetch(`${API_BASE}/payments/${id}/request`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Paid', method: 'BKPay' } : t)));
      setActionMessage(`Payment success for ${id} (${data.bkpayRef})`);
    } else {
      setActionMessage(data.message || 'Payment failed');
    }
  };

  const updatePolicy = async (category: string) => {
    const hourly = Number(window.prompt(`New hourly price for ${category}`, '5000'));
    if (Number.isNaN(hourly)) return;
    const res = await fetch(`${API_BASE}/admin/pricing-policies/${encodeURIComponent(category)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-role': actorRole || 'END_USER' },
      body: JSON.stringify({ hourly }),
    });
    const data = await res.json();
    setActionMessage(res.ok ? `Updated ${category} hourly to ₫${hourly.toLocaleString()}` : data.message || 'Update failed');
    if (res.ok) setPricingPlans((prev) => prev.map((p) => (p.category === data.category ? data : p)));
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((txn) =>
      [txn.id, txn.userName, txn.userId, txn.date, txn.period].join(' ').toLowerCase().includes(q),
    );
  }, [transactions, searchQuery]);

  if (!isAdmin && actorRole !== 'OPERATOR') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Parking Account</CardTitle>
          <CardDescription>View your individual usage and balance.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-slate-500 italic">Financial logs and system-wide revenue are restricted to Administrators.</p>
           {/* Member chỉ thấy bảng giá hiện tại, không có nút Adjust */}
           <div className="grid grid-cols-4 gap-4 mt-4">
              {pricingPlans.map(plan => (
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
      {/* Admin mới thấy stats tổng doanh thu */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4">Total: ₫{stats.totalRevenue.toLocaleString()}</CardContent></Card>
        {/* ... các card khác */}
      </div>

      <Card>
        <CardHeader><CardTitle>Pricing Management</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          {pricingPlans.map(plan => (
            <div key={plan.category} className="p-4 border rounded relative">
              <div className="font-bold">{plan.category}</div>
              <div className="text-lg">₫{plan.hourly}/h</div>
              {/* Nút Adjust Price chỉ hiện cho Admin */}
              {isAdmin && (
                <Button size="sm" className="mt-2 w-full" onClick={() => updatePolicy(plan.category)}>
                  Edit Price
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Bảng Transaction History chỉ hiện cho Admin */}
      <Card>... (Table code) ...</Card>
    </div>
  );
}

