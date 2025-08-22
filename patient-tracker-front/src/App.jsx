import React from 'react';
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HomeLayout, Login, Landing, Patients, ProfilePage, Register, AppointmentsPage, ManageAppointments, HealthMetrics, Documents, DocumentAccess } from './pages';
import { store } from './store';

// Import actions
import { action as loginAction } from './pages/Login';
import { action as registerAction } from './pages/Register';

// Import pages
import {
  Login,
  Register,
  Landing,
  Patients,
  ProfilePage,
  AppointmentsPage,
  ManageAppointments,
  HealthMetrics
} from './pages';

// Import components
import { SinglePatient } from './components';
import { ProtectedRoute } from './ProtectedRoute';
import Navbar from './components/Navbar'; // Adjust the path as needed

// Import loaders
import { loader as patientLoader } from './pages/Patients';
import { loader as singlePatientLoader } from './components/SinglePatient';
import { loader as singlePatientLoaderEdit } from './components/PatientRegister';
import { loader as appointmentsLoader } from './pages/AppointmentsPage';
import { loader as singleAppointmentEditLoader } from './components/AppointmentRegister';
import { loader as healthMetricsLoader } from './pages/HealthMetrics';

// Import store
import { store } from './store';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

// Layout component with Navbar
const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

// Router configuration
const router = createBrowserRouter([
{
 path: '/',
 element: <HomeLayout />,
 children: [
   {
     index: true,
     element: <Landing />,
   },
   {
     path: 'manage-patient',
     element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
   },
   {
     path: 'manage-patient/:id',
     element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
    loader: singlePatientLoaderEdit(queryClient)
   },
   {
     path: 'medical-history',
     element: (
      <ProtectedRoute>
        <Patients />
      </ProtectedRoute>
    ),
    loader: patientLoader(queryClient)
   },
   {
     path: 'medical-history/:id',
     element: (
      <ProtectedRoute>
        <SinglePatient />
      </ProtectedRoute>
    ),
    loader: singlePatientLoader(queryClient)
   },
   {
     path: 'appointments/',
     element: (
      <ProtectedRoute>
        <AppointmentsPage />
      </ProtectedRoute>
    ),
    loader: appointmentsLoader(queryClient)
   },
   {
     path: 'manage-appointments/',
     element: (
      <ProtectedRoute>
        <ManageAppointments />
      </ProtectedRoute>
    ),
    loader: singleAppointmentEditLoader(queryClient)
   },
   {
     path: 'health-metrics/:id',
     element: (
      <ProtectedRoute>
        <HealthMetrics />
      </ProtectedRoute>
    ),
    loader: healthMetricsLoader(queryClient)
   },
   {
     path: 'documents',
     element: (
      <ProtectedRoute>
        <Documents />
      </ProtectedRoute>
    ),
   },
  
 ]
},
{
 path: '/document-access/:accessToken',
 element: <DocumentAccess />,
},
{
 path: '/login',
 element: <Login />,
 action: loginAction(store),
},
{
 path: '/register',
 element: <Register />,
 action: registerAction,
},
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'manage-patient',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manage-patient/:id',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
        loader: singlePatientLoaderEdit(queryClient),
      },
      {
        path: 'medical-history',
        element: (
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        ),
        loader: patientLoader(queryClient),
      },
      {
        path: 'medical-history/:id',
        element: (
          <ProtectedRoute>
            <SinglePatient />
          </ProtectedRoute>
        ),
        loader: singlePatientLoader(queryClient),
      },
      {
        path: 'appointments',
        element: (
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        ),
        loader: appointmentsLoader(queryClient),
      },
      {
        path: 'manage-appointments',
        element: (
          <ProtectedRoute>
            <ManageAppointments />
          </ProtectedRoute>
        ),
        loader: singleAppointmentEditLoader(queryClient),
      },
      {
        path: 'health-metrics/:id',
        element: (
          <ProtectedRoute>
            <HealthMetrics />
          </ProtectedRoute>
        ),
        loader: healthMetricsLoader(queryClient),
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
    action: loginAction(store),
  },
  {
    path: '/register',
    element: <Register />,
    action: registerAction,
  },
]);

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;