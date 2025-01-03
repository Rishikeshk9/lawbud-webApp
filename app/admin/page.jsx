'use client';

import { Card } from '@/components/ui/card';
import {
  Users,
  Scale,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { mockLawyers } from '@/app/data/mockLawyers';

export default function AdminDashboard() {
  // Calculate lawyer statistics
  const totalLawyers = mockLawyers.filter((lawyer) => !lawyer.isAI).length;
  const verifiedLawyers = mockLawyers.filter(
    (lawyer) => lawyer.status === 'verified' && !lawyer.isAI
  ).length;
  const pendingLawyers = mockLawyers.filter(
    (lawyer) => lawyer.status === 'pending'
  ).length;
  const rejectedLawyers = mockLawyers.filter(
    (lawyer) => lawyer.status === 'rejected'
  ).length;

  // Mock statistics for other metrics
  const stats = {
    totalUsers: 156,
    activeChats: 24,
    totalConsultations: 342,
    growthRate: '+12.5%',
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered users on the platform',
      trend: '+5.2% from last month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Lawyers',
      value: totalLawyers,
      icon: Scale,
      description: 'Registered lawyers',
      trend: `${verifiedLawyers} verified`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Chats',
      value: stats.activeChats,
      icon: MessageSquare,
      description: 'Ongoing consultations',
      trend: 'Last 24 hours',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Consultations',
      value: stats.totalConsultations,
      icon: TrendingUp,
      description: 'Completed consultations',
      trend: stats.growthRate + ' this month',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const lawyerStatusCards = [
    {
      title: 'Verified Lawyers',
      value: verifiedLawyers,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Verification',
      value: pendingLawyers,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Rejected Applications',
      value: rejectedLawyers,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className='space-y-6 p-6'>
      <h1 className='text-2xl font-bold'>Dashboard Overview</h1>

      {/* Main Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className='p-6'>
              <div className='flex items-center gap-4'>
                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <h3 className='text-2xl font-bold'>{stat.value}</h3>
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-sm text-gray-600'>{stat.description}</p>
                <p className='text-sm font-medium text-gray-900 mt-1'>
                  {stat.trend}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Lawyer Status Overview */}
      <h2 className='text-xl font-semibold mt-8 mb-4'>
        Lawyer Status Overview
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {lawyerStatusCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className='p-6'>
              <div className='flex items-center gap-4'>
                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <h3 className='text-2xl font-bold'>{stat.value}</h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
