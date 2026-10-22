import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { authService } from '../services/auth';
import type { Usuario } from '../types/usuario';

export default function Layout() {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    let active = true;
    authService.me().then((data) => {
      if (active) setUser(data);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <Sidebar profile={user?.profile} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
