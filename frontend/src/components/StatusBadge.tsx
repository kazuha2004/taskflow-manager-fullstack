export default function StatusBadge({ status }: { status: string }) {
  let colorClass = 'bg-gray-100 text-gray-800'; // Default / To Do

  if (status === 'In Progress') {
    colorClass = 'bg-yellow-100 text-yellow-800';
  } else if (status === 'Done') {
    colorClass = 'bg-green-100 text-green-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
