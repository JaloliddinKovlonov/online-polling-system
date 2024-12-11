import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Results = () => {
  const { pollId } = useParams(); // Get poll ID from the route
  const navigate = useNavigate(); // To navigate to other pages
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to fetch poll results
  const fetchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/analytics/results/${pollId}`);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching poll results:", error);
      setError("Error fetching poll results. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(); // Fetch results initially

    // Set up polling to auto-update every 5 seconds
    const intervalId = setInterval(fetchResults, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [pollId]);

  const generateShareableLink = () => {
    return `${window.location.origin}/polls/${pollId}`;
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading results...</div>;
  }

  if (!results) {
    return <div className="text-center text-red-500">{error || "No results found for this poll."}</div>;
  }

  const chartData = {
    labels: results.results.map((option) => option.text),
    datasets: [
      {
        label: "Votes",
        data: results.results.map((option) => option.votes),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      {/* Poll Title */}
      <h1 className="text-2xl font-bold mb-4 text-center">{results.title}</h1>

      {/* Shareable Link */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">
          Share this poll:{" "}
          <a
            href={generateShareableLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {generateShareableLink()}
          </a>
        </p>
      </div>

      {/* Pie Chart */}
      <div className="mb-6 flex justify-center">
        <div style={{ height: "300px", width: "300px" }}>
          <Pie data={chartData} />
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-6 p-4 bg-gray-100 rounded shadow">
        <h2 className="text-lg font-semibold">Voting Summary</h2>
        <p className="mt-2">
          <strong>Total Votes:</strong> {results.total_votes}
        </p>
        <ul className="mt-4">
          {results.results.map((option) => (
            <li key={option.option_id} className="mb-2">
              <span className="font-medium">{option.text}</span>: {option.votes} votes
            </li>
          ))}
        </ul>
      </div>

      {/* Go Back Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate("/user/dashboard")} // Navigate to the dashboard
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
