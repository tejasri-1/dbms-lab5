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
        const load = async () => {
            try {
                const res = await fetch('http://localhost:4000/friends', {
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    setFriends(data || []);
                } else {
                    console.error('Failed to load friends');
                }
            } catch (err) {
                console.error('Error loading friends', err);
            }
        };

        load();
    };

    // TODO: Fetch friend list on component mount
    useEffect(() => {
        fetchFriends();
    }, []);

    // TODO: Implement handleSearch function
    // - Prevent default form submission
    // - Call GET /users/search?q=<query>
    // - Update searchResults state
    const handleSearch = async (e) => {
        e.preventDefault();

        const query = searchQuery.trim();
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:4000/users/search?q=${encodeURIComponent(
                    query,
                )}`,
                {
                    credentials: 'include',
                },
            );

            if (res.ok) {
                const data = await res.json();
                setSearchResults(data || []);
            } else {
                console.error('Search failed');
            }
        } catch (err) {
            console.error('Search error', err);
        }
    };

    // TODO: Implement addFriend function
    // - Call POST /friends/add API with friend_id
    // - Clear search input and results on success
    // - Refresh friend list
    const addFriend = async (friendId) => {
        try {
            const res = await fetch('http://localhost:4000/friends/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ friend_id: friendId }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'Failed to add friend');
                return;
            }

            setSearchQuery('');
            setSearchResults([]);
            fetchFriends();
        } catch (err) {
            console.error('Add friend failed', err);
            alert('Something went wrong. Please try again.');
        }
    };

    // TODO: (Optional) Implement settle-up logic per friend
    // - This can redirect to dashboard or open a modal
    const handleSettle = async (friendId, amount, currency) => {
        // Optional implementation
    };

    return (
        <div className="friends-page">
            <h2>Friends</h2>

            <section className="friends-list">
                <h3>Your Friends</h3>
                {friends.length === 0 ? (
                    <p>You have no friends added yet.</p>
                ) : (
                    <ul>
                        {friends.map((f) => (
                            <li key={f.user_id}>{f.username}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="friend-search">
                <h3>Add New Friends</h3>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search by username"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>

                {searchResults.length > 0 && (
                    <ul className="search-results">
                        {searchResults.map((u) => (
                            <li key={u.user_id}>
                                <span>{u.username}</span>
                                <button
                                    type="button"
                                    onClick={() => addFriend(u.user_id)}
                                >
                                    Add Friend
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default Friends;
