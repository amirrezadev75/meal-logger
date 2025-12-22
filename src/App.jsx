import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogMealPage from './pages/LogMealPage';
import LogMealDetailsPage from './pages/LogMealDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogMealPage />} />
        <Route path="/mealdetails" element={<LogMealDetailsPage />} />
      </Routes>
    </Router>
  )
}

export default App