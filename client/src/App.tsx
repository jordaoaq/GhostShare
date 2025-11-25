import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Room from "./components/Room";
import CursorGlow from "./components/CursorGlow";

function App() {
  return (
    <Router>
      <CursorGlow />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
