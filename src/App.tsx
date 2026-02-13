import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Balances from './pages/Balances';
import PendingBalances from './pages/PendingBalances';
import Taxes from './pages/Taxes';
import Reports from './pages/Reports';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import AccountReportBalances from './pages/AccountReportBalances';
import ImportedPendingBalances from './pages/ImportedPendingBalances';

const queryClient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute requireAdmin>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/pending-balances"
              element={
                <PrivateRoute>
                  <PendingBalances />
                </PrivateRoute>
              }
            />
            <Route
              path="/imported-pending-balances"
              element={
                <PrivateRoute>
                  <ImportedPendingBalances />
                </PrivateRoute>
              }
            />
            <Route
              path="/balances"
              element={
                <PrivateRoute>
                  <Balances />
                </PrivateRoute>
              }
            />
            <Route
              path="/balances-account-report"
              element={
                <PrivateRoute>
                  <AccountReportBalances />
                </PrivateRoute>
              }
            />
            <Route
              path="/taxes"
              element={
                <PrivateRoute requireAdmin>
                  <Taxes />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute requireAdmin>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute requireAdmin>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
