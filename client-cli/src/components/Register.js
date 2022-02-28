import React, { useState,useRef } from 'react'
import {Card, Container,Row, Col, Button, Form} from 'react-bootstrap';
import {Link} from 'react-router-dom'; 
import '../App.css';

const axios = require('axios').default;

export const Register = () => {
  const [username, setusername] = useState('');
  const [password, setpassword] = useState('');

  const submitHandler =(e)=>{
    e.preventDefault();
    console.log('Hey')
    console.log(username,password);
    axios.post('http://localhost:4000/register', {
      "username":username,
      "password":password
    })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  return (
    <>
    <div className="App">
      <Card >
        <Card.Header>Register/<Link to="/">Home</Link></Card.Header>
        <Card.Body>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3">
            <Form.Control value ={username} onChange={e=>{setusername(e.target.value)}} type="text" placeholder="Enter Username" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control value ={password} onChange={e=>{setpassword(e.target.value)}} type="password" placeholder="Password" />
          </Form.Group>
    
          <Button variant="outline-dark" type="submit">Submit</Button>
        </Form>
        </Card.Body>
      </Card>
    </div>
    </>
  )
}
