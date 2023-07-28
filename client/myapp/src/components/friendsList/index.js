import "./index.css"


const FriendsList = (props)=>{
    const {item, clickFriend, onlineFriends, socket} = props
    const {username, image} = item

    const isOnline = onlineFriends.includes(username)

    const sendMessage = ()=>{
        const sendBarText = ""
        socket.emit("changeText", "")
        clickFriend(item, sendBarText)
    }

    return( 
        <li onClick = {sendMessage} className="FriendContainer">
                {isOnline ? <img className = "userImage onlineUser" src = {image} alt = "profile"/>: <img className = "userImage" src = {image}/>}
                    <div className="contentsContainer">
                    <p>{username}</p>
                    </div>
        </li> 
    )
}

export default FriendsList