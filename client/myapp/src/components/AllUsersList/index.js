import "./index.css"
import React, {useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';

const AllUsersList = (props)=>{
    const data = props.eachUser
    const {friendRequest} = props

    const addFriend = ()=>{
        friendRequest(data.username)
    }

    return(
        <li className="liContainer">
                <img className = "userImage" src = {data.image}/>
                    <div className="contentsContainer">
                    <p>{data.username}</p>
                    </div>
                    <div>
                    <button onClick = {addFriend} className="buttonStylingIcon"><i className="iconStyling"><FontAwesomeIcon icon={faUserGroup} /></i></button>
                    </div>
        </li>
    )
}

export default AllUsersList 