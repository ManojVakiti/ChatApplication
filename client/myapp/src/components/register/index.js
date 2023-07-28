import {useState} from "react"
import "./index.css"

const Register = (props)=>{
    const socket = props.socket
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        error: ""
    })

    const handleChange = (event)=>{
        const {value, name} = event.target
        setFormData((prevFormData)=>({
            ...prevFormData,
            [name]: value,
            error: ""
        }))
        
    }

    const handleSubmitEvent = async(event)=>{
        event.preventDefault()
        const {username, email, password} = formData
        const data = {
            username, email, password
        }
        const options = {
            method : "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        const response = await fetch("http://localhost:3005/register", options)
        const res = await response.json()
        setFormData((prevFormData)=>({
            ...prevFormData,
            error: res.message
        }))
        if(res.message === "Registration Successful!"){
            const dataSend = {
                username
            }
            socket.emit("joined", (dataSend))
        }   
    }

    return(
        <form onSubmit = {handleSubmitEvent} className = "bg-container">
            <h1 className = "headingField">Create an Account</h1>
            <div className = "container">
                <input value = {formData.username} name = "username" required className = "textBoxStyling" onChange = {handleChange} placeholder = "username" type = "text"/>
                <input value = {formData.email} name = "email" required className = "textBoxStyling" onChange = {handleChange} placeholder = "email@gmail.com"  type = "email"/>
                <input value = {formData.password} name = "password" required className = "textBoxStyling" onChange = {handleChange} placeholder = "password"  type = "password"/>
                <button className = "textBoxStyling buttonStyling" type = "submit" >Register</button>
                <a href = "/login">Login</a>
                {formData.error.length !== 0 ? <p className = "errorText">{formData.error}</p>: null}
            </div>
        </form>
    )
}

export default Register