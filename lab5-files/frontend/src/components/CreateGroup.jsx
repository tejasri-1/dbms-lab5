import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CreateGroup() {

    // TODO: Use useState to manage:
    // 1. Group name
    // 2. Friend list
    // 3. Selected friends
    const [name, setName] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const navigate = useNavigate();

    // TODO: Fetch the friend list of the logged-in user
    // - Call GET /friends API
    // - Include credentials
    // - Store the response in friends state
    // - Handle error cases
    useEffect(() => {
        // Implement logic here
    }, []);

    // TODO: Implement handleCreateGroup function
    // - Prevent default form submission
    // - Validate group name
    // - Call POST /groups API with:
    //   { name, member_ids }
    // - Navigate to /groups on success
    const handleCreateGroup = async (e) => {
        // Implement logic here
    };

    // TODO: Implement toggleFriend function
    // - Add/remove friend ID from selectedFriends array
    const toggleFriend = (id) => {
        // Implement logic here
    };

    return (
        <>
            {/* 
              TODO: Implement JSX for Create Group page
              - Input field for group name
              - Checkbox list of friends
              - "Create Group" and "Cancel" buttons
              - Link to add friends if friend list is empty
            */}
        </>
    );
}

export default CreateGroup;
