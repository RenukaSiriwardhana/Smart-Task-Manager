import { useState, useEffect } from 'react';
import './App.css'; 

// --- LOCAL IMAGES IMPORT ---
import startupImg from './assets/startup.png';
import loginImg from './assets/login.png';
import signupImg from './assets/signup.png';

const API_URL = 'https://smart-task-manager-qxgj.onrender.com';

const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => {
  const now = new Date();
  return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [showLanding, setShowLanding] = useState(!localStorage.getItem('token'));
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [authError, setAuthError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const [dueDate, setDueDate] = useState(getCurrentDate());
  const [dueTime, setDueTime] = useState(getCurrentTime());
  const [isGenerating, setIsGenerating] = useState(false);

  const [expandedTasks, setExpandedTasks] = useState({});

  // --- 150ms BROWSER AUTOFILL KILLER TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token) {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }
    }, 150); 
    return () => clearTimeout(timer);
  }, [isLoginMode, token, showLanding]);

  useEffect(() => {
    if (token) {
      fetchTasks();
      setShowLanding(false);
    }
  }, [token]);

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    setUsername(''); setPassword(''); setConfirmPassword(''); setAuthError('');
    setShowPassword(false); setShowConfirmPassword(false); 
  };

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    
    if (!username || !password) {
      setAuthError("Please fill in all required fields!"); return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      setAuthError("Passwords do not match!"); return;
    }
    const endpoint = isLoginMode ? '/login' : '/register';
    try {
      let response;
      if (isLoginMode) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData });
      } else {
        response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      }
      const data = await response.json();
      if (!response.ok) { setAuthError(data.detail || 'Authentication failed'); return; }
      if (isLoginMode) {
        localStorage.setItem('token', data.access_token); setToken(data.access_token);
        setShowLanding(false);
      } else {
        alert('Registration successful! Please login.'); setIsLoginMode(true); 
      }
    } catch (error) { setAuthError('Network error. Server running?'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); setToken(''); setTasks([]); 
    setShowLanding(true);
  };

  const fetchTasks = async () => {
    const response = await fetch(`${API_URL}/tasks/`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (response.ok) setTasks(await response.json()); else handleLogout();
  };

  const addTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTaskTitle || !dueDate || !dueTime) return;

    setIsGenerating(true);
    const response = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: newTaskTitle, due_date: dueDate, due_time: dueTime }),
    });

    if (response.ok) {
      setNewTaskTitle(''); setDueDate(getCurrentDate()); setDueTime(getCurrentTime()); fetchTasks(); 
    }
    setIsGenerating(false);
  };

  const toggleTaskCompletion = async (task) => {
    const newStatus = !task.is_completed;
    const response = await fetch(`${API_URL}/tasks/${task.id}`, { 
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_completed: newStatus })
    });
    if (response.ok) fetchTasks();
  };

  const deleteTask = async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (response.ok) fetchTasks(); 
  };

  const toggleTaskExpand = (id) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAuth(e);
  };

  // --- 1. RENDER LANDING PAGE ---
  if (showLanding && !token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="illustration-container" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img src={startupImg} alt="Welcome" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: '#1e2022', fontSize: '1.8rem', marginBottom: '10px' }}>Smart Task Manager</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '30px', lineHeight: '1.5' }}>
            Plan your day with AI. Get smart time-management suggestions, strict warnings for conflicting schedules, and keep your life organized.
          </p>
          <button className="primary-btn" onClick={() => setShowLanding(false)} style={{ padding: '12px 20px', fontSize: '1.05rem', boxShadow: '0 4px 14px 0 rgba(0,86,255,0.39)' }}>
            Get Started 🚀
          </button>
        </div>
      </div>
    );
  }

  // --- 2. RENDER AUTH PAGE ---
  if (!token && !showLanding) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div onClick={() => setShowLanding(true)} style={{ display: 'inline-block', marginBottom: '15px', cursor: 'pointer', color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>
            ← Back
          </div>
          <div className="illustration-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={isLoginMode ? loginImg : signupImg} alt="Auth" style={{ width: '100%', maxHeight: '140px', objectFit: 'contain' }} />
          </div>
          <h2>{isLoginMode ? 'Sign In' : 'Sign Up'}</h2>
          
          <div className="auth-form" onKeyDown={handleKeyDown}>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input 
                type="search" 
                name={"usr_" + Math.random()} 
                autoComplete="off"
                placeholder="User name" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              {}
              <input 
                type={showPassword ? "text" : "password"} 
                name={"pwd_" + Math.random()}
                autoComplete="new-password"
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>{showPassword ? "🙈" : "👁️"}</span>
            </div>

            {!isLoginMode && (
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                { }
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name={"conf_" + Math.random()}
                  autoComplete="new-password"
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}>{showConfirmPassword ? "🙈" : "👁️"}</span>
              </div>
            )}

            {authError && <p className="error-text">{authError}</p>}
            <button type="button" onClick={handleAuth} className="primary-btn" style={{ marginTop: '15px' }}>{isLoginMode ? 'Login' : 'Create Account'}</button>
          </div>
          
          <p className="toggle-text" style={{ marginTop: '20px' }}>
            {isLoginMode ? "Haven't any account? " : "Already have an Account? "}
            <span onClick={toggleAuthMode} className="toggle-link" style={{ cursor: 'pointer', color: '#0056FF' }}>{isLoginMode ? "Sign up" : "Sign in"}</span>
          </p>
        </div>
      </div>
    );
  }

  // --- 3. RENDER DASHBOARD ---
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        <div className="header">
          <h2>My Smart Tasks</h2>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <form onSubmit={addTask} className="task-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="e.g., Prepare for exam" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} disabled={isGenerating} required />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="date" value={dueDate} min={getCurrentDate()} onChange={(e) => setDueDate(e.target.value)} disabled={isGenerating} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #f5d2d2' }} />
            <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} disabled={isGenerating} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #f1cbcb' }} />
          </div>
          <button type="submit" className="add-btn" disabled={isGenerating}>
            {isGenerating ? "AI is Thinking..." : "Add Task"}
          </button>
        </form>

        <ul className="task-list">
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            tasks.map((task) => {
              const lines = task.description ? task.description.split('\n').filter(line => line.trim() !== '') : [];
              const warningLine = lines.find(line => line.includes('🚨 WARNING:'));
              const otherLines = lines.filter(line => !line.includes('🚨 WARNING:'));
              const isExpanded = expandedTasks[task.id];

              return (
                <li key={task.id} className="task-item" style={{ flexDirection: 'column', alignItems: 'flex-start', opacity: task.is_completed ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" checked={task.is_completed} onChange={() => toggleTaskCompletion(task)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      <span style={{ fontWeight: '600', fontSize: '1.05rem', color: '#1e2022', textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
                  </div>
                  
                  <span style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px', display: 'flex', gap: '10px', marginLeft: '30px' }}>
                    <span>📅 {task.due_date}</span> <span>⏰ {task.due_time}</span>
                  </span>
                  
                  {task.description && !task.is_completed && (
                    <div onClick={() => toggleTaskExpand(task.id)} style={{ fontSize: '0.85rem', color: '#4b5563', backgroundColor: '#a0b4c9', padding: '12px', borderRadius: '8px', width: '100%', borderLeft: '4px solid #0056FF', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                      <strong style={{ color: '#0056FF', display: 'block', marginBottom: '5px' }}>✨ AI Suggestion:</strong>
                      {warningLine && <p style={{ color: '#d32f2f', fontWeight: 'bold', margin: '5px 0' }}>{warningLine}</p>}
                      {!isExpanded ? (
                        <p style={{ margin: '5px 0', color: '#0056FF', fontSize: '0.8rem', fontWeight: 'bold' }}>{warningLine ? "🔽 Click to see steps" : "🔽 Click to see AI steps"}</p>
                      ) : (
                        <div style={{ marginTop: '10px', borderTop: '1px solid #9aabc0', paddingTop: '10px' }}>
                          {otherLines.map((line, index) => <p key={index} style={{ margin: '5px 0', lineHeight: '1.5' }}>{line}</p>)}
                          <p style={{ margin: '10px 0 0 0', color: '#0056FF', fontSize: '0.8rem', fontWeight: 'bold' }}>🔼 Hide steps</p>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;