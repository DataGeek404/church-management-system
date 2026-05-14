import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MemberManagement from './pages/MemberManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import FinancialManagement from './pages/FinancialManagement';
import EventManagement from './pages/EventManagement';
import Communications from './pages/Communications';
import Reports from './pages/Reports';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<MemberManagement />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/financial" element={<FinancialManagement />} />
            <Route path="/events" element={<EventManagement />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

