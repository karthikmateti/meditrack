import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiActivity,
  FiPackage,
  FiThermometer,
  FiUserCheck,
  FiFileText,
  FiBarChart2,
  FiDownload,
  FiAlertTriangle,
  FiUser,
  FiX,
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/vitals', icon: FiActivity, label: 'Vitals' },
  { to: '/medicines', icon: FiPackage, label: 'Medicines' },
  { to: '/symptoms', icon: FiThermometer, label: 'Symptoms' },
  { to: '/doctor-visits', icon: FiUserCheck, label: 'Doctor Visits' },
  { to: '/prescriptions', icon: FiFileText, label: 'Prescriptions' },
  { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/reports', icon: FiDownload, label: 'Reports' },
  { to: '/sos', icon: FiAlertTriangle, label: 'SOS Emergency' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

const Sidebar = ({ isOpen, onClose }) => (
  <>
    {isOpen && (
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />
    )}
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-lg font-bold text-white">+</span>
          </div>
          <span className="text-xl font-bold text-primary-600">MediTrack</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 lg:hidden">
          <FiX className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your personal health companion
        </p>
      </div>
    </aside>
  </>
);

export default Sidebar;
