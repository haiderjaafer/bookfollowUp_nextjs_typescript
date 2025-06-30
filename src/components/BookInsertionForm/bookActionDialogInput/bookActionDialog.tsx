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
import { BookInsertionType } from "../../../../bookInsertionType";



export function BookActionDialog({ open, setOpen, formData, setFormData }:any) {
  const handleSave = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تعديل الاجراء</DialogTitle>
          <DialogDescription>قم بإدخال تفاصيل الاجراء.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={formData.bookAction}
    onChange={(e) =>
  setFormData((prev: BookInsertionType) => ({
    ...prev,
    bookAction: e.target.value,
  }))
}



          
          rows={6}
          className="mt-2"
          placeholder="اكتب الاجراء هنا..."
        />
        <DialogFooter>
          <Button onClick={handleSave}>تم</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
