import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Create Receipt', path: '/create', icon: PlusCircle },
    { name: 'All Receipts', path: '/receipts', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 print:h-auto print:block">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col bg-[#0056b3] text-white shadow-xl md:flex no-print">
        <div className="flex h-20 items-center justify-center border-b border-[#004494]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0056b3] font-bold text-xl">
              ST
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider">SOFTSPERA</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-200">Technology</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-white text-[#0056b3]'
                      : 'text-blue-100 hover:bg-[#004494] hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#004494] p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-blue-100 transition-colors hover:bg-[#004494] hover:text-white">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible print:block">
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden no-print">
          <div className="flex items-center gap-2 text-[#0056b3]">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0056b3] text-white font-bold">
              ST
            </div>
            <span className="font-bold">Softspera</span>
          </div>
          <button onClick={toggleMobileMenu} className="text-slate-500 hover:text-slate-700">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-50 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden no-print">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-[#0056b3]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Desktop Header */}
        <header className="hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-8 md:flex no-print">
          <h2 className="text-2xl font-bold text-slate-800">
            {navItems.find((item) => isActive(item.path))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700">
              <Settings className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0fa] font-bold text-[#0056b3]">
                A
              </div>
              <div className="hidden text-sm md:block">
                <p className="font-medium text-slate-700">Admin User</p>
                <p className="text-xs text-slate-500">admin@softspera.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:overflow-visible print:p-0">
          <div className="mx-auto max-w-6xl print:max-w-none print:w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
