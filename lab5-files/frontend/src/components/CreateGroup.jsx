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
        const loadFriends = async () => {
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

        loadFriends();
    }, []);

    // TODO: Implement handleCreateGroup function
    // - Prevent default form submission
    // - Validate group name
    // - Call POST /groups API with:
    //   { name, member_ids }
    // - Navigate to /groups on success
    const handleCreateGroup = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Please enter a group name');
            return;
        }

        try {
            const res = await fetch('http://localhost:4000/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: name.trim(),
                    member_ids: selectedFriends,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'Failed to create group');
                return;
            }

            navigate('/groups');
        } catch (err) {
            console.error('Create group failed', err);
            alert('Something went wrong. Please try again.');
        }
    };

    // TODO: Implement toggleFriend function
    // - Add/remove friend ID from selectedFriends array
    const toggleFriend = (id) => {
        setSelectedFriends((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
        );
    };

    return (
        <div className="create-group-page">
            <h2>Create Group</h2>

            <form onSubmit={handleCreateGroup} className="create-group-form">
                <div className="form-group">
                    <label htmlFor="groupName">Group Name</label>
                    <input
                        id="groupName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Members</label>
                    {friends.length === 0 ? (
                        <p>
                            You have no friends yet.{' '}
                            <Link to="/friends">Add some friends first.</Link>
                        </p>
                    ) : (
                        <div className="friend-checkboxes">
                            {friends.map((f) => (
                                <label key={f.user_id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedFriends.includes(f.user_id)}
                                        onChange={() => toggleFriend(f.user_id)}
                                    />
                                    {f.username}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="actions">
                    <button type="submit" className="primary-btn">
                        Create Group
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/groups')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateGroup;
