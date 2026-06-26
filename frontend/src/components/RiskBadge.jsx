import { riskColors, riskLabels } from '../utils/healthRisk';

const RiskBadge = ({ status = 'unknown', size = 'sm' }) => {
  const sizeClasses = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium capitalize ${sizeClasses} ${riskColors[status] || riskColors.unknown}`}
    >
      {riskLabels[status] || 'Unknown'}
    </span>
  );
};

export default RiskBadge;
