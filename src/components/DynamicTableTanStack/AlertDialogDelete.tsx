import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { PDFRecord } from "./types";
import { toast } from "react-toastify";

interface AlertDialogDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdf: PDFRecord;
  setPdfs: React.Dispatch<React.SetStateAction<PDFRecord[]>>;
}

export function AlertDialogDelete({ open, onOpenChange, pdf, setPdfs }: AlertDialogDeleteProps) {
    
  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/delete_pdf`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: pdf.id, pdf: pdf.pdf?.replace(/\//g, "\\") }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`تم حذف الملف ${pdf.pdf}`);
        setPdfs((prev) => prev.filter((p) => p.id !== pdf.id));
      } else {
        toast.error("فشل حذف الملف");
      }

      onOpenChange(false); // Close dialog
    } catch (error: any) {
      toast.error(`فشل في حذف الملف: ${error.message}`);
    }
  };

  return (
 
 <AlertDialog open={open} onOpenChange={onOpenChange}>
  <AlertDialogContent className="text-right rtl">
    <AlertDialogHeader className="text-right">
      <AlertDialogTitle className="text-right font-bold text-lg">
        هل أنت متأكد من الحذف؟
      </AlertDialogTitle>
    </AlertDialogHeader>

    <div className="text-lg font-extrabold text-gray-600">
      سيتم حذف ملف محدد للكتاب: {pdf.bookNo}
    </div>

    <AlertDialogFooter className="flex justify-center gap-4 mt-4">
      
      <AlertDialogAction
        onClick={handleDelete}
        className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700"
      >
        حذف
      </AlertDialogAction>

      <AlertDialogCancel className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300">
        إلغاء
      </AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

 
  );
}
