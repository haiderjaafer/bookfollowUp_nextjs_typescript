import { useState } from "react";
import { DirectoryNameDialog } from "./directoryNameDialog";
import { BookInsertionType } from "../../../bookInsertionType";




interface DirectoryNameInputProps {
  formData: BookInsertionType;
  setFormData: React.Dispatch<React.SetStateAction<BookInsertionType>>;
}

export default function DirectoryNameInput({ formData, setFormData }:DirectoryNameInputProps) {
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
        id="materialName"
        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formData.directoryName}
        onClick={() => setDialogOpen(true)} // open dialog on click
        onChange={(e) =>
          setFormData((prev:BookInsertionType) => ({
            ...prev,
            materialName: e.target.value,
          }))
        }
        readOnly // prevent typing directly unless you want both behaviors
      />

      <DirectoryNameDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
