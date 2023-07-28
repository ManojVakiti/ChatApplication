import "./index.css"
import {useEffect} from "react"
const {format } = require('date-fns');


const MessagesComponent = (props)=>{
    const {users, onlineUsers, messages} = props    
    const {username, image} = users
    let isOnline = onlineUsers.includes(users.username)
    
    const groupedData = messages.reduce((accumulator, currentObject) => {
    const dateOnly = currentObject.sent_at.split(' ')[0]; // Extracting the date part
    const foundIndex = accumulator.findIndex((item) => item.date === dateOnly);


  if (foundIndex === -1) {
    // If the date is not already present in the accumulator, add the object as a new entry
    accumulator.push({
      date: dateOnly,
      items: [currentObject],
    });
  } else {
    // If the date is already present, add the object to the existing entry's "items" array
    accumulator[foundIndex].items.push(currentObject);
  }

  return accumulator;
}, []);

    const scrollToBottom = () => {
    const scrollContainer = document.getElementById('scrollContainer');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll to bottom on initial mount and when content changes
    scrollToBottom();
  }, [messages]);

    return (
        <div className="userBgContainer">
             <div className="headerContainer">
                    {isOnline ? <img className = "userImage onlineUser" alt = "profile" src = {image}/>: <img className = "userImage" src = {image}/>}
                    <div className="contentsUser">
                    <h3 className="paraElement">{username}</h3>
                    {isOnline ? <p className="paraElement statusText">Online</p>: <p className="paraElement statusText">Offline</p>}
                    </div> 
             </div>
             <div className="MessagesContainer" id = "scrollContainer">
                {groupedData.map((eachItem)=>{
                    const dateTime = new Date(eachItem.date)
                    const formattedDate = format(dateTime, 'yyyy-MMMM-dd');
                    const date = formattedDate.split("-")
                    const dateFomrat = `${date[2]} ${date[1]} ${date[0]}`
                    return <div className="messages_container">
                    <p className = "dateClass">{dateFomrat}</p>
                    <ul className = "chats-container">
                        {eachItem.items.map((eachMessage)=>{
                            const dateTime = new Date(eachMessage.sent_at)
                            const time12Hour = format(dateTime, 'hh:mm a');
                            const caseChangeTime = time12Hour.toLocaleLowerCase()
                            if(eachMessage.sender_name === username){
                                return (
                                    <li className="liMessage receivedMessage">
                                        <p className="messageTitle">{eachMessage.message_text}</p>
                                        <p className="time">{caseChangeTime}</p>
                                    </li> //receivedMessage
                                )
                            }
                            return (
                                <li className="liMessage sentMessage">
                                        <p className="messageTitle">{eachMessage.message_text}</p>
                                        <p className="time">{caseChangeTime}</p>
                                    </li>
                            ) //sent Message
                        })}
                    </ul>
                    </div>
                    
                    })}
             </div>
        </div>
       
    )
}

export default MessagesComponent