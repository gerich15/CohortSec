import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LandingLayout from "./components/layout/LandingLayout";
import FraudHelpLayout from "./components/layout/FraudHelpLayout";
import LegalLayout from "./components/layout/LegalLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const About = lazy(() => import("./pages/About"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Documentation = lazy(() => import("./pages/Documentation"));
const TechnicalDocumentation = lazy(() => import("./pages/TechnicalDocumentation"));
const YourSecurity = lazy(() => import("./pages/YourSecurity"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Family = lazy(() => import("./pages/Family"));
const Backup = lazy(() => import("./pages/Backup"));
const Security = lazy(() => import("./pages/Security"));
const Anomalies = lazy(() => import("./pages/Anomalies"));
const Checks = lazy(() => import("./pages/Checks"));
const Support = lazy(() => import("./pages/Support"));
const FraudHelpAbout = lazy(() => import("./pages/fraud-help/FraudHelpAbout"));
const FraudHelpUrgent = lazy(() => import("./pages/fraud-help/FraudHelpUrgent"));
const FraudHelpReport = lazy(() => import("./pages/fraud-help/FraudHelpReport"));
const FraudHelpFaq = lazy(() => import("./pages/fraud-help/FraudHelpFaq"));
const FraudHelpSchemes = lazy(() => import("./pages/fraud-help/FraudHelpSchemes"));
const FraudHelpContacts = lazy(() => import("./pages/fraud-help/FraudHelpContacts"));
const FraudHelpComplain = lazy(() => import("./pages/fraud-help/FraudHelpComplain"));
const FraudHelpUsefulSites = lazy(() => import("./pages/fraud-help/FraudHelpUsefulSites"));
const LegalInfo = lazy(() => import("./pages/legal/LegalInfo"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const Eula = lazy(() => import("./pages/legal/Eula"));
const CybercrimeStats = lazy(() => import("./pages/CybercrimeStats"));

function PageFallback() {
  return <div className="flex min-h-[200px] items-center justify-center text-gray-500">Загрузка…</div>;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/your-security" element={<YourSecurity />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/security-whitepaper" element={<TechnicalDocumentation />} />
        <Route path="/cybercrime-stats" element={<CybercrimeStats />} />
        <Route path="/fraud-help" element={<FraudHelpLayout />}>
          <Route index element={<FraudHelpAbout />} />
          <Route path="urgent" element={<FraudHelpUrgent />} />
          <Route path="report" element={<FraudHelpReport />} />
          <Route path="faq" element={<FraudHelpFaq />} />
          <Route path="schemes" element={<FraudHelpSchemes />} />
          <Route path="useful-sites" element={<FraudHelpUsefulSites />} />
          <Route path="contacts" element={<FraudHelpContacts />} />
          <Route path="complain" element={<FraudHelpComplain />} />
        </Route>
        <Route path="/legal" element={<LegalLayout />}>
          <Route index element={<LegalInfo />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="eula" element={<Eula />} />
          <Route path="cookies" element={<CookiePolicy />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="checks" element={<Checks />} />
        <Route path="family" element={<Family />} />
        <Route path="backup" element={<Backup />} />
        <Route path="security" element={<Security />} />
        <Route path="events" element={<Anomalies />} />
        <Route path="support" element={<Support />} />
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
    </Suspense>
  );
}
