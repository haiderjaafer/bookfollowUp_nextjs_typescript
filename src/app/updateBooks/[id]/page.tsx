import UpdateBooksFollowUpByBookID from "@/components/UpdateBooksFollowUpByBookID/UpdateBooksFollowUpByBookID";


interface PageProps {
  params: {
    id: string;
  };
}

const UpdateBooksFollowUpByBookIDPage = async ({ params }: PageProps) => {
  const { id } = params;

  return (
    <div>
      <UpdateBooksFollowUpByBookID bookId={id} />
    </div>
  );
};

export default UpdateBooksFollowUpByBookIDPage;