import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "NotoBengali",
  fonts: [
    { src: "/fonts/NotoSansBengali-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansBengali-Bold.ttf", fontWeight: 700 },
  ],
});

// IMPORTANT: Bengali word break/hyphenate hole matra bhenge jay
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: "#f8fafc", fontFamily: "NotoBengali" },
  header: { backgroundColor: "#2563eb", padding: 20, borderRadius: 12, marginBottom: 18 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 24, color: "#fff", marginBottom: 8 },
  examTitle: { fontSize: 14, color: "#e0e7ff", lineHeight: 1.7 },
  stats: { flexDirection: "row", marginTop: 15 },
  stat: { flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 8, marginRight: 6 },
  statLabel: { fontFamily: "Helvetica", fontSize: 8, color: "#64748b", marginBottom: 5 },
  statValue: { fontFamily: "Helvetica-Bold", fontSize: 16, color: "#0f172a" },

  question: {
    backgroundColor: "#fff", padding: 14, marginBottom: 12, borderRadius: 10,
    borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "solid",
  },
  qNum: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#3730a3", marginBottom: 7 },
  qText: { fontSize: 11, lineHeight: 1.8, color: "#0f172a", marginBottom: 10 },

  option: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 8, marginBottom: 6, borderRadius: 6,
    borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "solid",
  },
  optText: { flex: 1, fontSize: 10, lineHeight: 1.7, color: "#334155" },
  correct: { backgroundColor: "#f0fdf4", borderColor: "#86efac" },
  correctText: { color: "#14532d" },
  wrong: { backgroundColor: "#fff1f2", borderColor: "#fca5a5" },
  wrongText: { color: "#7f1d1d" },
  tagCorrect: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#15803d", marginLeft: 8 },
  tagWrong: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#dc2626", marginLeft: 8 },
});

export default function ResultPDF({ exam, reviewData, score }) {
  const questions = Array.isArray(reviewData?.questions) ? reviewData.questions : [];
  const answers = reviewData?.answers || {};
  const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;
  const total = questions.length;
  const wrong = Math.max(0, total - safeScore);
  const percentage = total > 0 ? Math.round((safeScore / total) * 100) : 0;

  const stats = [
    ["SCORE", `${safeScore}/${total}`],
    ["CORRECT", safeScore],
    ["WRONG", wrong],
    ["PERCENTAGE", `${percentage}%`],
  ];

  return (
    <Document title={`${exam?.title || "Exam"} - Result`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Exam Completed</Text>
          <Text style={styles.examTitle}>{exam?.title || "Exam Result"}</Text>

          <View style={styles.stats}>
            {stats.map(([label, value], i) => (
              <View key={label} style={[styles.stat, i === 3 ? { marginRight: 0 } : null]}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {questions.map((q, index) => {
          const userAns = answers[q?._id];
          const correctAnswer = q?.correctAnswer ?? "";

          return (
            <View key={q?._id || index} style={styles.question} wrap={false}>
              <Text style={styles.qNum}>Q{index + 1}</Text>
              <Text style={styles.qText}>{q?.question || ""}</Text>

              {Array.isArray(q?.options) &&
                q.options.map((opt, i) => {
                  const isCorrect = opt === correctAnswer;
                  const isWrong = opt === userAns && opt !== correctAnswer;
                  return (
                    <View
                      key={i}
                      style={[styles.option, isCorrect && styles.correct, isWrong && styles.wrong]}
                    >
                      <Text style={[styles.optText, isCorrect && styles.correctText, isWrong && styles.wrongText]}>
                        {opt}
                      </Text>
                      {isCorrect && <Text style={styles.tagCorrect}>CORRECT</Text>}
                      {isWrong && <Text style={styles.tagWrong}>YOUR ANSWER</Text>}
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