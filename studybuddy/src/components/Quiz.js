import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
  Container,
  FormControl,
  Box,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/system";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./Quiz.css";
import Header from "./Header";
import {jwtDecode} from "jwt-decode"; // Import jwt-decode if not already imported


ChartJS.register(ArcElement, Tooltip, Legend);

const subjects = [
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

const difficulties = [
  { value: "1", label: "Easy" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Difficult" },
];
// const CustomButton = styled(Button)(({ theme }) => ({
//   width: '100%',
//   marginTop: '1.5rem',
//   padding: '0.5rem',
//   borderRadius: '5px',
//   backgroundColor: '#87247f', // Set this to your desired purple color
//   color: '#ffffff', // Assuming you want white text
//   '&:hover': {
//     backgroundColor: '#6f1d64', // A darker purple on hover
//   },
// }));

const CustomButton = styled(Button)(({ theme }) => ({
  width: "100%",
  marginTop: "1.5rem",
  padding: "0.5rem",
  borderRadius: "5px",
  backgroundColor: "#ab38b5", // Light purple background color
  color: "#ffffff", // White text
  "&:hover": {
    backgroundColor: "#a512b3", // Dark purple on hover
  },
}));

const Quiz = () => {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [recommendedDifficulty, setRecommendedDifficulty] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [marks, setMarks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // Initial timer set for 5 minutes
  const [timer, setTimer] = useState(null);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false); // New state for loader

  const customSelectStyle = {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "purple", // Adjust this color to match your theme's purple
      },
    },
  };

  const formatTime = (timeLeft) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const saveQuizResults = useCallback(
    async (marks) => {
      try {
        // Retrieve and decode the auth token
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("Auth token not found");
          return;
        }
  
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id; // Extract user_id from the token
  
        // Make the API call with the dynamic user ID
        await axios.post("http://localhost:5000/store_marks", {
          user_id: userId, // Use the dynamic user ID
          subject: subject,
          marks: marks,
          difficulty: difficulty,
        });
      } catch (error) {
        console.error("Failed to save results:", error);
      }
    },
    [subject, difficulty]
  );

  const handleQuizSubmit = useCallback(() => {
    clearInterval(timer);
    let userMarks = 0;
    quizQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = question.cop;
      const answerMap = { a: 0, b: 1, c: 2, d: 3 };
      const mappedUserAnswer = answerMap[userAnswer];
      if (mappedUserAnswer === correctAnswer) {
        userMarks += 1;
      }
    });

    setMarks(userMarks);
    setQuizCompleted(true);
    setQuizGenerated(false);
    setTimeLeft(300); // Reset the timer

    saveQuizResults(userMarks);

    setChartData({
      labels: ["Correct Answers", "Incorrect Answers"],
      datasets: [
        {
          data: [userMarks, quizQuestions.length - userMarks],
          backgroundColor: [
            "rgba(85,217,166, 1)", // Solid blue for correct
            "rgba(219,7,53, 1)", // Solid red for incorrect
          ],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
          cutout: "50%",
        },
      ],
    });
  }, [timer, quizQuestions, userAnswers, saveQuizResults]);

  // Button rendering in your JSX

  

  const handleQuizGenerate = () => {
    setLoading(true); // Start the loader
    axios
      .post(
        "http://localhost:5000/get_quiz",
        {
          subject_name: subject,
          difficulty: difficulty,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setQuizQuestions(response.data.quiz);
        setCurrentQuestion(0);
        setUserAnswers({});
        setQuizGenerated(true);
        setQuizCompleted(false);
        setMarks(0);
        setLoading(false); // Stop the loader

        clearInterval(timer);
        const newTimer = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(newTimer);
              handleQuizSubmit();
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
        setTimer(newTimer);
      })
      .catch((error) => {
        console.error("Error fetching quiz:", error.message);
        setLoading(false); // Stop the loader in case of error
      });
  };

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizSubmit();
    }
  }, [currentQuestion, quizQuestions.length, handleQuizSubmit]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  const handleSubjectChange = useCallback((event) => {
    const selectedSubject = event.target.value;
    setSubject(selectedSubject);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Auth token not found");
      return;
    }

    const decodedToken = jwtDecode(token);
    const userId = decodedToken.user_id; // Extract user_id from the token


    axios
      .post("http://localhost:5000/get_subject_text", {
        user_id: userId, // Use the dynamic user ID
        subject: selectedSubject,
      })
      .then((response) => {
        if (response.data && response.data.suggestion) {
          setRecommendedDifficulty(response.data.suggestion);
          setOpenDialog(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching recommended difficulty:", error);
      });
  }, []);

  const handleDifficultyChange = useCallback((event) => {
    setDifficulty(event.target.value);
  }, []);

  const handleAcceptRecommended = useCallback(() => {
    setDifficulty(recommendedDifficulty);
    setOpenDialog(false);
  }, [recommendedDifficulty]);
  

  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleGoBack = useCallback(() => {
    setQuizGenerated(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setUserAnswers({});
    setMarks(0);
    setTimeLeft(300);
    clearInterval(timer);
  }, [timer]);

  useEffect(() => {
    if (quizGenerated) {
      // Clear any existing timer before setting a new one
      if (timer) clearInterval(timer);

      const newTimer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(newTimer); // Clear the timer when time expires
            handleQuizSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setTimer(newTimer); // Update the timer state with the new interval
    }

    return () => {
      // Clear the timer when the component unmounts or when the quiz is no longer generated
      if (timer) clearInterval(timer);
    };
  }, [quizGenerated]);
  // Timer styling
  const timerStyle = {
    padding: "10px",
    borderRadius: "5px",
    color: "white",
    backgroundColor: timeLeft <= 60 ? "red" : "purple",
  };

  return (
    <div>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {quizGenerated && (
          <Box sx={{ alignSelf: "flex-end", mr: 2, mt: 2, ...timerStyle }}>
            <span>Time Left: {formatTime(timeLeft)}</span>
          </Box>
        )}
        {!quizGenerated && !quizCompleted ? (
          <>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: "900px",
                  height: "550px",
                  borderRadius: "8px",
                  padding: "50px 70px",
                  boxShadow: "0 2px 12px #c7c7c7",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h1
                  style={{
                    marginBottom: "2rem",
                    textAlign: "center",
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                >
                  <span
                    style={{
                      color: "black",
                      fontSize: "27px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    Explore your{" "}
                  </span>
                  <span
                    style={{
                      color: "#7d2e8c",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    Learning Skills
                  </span>
                </h1>
                <div className="subject-buttons">
                  <FormControl
                    fullWidth
                    margin="normal"
                    sx={customSelectStyle}
                    className="input-buttons"
                  >
                    <InputLabel>Subject</InputLabel>
                    <Select value={subject} onChange={handleSubjectChange}>
                      {subjects.map((subject) => (
                        <MenuItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    fullWidth
                    margin="normal"
                    sx={customSelectStyle}
                    className="input-buttons"
                  >
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={difficulty}
                      onChange={handleDifficultyChange}
                    >
                      {difficulties.map((difficulty) => (
                        <MenuItem
                          key={difficulty.value}
                          value={difficulty.value}
                        >
                          {difficulty.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <CustomButton
                  onClick={handleQuizGenerate}
                  disabled={loading} // Disable the button while loading
                  sx={{ mt: 3, width: "50%", marginLeft: "25%" }}
                >
                  {loading ? "Generating..." : "Generate Quiz"} {/* Dynamic label */}
                </CustomButton>
              </Box>
            </Box>
            <Dialog open={openDialog} onClose={handleDialogClose}>
              <DialogTitle>{"Recommended Difficulty"}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {`Recommended difficulty for ${subject} is ${recommendedDifficulty}. Would you like to accept this suggestion?`}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} color="primary">
                  Choose Difficulty
                </Button>
                <Button
                  onClick={handleAcceptRecommended}
                  color="primary"
                  autoFocus
                >
                  Accept Recommended Difficulty
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : quizCompleted ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "900px",
                height: "400px",
                borderRadius: "8px",
                padding: "50px 70px",
                boxShadow: "0 2px 12px #c7c7c7",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h2>
                Marks Obtained: {marks}/{quizQuestions.length}
              </h2>
              <div style={{ width: "250px", height: "250px" }}>
                <Doughnut data={chartData} />
              </div>
              <CustomButton
                onClick={handleGoBack}
                sx={{ mt: 3, width: "100%", marginLeft: "-0.5%" }}
              >
                Go Back
              </CustomButton>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "900px",
                height: "400px",
                borderRadius: "8px",
                padding: "50px 70px",
                boxShadow: "0 2px 12px #c7c7c7",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h3 style={{ fontSize: "1.5em" }}>
                Question {currentQuestion + 1} of {quizQuestions.length}:
              </h3>
              <p style={{ fontSize: "1.2em" }}>
                {quizQuestions[currentQuestion].question}
              </p>
              {["a", "b", "c", "d"].map((option, index) => (
                <label
                  key={option}
                  style={{ fontSize: "1.2em", margin: "10px 0" }}
                >
                  <input
                    type="radio"
                    name="question"
                    value={option}
                    style={{ transform: "scale(1.5)", marginRight: "10px" }}
                    checked={userAnswers[currentQuestion] === option}
                    onChange={(e) =>
                      setUserAnswers({
                        ...userAnswers,
                        [currentQuestion]: option,
                      })
                    }
                  />
                  {String.fromCharCode(65 + index)}.{" "}
                  {quizQuestions[currentQuestion][`op${option}`]}
                </label>
              ))}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <CustomButton
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  sx={{ width: "45%", marginLeft: "2.5%" }}
                >
                  Previous Question
                </CustomButton>
                <CustomButton
                  onClick={
                    currentQuestion === quizQuestions.length - 1
                      ? handleQuizSubmit
                      : handleNextQuestion
                  }
                  disabled={userAnswers[currentQuestion] === undefined}
                  sx={{ width: "45%", marginRight: "2.5%" }}
                >
                  {currentQuestion === quizQuestions.length - 1
                    ? "Submit Quiz"
                    : "Next Question"}
                </CustomButton>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default Quiz;
