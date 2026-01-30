import React, { useEffect, useState } from 'react';
import { Container, Form, Button, InputGroup, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import Auth from './Auth'; 

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


function App() {

  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("Connecting...");
  const [taskTitle, setTaskTitle] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [priority, setPriority] = useState("Medium");

  // 1. Define Functions
  const fetchTasks = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      const local = localStorage.getItem("tasks");
      if (local) setTasks(JSON.parse(local));
    }
  };


  const handleToggle = async (id) => {
    await fetch(`${API_URL}/tasks/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchTasks();
  };

  // 2. Define Effects
  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // 3. Define Handlers
  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title: taskTitle, completed: false , priority: priority }),
      });
      setTaskTitle("");
      setPriority("Medium");
      fetchTasks();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (title) => {
    await fetch(`${API_URL}/tasks/${encodeURIComponent(title)}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchTasks();
  };

  // 4. Conditional Rendering (The UI)
  if (!token) {
    return (
      <Container className="py-5">
        <Auth onLogin={(t) => { setToken(t); localStorage.setItem("token", t); }} />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Task Manager</h1>
            <Button variant="outline-secondary" size="sm" onClick={() => { setToken(null); localStorage.removeItem("token"); }}>Logout</Button>
          </div>
          
          <InputGroup className="mb-3">
            <Form.Control 
              placeholder="New task..." 
              value={taskTitle} 
              onChange={(e) => setTaskTitle(e.target.value)} 
            />
            <Form.Select 
              style={{ maxWidth: '120px' }} 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>
            <Button variant="primary" onClick={handleAddTask}>Add</Button>
          </InputGroup>

          <ListGroup>
            {tasks.map((t) => (
              <ListGroup.Item key={t.id} className="d-flex justify-content-between align-items-center">
                <span 
                  onClick={() => handleToggle(t.id)} 
                  style={{ cursor: 'pointer', textDecoration: t.completed ? 'line-through' : 'none' }}
                >
                  <Badge 
                    bg={t.priority === 'High' ? 'danger' : t.priority === 'Low' ? 'info' : 'warning'} 
                    className="me-2"
                  >
                    {t.priority}
                  </Badge>
                  {t.title}
                </span>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.title)}>✕</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default App;