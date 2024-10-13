import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, TextInput, View, Text, Button } from 'react-native';
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Firestore instance

export default function AdminCreateQuizScreen() {
  const [quizTitle, setQuizTitle] = useState('');  // Store the overall quiz title
  const [quizzes, setQuizzes] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: null }]);  // Store multiple quizzes
  const [quizResults, setQuizResults] = useState([]);  // Store employee quiz results
  const [uniqueUsersCount, setUniqueUsersCount] = useState(0);  // Store number of unique users who completed quizzes
  const [userQuizAttempts, setUserQuizAttempts] = useState([]);  // Store the number of attempts per user

  // Fetch quiz results from Firestore
  const fetchQuizResults = async () => {
    console.log("Fetching quiz results from 'quizAnswers' collection...");

    try {
      const querySnapshot = await getDocs(collection(db, "quizAnswers"));
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched quiz results:", results);

      if (results.length > 0) {
        setQuizResults(results);  // Store fetched quiz results
        countQuizAttempts(results);  // Count quiz attempts per user
        countUniqueUsers(results);  // Count unique users who completed quizzes
      } else {
        console.log("No quiz results found.");
        Alert.alert("No results", "No quiz results available.");
      }
    } catch (error) {
      console.error("Error fetching quiz results from 'quizAnswers':", error);
      Alert.alert("Error", "Could not fetch quiz results.");
    }
  };

  // Count the number of attempts per user
  const countQuizAttempts = (results) => {
    const userAttempts = {};

    results.forEach(result => {
      if (result.employeeEmail) {
        if (!userAttempts[result.employeeEmail]) {
          userAttempts[result.employeeEmail] = { name: result.employeeName, attempts: 0 };
        }
        userAttempts[result.employeeEmail].attempts += 1;
      }
    });

    setUserQuizAttempts(Object.entries(userAttempts));
    console.log("User quiz attempts:", userAttempts);
  };

  // Count the number of unique users who have completed at least one quiz
  const countUniqueUsers = (results) => {
    const uniqueUsers = new Set();

    results.forEach(result => {
      if (result.employeeEmail) {
        uniqueUsers.add(result.employeeEmail);
      }
    });

    setUniqueUsersCount(uniqueUsers.size);
    console.log("Unique users:", uniqueUsers.size);
  };

  useEffect(() => {
    fetchQuizResults();  // Fetch results on component mount
  }, []);

  // Function to handle question change
  const handleQuestionChange = (text, quizIndex) => {
    const updatedQuizzes = [...quizzes];
    updatedQuizzes[quizIndex].question = text;
    setQuizzes(updatedQuizzes);
  };

  // Function to handle option changes
  const handleOptionChange = (text, quizIndex, optionIndex) => {
    const updatedQuizzes = [...quizzes];
    updatedQuizzes[quizIndex].options[optionIndex] = text;
    setQuizzes(updatedQuizzes);
  };

  // Function to set the correct answer
  const setCorrectAnswerForQuiz = (quizIndex, optionIndex) => {
    const updatedQuizzes = [...quizzes];
    updatedQuizzes[quizIndex].correctAnswer = optionIndex;
    setQuizzes(updatedQuizzes);
  };

  // Function to add a new quiz form
  const addNewQuiz = () => {
    setQuizzes([...quizzes, { question: '', options: ['', '', '', ''], correctAnswer: null }]);
  };

  // Function to submit the entire quiz form to Firestore
  const submitQuiz = async () => {
    console.log("Submitting the quiz form...");
    
    if (!quizTitle) {
      Alert.alert("Error", "Please provide a title for the quiz.");
      return;
    }

    if (quizzes.some(quiz => !quiz.question || quiz.options.some(option => option === '') || quiz.correctAnswer === null)) {
      Alert.alert("Error", "Please fill in all questions, options, and select the correct answers for all quizzes.");
      return;
    }

    try {
      const quizData = {
        title: quizTitle,
        quizzes: quizzes.map(quiz => ({
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer,
          timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        })),
      };

      console.log("Quiz data to be submitted:", quizData);

      // Upload to Firestore under the 'quizCollections' collection
      await addDoc(collection(db, "quizCollections"), quizData);

      Alert.alert("Success", "All quizzes uploaded successfully!");
      setQuizTitle('');  // Clear the quiz title
      setQuizzes([{ question: '', options: ['', '', '', ''], correctAnswer: null }]);  // Reset the quizzes array
    } catch (error) {
      console.error("Error uploading quiz:", error);
      Alert.alert("Error", "Could not upload the quiz.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Create a New Quiz</Text>

        {/* Input for the overall quiz title */}
        <TextInput
          placeholder="Enter the quiz title"
          value={quizTitle}
          onChangeText={setQuizTitle}
          style={{ marginBottom: 20, borderColor: 'gray', borderWidth: 1, padding: 10 }}
        />

        {/* Dynamic quiz forms for multiple quizzes */}
        {quizzes.map((quiz, quizIndex) => (
          <View key={quizIndex} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Quiz {quizIndex + 1}</Text>

            {/* Input for the quiz question */}
            <TextInput
              placeholder="Enter the quiz question"
              value={quiz.question}
              onChangeText={(text) => handleQuestionChange(text, quizIndex)}
              multiline
              style={{ marginBottom: 10, borderColor: 'gray', borderWidth: 1, padding: 10 }}
            />

            {/* Inputs for the four answer options */}
            {quiz.options.map((option, optionIndex) => (
              <View key={optionIndex} style={{ marginBottom: 10 }}>
                <TextInput
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChangeText={(text) => handleOptionChange(text, quizIndex, optionIndex)}
                  style={{ borderColor: 'gray', borderWidth: 1, padding: 10 }}
                />
                <Button
                  onPress={() => setCorrectAnswerForQuiz(quizIndex, optionIndex)}
                  color={quiz.correctAnswer === optionIndex ? 'lightblue' : 'gray'}
                  title={quiz.correctAnswer === optionIndex ? "Correct Answer" : "Set as Correct Answer"}
                />
              </View>
            ))}
          </View>
        ))}

        {/* Add another quiz */}
        <Button onPress={addNewQuiz} title="Add Another Quiz" />

        {/* Submit Button */}
        <Button onPress={submitQuiz} title="Submit All Quizzes" style={{ marginTop: 20 }} />

        {/* Display Quiz Results */}
        <Text style={{ fontSize: 24, marginVertical: 20 }}>Employee Quiz Results</Text>
        {quizResults.length > 0 ? (
          quizResults.map((result) => (
            <View key={result.id} style={{ marginBottom: 20, padding: 15, borderWidth: 1, borderColor: 'gray' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Employee: {result.employeeName} ({result.employeeEmail})</Text>
              <Text style={{ fontSize: 16, marginTop: 5 }}>Score: {result.score} / {result.totalQuestions}</Text>
              <Text style={{ fontSize: 16 }}>Quiz Title: {result.quizTitle}</Text>
              <Text style={{ fontSize: 16 }}>Submission Date: {new Date(result.timestamp.seconds * 1000).toLocaleString()}</Text>
              <Text style={{ marginVertical: 10, fontSize: 16 }}>Answers:</Text>
              {result.answers.map((answer, answerIndex) => (
                <View key={answerIndex} style={{ marginBottom: 10 }}>
                  <Text>Q{answerIndex + 1}: {answer.question}</Text>
                  <Text>Selected Answer: {answer.selectedAnswer}</Text>
                  <Text>Correct Answer: {answer.correctAnswer}</Text>
                  <Text>{answer.isCorrect ? "Correct" : "Wrong"}</Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text>No results available yet.</Text>
        )}

        {/* Display unique user and quiz attempt stats */}
        <Text style={{ fontSize: 24, marginVertical: 20 }}>Statistics</Text>
        <Text style={{ fontSize: 18 }}>Total Users Participated: {uniqueUsersCount}</Text>

        <Text style={{ fontSize: 18, marginVertical: 10 }}>User Quiz Attempts:</Text>
        {userQuizAttempts.length > 0 ? (
          userQuizAttempts.map(([email, { name, attempts }]) => (
            <View key={email} style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderColor: 'gray' }}>
              <Text>{name} ({email})</Text>
              <Text>Attempts: {attempts}</Text>
            </View>
          ))
        ) : (
          <Text>No quiz attempts recorded yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}
