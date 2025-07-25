import { cookies } from "next/headers";
import { verifyTokenForPage } from "@/utiles/verifyToken";
import ClientLayout from "./ClientLayout";
// import { redirect } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default async function LayoutWrapper({ children }: LayoutWrapperProps) {   // this LayoutWrapper is server component will render client component ClientLayout with prop
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt_cookies_auth_token")?.value; 

  const payload = token ? verifyTokenForPage(token) : null;  // check for token not null will run verifyTokenForPage esle null

  // If no valid token, pass null to ClientLayout and let it handle redirection
  const userData = payload                      // userData and payload as same type of JWTPayload coz verifyTokenForPage of type JWTPayload
    ? {
        userID: payload.id?.toString() || "",
        username: payload.username || "",
        permission: payload.permission || "",
      }
    : null;

  return (
    <ClientLayout userData={userData}>
      {children}
    </ClientLayout>
  );
}





















// // LayoutWrapper.tsx (Server Component)
// import { cookies } from "next/headers";
// import { verifyTokenForPage } from "@/utiles/verifyToken";
// import ClientLayout from "./ClientLayout";

// interface LayoutWrapperProps {
//   children: React.ReactNode;
// }

// export default async function LayoutWrapper({ children }: LayoutWrapperProps) {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("jwt_cookies_auth_token")?.value || '';
//   const payload = verifyTokenForPage(token);

//   const userData = payload ? {
//     userID: payload.id?.toString() || '',
//     username: payload.username || '',
//     permission: payload.permission || ''
//   } : null;

//   return (
//     <ClientLayout userData={userData}>
//       {children}
//     </ClientLayout>
//   );
// }