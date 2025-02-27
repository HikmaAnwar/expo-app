import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  fetchQuestions,
  setUserScore,
  fetchUserScores,
} from "@/api/supabaseService";

interface Choice {
  name: string;
  value: string;
}

interface Question {
  id?: number;
  question: string;
  choices: Choice[];
  difficulty_level: string;
}

const ColorGuessingGame = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showCorrectAlert, setShowCorrectAlert] = useState(false);
  const [showTryAgainAlert, setShowTryAgainAlert] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      const data = await fetchQuestions();
      setAllQuestions(data);
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    if (selectedDifficulty && allQuestions.length > 0) {
      const filteredQuestions = allQuestions.filter(
        (q) => q.difficulty_level === selectedDifficulty
      );
      setQuestions(filteredQuestions);
      setCurrentQuestion(0);
      setAttempts(0);
      setShowCorrectAlert(false);
      setShowTryAgainAlert(false);
    }
  }, [selectedDifficulty, allQuestions]);

  const extractCorrectValueFromQuestion = (question: string): string => {
    const match = question.match(/RGB\(\d+,\s*\d+,\s*\d+\)/i);
    if (match) {
      return match[0].toUpperCase();
    }
    return "";
  };

  const normalizeColor = (value: string): string => {
    const trimmed = value.trim().toLowerCase();
    const match =
      trimmed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i) ||
      trimmed.match(/rgb\((\d+),(\d+),(\d+)\)/i);
    if (match) {
      const [, r, g, b] = match;
      return `rgb(${r}, ${g}, ${b})`;
    }
    return "rgb(0, 0, 0)";
  };

  const handleChoice = (value: string) => {
    const currentQ = questions[currentQuestion];
    const correctValue = extractCorrectValueFromQuestion(currentQ.question);

    if (value === correctValue) {
      setScore((prevScore) => prevScore + 1);
      setAttempts(0);
      setShowCorrectAlert(true);
      setTimeout(() => {
        setShowCorrectAlert(false);
        proceedToNext();
      }, 500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts < 3) {
        setShowTryAgainAlert(true);
        setTimeout(() => {
          setShowTryAgainAlert(false);
        }, 500);
      } else {
        setShowTryAgainAlert(true);
        setTimeout(() => {
          setShowTryAgainAlert(false);
          proceedToNext();
        }, 500);
      }
    }
  };

  const proceedToNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setAttempts(0);
    } else {
      setShowNameModal(true);
    }
  };

  const skipQuestion = () => {
    setAttempts(0);
    proceedToNext();
  };

  const [isNameTaken, setIsNameTaken] = useState(false);

  const checkIfNameExists = async () => {
    if (!playerName || !selectedDifficulty) return;

    const existingScores = await fetchUserScores();
    const nameExists = existingScores.some(
      (entry: any) =>
        entry.name === playerName &&
        entry.difficulty_level === selectedDifficulty
    );

    setIsNameTaken(nameExists);
  };

  useEffect(() => {
    checkIfNameExists();
  }, [playerName, selectedDifficulty]);

  const handleNameSubmit = async () => {
    if (!isNameTaken) {
      await setUserScore(playerName, score, selectedDifficulty);
      setShowNameModal(false);
      setCurrentQuestion(0);
      setScore(0);
      setAttempts(0);
      setShowCorrectAlert(false);
      setShowTryAgainAlert(false);
      setPlayerName("");
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Welcome to the Color Guessing Game!
          </Text>
          <Button title="Start Game" onPress={() => setShowModal(false)} />
        </View>
      </Modal>

      <Modal visible={showNameModal} animationType="slide" transparent={false}>
        <View style={styles.nameModal}>
          <Text style={styles.modalText}>Enter your name:</Text>
          <TextInput
            style={styles.textInput}
            value={playerName}
            onChangeText={setPlayerName}
          />
          {isNameTaken && (
            <Text style={{ color: "red", marginBottom: 10 }}>
              This name is already taken at this difficulty level. Please choose
              another name.
            </Text>
          )}
          <Button
            title="Submit"
            onPress={handleNameSubmit}
            disabled={isNameTaken}
          />
        </View>
      </Modal>

      {showCorrectAlert && (
        <View style={styles.correctAlert}>
          <Text style={styles.alertText}>Correct!</Text>
        </View>
      )}

      {showTryAgainAlert && (
        <View style={styles.tryAgainAlert}>
          <Text style={styles.alertText}>
            {attempts < 3
              ? `Try Again! (${3 - attempts} attempts left)`
              : "Out of attempts!"}
          </Text>
        </View>
      )}

      <Text style={styles.header}>Color Guessing Game</Text>

      <Picker
        selectedValue={selectedDifficulty}
        onValueChange={(itemValue) => setSelectedDifficulty(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Difficulty" value="" />
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>

      <View style={styles.pickerRow}>
        <Text style={styles.questionNumber}>
          No. of Questions: {questions.length}
        </Text>
        <Text style={styles.questionNumber}>
          Current Question: {currentQuestion + 1}
        </Text>
      </View>

      {questions.length === 0 ? (
        <Text style={styles.noQuestionsText}>
          {selectedDifficulty
            ? "No questions available for this level."
            : "Select a difficulty level to start."}
        </Text>
      ) : (
        <View style={styles.questionContainer}>
          <View style={styles.questionWrapper}>
            <Text style={styles.questionText}>
              Question {currentQuestion + 1}:{" "}
              {questions[currentQuestion].question}
            </Text>
          </View>

          <Text style={styles.attemptsText}>Attempts left: {3 - attempts}</Text>

          <FlatList
            data={questions[currentQuestion].choices}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => handleChoice(item.value)}
                  style={[
                    styles.choice,
                    { backgroundColor: normalizeColor(item.value) },
                    {
                      borderWidth: 2,
                      borderColor:
                        normalizeColor(item.value) === "rgb(0, 0, 0)"
                          ? "white"
                          : "black",
                    },
                  ]}
                >
                  <Text style={styles.choiceText}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Skip Question 
            "
              onPress={skipQuestion}
            />
          </View>
          <Text
            style={{
              textAlign: "center",
              marginTop: 2,
              color: "red",
            }}
          >
            Note: Skipping a question will not add to your score or your score
            will not be zero for that question.
          </Text>
        </View>
      )}

      <Text>Score: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, marginBottom: 20, color: "white" },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  picker: {
    width: 200,
    height: 50,
    backgroundColor: "white",
    marginBottom: 10,
  },
  noQuestionsText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginVertical: 20,
  },
  questionContainer: { alignItems: "center", marginBottom: 20 },
  questionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    color: "white",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
    marginTop: 10,
  },
  questionNumber: {
    fontSize: 12,
    color: "white",
    backgroundColor: "rgba(100, 100, 100, 0.7)",
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    marginTop: 10,
  },
  attemptsText: { fontSize: 16, color: "white", marginVertical: 20 },
  choice: {
    width: 80,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  choiceText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
  modalContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalText: { fontSize: 20, marginBottom: 20 },
  nameModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  textInput: {
    backgroundColor: "white",
    width: "80%",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  correctAlert: {
    position: "absolute",
    top: "40%",
    backgroundColor: "rgba(0, 255, 0, 0.9)",
    padding: 20,
    borderRadius: 10,
    zIndex: 1000,
  },
  tryAgainAlert: {
    position: "absolute",
    top: "40%",
    backgroundColor: "rgba(255, 0, 0, 0.9)",
    padding: 20,
    borderRadius: 10,
    zIndex: 1000,
  },
  alertText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ColorGuessingGame;
