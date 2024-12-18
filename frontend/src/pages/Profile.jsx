import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Profile = () => {
  const { auth } = useContext(AuthContext); // Get auth state
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch user profile
    axios
      .get(`${import.meta.env.VITE_API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((response) => {
        setProfile(response.data);
        setFormData(response.data);
      })
      .catch((error) => setError("Error fetching profile"));
  }, [auth]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios
      .patch(`${import.meta.env.VITE_API_URL}/users/profile`, formData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((response) => {
        setProfile(response.data);
        setEditMode(false);
        setError("");
      })
      .catch((error) => setError("Error updating profile"));
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-4 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      {editMode ? (
        <div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="ml-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p>
            <strong>Username:</strong> {profile.username}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
