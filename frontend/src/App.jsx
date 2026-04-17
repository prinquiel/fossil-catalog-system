import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Catalog from './pages/public/Catalog';
import RoleLayout from './layouts/RoleLayout';
import AdminLayout from './layouts/AdminLayout';
import PlaceholderPage from './pages/common/PlaceholderPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPendingRegistrations from './pages/admin/AdminPendingRegistrations';
import AdminUsers from './pages/admin/AdminUsers';

const explorerLinks = [
  { to: '/explorer/dashboard', label: 'Dashboard' },
  { to: '/explorer/create-fossil', label: 'Create Fossil' },
  { to: '/explorer/my-fossils', label: 'My Fossils' },
  { to: '/explorer/profile', label: 'Profile' },
];

const researcherLinks = [
  { to: '/researcher/dashboard', label: 'Dashboard' },
  { to: '/researcher/catalog', label: 'Catalog' },
  { to: '/researcher/search', label: 'Search' },
  { to: '/researcher/my-studies', label: 'My Studies' },
  { to: '/researcher/map', label: 'Map' }, 
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Publico */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/fossil/:id" element={<PlaceholderPage title="Fossil Detail" />} />
          <Route path="/map" element={<PlaceholderPage title="Public Map" />} />
          <Route path="/about" element={<PlaceholderPage title="About" />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact" />} />

          {/* Compartidas */}
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="/403" element={<PlaceholderPage title="403" description="No autorizado" />} />
          <Route path="/404" element={<PlaceholderPage title="404" description="Pagina no encontrada" />} />
          <Route path="/500" element={<PlaceholderPage title="500" description="Error interno del servidor" />} />

          <Route path="/explorer" element={<RoleLayout title="Explorer Dashboard" links={explorerLinks} />}>
            <Route path="dashboard" element={<PlaceholderPage title="Explorer Dashboard" />} />
            <Route path="create-fossil" element={<PlaceholderPage title="Create Fossil" />} />
            <Route path="my-fossils" element={<PlaceholderPage title="My Fossils" />} />
            <Route path="edit-fossil/:id" element={<PlaceholderPage title="Edit Fossil" />} />
            <Route path="profile" element={<PlaceholderPage title="Explorer Profile" />} />
          </Route>

          <Route path="/researcher" element={<RoleLayout title="Researcher Dashboard" links={researcherLinks} />}>
            <Route path="dashboard" element={<PlaceholderPage title="Researcher Dashboard" />} />
            <Route path="catalog" element={<PlaceholderPage title="Researcher Catalog" />} />
            <Route path="fossil/:id" element={<PlaceholderPage title="Researcher Fossil Detail" />} />
            <Route path="search" element={<PlaceholderPage title="Researcher Search" />} />
            <Route path="create-study/:fossilId" element={<PlaceholderPage title="Create Study" />} />
            <Route path="my-studies" element={<PlaceholderPage title="My Studies" />} />
            <Route path="map" element={<PlaceholderPage title="Researcher Map" />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pending-registrations" element={<AdminPendingRegistrations />} />
            <Route path="pending-fossils" element={<PlaceholderPage title="Fosiles pendientes" />} />
            <Route path="fossil/:id/review" element={<PlaceholderPage title="Revisar fosil" />} />
            <Route path="fossils" element={<PlaceholderPage title="Gestionar fosiles" />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="create-user" element={<PlaceholderPage title="Crear usuario" />} />
            <Route path="edit-user/:id" element={<PlaceholderPage title="Editar usuario" />} />
            <Route path="messages" element={<PlaceholderPage title="Mensajes" />} />
            <Route path="message/:id" element={<PlaceholderPage title="Detalle del mensaje" />} />
            <Route path="audit" element={<PlaceholderPage title="Auditoria" />} />
            <Route path="stats" element={<PlaceholderPage title="Estadisticas" />} />
          </Route>

          <Route path="*" element={<PlaceholderPage title="404" description="Pagina no encontrada" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
