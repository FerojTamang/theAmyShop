import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { CustomerLayout } from "../components/layout/CustomerLayout";
import { PublicLayout } from "../components/layout/PublicLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminCouponsPage } from "../pages/admin/AdminCouponsPage";
import { AdminCustomersPage } from "../pages/admin/AdminCustomersPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminProfilePage } from "../pages/admin/AdminProfilePage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { AdminReviewsPage } from "../pages/admin/AdminReviewsPage";
import { AdminSettingsPage } from "../pages/admin/AdminSettingsPage";
import { AccountPage } from "../pages/customer/AccountPage";
import { CartPage } from "../pages/customer/CartPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";
import { OrdersPage } from "../pages/customer/OrdersPage";
import { HomePage } from "../pages/public/HomePage";
import { LoginPage } from "../pages/public/LoginPage";
import { ProductDetailPage } from "../pages/public/ProductDetailPage";
import { ProductsPage } from "../pages/public/ProductsPage";
import { RegisterPage } from "../pages/public/RegisterPage";
import { AdminRoute } from "../routes/AdminRoute";
import { CustomerAccountRoute } from "../routes/CustomerAccountRoute";
import { ProtectedRoute } from "../routes/ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<CustomerLayout />}>
          <Route element={<CustomerAccountRoute />}>
            <Route path="account" element={<AccountPage />} />
          </Route>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
