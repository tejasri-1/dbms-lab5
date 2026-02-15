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
        const load = async () => {
            try {
                const [balRes, friendsRes] = await Promise.all([
                    fetch('http://localhost:4000/balances', {
                        credentials: 'include',
                    }),
                    fetch('http://localhost:4000/friends', {
                        credentials: 'include',
                    }),
                ]);

                if (balRes.ok) {
                    const balData = await balRes.json();
                    setBalances(balData || []);
                } else {
                    console.error('Failed to load balances');
                }

                if (friendsRes.ok) {
                    const frData = await friendsRes.json();
                    setFriends(frData || []);
                } else {
                    console.error('Failed to load friends');
                }
            } catch (err) {
                console.error('Dashboard data load failed', err);
            }
        };

        load();
    };

    // TODO: Fetch dashboard data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // TODO: Implement handleSettleUp function
    // - Prevent default form submission
    // - Validate settleTo and settleAmount
    // - Call POST /settle API with:
    //   { to_user, amount }
    // - Refresh balances on success
    // - Show appropriate success/error messages
    const handleSettleUp = async (e) => {
        e.preventDefault();

        if (!settleTo || !settleAmount) {
            alert('Select a friend and enter an amount');
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
            fetchData();
        } catch (err) {
            console.error('Settle failed', err);
            alert('Something went wrong. Please try again.');
        }
    };

    const handleFullSettle = async (otherUserId, amount) => {
        const absAmount = Math.abs(parseFloat(amount));
        if (!absAmount || absAmount <= 0) return;

        try {
            const res = await fetch('http://localhost:4000/settle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    to_user: otherUserId,
                    amount: absAmount,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'Failed to settle');
                return;
            }

            fetchData();
        } catch (err) {
            console.error('Quick settle failed', err);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>

            <section className="balances">
                <h3>Your Balances</h3>
                {balances.length === 0 ? (
                    <p>No balances yet. Add expenses with friends to get started.</p>
                ) : (
                    <ul>
                        {balances.map((b) => {
                            const amountNum = parseFloat(b.amount);
                            const label =
                                amountNum > 0
                                    ? `${b.username} owes you`
                                    : amountNum < 0
                                    ? `You owe ${b.username}`
                                    : `Settled with ${b.username}`;
                            return (
                                <li key={b.other_user_id} className="balance-item">
                                    <span>{label}</span>
                                    <span className="amount">
                                        ₹{Math.abs(amountNum).toFixed(2)}
                                    </span>
                                    {amountNum < 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleFullSettle(
                                                    b.other_user_id,
                                                    amountNum,
                                                )
                                            }
                                        >
                                            Settle Up
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section className="settle-form">
                <h3>Settle Up Manually</h3>
                <form onSubmit={handleSettleUp}>
                    <div className="form-group">
                        <label htmlFor="settleTo">Friend</label>
                        <select
                            id="settleTo"
                            value={settleTo}
                            onChange={(e) => setSettleTo(e.target.value)}
                        >
                            <option value="">Select friend</option>
                            {friends.map((f) => (
                                <option key={f.user_id} value={f.user_id}>
                                    {f.username}
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
                            onChange={(e) => setSettleAmount(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="primary-btn">
                        Settle
                    </button>
                </form>
            </section>

            <section className="quick-links">
                <h3>Quick Links</h3>
                <div className="links">
                    <Link to="/groups">View Groups</Link>
                    <Link to="/friends">Manage Friends</Link>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
