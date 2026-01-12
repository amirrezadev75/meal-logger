import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogMealPage from './pages/LogMealPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogMealPage />} />
        <Route path="/chat/:mealType" element={<ChatPage />} />
      </Routes>
    </Router>
  )
}

export default App