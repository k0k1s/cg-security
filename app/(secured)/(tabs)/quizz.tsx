import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text, Button } from 'react-native';
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Firestore instance
import { getAuth } from "firebase/auth"; // To get the current user's info
import { Picker } from '@react-native-picker/picker'; // Updated import for Picker

export default function EmployeeQuizScreen() {
  const [quizCollections, setQuizCollections] = useState([]);  // Store all quiz collections
  const [selectedCollection, setSelectedCollection] = useState(null);  // Store selected quiz collection
  const [quizzes, setQuizzes] = useState([]);  // Store fetched quizzes from the selected collection
  const [selectedAnswers, setSelectedAnswers] = useState([]);  // Store selected answers by employee
  const [quizTitle, setQuizTitle] = useState('');  // Store quiz title
  const [score, setScore] = useState<number | null>(null);  // Store employee's score after submission
  const [showResults, setShowResults] = useState(false);  // Toggle to show results after submission

  // Get the current user's information
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const employeeName = currentUser?.displayName || "Anonymous";
  const employeeEmail = currentUser?.email || "No Email";

  // Fetch all quiz collections from Firestore
  useEffect(() => {
    const fetchQuizCollections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quizCollections"));
        const fetchedCollections = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizCollections(fetchedCollections);  // Store all quiz collections
      } catch (error) {
        console.error("Error fetching quiz collections:", error);
        Alert.alert("Error", "Could not fetch quiz collections.");
      }
    };

    fetchQuizCollections();
  }, []);

  // Function to handle selecting a quiz collection
  const handleSelectCollection = (collectionId) => {
    const selected = quizCollections.find(collection => collection.id === collectionId);
    if (selected) {
      setSelectedCollection(selected);  // Set the selected quiz collection
      setQuizzes(selected.quizzes);  // Set quizzes from the selected collection
      setQuizTitle(selected.title);  // Set the title of the selected collection
      setSelectedAnswers(new Array(selected.quizzes.length).fill(null));  // Initialize answers as null
      setShowResults(false);  // Reset the results view
      setScore(null);  // Reset score
    }
  };

  // Function to handle answer selection
  const handleAnswerSelection = (quizIndex, answerIndex) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[quizIndex] = answerIndex;  // Store the selected answer for the specific quiz
    setSelectedAnswers(updatedAnswers);
  };

  // Function to submit the answers
  const submitAnswers = async () => {
    if (selectedAnswers.some(answer => answer === null)) {
      Alert.alert("Error", "Please answer all questions before submitting.");
      return;
    }

    try {
      let correctAnswersCount = 0;
      const answerData = {
        quizTitle: quizTitle,
        employeeName: employeeName,
        employeeEmail: employeeEmail,
        submissionDate: new Date().toLocaleString(),  // Add submission date
        answers: selectedAnswers.map((answer, index) => {
          const isCorrect = answer === quizzes[index].correctAnswer;
          if (isCorrect) {
            correctAnswersCount += 1;  // Increment the correct answers count if the answer is correct
          }
          return {
            question: quizzes[index].question,
            selectedAnswer: answer,
            correctAnswer: quizzes[index].correctAnswer,
            isCorrect: isCorrect,  // Check if the answer is correct
          };
        }),
        score: correctAnswersCount,
        totalQuestions: quizzes.length,
        timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      };

      // Store the employee's answers in Firestore under the 'quizAnswers' collection
      await addDoc(collection(db, "quizAnswers"), answerData);

      setScore(correctAnswersCount);  // Set the employee's score
      setShowResults(true);  // Show the results
      Alert.alert("Success", `Your answers have been submitted! You scored ${correctAnswersCount} out of ${quizzes.length}.`);
    } catch (error) {
      console.error("Error submitting answers:", error);
      Alert.alert("Error", "Could not submit answers.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {/* Display a dropdown to select quiz collection */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Select a Quiz</Text>
        {quizCollections.length > 0 ? (
          <Picker
            selectedValue={selectedCollection ? selectedCollection.id : null}
            onValueChange={(value) => handleSelectCollection(value)}
          >
            <Picker.Item label="Select a Quiz Collection" value={null} />
            {quizCollections.map((collection) => (
              <Picker.Item key={collection.id} label={collection.title} value={collection.id} />
            ))}
          </Picker>
        ) : (
          <Text>Loading quiz collections...</Text>
        )}
      </View>

      {/* Display quizzes if a collection is selected */}
      {selectedCollection && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>{quizTitle}</Text>

          {quizzes.map((quiz, quizIndex) => (
            <View key={quizIndex} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, marginBottom: 10 }}>{quiz.question}</Text>

              {/* Display options for each quiz */}
              {quiz.options.map((option, optionIndex) => (
                <View key={optionIndex} style={{ marginBottom: 10 }}>
                  <Button
                    onPress={() => handleAnswerSelection(quizIndex, optionIndex)}
                    color={selectedAnswers[quizIndex] === optionIndex ? 'lightblue' : 'gray'}
                    title={option}
                  />
                </View>
              ))}

              {/* After submission, show the correct answer */}
              {showResults && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: selectedAnswers[quizIndex] === quizzes[quizIndex].correctAnswer ? 'green' : 'red' }}>
                    {selectedAnswers[quizIndex] === quizzes[quizIndex].correctAnswer ? "Correct!" : `Wrong! Correct Answer: ${quizzes[quizIndex].options[quizzes[quizIndex].correctAnswer]}`}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Submit Button */}
          {!showResults && (
            <Button onPress={submitAnswers} title="Submit Answers" style={{ marginTop: 20 }} />
          )}

          {/* Show the total score after submission */}
          {showResults && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 20 }}>Your Score: {score} out of {quizzes.length}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
