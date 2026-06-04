interface StatCardData {
  icon: string;
  label: string;
  value: number | string;
}

interface Props {
  cards: StatCardData[];
}

function StatCard({ icon, label, value }: StatCardData) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {icon} {label}
      </div>
    </div>
  );
}

export function StatsRow({ cards }: Props) {
  if (!cards.length) return null;
  return (
    <div className={`grid gap-4 mb-6 ${
      cards.length === 1 ? 'grid-cols-1' :
      cards.length === 2 ? 'grid-cols-2' :
      cards.length === 3 ? 'grid-cols-3' :
      'grid-cols-2 md:grid-cols-4'
    }`}>
      {cards.map((c, i) => (
        <StatCard key={i} {...c} />
      ))}
    </div>
  );
}
