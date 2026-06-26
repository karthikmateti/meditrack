import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ icon: Icon = FiInbox, title = 'No data yet', description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
    {description && (
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
