"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookInsertionType } from "../../utiles/bookInsertionType";

interface SubjectDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formData: BookInsertionType;
  setFormData: React.Dispatch<React.SetStateAction<BookInsertionType>>;
}

export function SubjectDialog({ 
  open, 
  setOpen, 
  formData, 
  setFormData 
}: SubjectDialogProps) {
  const handleSave = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تعديل الموضوع</DialogTitle>
          <DialogDescription>قم بإدخال تفاصيل الموضوع.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={formData.subject}
          onChange={(e) =>
            setFormData((prev: BookInsertionType) => ({
              ...prev,
              subject: e.target.value,
            }))
          }
          rows={6}
          className="mt-2"
          placeholder="اكتب الموضوع هنا..."
        />
        <DialogFooter>
          <Button onClick={handleSave}>تم</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}