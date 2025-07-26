import BookInsertionForm from "@/components/BookInsertionForm/BookInsertionForm";
import { verifyTokenForPage } from "@/utiles/verifyToken";
import { cookies } from "next/headers";


const BooksInsertionFormPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt_cookies_auth_token")?.value || "";
  const payload = verifyTokenForPage(token);

  // Check if payload is null and handle unauthorized case
  if (!payload) {
    return <div>Unauthorized</div>; // Optionally redirect to an error page
  }

  // Pass both payload and id to BookInsertionForm
  return <BookInsertionForm payload={payload} id={payload.id} />;
};

export default BooksInsertionFormPage;
