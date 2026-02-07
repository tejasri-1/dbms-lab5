import React, { useEffect, useState } from 'react';

function Friends() {

    // TODO: Use useState to manage:
    // 1. Friend list
    // 2. Search query
    // 3. Search results
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // TODO: Implement fetchFriends function
    // - Call GET /friends API
    // - Include credentials
    // - Update friends state
    const fetchFriends = () => {
        // Implement logic here
    };

    // TODO: Fetch friend list on component mount
    useEffect(() => {
        // Call fetchFriends here
    }, []);

    // TODO: Implement handleSearch function
    // - Prevent default form submission
    // - Call GET /users/search?q=<query>
    // - Update searchResults state
    const handleSearch = async (e) => {
        // Implement logic here
    };

    // TODO: Implement addFriend function
    // - Call POST /friends/add API with friend_id
    // - Clear search input and results on success
    // - Refresh friend list
    const addFriend = async (friendId) => {
        // Implement logic here
    };

    // TODO: (Optional) Implement settle-up logic per friend
    // - This can redirect to dashboard or open a modal
    const handleSettle = async (friendId, amount, currency) => {
        // Optional implementation
    };

    return (
        <>
            {/*
              TODO: Implement JSX for Friends page
              - Section to display current friends
              - Section to search users by username
              - Add Friend button for search results
              - Show empty-state message when no friends exist
            */}
        </>
    );
}

export default Friends;
