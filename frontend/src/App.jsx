import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Catalog from './pages/public/Catalog';
import RoleLayout from './layouts/RoleLayout';
import PlaceholderPage from './pages/common/PlaceholderPage';

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

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/pending-fossils', label: 'Pending Fossils' },
  { to: '/admin/fossils', label: 'Fossils' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/create-user', label: 'Create User' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/audit', label: 'Audit' },
  { to: '/admin/stats', label: 'Stats' },
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

          <Route path="/admin" element={<RoleLayout title="Admin Dashboard" links={adminLinks} />}>
            <Route path="dashboard" element={<PlaceholderPage title="Admin Dashboard" />} />
            <Route path="pending-fossils" element={<PlaceholderPage title="Pending Fossils" />} />
            <Route path="fossil/:id/review" element={<PlaceholderPage title="Review Fossil" />} />
            <Route path="fossils" element={<PlaceholderPage title="Manage Fossils" />} />
            <Route path="users" element={<PlaceholderPage title="Manage Users" />} />
            <Route path="create-user" element={<PlaceholderPage title="Create User" />} />
            <Route path="edit-user/:id" element={<PlaceholderPage title="Edit User" />} />
            <Route path="messages" element={<PlaceholderPage title="Messages" />} />
            <Route path="message/:id" element={<PlaceholderPage title="Message Detail" />} />
            <Route path="audit" element={<PlaceholderPage title="Audit" />} />
            <Route path="stats" element={<PlaceholderPage title="Admin Stats" />} />
          </Route>

          <Route path="*" element={<PlaceholderPage title="404" description="Pagina no encontrada" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
