const ShowMoreFields = () => {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Field label="تاريخ التعيين" name="hireDate" />
      <Field label="الوظيفة الحالية" name="currentPosition" />
      <Field label="تاريخ المباشرة" name="startDate" />
      <Field label="الدرجة" name="grade" />
    </div>
  );
};

const Field = ({ label, name }: { label: string; name: string }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-semibold text-gray-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      placeholder={label}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold"
    />
  </div>
);

export default ShowMoreFields;
