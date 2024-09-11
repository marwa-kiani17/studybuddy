import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Quiz from './components/Quiz';
import LandingPage from './pages/LandingPage';
// import SignUp from './components/SignUp';
import UseLogin from './components/UseLogin'; // Assuming this is a custom hook, not a component

function App() {
    return (
        <Router>
            <Routes>
                {/* Use the component directly in the 'element' prop */}
                {/* <Route path="/" element={<UseLogin />} />
                <Route path="/Quiz" element={<Quiz />} />
                <Route path="/signup" element={<SignUp />} /> */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<UseLogin />} />
                <Route path="/Quiz" element={<Quiz />} />
                {/* <Route path="/signup" element={<SignUp />} /> */}
            </Routes>
        </Router>
    );
}

export default App;
