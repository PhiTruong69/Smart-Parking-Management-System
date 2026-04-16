import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table } from './ui/table';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Shield,
  GraduationCap,
  Briefcase
} from 'lucide-react';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const users = [
    {
      id: '1952001',
      name: 'Nguyen Van A',
      role: 'Student',
      program: 'Computer Science',
      status: 'Active',
      parkingPass: 'Monthly',
      lastActivity: '2026-04-07 08:30',
      balance: 50000,
      entryCount: 45
    },
    {
      id: '1952045',
      name: 'Tran Thi B',
      role: 'Student',
      program: 'Electrical Engineering',
      status: 'Active',
      parkingPass: 'Monthly',
      lastActivity: '2026-04-07 09:15',
      balance: 0,
      entryCount: 38
    },
    {
      id: 'F2001',
      name: 'Le Van C',
      role: 'Faculty',
      program: 'Mathematics Department',
      status: 'Active',
      parkingPass: 'Reserved',
      lastActivity: '2026-04-07 07:45',
      balance: 0,
      entryCount: 89
    },
    {
      id: 'F2034',
      name: 'Pham Thi D',
      role: 'Faculty',
      program: 'Physics Department',
      status: 'Active',
      parkingPass: 'Reserved',
      lastActivity: '2026-04-06 17:20',
      balance: 0,
      entryCount: 102
    },
    {
      id: 'S1023',
      name: 'Hoang Van E',
      role: 'Staff',
      program: 'Administration',
      status: 'Active',
      parkingPass: 'Standard',
      lastActivity: '2026-04-07 08:00',
      balance: 25000,
      entryCount: 67
    },
    {
      id: '2152078',
      name: 'Vo Thi F',
      role: 'Graduate',
      program: 'Civil Engineering',
      status: 'Active',
      parkingPass: 'Monthly',
      lastActivity: '2026-04-07 10:30',
      balance: 15000,
      entryCount: 22
    },
    {
      id: '1951234',
      name: 'Dang Van G',
      role: 'Student',
      program: 'Mechanical Engineering',
      status: 'Suspended',
      parkingPass: 'None',
      lastActivity: '2026-03-28 14:20',
      balance: -20000,
      entryCount: 31
    },
    {
      id: 'D3001',
      name: 'Bui Thi H',
      role: 'Doctoral',
      program: 'Chemical Engineering',
      status: 'Active',
      parkingPass: 'Monthly',
      lastActivity: '2026-04-07 09:00',
      balance: 35000,
      entryCount: 56
    }
  ];

  const stats = {
    totalUsers: 1234,
    activeUsers: 1198,
    students: 945,
    faculty: 156,
    staff: 89,
    visitors: 44
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Faculty':
        return <Briefcase className="w-4 h-4" />;
      case 'Student':
      case 'Graduate':
      case 'Doctoral':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      Student: 'bg-blue-100 text-blue-700',
      Graduate: 'bg-purple-100 text-purple-700',
      Doctoral: 'bg-indigo-100 text-indigo-700',
      Faculty: 'bg-green-100 text-green-700',
      Staff: 'bg-orange-100 text-orange-700'
    };
    return colors[role as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.faculty}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.staff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.visitors}</div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>Manage parking system users and permissions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, ID, or program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Program/Department
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Parking Pass
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Last Activity
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Balance
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={getRoleBadge(user.role)}>
                        <span className="mr-1">{getRoleIcon(user.role)}</span>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-700">{user.program}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{user.parkingPass}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={user.status === 'Active' ? 'secondary' : 'destructive'}
                        className={user.status === 'Active' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600">{user.lastActivity}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`text-sm font-medium ${
                        user.balance < 0 ? 'text-red-600' :
                        user.balance === 0 ? 'text-slate-500' :
                        'text-green-600'
                      }`}>
                        ₫{user.balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing 1-8 of {stats.totalUsers} users
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

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Integration</CardTitle>
          <CardDescription>User data synchronization status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">HCMUT_SSO</div>
                <div className="text-xs text-blue-700">Authentication service connected</div>
              </div>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-green-900">HCMUT_DATACORE</div>
                <div className="text-xs text-green-700">Last sync: 2 minutes ago</div>
              </div>
              <Badge className="bg-green-100 text-green-700">Synced</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
