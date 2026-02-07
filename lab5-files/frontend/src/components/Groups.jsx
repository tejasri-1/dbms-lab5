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
        // Implement logic here
    };

    // TODO: Fetch group list on component mount
    useEffect(() => {
        // Call fetchData here
    }, []);

    return (
        <>
            {/*
              TODO: Implement JSX for Groups page
              - Display list of groups
              - Show "Create New Group" button
              - Navigate to /groups/create on button click
              - Show empty-state message when no groups exist
            */}
        </>
    );
}

export default Groups;
