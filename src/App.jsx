import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogMealPage from './pages/LogMealPage';
import LogMealDetailsPage from './pages/LogMealDetailsPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogMealPage />} />
        <Route path="/mealdetails/:mealType" element={<LogMealDetailsPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  )
}

export default App