import "./index.css"
import React, {useState, useEffect} from "react"

const SearchComponent = (props)=>{
    const [message, setMessage] = useState("")
    const {sendMessage, socket} = props
    const changeText = (event)=>{
        setMessage(event.target.value)
    }
    useEffect(()=>{
        socket.on("changeSendText", ()=>{
            setMessage("")
        })

    })
    
    const handleSubmitEvent = (message)=>{
        sendMessage(message) //adding message to the database
    }

    const handleEnterButton = (e)=>{ //sendMessage to the user
        if(e.key === "Enter"){
            handleSubmitEvent(message)
            setMessage("");
        }
    }

    return(
        <div className = "sendBarContainer">
            <div>
            <input onKeyPress = {handleEnterButton} value = {message} onChange = {changeText} placeholder="Send A Message" className="textSend" type = "text"/>
            <button onClick={() => {
                handleSubmitEvent(message)
                setMessage('')
            }} className="SendButton">Send</button>
            </div>
             
        </div>
    )
}

export default SearchComponent