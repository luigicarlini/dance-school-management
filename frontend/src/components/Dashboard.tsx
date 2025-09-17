import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useDashboardData } from '../hooks/useDashboardData';
import { ClassCard } from './ClassCard';
import { NotificationPanel } from './NotificationPanel';
import { QuickActions } from './QuickActions';
import { StatsCard } from './StatsCard';

interface DashboardProps {
  userRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF';
}

// 👇 NIENTE export qui
const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading, error } = useDashboardData(userRole);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const safeData = dashboardData ?? {
    bookedClasses: 0,
    completedClasses: 0,
    remainingCredits: 0,
    todayClasses: 0,
    totalStudents: 0,
    hoursThisMonth: 0,
    activeStudents: 0,
    monthlyRevenue: 0,
    unreadNotifications: 0,
    notifications: [],
    upcomingClasses: [],
    recentActivity: []
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const getRoleSpecificStats = () => {
    switch (userRole) {
      case 'STUDENT':
        return [
          { title: 'Lezioni Prenotate', value: safeData.bookedClasses, icon: CalendarIcon, color: 'bg-blue-500' },
          { title: 'Lezioni Completate', value: safeData.completedClasses, icon: ChartBarIcon, color: 'bg-green-500' },
          { title: 'Crediti Rimanenti', value: safeData.remainingCredits, icon: CreditCardIcon, color: 'bg-purple-500' }
        ];
      case 'INSTRUCTOR':
        return [
          { title: 'Lezioni Oggi', value: safeData.todayClasses, icon: CalendarIcon, color: 'bg-blue-500' },
          { title: 'Studenti Totali', value: safeData.totalStudents, icon: UserGroupIcon, color: 'bg-green-500' },
          { title: 'Ore Insegnate', value: safeData.hoursThisMonth, icon: ChartBarIcon, color: 'bg-purple-500' }
        ];
      case 'ADMIN':
      case 'STAFF':
        return [
          { title: 'Studenti Attivi', value: safeData.activeStudents, icon: UserGroupIcon, color: 'bg-blue-500' },
          { title: 'Lezioni Oggi', value: safeData.todayClasses, icon: CalendarIcon, color: 'bg-green-500' },
          { title: 'Ricavi Mensili', value: `€${safeData.monthlyRevenue}`, icon: CreditCardIcon, color: 'bg-purple-500' }
        ];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Errore nel caricamento dei dati. Riprova più tardi.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user?.firstName || "Demo"}!</h1>
            <p className="text-gray-600 mt-1">Ecco un riepilogo delle tue attività</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="h-6 w-6" />
              {safeData.unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getRoleSpecificStats().map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* ... resto del contenuto (Upcoming, Notifications, Calendar, Activity) ... */}
    </div>
  );
};

// 👇 Esportazioni corrette
export default Dashboard;
export { Dashboard };