interface Props {
  items: string[];
}

export function NextSteps({ items }: Props) {
  if (!items.length) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-blue-900 mb-2">▶ Next Steps</h2>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-blue-800 font-mono">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
