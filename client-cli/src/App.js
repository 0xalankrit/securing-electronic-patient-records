import './App.css';
import {Card, Container,Row, Col, Button, Form, Nav} from 'react-bootstrap';
import {Register} from './components/Register';
import {Login} from './components/Login';
function App() {
  return (
    <div className="App">
    <Nav fill variant="tabs" defaultActiveKey="/home">
      <Nav.Item>
        <Nav.Link href="/home">Active</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="link-1">Loooonger NavLink</Nav.Link>
      </Nav.Item>
    </Nav>
    </div>
  );
}

export default App;
