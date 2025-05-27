import { useState } from "react";

import { BookInsertionType } from "../../../bookInsertionType";
import { SubjectDialog } from "./subjectDialog";




interface SubjectInputProps {
  formData: BookInsertionType;
  setFormData: React.Dispatch<React.SetStateAction<BookInsertionType>>;
}

export default function SubjectInput({ formData, setFormData }:SubjectInputProps) {
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
        id="subject"
        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formData.subject}
        onClick={() => setDialogOpen(true)} // open dialog on click
        onChange={(e) =>
          setFormData((prev:BookInsertionType) => ({
            ...prev,
            subject: e.target.value,
          }))
        }
        readOnly // prevent typing directly unless you want both behaviors
      />

      <SubjectDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
