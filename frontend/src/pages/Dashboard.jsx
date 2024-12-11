import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.user) {
      fetchUserPolls();
    }
  }, [auth]);

  const fetchUserPolls = () => {
    axios
      .get(`http://localhost:3000/polls/user/${auth.user.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((response) => setPolls(response.data))
      .catch((error) => {
        console.error("Error fetching user polls:", error);
        setError("Failed to fetch polls. Please try again.");
      });
  };

  const handleDeletePoll = (pollId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this poll? This action cannot be undone."
    );
    if (!confirmed) return;

    axios
      .delete(`http://localhost:3000/polls/${pollId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then(() => {
        // Remove the deleted poll from the state
        setPolls((prevPolls) => prevPolls.filter((poll) => poll.poll_id !== pollId));
      })
      .catch((error) => {
        console.error("Error deleting poll:", error);
        setError("Failed to delete the poll. Please try again.");
      });
  };

  const getPollStatus = (expiresAt) => {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    return now > expirationDate ? "Expired" : "Active";
  };

  if (!auth.user) {
    return <p>Please log in to view your dashboard.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Your Polls</h1>
      {error && <p className="text-red-500">{error}</p>}
      {polls.length === 0 ? (
        <p>You haven't created any polls yet.</p>
      ) : (
        <ul>
          {polls.map((poll) => (
            <li key={poll.poll_id} className="mb-4 p-4 border rounded">
              <p className="font-semibold text-lg">{poll.title}</p>
              <p>Created At: {new Date(poll.created_at).toLocaleString()}</p>
              <p>
                Expires At:{" "}
                {poll.expires_at
                  ? new Date(poll.expires_at).toLocaleString()
                  : "No expiration date"}
              </p>
              <p className="font-semibold">
                Status:{" "}
                <span
                  className={
                    getPollStatus(poll.expires_at) === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {getPollStatus(poll.expires_at)}
                </span>
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() =>
                    window.location.href = `/polls/${poll.poll_id}/results`
                  }
                >
                  View Results
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeletePoll(poll.poll_id)}
                >
                  Delete Poll
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
