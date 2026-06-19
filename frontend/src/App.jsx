import { useState, useEffect } from 'react';
import './App.css'; 

const API_URL = 'http://127.0.0.1:8000';

function App() {
  // --- STATE MANAGEMENT ---
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  // Auth Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [authError, setAuthError] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Task States
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // --- USE EFFECT ---
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  // --- HELPER FUNCTION: TOGGLE MODE ---
  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
    setShowPassword(false); // Reset visibility
    setShowConfirmPassword(false); // Reset visibility
  };

  // --- AUTHENTICATION FUNCTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    // --- ADVANCED VALIDATION LOGIC ---
    if (!isLoginMode) {
      // 1. Check if passwords match
      if (password !== confirmPassword) {
        setAuthError("Passwords do not match!");
        return;
      }

      // 2. Strong Password Check using Regex
      // At least 6 characters, 1 uppercase letter, and 1 number
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!passwordRegex.test(password)) {
        setAuthError("Password must be at least 6 characters, include one uppercase letter and one number.");
        return;
      }
    }

    const endpoint = isLoginMode ? '/login' : '/register';
    const url = `${API_URL}${endpoint}`;
    
    try {
      let response;
      if (isLoginMode) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.detail || 'Authentication failed');
        return;
      }

      if (isLoginMode) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
      } else {
        alert('Registration successful! Please login.');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setIsLoginMode(true); 
      }
    } catch (error) {
      setAuthError('Network error. Is the server running?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setTasks([]); 
    setUsername('');
    setPassword('');
  };

  // --- TASK FUNCTIONS ---
  const fetchTasks = async () => {
    const response = await fetch(`${API_URL}/tasks/`, {
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (response.ok) setTasks(await response.json());
    else handleLogout();
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const response = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ title: newTaskTitle, description: "" }),
    });

    if (response.ok) {
      setNewTaskTitle('');
      fetchTasks(); 
    }
  };

  const deleteTask = async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (response.ok) fetchTasks(); 
  };

  // --- RENDER COMPONENT ---

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Top Illustration */}
          <div className="illustration-container">
            <img 
              src={isLoginMode 
                ? "https://illustrations.popsy.co/blue/work-from-home.svg" 
                : "https://illustrations.popsy.co/blue/team-building.svg"} 
              alt="auth illustration" 
            />
          </div>

          <h2>{isLoginMode ? 'Sign In' : 'Sign Up'}</h2>
          <p className="subtitle">
            {isLoginMode ? 'Enter valid user name & password to continue' : 'Use proper information to continue'}
          </p>

          <form onSubmit={handleAuth} className="auth-form">
            
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input 
                type="text" 
                placeholder={isLoginMode ? "User name" : "User name"}
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              {/* Show/Hide Password Icon */}
              <span 
                className="eye-icon" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {!isLoginMode && (
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
                {/* Show/Hide Confirm Password Icon */}
                <span 
                  className="eye-icon" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </span>
              </div>
            )}

            {authError && <p className="error-text">{authError}</p>}
            
            {/* Forget Password Link */}
            {isLoginMode && (
              <div className="forget-password">
                <a href="#">Forget password?</a>
              </div>
            )}

            {/* Terms and Conditions */}
            {!isLoginMode && (
              <p className="terms-text">
                By signing up, you are agree to our <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
              </p>
            )}

            <button type="submit" className="primary-btn">
              {isLoginMode ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Bottom Toggle Link */}
          <p className="toggle-text" style={{ marginTop: '20px' }}>
            {isLoginMode ? "Haven't any account? " : "Already have an Account? "}
            <span onClick={toggleAuthMode} className="toggle-link">
              {isLoginMode ? "Sign up" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Task Manager Screen
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        <div className="header">
          <h2>My Smart Tasks</h2>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <form onSubmit={addTask} className="task-form">
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            value={newTaskTitle} 
            onChange={(e) => setNewTaskTitle(e.target.value)} 
          />
          <button type="submit" className="add-btn">Add Task</button>
        </form>

        <ul className="task-list">
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="task-item">
                <span>{task.title}</span>
                <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;