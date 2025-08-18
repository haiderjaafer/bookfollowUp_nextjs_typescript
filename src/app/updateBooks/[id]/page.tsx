import UpdateBooksFollowUpByBookID from "@/components/UpdateBooksFollowUpByBookID/UpdateBooksFollowUpByBookID";
import { verifyTokenForPage } from "@/utiles/verifyToken";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const UpdateBooksFollowUpByBookIDPage = async ({ params }: PageProps) => {
  const { id } = await params; // Now await the params Promise

  const cookieStore = await cookies();
  const token = cookieStore.get("jwt_cookies_auth_token")?.value || '';
  const payload = verifyTokenForPage(token);

  

  if (!payload) {
    // Optional: redirect or render error
    return <div>Unauthorized</div>; // Consider redirecting to an error page
  }

  return (
    <div>
      <UpdateBooksFollowUpByBookID bookId={id} payload={payload} />
    </div>
  );
};

export default UpdateBooksFollowUpByBookIDPage;