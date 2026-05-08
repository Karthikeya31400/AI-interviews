import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-[var(--color-dark-surface)] text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
