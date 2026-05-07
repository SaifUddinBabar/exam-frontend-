if (score !== null && reviewData) {

  const wrong =
    reviewData.questions.length - score;

  const percentage = Math.round(
    (score / reviewData.questions.length) * 100
  );

  const downloadResult = () => {

    const printContents =
      document.getElementById("result-sheet").innerHTML;

    const win = window.open("", "", "width=1000,height=700");

    win.document.write(`
      <html>
      <head>
        <title>Exam Result</title>

        <style>

          body{
            font-family: Arial;
            padding:20px;
            background:#f8fafc;
          }

          .card{
            background:white;
            padding:20px;
            border-radius:12px;
            margin-bottom:20px;
            box-shadow:0 5px 15px rgba(0,0,0,0.08);
          }

          .correct{
            background:#dcfce7;
            padding:10px;
            border-radius:8px;
            margin-top:8px;
          }

          .wrong{
            background:#fee2e2;
            padding:10px;
            border-radius:8px;
            margin-top:8px;
          }

        </style>

      </head>

      <body>

        ${printContents}

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
          maxWidth: 1000,
          margin: "auto"
        }}
      >

        {/* TOP */}
        <div
          style={{
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            borderRadius: 24,
            padding: 30,
            color: "white",
            marginBottom: 25,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
          }}
        >

          <h1
            style={{
              fontSize: 40,
              marginBottom: 10
            }}
          >
            🎉 Exam Completed
          </h1>

          <h2>
            {exam.title}
          </h2>

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              marginTop: 25
            }}
          >

            {/* SCORE */}
            <div
              style={{
                flex: 1,
                minWidth: 200,
                background: "rgba(255,255,255,0.12)",
                padding: 20,
                borderRadius: 18
              }}
            >
              <p style={{ opacity: 0.8 }}>
                Score
              </p>

              <h1 style={{ fontSize: 45 }}>
                {score}/{reviewData.questions.length}
              </h1>
            </div>

            {/* CORRECT */}
            <div
              style={{
                flex: 1,
                minWidth: 200,
                background: "rgba(34,197,94,0.2)",
                padding: 20,
                borderRadius: 18
              }}
            >
              <p>Correct</p>

              <h1 style={{ fontSize: 45 }}>
                ✅ {score}
              </h1>
            </div>

            {/* WRONG */}
            <div
              style={{
                flex: 1,
                minWidth: 200,
                background: "rgba(239,68,68,0.2)",
                padding: 20,
                borderRadius: 18
              }}
            >
              <p>Wrong</p>

              <h1 style={{ fontSize: 45 }}>
                ❌ {wrong}
              </h1>
            </div>

            {/* PERCENT */}
            <div
              style={{
                flex: 1,
                minWidth: 200,
                background: "rgba(255,255,255,0.12)",
                padding: 20,
                borderRadius: 18
              }}
            >
              <p>Percentage</p>

              <h1 style={{ fontSize: 45 }}>
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
              padding: "14px 28px",
              border: "none",
              borderRadius: 14,
              background: "#22c55e",
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
            }}
          >
            📄 Download Result
          </button>

        </div>

        {/* REVIEW */}
        {reviewData.questions.map((q, index) => {

          const userAns =
            reviewData.answers[q._id];

          const correct =
            q.correctAnswer;

          const isCorrect =
            userAns === correct;

          return (

            <div
              key={index}
              className="card"
              style={{
                background: "white",
                padding: 25,
                borderRadius: 20,
                marginBottom: 20,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
              }}
            >

              {/* QUESTION */}
              <h2
                style={{
                  fontSize: 22,
                  marginBottom: 18,
                  color: "#0f172a"
                }}
              >
                Q{index + 1}. {q.question}
              </h2>

              {/* OPTIONS */}
              {q.options.map((opt, i) => {

                let bg = "#f8fafc";
                let border = "#e2e8f0";

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

                    {opt === correct && (
                      <span>
                        {" "}✅ Correct
                      </span>
                    )}

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