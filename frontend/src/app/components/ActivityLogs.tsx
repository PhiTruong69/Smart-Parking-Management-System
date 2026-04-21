import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Activity,
  Car,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  Search,
  Filter,
  Download
} from 'lucide-react';

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${API_BASE}/activity-logs`);
      const data = await res.json();
      setActivities(data.items || []);
    };
    fetchData();
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const filteredActivities = useMemo(() => {
    if (!searchQuery) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter((a) => JSON.stringify(a).toLowerCase().includes(q));
  }, [activities, searchQuery]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'exit':
        return <LogOut className="w-4 h-4 text-blue-600" />;
      case 'ticket':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'payment':
        return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'sensor':
        return <Activity className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const styles = {
      entry: 'bg-green-100 text-green-700',
      exit: 'bg-blue-100 text-blue-700',
      ticket: 'bg-purple-100 text-purple-700',
      payment: 'bg-yellow-100 text-yellow-700',
      sensor: 'bg-orange-100 text-orange-700',
      system: 'bg-slate-100 text-slate-700'
    };
    return styles[type as keyof typeof styles] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Today's Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">342</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Today's Exits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">298</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Visitor Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">47</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">156</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Avg. Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">4.2h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">System Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Real-time parking system activity tracking</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
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
                placeholder="Search by user, zone, gate, or vehicle ID..."
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
                    Timestamp
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Action
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Location
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-slate-600">
                        {activity.timestamp}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={getActivityBadge(activity.type)}
                      >
                        <span className="mr-1">{getActivityIcon(activity.type)}</span>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-slate-900">
                        {activity.user}
                      </div>
                      <div className="text-xs text-slate-500">
                        {activity.userId} • {activity.role}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-700">
                        {activity.action}
                      </div>
                      {activity.duration && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Duration: {activity.duration}
                        </div>
                      )}
                      {activity.amount && (
                        <div className="text-xs text-green-600 mt-1">
                          Amount: ₫{activity.amount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-slate-700">
                        <MapPin className="w-3 h-3" />
                        {activity.zone}
                      </div>
                      {activity.gate !== 'N/A' && (
                        <div className="text-xs text-slate-500 mt-1">
                          {activity.gate}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {activity.vehicleId !== 'N/A' && (
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {activity.vehicleId}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing 1-{Math.min(filteredActivities.length, 10)} of {filteredActivities.length} activities
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Info */}
      <Card>
        <CardHeader>
          <CardTitle>Audit & Compliance</CardTitle>
          <CardDescription>Activity logging and data retention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Data Retention
              </div>
              <div className="text-xs text-blue-700">
                Activity logs retained for 24 months for compliance
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-900 mb-1">
                Backup Status
              </div>
              <div className="text-xs text-green-700">
                Last backup: 2 hours ago • Next: In 22 hours
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-900 mb-1">
                Export Available
              </div>
              <div className="text-xs text-purple-700">
                CSV, JSON, and PDF formats supported
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
