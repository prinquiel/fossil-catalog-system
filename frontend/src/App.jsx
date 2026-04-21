import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Catalog from './pages/public/Catalog';
import PublicStudiesIndex from './pages/public/PublicStudiesIndex';
import PublicStudyDetail from './pages/public/PublicStudyDetail';
import PublicMap from './pages/public/PublicMap';
import PublicFossilDetail from './pages/public/PublicFossilDetail';
import PublicContact from './pages/public/PublicContact';
import PublicAbout from './pages/public/PublicAbout';
import PublicProfile from './pages/public/PublicProfile';
import PublicNotifications from './pages/public/PublicNotifications';
import PublicSettings from './pages/public/PublicSettings';
import RoleLayout from './layouts/RoleLayout';
import AdminLayout from './layouts/AdminLayout';
import PlaceholderPage from './pages/common/PlaceholderPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPendingRegistrations from './pages/admin/AdminPendingRegistrations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCreateUser from './pages/admin/AdminCreateUser';
import AdminEditUser from './pages/admin/AdminEditUser';
import AdminFossils from './pages/admin/AdminFossils';
import AdminPendingFossils from './pages/admin/AdminPendingFossils';
import AdminPendingStudies from './pages/admin/AdminPendingStudies';
import AdminStudies from './pages/admin/AdminStudies';
import AdminStudyView from './pages/admin/AdminStudyView';
import AdminFossilReview from './pages/admin/AdminFossilReview';
import AdminMessages from './pages/admin/AdminMessages';
import AdminMessageDetail from './pages/admin/AdminMessageDetail';
import AdminStats from './pages/admin/AdminStats';
import ExplorerDashboard from './pages/explorer/ExplorerDashboard';
import ExplorerCreateFossil from './pages/explorer/ExplorerCreateFossil';
import ExplorerMyFossils from './pages/explorer/ExplorerMyFossils';
import ExplorerEditFossil from './pages/explorer/ExplorerEditFossil';
import ExplorerProfile from './pages/explorer/ExplorerProfile';
import ResearcherDashboard from './pages/researcher/ResearcherDashboard';
import ResearcherCatalog from './pages/researcher/ResearcherCatalog';
import ResearcherFossilDetail from './pages/researcher/ResearcherFossilDetail';
import ResearcherSearch from './pages/researcher/ResearcherSearch';
import ResearcherCreateStudy from './pages/researcher/ResearcherCreateStudy';
import ResearcherMyStudies from './pages/researcher/ResearcherMyStudies';
import ResearcherStudyDetail from './pages/researcher/ResearcherStudyDetail';
import ResearcherEditStudy from './pages/researcher/ResearcherEditStudy';

const ResearcherMap = lazy(() => import('./pages/researcher/ResearcherMap'));
import GlobalLoadingBar from './components/system/GlobalLoadingBar.jsx';
import { AppErrorBoundary } from './components/system/AppErrorBoundary.jsx';

const explorerLinks = [
  { to: '/explorer/dashboard', label: 'Inicio' },
  { to: '/explorer/create-fossil', label: 'Nuevo fósil' },
  { to: '/explorer/my-fossils', label: 'Mis fósiles' },
  { to: '/explorer/profile', label: 'Perfil' },
];

const researcherLinks = [
  { to: '/researcher/dashboard', label: 'Inicio' },
  { to: '/researcher/catalog', label: 'Catálogo' },
  { to: '/researcher/search', label: 'Buscar' },
  { to: '/researcher/my-studies', label: 'Mis estudios' },
  { to: '/researcher/map', label: 'Mapa' },
];

function PublicRouteTransition() {
  const location = useLocation();
  return (
    <div className="route-transition" key={location.pathname}>
      <Outlet />
    </div>
  );
}

function NotFoundRoute() {
  const location = useLocation();
  return (
    <div className="route-transition" key={location.pathname}>
      <PlaceholderPage title="404" description="Pagina no encontrada" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppErrorBoundary>
          <GlobalLoadingBar />
          <Toaster position="top-right" />
          <Routes>
            <Route element={<PublicRouteTransition />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/estudios" element={<PublicStudiesIndex />} />
              <Route path="/catalog/estudio/:id" element={<PublicStudyDetail />} />
              <Route path="/fossil/:id" element={<PublicFossilDetail />} />
              <Route path="/map" element={<PublicMap />} />
              <Route path="/about" element={<PublicAbout />} />
              <Route path="/contact" element={<PublicContact />} />

              <Route path="/profile" element={<PublicProfile />} />
              <Route path="/notifications" element={<PublicNotifications />} />
              <Route path="/settings" element={<PublicSettings />} />
              <Route path="/403" element={<PlaceholderPage title="403" description="No autorizado" />} />
              <Route path="/404" element={<PlaceholderPage title="404" description="Pagina no encontrada" />} />
              <Route
                path="/500"
                element={<PlaceholderPage title="500" description="Error interno del servidor" />}
              />
            </Route>

            <Route
              path="/explorer"
              element={<RoleLayout variant="explorer" navTitle="Explorador" links={explorerLinks} />}
            >
              <Route path="dashboard" element={<ExplorerDashboard />} />
              <Route path="create-fossil" element={<ExplorerCreateFossil />} />
              <Route path="my-fossils" element={<ExplorerMyFossils />} />
              <Route path="edit-fossil/:id" element={<ExplorerEditFossil />} />
              <Route path="profile" element={<ExplorerProfile />} />
            </Route>

            <Route
              path="/researcher"
              element={<RoleLayout variant="researcher" navTitle="Investigador" links={researcherLinks} />}
            >
              <Route path="dashboard" element={<ResearcherDashboard />} />
              <Route path="catalog" element={<ResearcherCatalog />} />
              <Route path="fossil/:id" element={<ResearcherFossilDetail />} />
              <Route path="search" element={<ResearcherSearch />} />
              <Route path="create-study/:fossilId" element={<ResearcherCreateStudy />} />
              <Route path="study/:id" element={<ResearcherStudyDetail />} />
              <Route path="study/:id/edit" element={<ResearcherEditStudy />} />
              <Route path="my-studies" element={<ResearcherMyStudies />} />
              <Route
                path="map"
                element={
                  <Suspense
                    fallback={
                      <div
                        style={{
                          padding: '1.5rem',
                          fontFamily: 'var(--font-body)',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        Cargando mapa…
                      </div>
                    }
                  >
                    <ResearcherMap />
                  </Suspense>
                }
              />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="pending-registrations" element={<AdminPendingRegistrations />} />
              <Route path="pending-fossils" element={<AdminPendingFossils />} />
              <Route path="pending-studies" element={<AdminPendingStudies />} />
              <Route path="studies" element={<AdminStudies />} />
              <Route path="study/:id" element={<AdminStudyView />} />
              <Route path="fossil/:id/review" element={<AdminFossilReview />} />
              <Route path="fossils" element={<AdminFossils />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="create-user" element={<AdminCreateUser />} />
              <Route path="edit-user/:id" element={<AdminEditUser />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="message/:id" element={<AdminMessageDetail />} />
              <Route path="audit" element={<Navigate to="/admin/studies" replace />} />
              <Route path="stats" element={<AdminStats />} />
            </Route>

            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
        </AppErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
