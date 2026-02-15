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
        const load = async () => {
            try {
                const groupRes = await fetch(
                    `http://localhost:4000/groups/${id}`,
                    {
                        credentials: 'include',
                    },
                );

                if (groupRes.ok) {
                    const data = await groupRes.json();
                    setGroup(data.group || null);
                    setMembers(data.members || []);
                } else if (groupRes.status === 404) {
                    setGroup(null);
                } else {
                    console.error('Failed to load group');
                }

                const expRes = await fetch(
                    `http://localhost:4000/groups/${id}/expenses`,
                    {
                        credentials: 'include',
                    },
                );

                if (expRes.ok) {
                    const expensesData = await expRes.json();
                    const sorted = (expensesData || []).slice().sort((a, b) => {
                        const da = new Date(a.created_at);
                        const db = new Date(b.created_at);
                        return db - da;
                    });
                    setExpenses(sorted);
                } else {
                    console.error('Failed to load expenses');
                }
            } catch (err) {
                console.error('Error loading group details', err);
            }
        };

        load();
    };

    // TODO: Fetch group data on component mount or when id changes
    useEffect(() => {
        fetchData();
    }, [id]);

    // TODO: Set default paidBy when user info is available
    useEffect(() => {
        if (user && !paidBy) {
            setPaidBy(user.user_id);
        }
    }, [user]);

    // TODO: Implement handleAddExpense function
    // - Validate form inputs
    // - Calculate split amounts
    // - Call POST /expenses API
    // - Reset form and refresh data on success
    const handleAddExpense = async (e) => {
        e.preventDefault();

        if (!description.trim()) {
            alert('Please enter a description');
            return;
        }

        const total = parseFloat(amount);
        if (Number.isNaN(total) || total <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!paidBy) {
            alert('Please select who paid');
            return;
        }

        const participantIds =
            splitWith.length > 0
                ? splitWith
                : members.map((m) => m.user_id);

        if (participantIds.length === 0) {
            alert('No members to split with');
            return;
        }

        const perShare = parseFloat(
            (total / participantIds.length).toFixed(2),
        );

        const splits = participantIds.map((uid) => ({
            user_id: uid,
            share_amount: perShare,
        }));

        try {
            const res = await fetch('http://localhost:4000/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    group_id: Number(id),
                    description: description.trim(),
                    amount: total,
                    paid_by: Number(paidBy),
                    splits,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'Failed to add expense');
                return;
            }

            setDescription('');
            setAmount('');
            setSplitWith([]);
            fetchData();
        } catch (err) {
            console.error('Add expense failed', err);
            alert('Something went wrong. Please try again.');
        }
    };

    // TODO: Implement handleSettleUp function
    // - Validate settlement inputs
    // - Call POST /settle API
    // - Show success or error messages
    const handleSettleUp = async (e) => {
        e.preventDefault();

        if (!settleTo || !settleAmount) {
            alert('Select a user and enter an amount');
            return;
        }

        const amountNum = parseFloat(settleAmount);
        if (Number.isNaN(amountNum) || amountNum <= 0) {
            alert('Enter a valid amount');
            return;
        }

        try {
            const res = await fetch('http://localhost:4000/settle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    to_user: Number(settleTo),
                    amount: amountNum,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'Failed to settle');
                return;
            }

            setSettleTo('');
            setSettleAmount('');
        } catch (err) {
            console.error('Settle failed', err);
            alert('Something went wrong. Please try again.');
        }
    };

    // TODO: Implement toggleSplitMember function
    // - Add/remove user ID from splitWith list
    const toggleSplitMember = (uid) => {
        setSplitWith((prev) =>
            prev.includes(uid) ? prev.filter((id2) => id2 !== uid) : [...prev, uid],
        );
    };

    return (
        <div className="group-details-page">
            {!group ? (
                <p>Loading group details...</p>
            ) : (
                <>
                    <h2>{group.name}</h2>

                    <section className="add-expense">
                        <h3>Add Expense</h3>
                        <form onSubmit={handleAddExpense}>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <input
                                    id="description"
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="amount">Amount</label>
                                <input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="paidBy">Paid By</label>
                                <select
                                    id="paidBy"
                                    value={paidBy}
                                    onChange={(e) => setPaidBy(e.target.value)}
                                    required
                                >
                                    <option value="">Select member</option>
                                    {members.map((m) => (
                                        <option
                                            key={m.user_id}
                                            value={m.user_id}
                                        >
                                            {m.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Split Among</label>
                                <p className="hint">
                                    Select members to include in the split. If you
                                    select none, the amount will be split among all
                                    members.
                                </p>
                                <div className="member-checkboxes">
                                    {members.map((m) => (
                                        <label key={m.user_id}>
                                            <input
                                                type="checkbox"
                                                checked={splitWith.includes(
                                                    m.user_id,
                                                )}
                                                onChange={() =>
                                                    toggleSplitMember(m.user_id)
                                                }
                                            />
                                            {m.username}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="primary-btn">
                                Add Expense
                            </button>
                        </form>
                    </section>

                    <section className="settle-up-group">
                        <h3>Settle with a Member</h3>
                        <form onSubmit={handleSettleUp}>
                            <div className="form-group">
                                <label htmlFor="settleTo">Member</label>
                                <select
                                    id="settleTo"
                                    value={settleTo}
                                    onChange={(e) => setSettleTo(e.target.value)}
                                >
                                    <option value="">Select member</option>
                                    {members.map((m) => (
                                        <option
                                            key={m.user_id}
                                            value={m.user_id}
                                        >
                                            {m.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="settleAmount">Amount</label>
                                <input
                                    id="settleAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={settleAmount}
                                    onChange={(e) =>
                                        setSettleAmount(e.target.value)
                                    }
                                />
                            </div>
                            <button type="submit">Settle</button>
                        </form>
                    </section>

                    <section className="expenses-history">
                        <h3>Expenses</h3>
                        {expenses.length === 0 ? (
                            <p>No expenses yet in this group.</p>
                        ) : (
                            <ul>
                                {expenses.map((ex) => (
                                    <li key={ex.expense_id}>
                                        <div>
                                            <strong>{ex.description}</strong> - ₹
                                            {parseFloat(ex.amount).toFixed(2)}
                                        </div>
                                        <div>
                                            Paid by {ex.paid_by_name} on{' '}
                                            {new Date(
                                                ex.created_at,
                                            ).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default GroupDetails;
