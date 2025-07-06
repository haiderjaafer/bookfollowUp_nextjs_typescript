import BookInsertionForm from "@/components/BookInsertionForm/BookInsertionForm";
import { verifyTokenForPage } from "@/utiles/verifyToken";
import { cookies } from "next/headers";

const BooksInsertionFormPage = async () => {

  const cookieStore = await cookies();
    const token = cookieStore.get("jwt_cookies_auth_token")?.value || '';
    const payload = verifyTokenForPage(token);
  
    if (!payload) {
      // optional: redirect or render error 
      return <div>Unauthorized</div>; // here maybe redirect into error page
    }


  return (
   <BookInsertionForm payload={payload} />
  )
}
export default BooksInsertionFormPage

