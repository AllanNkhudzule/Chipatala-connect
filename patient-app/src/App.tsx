import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RetrieveRecords from './pages/RetrieveRecords';
import MedicalHistory from './pages/MedicalHistory';
import Profile from './pages/Profile';
import ReportIssue from './components/ReportIssue';

import NotFound from './pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/retrieve" element={<RetrieveRecords />} />
          <Route path="/history" element={<MedicalHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ReportIssue />
    </>
  );
}
