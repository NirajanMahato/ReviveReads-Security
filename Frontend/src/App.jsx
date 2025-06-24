import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import { AdminRoute } from "./components/routes/AdminRoute";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { NotificationProvider } from "./context/NotificationContext";
import { SocketContextProvider } from "./context/SocketContext";
import { UserProvider } from "./context/UserContext";
import useUpdateUserStatus from "./hooks/useUpdateUserStatus";
import { authActions } from "./store/auth";

// Lazy-loaded components (keeping your existing imports)
const Home = lazy(() => import("./core/public/homePage/Home"));
const Layout = lazy(() => import("./core/private/Layout"));
const ErrorPage = lazy(() => import("./core/public/errorPage/ErrorPage"));
const DashboardIndex = lazy(() => import("./core/private/dashboard"));
const UserIndex = lazy(() => import("./core/private/user"));
const BookListings = lazy(() => import("./core/private/bookListings"));
const LoginPage = lazy(() => import("./core/public/auth/loginPage"));
const RegisterPage = lazy(() => import("./core/public/auth/RegisterPage"));
const ForgotPassword = lazy(() => import("./core/public/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./core/public/auth/ResetPassword"));
const ProductDetails = lazy(() =>
  import("./core/public/productDetails/ProductDetails")
);
const UserProfile = lazy(() => import("./core/public/userProfile/UserProfile"));
const MessagePage = lazy(() => import("./core/public/messages/MessagePage"));
const CustomerProfile = lazy(() =>
  import("./core/public/customerProfile/CustomerProfile")
);
const NotificationsPage = lazy(() =>
  import("./core/public/notifications/NotificationsPage")
);
const Settings = lazy(() => import("./core/private/settings"));

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  useUpdateUserStatus();

  useEffect(() => {
    if (
      localStorage.getItem("id") &&
      localStorage.getItem("token") &&
      localStorage.getItem("role")
    ) {
      const roleFromLocalStorage = localStorage.getItem("role");
      dispatch(authActions.login());
      dispatch(authActions.changeRole(roleFromLocalStorage));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <UserProvider>
        <SocketContextProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes - Accessible to Everyone */}
              <Route path="/" element={<Home />} />
              <Route path="/products/:bookId" element={<ProductDetails />} />
              <Route
                path="/customerprofile/:userId"
                element={<CustomerProfile />}
              />
              <Route path="/error" element={<ErrorPage />} />

              {/* Auth Routes - Only accessible if NOT authenticated */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />

              {/* Protected Routes - Only accessible if authenticated */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - Only accessible if authenticated and role is admin */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Layout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<DashboardIndex />} />
                <Route path="users" element={<UserIndex />} />
                <Route path="booklistings" element={<BookListings />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all Route for 404 Errors */}
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </NotificationProvider>
        </SocketContextProvider>
      </UserProvider>
    </Suspense>
  );
}

export default App;
