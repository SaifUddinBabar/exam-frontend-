import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function ExamPage() {

  const { code } = useParams();

  // ==============================
  // STATES
  // ==============================
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [score, setScore] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  // TIMER
  const [timeLeft, setTimeLeft] = useState(null);

  // ==============================
  // FETCH EXAM
  // ==============================
  useEffect(() => {

    fetch(`${API}/api/exams/${code}`)
      .then((res) => res.json())
      .then((data) => {

        setExam(data);

        if (data.duration) {
          setTimeLeft(data.duration * 60);
        }
      });

  }, [code]);

  // ==============================
  // TIMER
  // ==============================
  useEffect(() => {

    if (timeLeft === null) return;

    if (timeLeft <= 0) {

      autoSubmit();

      return;
    }

    const timer = setInterval(() => {

      setTimeLeft((prev) => prev - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft]);

  // ==============================
  // FORMAT TIME
  // ==============================
  const formatTime = () => {

    const minutes =
      Math.floor(timeLeft / 60);

    const seconds =
      timeLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ==============================
  // ANSWER
  // ==============================
  const handleAnswer = (qid, option) => {

    setAnswers({
      ...answers,
      [qid]: option
    });
  };

  // ==============================
  // SUBMIT
  // ==============================
  const submitExam = async () => {

    if (!name || !roll) {
      return alert("Name & Roll Required");
    }

    try {

      const res = await fetch(
        `${API}/api/exams/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            examCode: code,
            name,
            roll,
            answers
          })
        }
      );

      const data = await res.json();

      setScore(data.score);

      setReviewData(data);

    } catch {

      alert("Submit Failed");
    }
  };

  // ==============================
  // AUTO SUBMIT
  // ==============================
  const autoSubmit = () => {

    alert("সময় শেষ! Auto Submit হচ্ছে");

    submitExam();
  };

  // ==============================
  // DOWNLOAD RESULT PDF
  // ==============================
  const downloadResult = async () => {

    const html2pdf =
      (await import("html2pdf.js")).default;

    const element =
      document.getElementById(
        "result-sheet"
      );

    // PDF MODE
    element.classList.add("pdf-mode");

    // wait render
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    const options = {

      margin: [5, 5, 5, 5],

      filename:
        `${exam.title || "exam-result"}.pdf`,

      image: {
        type: "jpeg",
        quality: 1
      },

      html2canvas: {

        scale: 2,

        useCORS: true,

        backgroundColor: "#071028",

        scrollY: 0
      },

      jsPDF: {

        unit: "mm",

        format: "a4",

        orientation: "portrait"
      },

      pagebreak: {
        mode: ["avoid-all", "css", "legacy"]
      }
    };

    await html2pdf()
      .set(options)
      .from(element)
      .save();

    // remove mode
    element.classList.remove("pdf-mode");
  };

  // ==============================
  // RESULT PAGE
  // ==============================
  if (score !== null && reviewData) {

    const wrong =
      reviewData.questions.length - score;

    const percentage = Math.round(
      (score / reviewData.questions.length) * 100
    );

    return (

      <div
        style={{
          minHeight: "100vh",
          background: "#071028",
          padding: "14px"
        }}
      >

        {/* PDF STYLE */}
        <style>
          {`

            .pdf-mode{
              background:#071028 !important;
              padding:20px !important;
            }

            .pdf-mode *{
              box-sizing:border-box;
            }

            .pdf-mode .question{
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

          `}
        </style>

        <div
          id="result-sheet"
          style={{
            maxWidth: 1200,
            margin: "auto",
            width: "100%"
          }}
        >

          {/* TOP CARD */}
          <div
            style={{
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",
              borderRadius: 28,
              padding: "25px 18px",
              color: "white",
              marginBottom: 30
            }}
          >

            {/* TITLE */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
                marginBottom: 15
              }}
            >

              <h1
                style={{
                  fontSize: "clamp(28px,5vw,55px)",
                  margin: 0,
                  fontWeight: "700",
                  lineHeight: 1.2
                }}
              >
                🎉 Exam Completed
              </h1>

            </div>

            {/* EXAM TITLE */}
            <h2
              style={{
                fontSize: "clamp(16px,3vw,28px)",
                marginBottom: 25,
                wordBreak: "break-word"
              }}
            >
              {exam.title}
            </h2>

            {/* STATS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(160px,1fr))",
                gap: 16
              }}
            >

              {/* SCORE */}
              <div
                style={{
                  background:
                    "rgba(255,255,255,0.12)",
                  padding: 20,
                  borderRadius: 20
                }}
              >

                <p
                  style={{
                    opacity: 0.9,
                    marginBottom: 10,
                    fontSize: 16
                  }}
                >
                  Score
                </p>

                <h1
                  style={{
                    fontSize: "clamp(30px,5vw,50px)",
                    margin: 0
                  }}
                >
                  {score}/{reviewData.questions.length}
                </h1>

              </div>

              {/* CORRECT */}
              <div
                style={{
                  background:
                    "rgba(34,197,94,0.18)",
                  padding: 20,
                  borderRadius: 20
                }}
              >

                <p
                  style={{
                    marginBottom: 10,
                    fontSize: 16
                  }}
                >
                  Correct
                </p>

                <h1
                  style={{
                    fontSize: "clamp(30px,5vw,50px)",
                    margin: 0
                  }}
                >
                  ✅ {score}
                </h1>

              </div>

              {/* WRONG */}
              <div
                style={{
                  background:
                    "rgba(239,68,68,0.18)",
                  padding: 20,
                  borderRadius: 20
                }}
              >

                <p
                  style={{
                    marginBottom: 10,
                    fontSize: 16
                  }}
                >
                  Wrong
                </p>

                <h1
                  style={{
                    fontSize: "clamp(30px,5vw,50px)",
                    margin: 0
                  }}
                >
                  ❌ {wrong}
                </h1>

              </div>

              {/* PERCENT */}
              <div
                style={{
                  background:
                    "rgba(255,255,255,0.12)",
                  padding: 20,
                  borderRadius: 20
                }}
              >

                <p
                  style={{
                    marginBottom: 10,
                    fontSize: 16
                  }}
                >
                  Percentage
                </p>

                <h1
                  style={{
                    fontSize: "clamp(30px,5vw,50px)",
                    margin: 0
                  }}
                >
                  {percentage}%
                </h1>

              </div>

            </div>

          </div>

          {/* DOWNLOAD */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 30
            }}
          >

            <button
              onClick={downloadResult}
              style={{
                padding: "16px 28px",
                border: "none",
                borderRadius: 18,
                background: "#22c55e",
                color: "white",
                fontSize: 18,
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
                maxWidth: 350
              }}
            >
              📄 Download Result PDF
            </button>

          </div>

          {/* REVIEW */}
          {reviewData.questions.map((q, index) => {

            const userAns =
              reviewData.answers[q._id];

            const correct =
              q.correctAnswer;

            return (

              <div
                key={index}
                className="question"
                style={{
                  background: "white",
                  padding: "18px",
                  borderRadius: 24,
                  marginBottom: 22,
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)",
                  overflow: "hidden"
                }}
              >

                {/* QUESTION */}
                <h2
                  style={{
                    fontSize: "clamp(18px,3vw,28px)",
                    marginBottom: 18,
                    color: "#0f172a",
                    lineHeight: 1.5,
                    wordBreak: "break-word"
                  }}
                >
                  Q{index + 1}. {q.question}
                </h2>

                {/* OPTIONS */}
                <div
                  style={{
                    display: "grid",
                    gap: 12
                  }}
                >

                  {q.options.map((opt, i) => {

                    let bg = "#f1f5f9";
                    let border = "#cbd5e1";

                    // correct
                    if (opt === correct) {
                      bg = "#dcfce7";
                      border = "#16a34a";
                    }

                    // wrong
                    if (
                      opt === userAns &&
                      opt !== correct
                    ) {
                      bg = "#fee2e2";
                      border = "#dc2626";
                    }

                    return (

                      <div
                        key={i}
                        style={{
                          padding: "15px 14px",
                          borderRadius: 14,
                          background: bg,
                          border: `2px solid ${border}`,
                          fontSize:
                            "clamp(15px,2.7vw,20px)",
                          fontWeight: 500,
                          lineHeight: 1.6,
                          wordBreak: "break-word"
                        }}
                      >

                        {opt}

                        {/* CORRECT */}
                        {opt === correct && (
                          <span>
                            {" "}✅ Correct
                          </span>
                        )}

                        {/* WRONG */}
                        {opt === userAns &&
                          opt !== correct && (
                          <span>
                            {" "}❌ Your Answer
                          </span>
                        )}

                      </div>
                    );
                  })}

                </div>

              </div>
            );
          })}

        </div>

      </div>
    );
  }

  // ==============================
  // LOADING
  // ==============================
  if (!exam) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 30,
          fontWeight: "bold"
        }}
      >
        Loading...
      </div>
    );
  }

  // ==============================
  // EXAM PAGE
  // ==============================
  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b)",
        padding: 14
      }}
    >

      <div
        style={{
          maxWidth: 1100,
          margin: "auto"
        }}
      >

        {/* TOP */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#2563eb,#7c3aed)",
            borderRadius: 28,
            padding: "25px 18px",
            color: "white",
            marginBottom: 25
          }}
        >

          <h1
            style={{
              fontSize: "clamp(28px,5vw,55px)",
              marginBottom: 14,
              lineHeight: 1.2
            }}
          >
            📝 {exam.title}
          </h1>

          <p
            style={{
              fontSize: "clamp(18px,3vw,24px)"
            }}
          >
            ⏰ Time Left: {formatTime()}
          </p>

        </div>

        {/* USER INFO */}
        <div
          style={{
            background: "white",
            borderRadius: 22,
            padding: 20,
            marginBottom: 25
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: 16
            }}
          >

            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                width: "100%",
                boxSizing: "border-box"
              }}
            />

            <input
              type="text"
              placeholder="Your Roll"
              value={roll}
              onChange={(e) =>
                setRoll(e.target.value)
              }
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                width: "100%",
                boxSizing: "border-box"
              }}
            />

          </div>

        </div>

        {/* QUESTIONS */}
        {exam.questions.map((q, index) => (

          <div
            key={q._id}
            style={{
              background: "white",
              borderRadius: 24,
              padding: 20,
              marginBottom: 22
            }}
          >

            {/* QUESTION */}
            <h2
              style={{
                fontSize: "clamp(20px,3vw,30px)",
                marginBottom: 20,
                color: "#0f172a",
                lineHeight: 1.5
              }}
            >
              {index + 1}. {q.question}
            </h2>

            {/* OPTIONS */}
            <div
              style={{
                display: "grid",
                gap: 14
              }}
            >

              {q.options.map((opt, i) => (

                <button
                  key={i}
                  onClick={() =>
                    handleAnswer(q._id, opt)
                  }
                  style={{
                    padding: "16px 18px",
                    borderRadius: 16,
                    border:
                      answers[q._id] === opt
                        ? "2px solid #2563eb"
                        : "2px solid #e2e8f0",
                    background:
                      answers[q._id] === opt
                        ? "#dbeafe"
                        : "#f8fafc",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize:
                      "clamp(15px,2.7vw,20px)",
                    fontWeight: 500,
                    lineHeight: 1.6,
                    width: "100%",
                    wordBreak: "break-word"
                  }}
                >
                  {opt}
                </button>

              ))}

            </div>

          </div>

        ))}

        {/* SUBMIT */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 35
          }}
        >

          <button
            onClick={submitExam}
            style={{
              padding: "18px 28px",
              border: "none",
              borderRadius: 18,
              background: "#22c55e",
              color: "white",
              fontSize: 20,
              fontWeight: "700",
              cursor: "pointer",
              width: "100%",
              maxWidth: 350
            }}
          >
            🚀 Submit Exam
          </button>

        </div>

      </div>

    </div>
  );
}

export default ExamPage;