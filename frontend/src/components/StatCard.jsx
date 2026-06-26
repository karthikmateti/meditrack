const StatCard = ({ title, value, unit, icon: Icon, subtitle, badge, className = '' }) => (
  <div className={`card animate-fade-in ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {value ?? '—'}
          </span>
          {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {Icon && (
          <div className="rounded-lg bg-primary-50 p-2.5 dark:bg-primary-900/20">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
        )}
        {badge}
      </div>
    </div>
  </div>
);

export default StatCard;
