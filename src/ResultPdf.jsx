import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

/*
|--------------------------------------------------------------------------
| Bengali Font
|--------------------------------------------------------------------------
| Put this file here:
|
| public/fonts/NotoSansBengali-Regular.ttf
|
| Then Vite/React will serve it from:
| /fonts/NotoSansBengali-Regular.ttf
|--------------------------------------------------------------------------
*/

Font.register({
  family: "NotoBengali",
  src: "/fonts/NotoSansBengali-Regular.ttf",
});

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#f8fafc",
    fontFamily: "NotoBengali",
  },

  /*
  |--------------------------------------------------------------------------
  | Header
  |--------------------------------------------------------------------------
  */

  header: {
    backgroundColor: "#2563eb",
    padding: 20,
    borderRadius: 12,
    marginBottom: 18,
  },

  title: {
    fontFamily: "Helvetica",
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 8,
  },

  examTitle: {
    fontFamily: "NotoBengali",
    fontSize: 14,
    color: "#e0e7ff",
    lineHeight: 1.5,
  },

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

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
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#64748b",
    marginBottom: 5,
  },

  statValue: {
    fontFamily: "Helvetica",
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },

  /*
  |--------------------------------------------------------------------------
  | Question Card
  |--------------------------------------------------------------------------
  */

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
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#3730a3",
    marginBottom: 7,
    fontWeight: "bold",
  },

  questionText: {
    fontFamily: "NotoBengali",
    fontSize: 10.5,
    lineHeight: 1.65,
    color: "#0f172a",
    marginBottom: 10,
  },

  /*
  |--------------------------------------------------------------------------
  | Question Image
  |--------------------------------------------------------------------------
  */

  questionImage: {
    width: 220,
    maxHeight: 180,
    objectFit: "contain",
    marginBottom: 10,
  },

  /*
  |--------------------------------------------------------------------------
  | Options
  |--------------------------------------------------------------------------
  */

  option: {
    padding: 8,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
  },

  optionText: {
    fontFamily: "NotoBengali",
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#334155",
  },

  /*
  |--------------------------------------------------------------------------
  | Correct / Wrong
  |--------------------------------------------------------------------------
  */

  correct: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },

  correctText: {
    color: "#14532d",
  },

  wrong: {
    backgroundColor: "#fff1f2",
    borderColor: "#fca5a5",
  },

  wrongText: {
    color: "#7f1d1d",
  },

  /*
  |--------------------------------------------------------------------------
  | Status labels
  |--------------------------------------------------------------------------
  */

  correctLabel: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#15803d",
  },

  wrongLabel: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#dc2626",
  },
});

/*
|--------------------------------------------------------------------------
| Result PDF Component
|--------------------------------------------------------------------------
*/

export default function ResultPDF({
  exam,
  reviewData,
  score,
}) {
  /*
  |--------------------------------------------------------------------------
  | Safe data
  |--------------------------------------------------------------------------
  */

  const questions = Array.isArray(reviewData?.questions)
    ? reviewData.questions
    : [];

  const answers = reviewData?.answers || {};

  /*
  |--------------------------------------------------------------------------
  | Score
  |--------------------------------------------------------------------------
  */

  const safeScore = Number.isFinite(Number(score))
    ? Number(score)
    : 0;

  const totalQuestions = questions.length;

  const wrong = Math.max(
    0,
    totalQuestions - safeScore
  );

  const percentage =
    totalQuestions > 0
      ? Math.round(
          (safeScore / totalQuestions) * 100
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <Document
      title={`${exam?.title || "Exam"} - Result`}
      author="Exam Builder"
      subject="Exam Result"
    >
      <Page
        size="A4"
        style={styles.page}
        wrap
      >
        {/* =========================================================
            HEADER
        ========================================================= */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Exam Completed
          </Text>

          <Text style={styles.examTitle}>
            {exam?.title || "Exam Result"}
          </Text>

          {/* =======================================================
              STATS
          ======================================================= */}

          <View style={styles.stats}>
            {/* SCORE */}

            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                SCORE
              </Text>

              <Text style={styles.statValue}>
                {safeScore}/{totalQuestions}
              </Text>
            </View>

            {/* CORRECT */}

            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                CORRECT
              </Text>

              <Text style={styles.statValue}>
                {safeScore}
              </Text>
            </View>

            {/* WRONG */}

            <View style={styles.stat}>
              <Text style={styles.statLabel}>
                WRONG
              </Text>

              <Text style={styles.statValue}>
                {wrong}
              </Text>
            </View>

            {/* PERCENTAGE */}

            <View
              style={[
                styles.stat,
                {
                  marginRight: 0,
                },
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

        {/* =========================================================
            QUESTIONS
        ========================================================= */}

        {questions.map((q, index) => {
          const userAns = answers[q?._id];

          const correctAnswer =
            q?.correctAnswer ?? "";

          return (
            <View
              key={q?._id || `question-${index}`}
              style={styles.question}
              wrap
            >
              {/* QUESTION NUMBER */}

              <Text style={styles.questionNumber}>
                Q{index + 1}
              </Text>

              {/* QUESTION TEXT */}

              <Text style={styles.questionText}>
                {q?.question || ""}
              </Text>

              {/* ===================================================
                  QUESTION IMAGE
              =================================================== */}

              {q?.image ? (
                <Image
                  src={q.image}
                  style={styles.questionImage}
                />
              ) : null}

              {/* ===================================================
                  OPTIONS
              =================================================== */}

              {Array.isArray(q?.options) &&
                q.options.map((opt, optionIndex) => {
                  const isCorrect =
                    opt === correctAnswer;

                  const isWrong =
                    opt === userAns &&
                    opt !== correctAnswer;

                  return (
                    <View
                      key={optionIndex}
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
                      <Text
                        style={[
                          styles.optionText,

                          isCorrect
                            ? styles.correctText
                            : null,

                          isWrong
                            ? styles.wrongText
                            : null,
                        ]}
                      >
                        {opt}

                        {isCorrect ? (
                          <>
                            {"   "}
                            <Text
                              style={styles.correctLabel}
                            >
                              ✓ Correct
                            </Text>
                          </>
                        ) : null}

                        {isWrong ? (
                          <>
                            {"   "}
                            <Text
                              style={styles.wrongLabel}
                            >
                              ✕ Your Answer
                            </Text>
                          </>
                        ) : null}
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