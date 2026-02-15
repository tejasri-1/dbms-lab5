import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Groups() {

    // TODO: Use useState to manage group list
    const [groups, setGroups] = useState([]);

    const navigate = useNavigate();

    // TODO: Implement fetchData function
    // - Call GET /groups API
    // - Include credentials
    // - Update groups state
    // - Handle error cases
    const fetchData = () => {
        const load = async () => {
            try {
                const res = await fetch('http://localhost:4000/groups', {
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    setGroups(data || []);
                } else {
                    console.error('Failed to load groups');
                }
            } catch (err) {
                console.error('Error loading groups', err);
            }
        };

        load();
    };

    // TODO: Fetch group list on component mount
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="groups-page">
            <h2>Groups</h2>

            <button
                type="button"
                className="primary-btn"
                onClick={() => navigate('/groups/create')}
            >
                Create New Group
            </button>

            {groups.length === 0 ? (
                <p>You are not part of any groups yet.</p>
            ) : (
                <ul className="groups-list">
                    {groups.map((g) => (
                        <li key={g.group_id} className="group-item">
                            <Link to={`/group/${g.group_id}`}>{g.name}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Groups;
