import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RetrieveRecords from './pages/RetrieveRecords';
import MedicalHistory from './pages/MedicalHistory';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/retrieve" element={<RetrieveRecords />} />
        <Route path="/history" element={<MedicalHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
