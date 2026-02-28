import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RetrieveRecords from './pages/RetrieveRecords';
import MedicalHistory from './pages/MedicalHistory';
import Profile from './pages/Profile';
import ReportIssue from './components/ReportIssue';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/retrieve" element={<RetrieveRecords />} />
          <Route path="/history" element={<MedicalHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ReportIssue />
    </>
  );
}
