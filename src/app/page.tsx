import LateBooksTable from "@/components/LandingPage/LateBooksTable";
import StatisticsComponentParent from "@/components/LandingPage/StatisticsSection/StatisticsComponentParent";
import { verifyTokenForPage } from "@/utiles/verifyToken";
import { cookies } from "next/headers";


const Home = async () => {

   const cookieStore = await cookies();
    const token = cookieStore.get("jwt_cookies_auth_token")?.value || '';
    const payload = verifyTokenForPage(token);

    if (!payload) {
    // Optional: redirect or render error
    return <div>Unauthorized</div>; // Consider redirecting to an error page
  }

    console.log("home paylaod..."  + payload?.permission)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-serif" dir="rtl">
      {/* Statistics Section - Client Component */}
      <StatisticsComponentParent permission={payload?.permission} />
      
      {/* Late Books Table Section - Client Component */}
      <LateBooksTable />
    </div>
  );
};

export default Home;