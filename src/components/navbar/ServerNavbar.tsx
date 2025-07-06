// import { cookies } from "next/headers";
// import { verifyTokenForPage } from "@/utiles/verifyToken";
// import  Navbar  from "../Navbar";


// const ServerNavbar = async() => {


//       const cookieStore = await cookies();
//     const token = cookieStore.get("jwt_cookies_auth_token")?.value || '';
//     const payload = verifyTokenForPage(token);


//     return (

//         <Navbar payload={payload}/>
//     // <nav className="flex justify-between p-4 bg-gray-200">
//     //   <div>🚀 شعار الموقع</div>
//     //   {payload?.username ? (
//     //     <p>مرحباً، {payload.username}</p>
//     //   ) : (
//     //     <p>أهلاً بك زائر</p>
//     //   )}
//     // </nav>a
//   );


// }


// export default ServerNavbar