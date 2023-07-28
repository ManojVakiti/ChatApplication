import {useState} from "react"
import Cookies from 'js-cookie'
import "./index.css"


const Login = (props)=>{
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        error: ""
      });

      

      const handleChange = (event)=>{
        const {name, value} = event.target
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            error: ""
        }));
        }

      const handleSubmitEvent = async(event)=>{
        event.preventDefault()

        // verifying details and posting details to the api
        const jsonData = {
            username: formData.username, password: formData.password
        }
        
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        }

        const res = await fetch("http://localhost:3005/login", options)
        const result = await res.json()
        if(result.jwtToken !== undefined){
            Cookies.set("jwtToken", result.jwtToken, {expires: 7})
            window.location.href = "/"
        }

        setFormData((prevFormData) => ({
            ...prevFormData,
            error: result.error,
          }));
    }

      return(
        <form onSubmit = {handleSubmitEvent} className = "bg-container">
        <h1 className = "headingField">Login</h1>
        <div className = "container">
            <input onChange = {handleChange} name = "username" required className = "textBoxStyling" placeholder = "username" type = "text"/>
            <input onChange = {handleChange} name = "password" required className = "textBoxStyling" placeholder = "password"  type = "password"/>
            <button onChange = {handleChange} className = "textBoxStyling buttonStyling" type = "submit" >Login</button>
            <a href = "/register">Register</a>
            {formData.error.length !== 0 ? <p className="errorText">{formData.error}</p>: null}
        </div>
    </form>
      )
}

export default Login