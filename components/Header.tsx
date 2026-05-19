import {
  UserIcon,
  BellIcon,
} from "@heroicons/react/20/solid";


export default function Header() {
  return (
    <div className="flex justify-between items-center bg-white p-4 shadow">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div>ผู้ใช้งาน สำนัก/กอง</div>
    </div>
  );
}