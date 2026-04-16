import { useState } from 'react';
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
  User,
  MapPin,
  Search,
  Filter,
  Download
} from 'lucide-react';

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState('');

  const activities = [
    {
      id: 1,
      timestamp: '2026-04-07 10:42:15',
      type: 'entry',
      user: 'Nguyen Van A',
      userId: '1952001',
      role: 'Student',
      zone: 'Zone B',
      gate: 'Gate B1',
      vehicleId: '59A-12345',
      action: 'Vehicle entered parking zone'
    },
    {
      id: 2,
      timestamp: '2026-04-07 10:38:42',
      type: 'exit',
      user: 'Tran Thi B',
      userId: 'F2001',
      role: 'Faculty',
      zone: 'Zone A',
      gate: 'Gate A2',
      vehicleId: '59B-67890',
      action: 'Vehicle exited parking zone',
      duration: '3h 25m'
    },
    {
      id: 3,
      timestamp: '2026-04-07 10:35:18',
      type: 'ticket',
      user: 'Visitor',
      userId: 'V-2345',
      role: 'Visitor',
      zone: 'Zone E',
      gate: 'Gate E1',
      vehicleId: 'N/A',
      action: 'Temporary ticket issued'
    },
    {
      id: 4,
      timestamp: '2026-04-07 10:30:05',
      type: 'entry',
      user: 'Le Van C',
      userId: '2152078',
      role: 'Graduate',
      zone: 'Zone C',
      gate: 'Gate C1',
      vehicleId: '59C-11223',
      action: 'Vehicle entered parking zone'
    },
    {
      id: 5,
      timestamp: '2026-04-07 10:25:33',
      type: 'payment',
      user: 'Pham Thi D',
      userId: '1951234',
      role: 'Student',
      zone: 'N/A',
      gate: 'N/A',
      vehicleId: 'N/A',
      action: 'Payment processed via BKPay',
      amount: 150000
    },
    {
      id: 6,
      timestamp: '2026-04-07 10:20:47',
      type: 'exit',
      user: 'Hoang Van E',
      userId: 'S1023',
      role: 'Staff',
      zone: 'Zone A',
      gate: 'Gate A1',
      vehicleId: '59D-44556',
      action: 'Vehicle exited parking zone',
      duration: '8h 15m'
    },
    {
      id: 7,
      timestamp: '2026-04-07 10:15:22',
      type: 'sensor',
      user: 'System',
      userId: 'SYSTEM',
      role: 'System',
      zone: 'Zone B',
      gate: 'N/A',
      vehicleId: 'N/A',
      action: 'Sensor B-23 status changed: online'
    },
    {
      id: 8,
      timestamp: '2026-04-07 10:10:58',
      type: 'entry',
      user: 'Vo Thi F',
      userId: 'D3001',
      role: 'Doctoral',
      zone: 'Zone A',
      gate: 'Gate A1',
      vehicleId: '59E-77889',
      action: 'Vehicle entered parking zone'
    },
    {
      id: 9,
      timestamp: '2026-04-07 10:05:14',
      type: 'ticket',
      user: 'Visitor',
      userId: 'V-2346',
      role: 'Visitor',
      zone: 'Zone E',
      gate: 'Gate E1',
      vehicleId: 'N/A',
      action: 'Temporary ticket issued'
    },
    {
      id: 10,
      timestamp: '2026-04-07 10:00:00',
      type: 'system',
      user: 'System',
      userId: 'SYSTEM',
      role: 'System',
      zone: 'All Zones',
      gate: 'N/A',
      vehicleId: 'N/A',
      action: 'Daily system health check completed'
    }
  ];

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
                {activities.map((activity) => (
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
              Showing 1-10 of 1,247 activities today
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
