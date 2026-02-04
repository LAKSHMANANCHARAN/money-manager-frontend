export default function RangeSelector({ range, setRange }) {
  return (
    <select
      value={range}
      onChange={(e) => setRange(e.target.value)}
      className="border rounded px-3 py-2"
    >
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
    </select>
  );
}
