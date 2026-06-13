import Swal from "sweetalert2";

export const successAlert = (message: string) =>
  Swal.fire({
    icon: "success",
    title: "เพิ่มข้อมูลสำเร็จ!",
    text: message,
  });

export const editSuccessAlert = (message: string) =>
  Swal.fire({
    icon: "success",
    title: "แก้ไขข้อมูลสำเร็จ!",
    text: message,
  });

export const errorAlert = (message: string) =>
  Swal.fire({
    icon: "error",
    title: "ผิดพลาด",
    text: message,
  });

export const confirmDelete = () =>
  Swal.fire({
    title: "ยืนยันการลบ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ลบ",
    cancelButtonText: "ยกเลิก",
  });
