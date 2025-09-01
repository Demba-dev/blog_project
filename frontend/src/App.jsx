import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Pages
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./Context/AuthContext";
// import CreateArticlePage from "./pages/CreateArticlePage";
import ProfilePage from "./pages/ProfilePage";
// import NotFoundPage from "./pages/NotFoundPage";

// Context
import { AuthProvider } from "./Context/AuthContext";

// Services
import { authService } from "./services/api";

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, token }) => {
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children, token }) => {
  return !token ? children : <Navigate to="/" replace />;
};

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function AppContent() {

  const [loading, setLoading] = useState(true);
  const {user, token, setUser, setToken} = useAuth()


  const handleLogout =useCallback(() => {
    localStorage.removeItem("token");
    setToken('');
    setUser(null);
  },[setToken, setUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // Verify token validity
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error("Token validation failed:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [setUser,handleLogout,setToken]);

  const handleLogin = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
  };



  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ScrollToTop />
      
      <Navbar 
        token={token} 
        
        
        onLogout={handleLogout} 
      />
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={<HomePage token={token} user={user}
             />} 
          />
          <Route 
            path="/articles/:id" 
            element={<ArticlePage token={token} user={user}
             />} 
          />
            
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute token={token}>
                <LoginPage onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute token={token}>
                <RegisterPage onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          {/* <Route 
            path="/create-article" 
            element={
              <ProtectedRoute token={token}>
                <CreateArticlePage 
                 />
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute token={token}>
                <ProfilePage
                  user={user}
                  onUpdateUser={setUser} />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Page */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>
      
      <Footer />
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;