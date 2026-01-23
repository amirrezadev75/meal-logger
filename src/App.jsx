import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogMealPage from './pages/LogMealPage';
import ChatPage from './pages/ChatPage';
import ExtraInformation from './pages/ExtraInformation';
import JournalPage from './pages/JournalPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogMealPage />} />
        <Route path="/chat/:mealType" element={<ChatPage />} />
        <Route path="/extra-information" element={<ExtraInformation />} />
        <Route path="/journal" element={<JournalPage />} />
      </Routes>
    </Router>
  )
}

export default App