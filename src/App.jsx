import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LogMealPage from './pages/LogMealPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogMealPage />} />
      </Routes>
    </Router>
  )
}

export default App
