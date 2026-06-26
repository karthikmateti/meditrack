import { FiMenu, FiBell, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white lg:hidden">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-700"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
        </button>

        <button
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Notifications"
          onClick={() => {
            if ('Notification' in window && Notification.permission === 'default') {
              Notification.requestPermission();
            }
          }}
        >
          <FiBell className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          title="Logout"
        >
          <FiLogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
