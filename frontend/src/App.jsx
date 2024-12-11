import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from './components/Header';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PollDetails from "./pages/PollDetails";
import Results from "./pages/Results";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatePoll from "./pages/CreatePoll";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Router>
       <Header />
       <main className="p-4">
        <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          {/* Additional routes for Poll Details and Results */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
          <Route path="/polls/create" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>}/>
          <Route path="/user/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
          <Route path="/polls/:pollId" element={<PollDetails />} />
          <Route path="/polls/:pollId/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
