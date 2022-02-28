import React from 'react'
import {Card, Container,Row, Col, Button, Form} from 'react-bootstrap';
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div>
      <br></br>
      <Link to="register">Register</Link><br></br>
      <Link to="login">Login</Link>
    </div>
  )
}
