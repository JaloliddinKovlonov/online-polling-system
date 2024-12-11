import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

const PollDetails = () => {
  const { pollId } = useParams(); // Get poll ID from the route
  const navigate = useNavigate(); // For navigation
  const { auth } = useContext(AuthContext); // Get auth state from context
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // Track the selected option
  const [message, setMessage] = useState(""); // Feedback message
  const [isExpired, setIsExpired] = useState(false); // Track if the poll has expired

  useEffect(() => {
    // Fetch poll details from the Poll Management Service
    axios
      .get(`http://localhost:3000/polls/${pollId}`)
      .then((response) => {
        setPoll(response.data);

        // Check if poll has expired
        const expiresAt = new Date(response.data.expires_at);
        if (new Date() > expiresAt) {
          setIsExpired(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching poll details:", error);
        setMessage("Error loading poll details.");
      });
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption) {
      setMessage("Please select an option before voting.");
      return;
    }

    try {
      const votePayload = {
        poll_id: pollId,
        option_id: selectedOption,
      };

      // Include user ID if the user is authenticated
      if (auth.user) {
        votePayload.user_id = auth.user.id.toString();
      }

      // Submit vote to Voting Service
      const response = await axios.post("http://localhost:3000/votes", votePayload, {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
      });

      if (response.status === 201) {
        setMessage("Your vote has been submitted successfully!");
      } else {
        setMessage("Failed to submit your vote. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      setMessage(
        error.response?.data || "An error occurred while submitting your vote."
      );
    }
  };

  const handleViewResults = () => {
    navigate(`/polls/${pollId}/results`); // Navigate to the results page
  };

  if (!poll) {
    return <div className="text-center">Loading poll details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{poll.title}</h1>

      {isExpired ? (
        <p className="text-center text-red-500">This poll has expired. You cannot vote.</p>
      ) : (
        <ul className="space-y-4">
          {poll.options.map((option) => (
            <li key={option.option_id} className="mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="vote"
                  value={option.option_id}
                  onChange={() => setSelectedOption(option.option_id)}
                  className="form-radio text-blue-500"
                />
                <span>{option.text}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-4 mt-4">
        {!isExpired && (
          <button
            onClick={handleVote}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isExpired}
          >
            Submit Vote
          </button>
        )}
        <button
          onClick={handleViewResults}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          View Results
        </button>
      </div>

      {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
    </div>
  );
};

export default PollDetails;
