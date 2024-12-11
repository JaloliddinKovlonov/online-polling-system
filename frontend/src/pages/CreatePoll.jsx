import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreatePoll = () => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]); // Start with two blank options
  const [expiresAt, setExpiresAt] = useState(""); // State for expiration date
  const [shareableLink, setShareableLink] = useState(null); // Store the shareable link
  const [error, setError] = useState("");
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const getMinDate = () => {
    const now = new Date();
    const minTime = new Date(now.getTime() + 5 * 60 * 1000); // Add 5 minutes
    return minTime.toISOString().slice(0, 16); // Format for datetime-local
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!title.trim() || options.some((option) => !option.trim())) {
      setError("Poll title and all options are required.");
      return;
    }

    if (!expiresAt) {
      setError("Expiration date is required.");
      return;
    }

    const currentTime = new Date();
    const selectedTime = new Date(expiresAt);
    const minimumTime = new Date(currentTime.getTime() + 5 * 60 * 1000);

    if (selectedTime < minimumTime) {
      setError("Expiration date must be at least 5 minutes from now.");
      return;
    }

    try {
      // Convert the expiration date to ISO 8601 UTC format
      const expiresAtUTC = new Date(selectedTime).toISOString();

      const response = await axios.post(
        "http://localhost:3000/polls", // Backend endpoint for creating polls
        {
          user_id: auth.user.id,
          creator_email: auth.user.email,
          title,
          options,
          expires_at: expiresAtUTC, // Send in ISO 8601 UTC format
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // Store the shareable link from the backend response
      setShareableLink(response.data.link); // Assuming the backend sends the link in `response.data.link`
    } catch (err) {
      console.error("Error creating poll:", err);
      setError(
        err.response?.data?.error || "Error creating poll. Please try again."
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-4 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Create a Poll</h1>
      {error && <p className="text-red-500">{error}</p>}
      {shareableLink ? (
        <div className="bg-green-100 p-4 rounded">
          <p className="text-green-700">Poll created successfully!</p>
          <p className="text-blue-700 break-all">
            Share this link:{" "}
            <a href={shareableLink} target="_blank" rel="noopener noreferrer">
              {shareableLink}
            </a>
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate("/user/dashboard")} // Navigate to the dashboard
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">Poll Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 border p-2 rounded"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-blue-500 mt-2"
            >
              Add Option
            </button>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Expiration Date</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={getMinDate()} // Prevent selecting past or invalid dates
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Create Poll
          </button>
        </form>
      )}
    </div>
  );
};

export default CreatePoll;
