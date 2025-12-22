import BottomNav from "../components/BottomNav/BottomNav";
import LogMealDetails from "../components/LogMealDetails/LogMealDetails";

const LogMealDetailsPage = () => {

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
      <LogMealDetails />
      <BottomNav />
    </div>
  );
};

export default LogMealDetailsPage;