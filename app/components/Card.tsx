type Props = {
  title: string;
  value: number;
  icon?: React.ReactNode;
};

export default function Card({ title, value, icon }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}