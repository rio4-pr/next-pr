interface Props {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

export default function KpiCard({
    title,
    value,
    icon,
    color,
}: Props) {
    return (
        <div
            className={`
      bg-gradient-to-r
      ${color}
      text-white
      rounded-2xl
      p-6
      shadow-lg
      hover:scale-105
      transition-all
      duration-300
    `}
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className="opacity-90">
                        {title}
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {value}
                    </h2>
                </div>

                <div className="opacity-80">
                    {icon}
                </div>
            </div>
        </div>
    );
}