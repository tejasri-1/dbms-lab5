import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {

    // TODO: Use useState to manage:
    // 1. User balances
    // 2. Friend list
    const [balances, setBalances] = useState([]);
    const [friends, setFriends] = useState([]);

    // TODO: Use useState to manage settle-up form inputs
    // 1. User to settle with
    // 2. Settlement amount
    const [settleTo, setSettleTo] = useState('');
    const [settleAmount, setSettleAmount] = useState('');

    // TODO: Implement fetchData function
    // - Fetch balances using GET /balances
    // - Fetch friends using GET /friends
    // - Include credentials in API calls
    // - Update respective state variables
    // - Handle failure cases
    const fetchData = () => {
        // Implement logic here
    };

    // TODO: Fetch dashboard data on component mount
    useEffect(() => {
        // Call fetchData here
    }, []);

    // TODO: Implement handleSettleUp function
    // - Prevent default form submission
    // - Validate settleTo and settleAmount
    // - Call POST /settle API with:
    //   { to_user, amount }
    // - Refresh balances on success
    // - Show appropriate success/error messages
    const handleSettleUp = async (e) => {
        // Implement logic here
    };

    return (
        <>
            {/*
              TODO: Implement JSX for Dashboard page
              - Section to display net balances
              - Section with settle-up form
              - Dropdown to select friend
              - Input for settlement amount
              - Quick links to Groups and Friends pages
            */}
        </>
    );
}

export default Dashboard;
