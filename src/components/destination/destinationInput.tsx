
// import { useState } from "react";

// import { BookInsertionType } from "../../../bookInsertionType";
// import { DestinationDialog } from "./destinationDialog";

// interface DestinationInputProps {
//   formData: BookInsertionType;
//   setFormData: React.Dispatch<React.SetStateAction<BookInsertionType>>;
// }

// export default function DestinationInput({ formData, setFormData }:DestinationInputProps) {
//   const [dialogOpen, setDialogOpen] = useState(false);

//   return (
//     <div className="flex flex-col space-y-1">
//       {/* <label
//         htmlFor="materialName"
//         className="text-lg font-extrabold text-gray-700"
//       >
//         اسم الدائرة
//       </label> */}
//       <input
//         type="text"
//         id="destination"
//         className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         value={formData.destination}
//         onClick={() => setDialogOpen(true)} // open dialog on click
//         onChange={(e) =>
//           setFormData((prev:BookInsertionType) => ({
//             ...prev,
//             destination: e.target.value,
//           }))
//         }
//         readOnly // prevent typing directly unless you want both behaviors
//       />

//       <DestinationDialog
//         open={dialogOpen}
//         setOpen={setDialogOpen}
//         formData={formData}
//         setFormData={setFormData}
//       />
//     </div>
//   );
// }
