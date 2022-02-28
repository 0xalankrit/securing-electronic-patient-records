import './App.css';
import {Card, Container,Row, Col, Button, Form, Nav} from 'react-bootstrap';
import {Register} from './components/Register';
import {Login} from './components/Login';
import {Home} from './components/Home';
import { useState,useEffect } from 'react';

import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="login" element={  <Login/> } />
        <Route path="register" element={ <Register/> } />
        <Route path="/" element={ <Home/> } />
      </Routes>
    </div>
  );
}

export default App;
