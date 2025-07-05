// import { toast } from "react-toastify";

// export async function handleDeletePdf(pdf: any, setPdfs: Function) {
//   try {
//     const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/delete_pdf`;
//     const res = await fetch(url, {
//       method: "DELETE",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ id: pdf.id, pdf: pdf.pdf?.replace(/\//g, "\\") }),
//     });

//     if (!res.ok) {
//       const errorData = await res.json().catch(() => ({}));
//       throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
//     }

//     const result = await res.json();
//     if (result.success) {
//       toast.success(`تم حذف الملف ${pdf.pdf}`);
//       setPdfs((prev: any[]) => prev.filter((item) => item.id !== pdf.id));
//     } else {
//       toast.error("فشل حذف الملف");
//     }
//   } catch (error: any) {
//     console.error("Error deleting PDF:", error);
//     toast.error(`فشل حذف الملف: ${error.message}`);
//   }
// }
