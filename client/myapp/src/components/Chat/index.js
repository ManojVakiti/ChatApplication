import React from "react";
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useHistory } from 'react-router-dom';
import AllUsersList from "../AllUsersList"
import FriendsList from "../friendsList"
import MessagesComponent from "../messagesComponent";
import SearchComponent from "../searchComponent"

import "./index.css" 

const getFormatedDate = (currentDate)=>{
    const year = currentDate.getFullYear(); 
    const month = currentDate.getMonth() + 1; 
    const day = currentDate.getDate(); 
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes(); 
    const seconds = currentDate.getSeconds()
    const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
    const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    const time = `${formattedDate} ${formattedTime}`
    return time
}

const fetchData = async()=>{
    try{
        let token = Cookies.get("jwtToken")
        const decodedToken = jwt_decode(token);
        const user = decodedToken.username
        const fetching = await fetch(`http://localhost:3005/users`)
        const res = await fetching.json()
        return res
    }catch(e){
        console.log(e)
    }
}

const Chat = (props)=>{
    const history = useHistory();
    const {socket} = props
    const [userDetails, setUserDetails] = useState([])
    const [friendsDetails, setFriendsDetails] = useState([])
    const [filteredArray, setFilteredArray] = useState([])
    const [allTheUsers, setAllTheUsers] = useState([])
    const [inputText, setInputText] = useState("")
    const [usernameState, setusernameState] = useState("")
    const [showMessage, setShowMessage] = useState(false)
    const [onClickUser, setonClickUser] = useState("")
    const [onlineUsersArray, setonlineUsersArray] = useState("")
    const [messagesArray, setMessagesArray] = useState([])
    const [searchValueState, setsearchValueState] = useState("")

    //socket for new userJoined
    useEffect(()=>{
        socket.on("newUserJoined", (message)=>{ 
            const dataFunc = async()=>{
                const data = await fetchData()
                setAllTheUsers(data)
            }
            dataFunc();
        })
    }, [])

    //socket for friend request received
    useEffect(()=>{
        socket.on("receivedFriendRequest", (array)=>{ 
            const names = array.map(obj => obj.friend)
            setFriendsDetails(names)
            
        })
    },[])

    //effect for verifying the token
    useEffect(()=>{
        const validataTheUser = async() => {
            try {
                let token = Cookies.get("jwtToken")
                const decodedToken = jwt_decode(token);
                //getting userDetails
                const user = decodedToken.username
                const result = await fetch(`http://localhost:3005/user?username=${user}`)
                const res = await result.json()
                socket.emit("onlineUsers", res.username)
                setusernameState(res.username)
                setUserDetails(res)
              } catch (error) {
                history.replace("register")
                window.location.reload();
              }
        }
        validataTheUser();
    }, [])

    useEffect(()=>{
        //fetching friendDetails
        const func = async()=>{
            let token = Cookies.get("jwtToken")
            const decodedToken = jwt_decode(token);
            const user = decodedToken.username
            try{
                const result = await fetch(`http://localhost:3005/friends/${user}`)
                const res = await result.json()
                const names = res.map(obj => obj.friend)
                setFriendsDetails(names)
            }catch(e){

            }
        }

        func()
    },[])

    //effect for fetching users
    useEffect(()=>{
        const dataFunc = async (user)=>{
            const data = await fetchData()
            setAllTheUsers(data)
            setFilteredArray(data)
        }
        dataFunc();
    },[])
    //searchFreinds
    const seachFriends = (event)=>{
        const text = event.target.value
        const filteredData = allTheUsers.filter((eachItem)=>{
            return eachItem.username.toLowerCase().includes(text.toLowerCase()) && eachItem.username !== usernameState && !friendsDetails.includes(eachItem.username)
        })
        setInputText(text)
        setFilteredArray(filteredData)

    }

    useEffect(()=>{
        socket.on("sendFriends", (array)=>{
            const names = array.map(obj => obj.friend)
            setFriendsDetails(names)
        })
    },[])

    useEffect(()=>{
        socket.on("friendrequestSent", (arr)=>{
            const names = arr.map(obj => obj.friend)
            setFriendsDetails(names)
        })
    },[])

    const friendButton = async(user)=>{
        const object = {
            username: user,
            sentBy: usernameState
        }
        socket.emit("friendRequest", (object))
        setInputText("")
    }

    const onFriendClick = async(user, message)=>{
        setsearchValueState(message)
        setonClickUser(user)
        setShowMessage(true)
        //getting the previous chats
        const details = {
            sentBy: usernameState,
            receivedBy: user.username
        }

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(details)
        }

        const response = await fetch("http://localhost:3005/messages/", options)
        const arr = await response.json()
        setMessagesArray(arr)
    }

    useEffect(()=>{
        socket.on("receivedMessages", (arr)=>{
            setMessagesArray(arr)
        })
    })

    //socket for getting all the online users
    useEffect(()=>{
        socket.on("getOnlineUsers", (onlineUsers)=>{
            const users = onlineUsers.map(eachItem => eachItem.username)
            setonlineUsersArray(users)

        })
    },[])

    useEffect(()=>{
        socket.on("displayMessages", (messagesArr)=>{
           setMessagesArray(messagesArr)
        })
    },[])

    const sendMessageToDb = (message)=>{
        const date = new Date()
        const dateTime = getFormatedDate(date)
         //send message to db
        const details = {
            sentName: usernameState,
            receivedName: onClickUser.username,
            messageText: message,
            sentAt: dateTime
        } 
        socket.emit("addMessageDb", (details))
    }

    return(
            <div className="bg-container-chat">
                <div className="chat-container">
                    <div className="horizontalContainer">
                        <div>
                            <div className="profile-details">
                        <img alt = "profileImage" className = "logoStyling" src = {userDetails.image}/>
                        <div>
                            <h3>{userDetails.username}</h3>
                            <p>{userDetails.email}</p>
                        </div>
                    </div>
                        <div className = "searchContainer">
                            <div>   
                                <input value = {inputText} onChange = {seachFriends} placeholder = "Search for new friends" className="searchBar" type = "search"/>
                            </div>
                        <div>

                            
                        </div>
                            {inputText !== "" ? <div className = "usersContainer">
                                <ul className="noMargin">
                                {inputText !== "" && filteredArray.length !== 0?  <p className="allUsers">Users</p>: <p>{`No users with name '${inputText}'`}</p>}
                                {inputText !== "" ? filteredArray.map((eachItem)=>{
                                return <AllUsersList key = {eachItem.username} friendRequest = {friendButton} eachUser = {eachItem}/>
                                }): null}
                                </ul>
                            </div>: null}                       
                        </div>
                        <div className = "acontainer">
                            <p className="Friends">Friends</p>
                            <ul className = "friendsContainer">
                                {allTheUsers.map((eachItem)=>{
                                    if(friendsDetails.includes(eachItem.username)){
                                        return (
                                            <React.Fragment>
                                                <FriendsList key = {eachItem.username} socket = {socket} onlineFriends = {onlineUsersArray} clickFriend = {onFriendClick} item = {eachItem}/>
                                            </React.Fragment>
                                        )
                                         
                                    }
                                })}
                            </ul>
                        </div>
                        </div>
                        <div className = "verticalLine"></div>
                        {showMessage === true ? 
                        <div className = "ChatContainer">
                                <div className = "messagesContainer">
                                    <MessagesComponent key = {onClickUser} socket = {socket} messages = {messagesArray} onlineUsers = {onlineUsersArray} users = {onClickUser}/>
                                </div>
                                <div className = "searchComponent">
                                    <SearchComponent key = {usernameState} socketIo = {socket} textValue = {searchValueState} searchValue = {""} socket = {socket} username = {usernameState} friend = {onClickUser} sendMessage = {sendMessageToDb} />
                                </div>
                        </div>: null}
                </div>
                </div>
            </div>
        )
}

export default Chat