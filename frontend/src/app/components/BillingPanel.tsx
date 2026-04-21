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

  return (
    <div className="space-y-4">
      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ₫{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₫{stats.thisMonth.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +18% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ₫{stats.pending.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₫{stats.overdue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Requires action</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Structure</CardTitle>
          <CardDescription>Current parking fee rates by user category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.category}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  {plan.category}
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  {plan.description}
                </div>
                <div className="space-y-2">
                  {plan.monthly !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Monthly:</span>
                      <span className="text-sm font-medium text-slate-900">
                        {plan.monthly === 0 ? 'Free' : `₫${plan.monthly.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Daily:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {plan.daily === 0 ? 'Free' : `₫${plan.daily.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Hourly:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {plan.hourly === 0 ? 'Free' : `₫${plan.hourly.toLocaleString()}`}
                    </span>
                  </div>
                  {isAdmin && (
                    <Button size="sm" variant="outline" onClick={() => updatePolicy(plan.category)}>
                      Adjust Price
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {isAdmin ? (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent parking fee transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button size="sm" variant="outline" onClick={runBillingCycle}>
                Run Learner Billing Cycle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by transaction ID, user, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Transaction ID
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Period
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Amount
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-slate-600">{txn.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-slate-900">{txn.userName}</div>
                      <div className="text-xs text-slate-500">{txn.userId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-700">{txn.type}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-700">{txn.period}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-slate-900">
                        ₫{txn.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          txn.status === 'Paid' ? 'secondary' :
                          txn.status === 'Pending' ? 'outline' :
                          'destructive'
                        }
                        className={
                          txn.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                          ''
                        }
                      >
                        {txn.status === 'Paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {txn.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                        {txn.status === 'Overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600">{txn.date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{txn.method}</Badge>
                      {txn.status !== 'Paid' && (
                        <Button size="sm" className="ml-2" onClick={() => payTransaction(txn.id)}>
                          Pay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Finance Access Restricted</CardTitle>
            <CardDescription>Only admin can view transaction logs and billing actions.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {loading && <div className="text-sm text-slate-500">Loading billing data...</div>}
      {actionMessage && <div className="text-sm text-blue-700">{actionMessage}</div>}

      {/* BKPay Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Integration</CardTitle>
          <CardDescription>BKPay gateway configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-900">BKPay Gateway</div>
              <div className="text-xs text-blue-700">
                Automatic billing for students at end of each period
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Last sync: 5 minutes ago • API Status: Active
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
