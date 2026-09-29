import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Use named import
import { FaMedal } from "react-icons/fa";
import { Doughnut, Bar } from "react-chartjs-2";
import Select from "react-select";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Header from "./Header";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const subjects = [
  { value: "", label: "All Subjects" },
  { value: "Anatomy", label: "Anatomy" },
  { value: "Biochemistry", label: "Biochemistry" },
  { value: "Surgery", label: "Surgery" },
  { value: "Ophthalmology", label: "Ophthalmology" },
  { value: "Physiology", label: "Physiology" },
  {
    value: "Social & Preventive Medicine",
    label: "Social & Preventive Medicine",
  },
  { value: "Gynaecology & Obstetrics", label: "Gynaecology & Obstetrics" },
  { value: "Anaesthesia", label: "Anaesthesia" },
  { value: "Psychiatry", label: "Psychiatry" },
  { value: "Microbiology", label: "Microbiology" },
  { value: "Medicine", label: "Medicine" },
  { value: "Pharmacology", label: "Pharmacology" },
  { value: "Dental", label: "Dental" },
  { value: "ENT", label: "ENT" },
  { value: "Forensic Medicine", label: "Forensic Medicine" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Orthopaedics", label: "Orthopaedics" },
  { value: "Radiology", label: "Radiology" },
  { value: "Pathology", label: "Pathology" },
  { value: "Skin", label: "Skin" },
];

const Dashboard = () => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [donutChartData, setDonutChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [recommendations, setRecommendations] = useState("");
  const [difficultyChartData, setDifficultyChartData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [userName, setUserName] = useState(""); // State to store user's name

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const totalQuestions = 10;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      axios
        .get("http://localhost:5000/get_user_badges", {
          params: { user_id: userId },
        })
        .then((response) => {
          console.log(response.data);
          setBadges(response.data.badges);
        })
        .catch((error) => console.error("Error fetching badges:", error));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      axios
        .get(`http://localhost:5000/get_user_subject_marks`, {
          params: { user_id: userId },
        })
        .then((response) => {
          const data = response.data.data;
          console.log(response.data.data);
          setQuizData(data);
          prepareCharts(data);
          prepareDifficultyChart(data);
        })
        .catch((error) => console.error("Error fetching quiz data:", error));
    }
  }, []);

  const difficultyMap = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
  };

  const prepareDifficultyChart = (data, selectedSubjects = []) => {
    const filteredData =
      selectedSubjects.length > 0
        ? data.filter((quiz) => selectedSubjects.includes(quiz.subject))
        : data;

    const difficultyStats = filteredData.reduce((acc, quiz) => {
      const { difficulty, marks } = quiz;

      if (!acc[difficulty]) {
        acc[difficulty] = { totalMarks: 0, count: 0 };
      }
      acc[difficulty].totalMarks += marks;
      acc[difficulty].count += 1;

      return acc;
    }, {});

    const difficulties = Object.keys(difficultyStats).map(
      (difficulty) => difficultyMap[difficulty] || `Level ${difficulty}`
    );
    const averageMarks = Object.keys(difficultyStats).map((difficulty) =>
      difficultyStats[difficulty].count > 0
        ? difficultyStats[difficulty].totalMarks /
          difficultyStats[difficulty].count
        : 0
    );

    setDifficultyChartData({
      labels: difficulties,
      datasets: [
        {
          label: "Average Marks",
          data: averageMarks,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const prepareCharts = (data) => {
    const subjectStats = data.reduce((acc, quiz) => {
      const { subject, marks } = quiz;
      if (!acc[subject]) {
        acc[subject] = { correct: 0, incorrect: 0 };
      }
      acc[subject].correct += marks;
      acc[subject].incorrect += totalQuestions - marks;
      return acc;
    }, {});

    // Get an array of subjects sorted by total attempts (correct + incorrect)
    const sortedSubjects = Object.entries(subjectStats)
      .sort(
        (a, b) =>
          b[1].correct + b[1].incorrect - (a[1].correct + a[1].incorrect)
      )
      .slice(0, 8); // Take only the top 8

    // Separate the subjects, correctAnswers, and incorrectAnswers for the top 8
    const subjectsArr = sortedSubjects.map(([subject]) => subject);
    const correctAnswers = sortedSubjects.map(([, stats]) => stats.correct);
    const incorrectAnswers = sortedSubjects.map(([, stats]) => stats.incorrect);

    // Total correct and incorrect answers for the donut chart
    const totalCorrect = correctAnswers.reduce((a, b) => a + b, 0);
    const totalIncorrect = incorrectAnswers.reduce((a, b) => a + b, 0);

    // Set Donut Chart Data
    setDonutChartData({
      labels: ["Success", "Failure"],
      datasets: [
        {
          data: [totalCorrect, totalIncorrect],
          backgroundColor: ["#36A2EB", "#FF5733"],
          hoverOffset: 4,
        },
      ],
    });

    // Set Bar Chart Data
    setBarChartData({
      labels: subjectsArr,
      datasets: [
        {
          label: "Correct Answers",
          data: correctAnswers,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Incorrect Answers",
          data: incorrectAnswers,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    });

    // Line Chart for Quiz Frequency
    const dateFrequency = data.reduce((acc, quiz) => {
      const date = new Date(quiz.timestamp).toLocaleDateString();
      acc[date] = acc[date] ? acc[date] + 1 : 1;
      return acc;
    }, {});

    const sortedDates = Object.keys(dateFrequency).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const frequencyCounts = sortedDates.map((date) => dateFrequency[date]);

    setLineChartData({
      labels: sortedDates,
      datasets: [
        {
          label: "Quizzes Taken Over Time",
          data: frequencyCounts,
          fill: false,
          borderColor: "#00CED1",
          tension: 0.3,
          pointBorderColor: "#00CED1",
          pointBackgroundColor: "#00CED1",
        },
      ],
    });
  };

  const fetchRecommendations = async (subjects) => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;

        const response = await axios.post(
          "http://localhost:5000/get_recommendations",
          {
            user_id: userId,
            subjects, // Send an array of selected subjects
          }
        );

        console.log(response.data.recommendations);

        let html = response.data.recommendations;

        // Convert **bold** to <strong>
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Convert links in parentheses to clickable blue links
        html = html.replace(
          /\((https?:\/\/[^\)]+)\)/g,
          '(<a href="$1" target="_blank" style="color: blue; text-decoration: underline;">link</a>)'
        );

        // Reduce multiple newlines to a single newline
        html = html.replace(/\n{2,}/g, "\n");

        // Insert a single <br> after the first colon-newline
        html = html.replace(/:\s*\n/, ":<br>");

        // Convert all remaining newlines to <br>
        html = html.replace(/\n/g, "<br>");

        // Remove the first and last sentence if not bullet points
        const lines = html.split("<br>");
        if (!lines[0].startsWith("-")) lines.shift(); // Remove first line if not a bullet point
        if (!lines[lines.length - 1].startsWith("-")) lines.pop(); // Remove last line if not a bullet point

        html = lines.join("<br>");

        setRecommendations(html);
      } else {
        throw new Error("Auth token not found");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations("Please perform a quiz to get recommendations");
    }
  };

  const handleFilterChange = () => {
    const filteredSubjects = selectedSubjects.map((subject) => subject.value);

    if (filteredSubjects.length > 0) {
      fetchRecommendations(filteredSubjects);
    } else {
      setRecommendations("");
    }
  };

  useEffect(() => {
    handleFilterChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjects]);

  const handleOpenFeedbackModal = () => {
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setFeedbackText("");
    setFeedbackMessage(null);
  };

  const handleSubjectsChange = (selectedOptions) => {
    setSelectedSubjects(selectedOptions || []);
  };

  const handleSubmitFeedback = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;

        const response = await axios.post(
          "http://localhost:5000/submit_dashboard_feedback",
          {
            user_id: userId,
            feedback: feedbackText,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setFeedbackMessage({
          type: "success",
          text: "Thank you for your feedback!",
        });
        setFeedbackText("");
      } else {
        throw new Error("Auth token not found");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackMessage({
        type: "error",
        text: "Failed to submit feedback. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-8">
        <h5 className="text-2xl font-semibold mb-8">Dashboard</h5>

        {/* Grid Layout with Wider Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mx-auto">
          {/* Attempted Quizzes Card */}
          <div className="bg-white shadow-md rounded-md p-6 text-center col-span-1 h-full">
            <h6 className="text-lg font-medium mb-2 ">Attempted Quizzes</h6>
            <p className="text-3xl font-bold text-[#36A2EB]">
              {quizData.length}
            </p>
          </div>

          {/* Total Subjects Card */}
          <div className="bg-white shadow-md rounded-md p-6 text-center col-span-1 h-full">
            <h6 className="text-lg font-medium mb-2">Total Subjects</h6>
            <p className="text-3xl font-bold text-green-600">20</p>
          </div>

          {/* Donut Chart */}
          <div className="bg-white shadow-md rounded-md p-6 col-span-2 row-span-2">
            <h6 className=" text-xl font-medium mb-4">Success Rate</h6>
            {donutChartData ? (
              <div className="relative h-[200px]">
                <Doughnut
                  data={donutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: { enabled: true },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="text-center">Loading...</p>
            )}
          </div>

          {/* Gold Badges Card */}
          <div className="bg-white shadow-md rounded-md p-6 text-center col-span-1 h-full">
            <h6 className="text-lg font-medium mb-2">Gold Badges</h6>
            <p className="text-3xl font-bold text-yellow-500">
              {badges.filter((badge) => badge.badge_type === "golden").length}
            </p>
          </div>

          {/* Success Rate Card */}
          <div className="bg-white shadow-md rounded-md p-6 text-center col-span-1 h-full">
            <h6 className="text-lg font-medium mb-2">Success Rate</h6>
            <p className="text-3xl font-bold text-red-600">
              {quizData.length > 0
                ? (
                    (quizData.reduce((total, quiz) => total + quiz.marks, 0) /
                      (quizData.length * totalQuestions)) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </p>
          </div>
        </div>

        <div className="max-w-7xl flex flex-row justify-between mt-8">
          {/* Bar Chart */}
          <div className="w-[65%] bg-white shadow-md rounded-md p-6 pr-4">
            <h6 className=" text-xl font-medium mb-4">Your Top Subjects</h6>
            {barChartData ? (
              <div className="relative h-[300px]">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: { title: { display: true, text: "Subjects" } },
                      y: {
                        title: { display: true, text: "Answers" },
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="text-center">Loading...</p>
            )}
          </div>

          {/* Difficulty-Level Performance Chart */}
          <div className="w-1/3 bg-white shadow-md rounded-md p-6">
            <h6 className=" text-xl font-medium mb-4">
              Level-wise Performance
            </h6>
            {difficultyChartData ? (
              <div className="relative h-[300px]">
                <Bar
                  data={difficultyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: {
                        title: { display: true, text: "Difficulty Levels" },
                      },
                      y: {
                        title: { display: true, text: "Average Marks" },
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="text-center">Loading...</p>
            )}
          </div>
        </div>

        <h5 className="text-2xl font-semibold mb-6 mt-8">
          Recommendations For You!
        </h5>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Recommendations Section */}
          <div className="flex-1 bg-white shadow-lg rounded-md p-6">
            <h6 className="text-lg font-medium mb-4">Recommendations</h6>
            <div
              className="prose max-w-none p-4 h-[300px] overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html:
                  recommendations ||
                  "<p class='text-center text-gray-600'>Select subjects to view personalized recommendations.</p>",
              }}
            />
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            {/* Subject Filter */}
            <div className=" shadow-lg bg-white rounded-md p-6">
              <label className="block mb-2 font-medium text-gray-700">
                Select Subject
              </label>
              <Select
                isMulti
                options={subjects}
                value={selectedSubjects}
                onChange={handleSubjectsChange}
                placeholder="Select Subjects"
                closeMenuOnSelect={false}
              />
            </div>

            {/* Achievements Section */}
            <div className="bg-white shadow-lg rounded-md p-6 h-[250px]">
              <h6 className="text-lg font-medium mb-4">Earned Badges</h6>
              {selectedSubjects.length === 0 ? (
                <p className="text-center text-gray-600">
                  Select a subject to display badges.
                </p>
              ) : badges.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {badges
                    .filter((badge) =>
                      selectedSubjects.some(
                        (subject) => subject.value === badge.subject
                      )
                    )
                    .map((badge, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 border border-gray-300 rounded-md shadow-sm w-full"
                      >
                        <FaMedal
                          size={40}
                          className="mx-auto"
                          color={
                            badge.badge_type === "golden"
                              ? "#FFD700"
                              : badge.badge_type === "silver"
                              ? "#C0C0C0"
                              : "#CD7F32"
                          }
                        />
                        <p className="mt-2 text-center text-gray-800">
                          <strong>
                            {badge.badge_type.charAt(0).toUpperCase() +
                              badge.badge_type.slice(1)}{" "}
                            Medal
                          </strong>{" "}
                          in <strong>{badge.subject}</strong>.
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  No achievements yet for the selected subject(s).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Button */}
        <div className="text-right mt-8">
          <button
            className="inline-block bg-[#BC7BDA] text-white py-2 px-4 rounded hover:bg-[#BC7BDA]"
            onClick={handleOpenFeedbackModal}
          >
            Provide Feedback
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-11/12 sm:w-96">
            <h2 className="text-xl font-semibold mb-4">Dashboard Feedback</h2>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your Feedback"
            ></textarea>
            {feedbackMessage && (
              <div
                className={`mt-4 p-2 rounded ${
                  feedbackMessage.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {feedbackMessage.text}
              </div>
            )}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200"
                onClick={handleCloseFeedbackModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
