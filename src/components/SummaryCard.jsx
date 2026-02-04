export default function SummaryCard({ title, amount, color, icon, showCurrency = true }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className={`text-2xl font-bold ${color} mt-1`}>
            {showCurrency && '₹ '}{typeof amount === 'number' ? amount.toLocaleString() : amount}
          </p>
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
