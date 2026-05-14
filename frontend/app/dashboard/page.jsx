'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { memberApi, attendanceApi, financialApi, eventApi } from '@/lib/api/client';
import '@/styles/pages.css';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
    // Redirect normal users to events page (they don't have dashboard access)
    if (!loading && isAuthenticated && user?.role === 'user') {
      router.replace('/events');
    }
    // Redirect unauthenticated from old / path
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, user, router]);

  // Fetch Members Data
  const { data: membersResponse, isLoading: membersLoading } = useQuery({
    queryKey: ['dashboard-members'],
    queryFn: async () => {
      try {
        const result = await memberApi.getMembers({ limit: 1000 });
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch members');
        return { data: { data: [] }, total: 0 };
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch Attendance Data
  const { data: attendanceResponse, isLoading: attendanceLoading } = useQuery({
    queryKey: ['dashboard-attendance'],
    queryFn: async () => {
      try {
        const result = await attendanceApi.getRecords({ limit: 1000 });
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch attendance');
        return { data: [] };
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch Financial Data
  const { data: financialResponse, isLoading: financialLoading } = useQuery({
    queryKey: ['dashboard-financial'],
    queryFn: async () => {
      try {
        const result = await financialApi.getTransactions({ limit: 1000 });
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch financial data');
        return { data: [] };
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch Events Data
  const { data: eventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      try {
        const result = await eventApi.getEvents({ limit: 1000 });
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch events');
        return { data: [] };
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Extract data safely - handle Axios wrapped responses
  const extractMembers = () => {
    let data = [];

    // Axios wraps response in .data, so we need to check multiple levels
    // Response structure: { data: { success, data: [...], total }, status, statusText, ... }
    const responseData = membersResponse?.data;

    if (Array.isArray(responseData?.data?.data)) {
      data = responseData.data.data;
    } else if (Array.isArray(responseData?.data)) {
      data = responseData.data;
    } else if (Array.isArray(membersResponse?.data)) {
      // Check if membersResponse.data is the array directly
      data = membersResponse.data;
    }

    return {
      total: data.length,
      active: data.filter(m => m.status === 'active').length,
    };
  };

  const extractAttendance = () => {
    let data = [];

    // Axios wraps response in .data
    // Response structure: { data: { success, data: [...], total }, status, statusText, ... }
    const responseData = attendanceResponse?.data;

    if (Array.isArray(responseData?.data)) {
      data = responseData.data;
    } else if (Array.isArray(attendanceResponse?.data)) {
      data = attendanceResponse.data;
    } else if (attendanceResponse && Object.keys(attendanceResponse).length > 0) {
      console.warn('⚠️ Unexpected attendance response format');
    }

    if (data.length === 0) return { total: 0, rate: '0%', today: 0 };

    const today = new Date().toDateString();
    const todayRecords = data.filter(r => new Date(r.createdAt || r.timestamp).toDateString() === today);
    const present = todayRecords.filter(r => r.status === 'Present').length;
    const rate = todayRecords.length > 0
      ? ((present / todayRecords.length) * 100).toFixed(0) + '%'
      : '0%';

    return {
      total: data.length,
      rate,
      today: todayRecords.length,
    };
  };

  const extractFinancial = () => {
    let data = [];

    // Axios wraps response in .data
    const responseData = financialResponse?.data;

    if (Array.isArray(responseData?.data?.data)) {
      data = responseData.data.data;
    } else if (Array.isArray(responseData?.data)) {
      data = responseData.data;
    } else if (Array.isArray(financialResponse?.data)) {
      data = financialResponse.data;
    }

    if (data.length === 0) return { income: 0, expense: 0, balance: 0 };

    const income = data
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(String(t.amount) || 0), 0);

    const expense = data
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(String(t.amount) || 0), 0);

    return {
      income: Math.round(income),
      expense: Math.round(expense),
      balance: Math.round(income - expense),
    };
  };

  const extractEvents = () => {
    let data = [];

    // Axios wraps response in .data
    const responseData = eventsResponse?.data;

    if (Array.isArray(responseData?.data?.data)) {
      data = responseData.data.data;
    } else if (Array.isArray(responseData?.data)) {
      data = responseData.data;
    } else if (Array.isArray(eventsResponse?.data)) {
      data = eventsResponse.data;
    }

    const now = new Date();
    const upcoming = data.filter(e => new Date(e.date) > now);
    return {
      total: data.length,
      upcoming: upcoming.length,
    };
  };

  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>⏳ Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>🔄 Redirecting to login...</p>
      </div>
    );
  }

  // Prevent normal users from seeing dashboard content
  if (user?.role === 'user') {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>🔄 Redirecting to events page...</p>
      </div>
    );
  }

  const isDataLoading = membersLoading || attendanceLoading || financialLoading || eventsLoading;
  const members = extractMembers();
  const attendance = extractAttendance();
  const financial = extractFinancial();
  const events = extractEvents();

  return (
    <div className="page dashboard" style={{ background: '#f9fafb' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            🏰 Church Management Dashboard
          </h1>
          <p style={{ color: '#6b7280', marginTop: '5px' }}>
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          {/* Members Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  👥 Total Members
                </p>
                <h3 style={{ fontSize: '2em', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {isDataLoading ? '...' : members.total}
                </h3>
              </div>
              <div style={{ fontSize: '2.5em' }}>👥</div>
            </div>
            <p style={{ color: '#10b981', fontSize: '0.875rem', margin: 0 }}>
              ✓ {members.active} active members
            </p>
          </div>

          {/* Attendance Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📍 Attendance Rate
                </p>
                <h3 style={{ fontSize: '2em', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {isDataLoading ? '...' : attendance.rate}
                </h3>
              </div>
              <div style={{ fontSize: '2.5em' }}>📍</div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
              {attendance.today} records today
            </p>
          </div>

          {/* Financial Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💰 Total Balance
                </p>
                <h3 style={{ fontSize: '1.75em', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {isDataLoading ? '...' : formatKES(financial.balance)}
                </h3>
              </div>
              <div style={{ fontSize: '2.5em' }}>💰</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem' }}>
              <p style={{ color: '#10b981', margin: 0 }}>
                Income: {formatKES(financial.income)}
              </p>
              <p style={{ color: '#ef4444', margin: 0 }}>
                Expense: {formatKES(financial.expense)}
              </p>
            </div>
          </div>

          {/* Events Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📅 Upcoming Events
                </p>
                <h3 style={{ fontSize: '2em', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {isDataLoading ? '...' : events.upcoming}
                </h3>
              </div>
              <div style={{ fontSize: '2.5em' }}>📅</div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
              {events.total} total events
            </p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '30px',
        }}>
          <h2 style={{ fontSize: '1.25em', fontWeight: 'bold', color: '#1f2937', marginTop: 0, marginBottom: '16px' }}>
            ⚡ Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
          }}>
            <button
              onClick={() => router.push('/members')}
              style={{
                padding: '12px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#2563eb'}
              onMouseOut={(e) => e.target.style.background = '#3b82f6'}
            >
              👤 Register Member
            </button>
            <button
              onClick={() => router.push('/attendance')}
              style={{
                padding: '12px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#059669'}
              onMouseOut={(e) => e.target.style.background = '#10b981'}
            >
              📍 Record Attendance
            </button>
            <button
              onClick={() => router.push('/events')}
              style={{
                padding: '12px 16px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#d97706'}
              onMouseOut={(e) => e.target.style.background = '#f59e0b'}
            >
              📅 Create Event
            </button>
            <button
              onClick={() => router.push('/financial')}
              style={{
                padding: '12px 16px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#7c3aed'}
              onMouseOut={(e) => e.target.style.background = '#8b5cf6'}
            >
              💰 Record Transaction
            </button>
            <button
              onClick={() => router.push('/communications')}
              style={{
                padding: '12px 16px',
                background: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#db2777'}
              onMouseOut={(e) => e.target.style.background = '#ec4899'}
            >
              💬 Send Message
            </button>
            <button
              onClick={() => router.push('/reports')}
              style={{
                padding: '12px 16px',
                background: '#06b6d4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#0891b2'}
              onMouseOut={(e) => e.target.style.background = '#06b6d4'}
            >
              📊 Generate Report
            </button>
          </div>
        </div>

        {/* Data Loading Info */}
        {isDataLoading && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '16px',
            color: '#78350f',
            textAlign: 'center',
          }}>
            ⏳ Loading dashboard data...
          </div>
        )}
      </div>
    </div>
  );
}
