import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function GroupDetails({ user }) {

    // TODO: Extract group ID from route params
    const { id } = useParams();

    // TODO: Use useState to manage:
    // 1. Group details
    // 2. Group members
    // 3. Expense list
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // TODO: Add Expense form state
    // - Description
    // - Amount
    // - Paid-by user ID
    // - Users to split with
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [splitWith, setSplitWith] = useState([]);

    // TODO: Settle Up form state
    // - User to settle with
    // - Settlement amount
    const [settleTo, setSettleTo] = useState('');
    const [settleAmount, setSettleAmount] = useState('');

    // TODO: Implement fetchData function
    // - Fetch group details using GET /groups/:id
    // - Fetch expenses using GET /groups/:id/expenses
    // - Update group, members, and expenses state
    // - Set default paidBy to current user if applicable
    const fetchData = () => {
        // Implement logic here
    };

    // TODO: Fetch group data on component mount or when id changes
    useEffect(() => {
        // Call fetchData here
    }, [id]);

    // TODO: Set default paidBy when user info is available
    useEffect(() => {
        // Set paidBy to user.user_id if not already set
    }, [user]);

    // TODO: Implement handleAddExpense function
    // - Validate form inputs
    // - Calculate split amounts
    // - Call POST /expenses API
    // - Reset form and refresh data on success
    const handleAddExpense = async (e) => {
        // Implement logic here
    };

    // TODO: Implement handleSettleUp function
    // - Validate settlement inputs
    // - Call POST /settle API
    // - Show success or error messages
    const handleSettleUp = async (e) => {
        // Implement logic here
    };

    // TODO: Implement toggleSplitMember function
    // - Add/remove user ID from splitWith list
    const toggleSplitMember = (uid) => {
        // Implement logic here
    };

    return (
        <>
            {/*
              TODO: Implement JSX for Group Details page
              - Add Expense form
              - Paid-by dropdown
              - Split-with checkboxes
              - Group name and expense history
              - Loading state when group data is not available
            */}
        </>
    );
}

export default GroupDetails;
