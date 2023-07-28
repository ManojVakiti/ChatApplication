const express = require("express")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const onlineUsers = []

const io = require("socket.io")(3000, {
    cors: {
        origin: ["http://localhost:3001"] 
    }
})

io.on("connection", (socket)=>{
    socket.on("joined", (message)=>{
        io.emit("newUserJoined", (message))
    })

    socket.on("onlineUsers", (message)=>{
        const userObject = {username: message, socketId: socket.id}
        if(onlineUsers.length === 0){
            onlineUsers.push(userObject)
        }else{
            //check if the username exists if so update the socketId
            const nameExists = onlineUsers.some((eachItem) => eachItem.username === message);
            if(nameExists){
                const index = onlineUsers.findIndex((item) => item.username === message);
                onlineUsers[index].socketId = socket.id;
            }else{
                onlineUsers.push(userObject)
            }
        } 
        io.emit("getOnlineUsers",onlineUsers)
    })

    socket.on("changeText",()=>{
        io.to(socket.id).emit("changeSendText", "")
    })

    socket.on("friendRequest", async(message)=>{
        const index = onlineUsers.findIndex((item) => item.username === message.username);
        if(index !== -1){
            const socketId = onlineUsers[index].socketId;
            const {sentBy, username} = message
            const query = `INSERT INTO friendTable (sender, friend) VALUES('${sentBy}', '${username}')`
            await db.run(query)
            const queryA = `INSERT INTO friendTable (sender, friend) VALUES('${username}', '${sentBy}')`
            await db.run(queryA)
            const querya = `SELECT * FROM friendTable WHERE sender = '${username}'`
            const arr = await db.all(querya)
            io.to(socketId).emit("receivedFriendRequest", arr)
            const queryb = `SELECT * FROM friendTable WHERE sender = '${sentBy}'`
            const arrB = await db.all(queryb)
            io.to(socket.id).emit("friendrequestSent", arrB)
        
        }else{
            const {sentBy, username} = message
            const query = `INSERT INTO friendTable (sender, friend) VALUES('${sentBy}', '${username}')`
            await db.run(query)
            const queryA = `INSERT INTO friendTable (sender, friend) VALUES('${username}', '${sentBy}')`
            await db.run(queryA)
            const querya = `SELECT * FROM friendTable WHERE sender = '${sentBy}'`
            const arr = await db.all(querya)
            io.emit("sendFriends", arr)
        }
        
        //send a request if the use is online
    })

    socket.on("addMessageDb", async(details)=>{
        //insertMessagesToTheDb
        const {sentName, receivedName, messageText, sentAt} = details
        const query = `INSERT INTO messages (sender_name, receiver_name, message_text, sent_at) VALUES('${sentName}', '${receivedName}', '${messageText}', '${sentAt}')`
        await db.run(query)
        const queryA = `SELECT * FROM messages WHERE (sender_name = '${sentName}' AND receiver_name = '${receivedName}') or (sender_name = '${receivedName}' AND receiver_name = '${sentName}')`
        const arr = await db.all(queryA)
        io.to(socket.id).emit("displayMessages", (arr))
        const index = onlineUsers.findIndex((item) => item.username === receivedName);
        if(index !== -1){
            io.to(onlineUsers[index].socketId).emit("receivedMessages", arr)
        }

    })

    socket.on("typing", (message)=>{
        const {sentBy, receivedBy} = message
        const index = onlineUsers.findIndex((item) => item.username === receivedBy.username);
        if(index !== -1){   
            io.to(onlineUsers[index].socketId).emit("typingStatus", "Typing")
        }
    })

    socket.on('disconnect', () => {
        const index = onlineUsers.findIndex((user) => user.socketId === socket.id);
        if (index !== -1) {
            onlineUsers.splice(index, 1);
            io.emit("getOnlineUsers",onlineUsers)
          }
      });
})

const app = express()

let db = null

const startDb = async ()=>{ //connecting the database
    const pathName = path.join(__dirname, "users.db")
    try{
        db = await open({
            filename: pathName,
            driver: sqlite3.Database
        })
        app.listen(3005, ()=>{
            console.log("Listening port 3005")
        })
    }catch(error){
        console.log(error)
    }
}

app.use(express.json())
app.use(cors())

startDb() //calling the function


app.post("/register", async(request, response)=>{ //registering the user
    const arrayImages = ["https://img.freepik.com/premium-vector/happy-smiling-young-man-avatar-3d-portrait-man-cartoon-character-people-vector-illustration_653240-187.jpg?size=626&ext=jpg", "https://img.freepik.com/premium-photo/3d-render-cute-nathan_899449-107.jpg?size=626&ext=jpg", "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436185.jpg?size=626&ext=jpg&ga=GA1.2.851980105.1690120540&semt=ais", "https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?size=626&ext=jpg&ga=GA1.2.851980105.1690120540&semt=ais", "https://img.freepik.com/premium-photo/illustration-cute-girl-avatar-graphic-white-background-created-with-generative-ai-technology_67092-5041.jpg?size=626&ext=jpg&ga=GA1.1.851980105.1690120540&semt=ais", "https://img.freepik.com/free-vector/3d-cartoon-young-woman-smiling-circle-frame-character-illustration-vector-design_40876-3100.jpg?size=626&ext=jpg&ga=GA1.1.851980105.1690120540&semt=ais"]
    const imageUrl = arrayImages[Math.floor(Math.random() * arrayImages.length)];
    const {username, email, password} = request.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const checkQuery = `SELECT * FROM user WHERE username = '${username}'`
    const checkArray = await db.all(checkQuery)
    if(checkArray.length === 0){
        const query = `INSERT INTO user (username, email, password, image) VALUES ('${username}', '${email}', '${hashedPassword}', '${imageUrl}')`
        await db.run(query)
        const result = {
            message: "Registration Successful!"
        }
        response.json(result)
    }else{
        const result = {
            message: "User exists!"
        }
        response.json(result)
    }
})

app.post("/login", async(request, response)=>{
    const {username, password} = request.body
    const query = `SELECT * FROM user WHERE username = '${username}'`
    const userDetails = await db.get(query)
    if(userDetails === undefined){
        const message = {
            error: "User doesn't exist"
        }
        return response.json(message)
    }else{
        const checkPassword = await bcrypt.compare(password, userDetails.password)
        if(checkPassword){
            const payload = {username: username}
            const token = jwt.sign(payload, "secret")
            const message = {
                error: "Login Successful",
                jwtToken: token
            }
            return response.json(message)
        }
        const message = {
            error: "Incorrect Password"
        }
        return response.json(message)
    }
})

app.get("/user", async(request, response)=>{
    const {username} = request.query
    const query = `SELECT * FROM user WHERE username = '${username}'`
    const array = await db.get(query)
    response.json(array)
})

app.get("/users", async(request, response)=>{
    const {username} = request.params
    const query = `SELECT * FROM user`
    const data = await db.all(query)
    response.json(data)
})

app.post("/addFriend", async(request, response)=>{
    
})

app.get("/friends/:username", async(request, response)=>{
    const {username} = request.params
    const query = `SELECT * FROM friendTable WHERE sender = '${username}'`
    const arr = await db.all(query)
    response.json(arr)
})

app.post("/messages/", async(request, response)=>{
    const {sentBy, receivedBy} = request.body
    const query = `SELECT * FROM messages WHERE (sender_name = '${sentBy}' AND receiver_name = '${receivedBy}') or (sender_name = '${receivedBy}' AND receiver_name = '${sentBy}')`
    const arr = await db.all(query)
    response.json(arr)
})

const runFunc = async()=>{
   
}

runFunc();

