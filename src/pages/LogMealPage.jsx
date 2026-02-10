import LogMeal from "../components/LogMeal/LogMeal";
import BottomNav from "../components/BottomNav/BottomNav";

const LogMealPage = () => {

  return (
    <div style={{ 
      maxWidth: 540, 
      margin: '0 auto', 
      width: '100%', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ flex: 1 }}>
        <LogMeal />
      </div>
      <BottomNav />
    </div>
  );
};

export default LogMealPage;