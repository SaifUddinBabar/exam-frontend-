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

        // minutes -> seconds
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
  // ANSWER CHANGE
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

      // prevent back
      window.history.pushState(
        null,
        "",
        window.location.href
      );

      window.onpopstate = () => {
        window.history.go(1);
      };

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
  // RESULT PAGE
  // ==============================
  if (score !== null && reviewData) {

    const wrong =
      reviewData.questions.length - score;

    const percentage = Math.round(
      (score / reviewData.questions.length) * 100
    );

    // ==============================
    // DOWNLOAD PDF
    // ==============================
    const downloadResult = () => {

      const content =
        document.getElementById(
          "result-sheet"
        ).innerHTML;

      const win =
        window.open("", "", "width=1200,height=700");

      win.document.write(`
        <html>

        <head>

          <title>Exam Result</title>

          <style>

            body{
              font-family: Arial;
              padding:20px;
              background:#f1f5f9;
            }

            .question{
              background:white;
              padding:20px;
              border-radius:14px;
              margin-bottom:20px;
              box-shadow:0 5px 15px rgba(0,0,0,0.08);
            }

          </style>

        </head>

        <body>

          ${content}

        </body>

        </html>
      `);

      win.document.close();

      setTimeout(() => {
        win.print();
      }, 500);
    };

    return (

      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          padding: 20
        }}
      >

        <div
          id="result-sheet"
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
              borderRadius: 24,
              padding: 30,
              color: "white",
              marginBottom: 30
            }}
          >

            <h1
              style={{
                fontSize: 42,
                marginBottom: 10
              }}
            >
              🎉 Exam Completed
            </h1>

            <h2>
              {exam.title}
            </h2>

            {/* STATS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: 20,
                marginTop: 25
              }}
            >

              {/* SCORE */}
              <div
                style={{
                  background:
                    "rgba(255,255,255,0.12)",
                  padding: 20,
                  borderRadius: 18
                }}
              >

                <p>Score</p>

                <h1
                  style={{
                    fontSize: 40
                  }}
                >
                  {score}/{reviewData.questions.length}
                </h1>

              </div>

              {/* CORRECT */}
              <div
                style={{
                  background:
                    "rgba(34,197,94,0.2)",
                  padding: 20,
                  borderRadius: 18
                }}
              >

                <p>Correct</p>

                <h1
                  style={{
                    fontSize: 40
                  }}
                >
                  ✅ {score}
                </h1>

              </div>

              {/* WRONG */}
              <div
                style={{
                  background:
                    "rgba(239,68,68,0.2)",
                  padding: 20,
                  borderRadius: 18
                }}
              >

                <p>Wrong</p>

                <h1
                  style={{
                    fontSize: 40
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
                  borderRadius: 18
                }}
              >

                <p>Percentage</p>

                <h1
                  style={{
                    fontSize: 40
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
                padding: "16px 35px",
                border: "none",
                borderRadius: 16,
                background: "#22c55e",
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                cursor: "pointer"
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
                  padding: 25,
                  borderRadius: 20,
                  marginBottom: 20,
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)"
                }}
              >

                {/* QUESTION */}
                <h2
                  style={{
                    fontSize: 22,
                    marginBottom: 18
                  }}
                >
                  Q{index + 1}. {q.question}
                </h2>

                {/* OPTIONS */}
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
                        padding: 14,
                        borderRadius: 12,
                        marginTop: 10,
                        background: bg,
                        border: `2px solid ${border}`,
                        fontSize: 16,
                        fontWeight: 500
                      }}
                    >

                      {opt}

                      {/* correct */}
                      {opt === correct && (
                        <span>
                          {" "}✅ Correct
                        </span>
                      )}

                      {/* wrong */}
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
        padding: 20
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
            borderRadius: 24,
            padding: 30,
            color: "white",
            marginBottom: 30
          }}
        >

          <h1
            style={{
              fontSize: 42,
              marginBottom: 10
            }}
          >
            📝 {exam.title}
          </h1>

          <p
            style={{
              fontSize: 18
            }}
          >
            ⏰ Time Left: {formatTime()}
          </p>

        </div>

        {/* USER INFO */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 25,
            marginBottom: 30
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 20
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
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                fontSize: 16
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
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                fontSize: 16
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
              borderRadius: 20,
              padding: 25,
              marginBottom: 25
            }}
          >

            {/* QUESTION */}
            <h2
              style={{
                fontSize: 24,
                marginBottom: 20,
                color: "#0f172a"
              }}
            >
              {index + 1}. {q.question}
            </h2>

            {/* OPTIONS */}
            <div
              style={{
                display: "grid",
                gap: 15
              }}
            >

              {q.options.map((opt, i) => (

                <button
                  key={i}
                  onClick={() =>
                    handleAnswer(q._id, opt)
                  }
                  style={{
                    padding: 18,
                    borderRadius: 14,
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
                    fontSize: 17,
                    fontWeight: 500
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
            marginTop: 40
          }}
        >

          <button
            onClick={submitExam}
            style={{
              padding: "18px 40px",
              border: "none",
              borderRadius: 18,
              background: "#22c55e",
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              cursor: "pointer"
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