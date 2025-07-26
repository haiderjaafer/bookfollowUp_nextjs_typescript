
import { useState } from "react";
import { BookInsertionType } from "../../../utiles/bookInsertionType";
import { BookActionDialog } from "./bookActionDialog";



interface BookActionInputProps {
  formData: BookInsertionType;
  setFormData: React.Dispatch<React.SetStateAction<BookInsertionType>>;
}

export default function BookActionInput({ formData, setFormData }:BookActionInputProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-1">
      {/* <label
        htmlFor="materialName"
        className="text-lg font-extrabold text-gray-700"
      >
        اسم الدائرة
      </label> */}
      <input
        type="text"
        id="destination"
        className="p-2 border h-12 border-gray-300 rounded-md font-extrabold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formData.bookAction}
        placeholder="اجراء او هامش الكتاب"
        onClick={() => setDialogOpen(true)} // open dialog on click
        onChange={(e) =>
          setFormData((prev:BookInsertionType) => ({
            ...prev,
            bookAction: e.target.value,
          }))
        }
        readOnly // prevent typing directly unless you want both behaviors
      />

      <BookActionDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
