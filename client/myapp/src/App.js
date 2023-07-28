import './App.css';
import ReactDOM from "react-dom";
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import Register from "./components/register"
import Login from "./components/login"
import Chat from "./components/Chat"
import {io} from 'socket.io-client';
const socket = io("http://localhost:3000")
socket.on("welcome", message=>{
    console.log(message)
})

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path = "/">
        <Chat socket = {socket}/>
      </Route>
      <Route exact path = "/login">
        <Login socket = {socket}/>
      </Route>
      <Route exact path = "/register">
        <Register socket = {socket}/>
      </Route>
      
      
    </Switch>
  </BrowserRouter>
)

export default App;
