'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { DashboardStats } from '../../types';
import { CheckCircle2, Clock, ListTodo, AlertCircle, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8 flex items-center">
        <LayoutDashboard className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats?.total_tasks || 0}
          icon={<ListTodo className="h-6 w-6 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="To Do"
          value={stats?.todo || 0}
          icon={<AlertCircle className="h-6 w-6 text-gray-600" />}
          bgColor="bg-gray-50"
        />
        <StatCard
          title="In Progress"
          value={stats?.in_progress || 0}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Done"
          value={stats?.done || 0}
          icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
          bgColor="bg-green-50"
        />
      </div>

      {stats?.overdue !== undefined && stats.overdue > 0 && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">
            You have {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}!
          </span>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }: { title: string; value: number; icon: React.ReactNode; bgColor: string }) {
  return (
    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl">
      <div className="p-5 flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
