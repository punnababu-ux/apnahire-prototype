import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { Archetypes } from './pages/Archetypes';
import { ScenarioMap } from './pages/ScenarioMap';
import { JobDetail } from './pages/JobDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone prototype launcher — no product chrome */}
        <Route path="/archetypes" element={<Archetypes />} />
        <Route path="/scenario-map" element={<ScenarioMap />} />

        {/* apnaHire product shell */}
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/job/:id" element={<JobDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
