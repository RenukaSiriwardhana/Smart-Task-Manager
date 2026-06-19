import { useState, useEffect } from 'react'
import './App.css' // අලුතින් හදපු CSS ෆයිල් එක ලින්ක් කිරීම

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const API_URL = 'http://127.0.0.1:8000/tasks/';

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.log("Error loading tasks:", error));
  }, []);

  const addTask = () => {
    if (newTaskTitle.trim() === "") return;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle, description: "" })
    })
      .then(response => response.json())
      .then(data => {
        setTasks([...tasks, data]);
        setNewTaskTitle('');
      });
  };

  const toggleComplete = (taskId) => {
    fetch(`${API_URL}${taskId}`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedTask => {
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      });
  };

  const editTask = (taskId, currentTitle) => {
    const newTitle = prompt("Edit your task:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    fetch(`${API_URL}${taskId}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: "" })
    })
      .then(response => response.json())
      .then(updatedTask => {
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      });
  };

  const deleteTask = (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    fetch(`${API_URL}${taskId}`, { method: 'DELETE' })
      .then(() => {
        setTasks(tasks.filter(task => task.id !== taskId));
      });
  };

  return (
    <div className="app-container">
      <h1 className="header">Smart Task Manager 🚀</h1>
      
      <div className="input-group">
        <input 
          type="text" 
          className="task-input"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What needs to be done?" 
          onKeyPress={(e) => e.key === 'Enter' && addTask()} // Enter එබුවමත් Save වෙනවා
        />
        <button onClick={addTask} className="btn-add">
          Add Task
        </button>
      </div>

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className="task-item">
            <input 
              type="checkbox" 
              className="checkbox"
              checked={task.completed} 
              onChange={() => toggleComplete(task.id)}
            />
            
            <span className={`task-text ${task.completed ? 'completed' : ''}`}>
              {task.title}
            </span>

            <button onClick={() => editTask(task.id, task.title)} className="btn-action btn-edit" title="Edit Task">
              ✏️
            </button>

            <button onClick={() => deleteTask(task.id)} className="btn-action btn-delete" title="Delete Task">
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App