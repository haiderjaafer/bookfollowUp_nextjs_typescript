// app/updateBooks/[id]/page.tsx

interface PageProps {
  params: {
    id: string;
  };
}

const UpdateBooksPage = async ({ params }: PageProps) => {
    const { id } = await params


  // optionally fetch data here using the ID
  // const data = await getBookById(id);

  return (
    <div>
      UpdateBooksPage {id}
    </div>
  );
};

export default UpdateBooksPage;
