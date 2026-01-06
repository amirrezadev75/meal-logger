import Chat from "../components/Chat/Chat";
import BottomNav from "../components/BottomNav/BottomNav";

const ChatPage = () => {
  return (
    <div style={{ 
      maxWidth: 540, 
      margin: '0 auto', 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '80px' // Add space for bottom nav
      }}>
        <Chat />
      </div>
      <BottomNav />
    </div>
  );
};

export default ChatPage;