import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#f8fafc",
    fontFamily: "Helvetica",
  },

  header: {
    backgroundColor: "#2563eb",
    padding: 20,
    borderRadius: 12,
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 8,
  },

  examTitle: {
    fontSize: 14,
    color: "#e0e7ff",
  },

  stats: {
    flexDirection: "row",
    marginTop: 15,
  },

  stat: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    marginRight: 6,
  },

  statLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 5,
  },

  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },

  question: {
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
  },

  questionNumber: {
    fontSize: 9,
    color: "#3730a3",
    marginBottom: 7,
    fontWeight: "bold",
  },

  questionText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#0f172a",
    marginBottom: 10,
  },

  questionImage: {
    width: 220,
    marginBottom: 10,
  },

  option: {
    padding: 8,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    fontSize: 9,
    color: "#334155",
  },

  correct: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
    color: "#14532d",
  },

  wrong: {
    backgroundColor: "#fff1f2",
    borderColor: "#fca5a5",
    color: "#7f1d1d",
  },
});

export default function ResultPDF({
  exam,
  reviewData,
  score,
}) {
  const questions = reviewData?.questions || [];
  const answers = reviewData?.answers || {};

  const wrong = questions.length - score;

  const percentage =
    questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

  return (
    <Document>

      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>

          <Text style={styles.title}>
            Exam Completed
          </Text>

          <Text style={styles.examTitle}>
            {exam?.title || "Exam Result"}
          </Text>

          {/* STATS */}
          <View style={styles.stats}>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                SCORE
              </Text>

              <Text style={styles.statValue}>
                {score}/{questions.length}
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                CORRECT
              </Text>

              <Text style={styles.statValue}>
                {score}
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                WRONG
              </Text>

              <Text style={styles.statValue}>
                {wrong}
              </Text>
            </View>

            <View
              style={[
                styles.stat,
                { marginRight: 0 },
              ]}
            >
              <Text style={styles.statLabel}>
                PERCENTAGE
              </Text>

              <Text style={styles.statValue}>
                {percentage}%
              </Text>
            </View>

          </View>
        </View>

        {/* QUESTIONS */}

        {questions.map((q, index) => {

          const userAns = answers[q._id];
          const correct = q.correctAnswer;

          return (
            <View
              key={q._id || index}
              style={styles.question}
            >

              <Text style={styles.questionNumber}>
                Q{index + 1}
              </Text>

              <Text style={styles.questionText}>
                {q.question || ""}
              </Text>

              {/* QUESTION IMAGE */}

              {q.image && (
                <Image
                  src={q.image}
                  style={styles.questionImage}
                />
              )}

              {/* OPTIONS */}

              {q.options?.map((opt, i) => {

                const isCorrect =
                  opt === correct;

                const isWrong =
                  opt === userAns &&
                  opt !== correct;

                return (
                  <View
                    key={i}
                    style={[
                      styles.option,

                      isCorrect
                        ? styles.correct
                        : null,

                      isWrong
                        ? styles.wrong
                        : null,
                    ]}
                  >

                    <Text>
                      {opt}

                      {isCorrect
                        ? "   ✓ Correct"
                        : ""}

                      {isWrong
                        ? "   ✕ Your Answer"
                        : ""}
                    </Text>

                  </View>
                );
              })}

            </View>
          );
        })}

      </Page>

    </Document>
  );
}