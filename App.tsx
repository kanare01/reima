import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ReportsPage from './pages/ReportsPage';
import TenantsPage from './pages/TenantsPage';

function App() {
  return (
    <div className="dark">
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="properties" element={<PropertiesPage />} />
                      <Route path="properties/:propertyId" element={<PropertyDetailPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="tenants" element={<TenantsPage />} />
                       {/* Redirect root of protected routes to dashboard */}
                      <Route path="/" element={<DashboardPage />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </div>
  );
}

export default App;