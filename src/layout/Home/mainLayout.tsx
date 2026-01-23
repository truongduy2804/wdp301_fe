import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

const MainLayoutComponent: React.FC = () => {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      <Header variant="site" />
      <main className="flex-1 mt-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const MainLayout = memo(MainLayoutComponent);
export default MainLayout;
