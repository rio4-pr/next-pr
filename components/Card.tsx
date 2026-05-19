type Props = {
  title: string;
  value: number;
};

export default function Card({ title, value }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}