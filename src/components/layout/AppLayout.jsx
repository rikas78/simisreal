import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import RaceCountdownAlert from './RaceCountdownAlert';

export default function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile nav */}
      <MobileNav />

      <RaceCountdownAlert />

      {/* Main content */}
      <main className="lg:ml-[240px] pt-14 lg:pt-0 min-h-screen">
        {isHome ? (
          <Outlet />
        ) : (
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}