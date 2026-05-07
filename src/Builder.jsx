import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

// ==============================
// SUBJECT + CHAPTER DATA
// ==============================
const SUBJECTS = {

  "বাংলা": [
    "গদ্য",
    "পদ্য",
    "ব্যাকরণ",
    "নির্মিতি"
  ],

  "ইংরেজি": [
    "Grammar",
    "Seen Passage",
    "Writing",
    "Vocabulary"
  ],

  "তথ্য ও যোগাযোগ প্রযুক্তি": [
    "প্রথম অধ্যায় : তথ্য ও যোগাযোগ প্রযুক্তি",
    "দ্বিতীয় অধ্যায় : কমিউনিকেশন সিস্টেম",
    "তৃতীয় অধ্যায় : সংখ্যা পদ্ধতি",
    "চতুর্থ অধ্যায় : ওয়েব ডিজাইন",
    "পঞ্চম অধ্যায় : প্রোগ্রামিং ভাষা"
  ],

  "পদার্থবিজ্ঞান": [
    "ভৌত জগৎ ও পরিমাপ",
    "ভেক্টর",
    "নিউটনিয়ান বলবিদ্যা",
    "কাজ শক্তি ক্ষমতা",
    "মহাকর্ষ ও অভিকর্ষ",
    "তাপগতিবিদ্যা"
  ],

  "রসায়ন": [
    "ল্যাবরেটরির নিরাপদ ব্যবহার",
    "গুণগত রসায়ন",
    "পরমাণুর গঠন",
    "রাসায়নিক পরিবর্তন",
    "জৈব রসায়ন",
    "তড়িৎ রসায়ন"
  ],

  "জীববিজ্ঞান": [
    "কোষ ও এর গঠন",
    "কোষ বিভাজন",
    "অণুজীব",
    "শৈবাল ও ছত্রাক",
    "মানবদেহ",
    "জীবপ্রযুক্তি"
  ],

  "উচ্চতর গণিত": [
    "ম্যাট্রিক্স ও নির্ণায়ক",
    "সরলরেখা",
    "বৃত্ত",
    "ত্রিকোণমিতি",
    "অন্তরীকরণ",
    "যোগজীকরণ"
  ]
};

function Builder() {

  // ==============================
  // STATES
  // ==============================
  const [questions, setQuestions] = useState([]);

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [chapter, setChapter] = useState("");

  const [examCode, setExamCode] = useState("");

  // ==============================
  // FORM DATA
  // ==============================
  const [examData, setExamData] = useState({

    academy: "",

    title: "",

    className: "একাদশ-দ্বাদশ",

    duration: "60",

    subject: "",

    marks: "20"
  });

  // ==============================
  // FETCH QUESTIONS
  // ==============================
  useEffect(() => {

    fetch(`${API}/api/questions`)
      .then((res) => res.json())
      .then((data) => {

        setQuestions(data);

      });

  }, []);

  // ==============================
  // HANDLE CHANGE
  // ==============================
  const handleChange = (e) => {

    setExamData({

      ...examData,

      [e.target.name]: e.target.value
    });
  };

  // ==============================
  // FILTER QUESTIONS
  // ==============================
  const filteredQuestions =
    questions.filter((q) => {

      const matchSubject =
        examData.subject
          ? q.subject === examData.subject
          : true;

      const matchChapter =
        chapter
          ? q.chapter === chapter
          : true;

      return (
        matchSubject &&
        matchChapter
      );
    });

  // ==============================
  // SELECT QUESTION
  // ==============================
  const toggleQuestion = (q) => {

    const exists =
      selectedQuestions.find(
        (item) => item._id === q._id
      );

    // remove
    if (exists) {

      setSelectedQuestions(

        selectedQuestions.filter(
          (item) => item._id !== q._id
        )
      );

      return;
    }

    // limit
    if (
      selectedQuestions.length >=
      Number(examData.marks)
    ) {

      alert(
        `সর্বোচ্চ ${examData.marks} টি প্রশ্ন নির্বাচন করা যাবে`
      );

      return;
    }

    // add
    setSelectedQuestions([
      ...selectedQuestions,
      q
    ]);
  };

  // ==============================
  // CREATE EXAM
  // ==============================
  const createExam = async () => {

    if (
      selectedQuestions.length === 0
    ) {

      return alert(
        "প্রশ্ন নির্বাচন করুন"
      );
    }

    const res = await fetch(
      `${API}/api/exams/create`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          title: examData.title,

          academy:
            examData.academy,

          className:
            examData.className,

          subject:
            examData.subject,

          duration:
            examData.duration,

          marks:
            examData.marks,

          questions:
            selectedQuestions
        })
      }
    );

    const data = await res.json();

    setExamCode(data.examCode);

    alert("Exam Created");
  };

  // ==============================
  // COPY LINK
  // ==============================
  const copyLink = () => {

    navigator.clipboard.writeText(

      `${window.location.origin}/exam/${examCode}`
    );

    alert("Link Copied");
  };

  // ==============================
  // DOWNLOAD PDF
  // ==============================
  const downloadPDF = () => {

    const element =
      document.getElementById(
        "question-paper"
      );

    const total =
      selectedQuestions.length;

    let fontSize = "16px";

    if (total > 20)
      fontSize = "12px";

    if (total > 25)
      fontSize = "10px";

    element.style.fontSize =
      fontSize;

    html2pdf()
      .set({

        margin: [5, 5, 5, 5],

        filename:
          `${examData.title}.pdf`,

        image: {
          type: "jpeg",
          quality: 1
        },

        html2canvas: {
          scale: 2
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        }
      })
      .from(element)
      .save();
  };

  return (

    <div className="min-h-screen bg-gray-100 pb-20">

      {/* ==============================
          TOP NAV
      ============================== */}
      <div className="bg-white shadow-md py-5 px-6 flex justify-between items-center">

        <h1 className="text-4xl font-bold text-blue-900">
          📄 প্রশ্নব্যাংক
        </h1>

        <a
          href="/"
          className="
            bg-green-500
            hover:bg-green-600
            text-white
            px-6
            py-3
            rounded-xl
            font-bold
          "
        >
          মূল তালিকা
        </a>

      </div>

      {/* ==============================
          MAIN BOX
      ============================== */}
      <div className="max-w-7xl mx-auto bg-white mt-10 rounded-3xl shadow-lg p-10">

        {/* TITLE */}
        <h1 className="text-6xl font-bold text-center mb-16 text-slate-800">

          বেসিক তথ্য পূরণ করুন

        </h1>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* ACADEMY */}
          <div>

            <label className="font-bold text-3xl block mb-4">

              একাডেমি / কলেজের নাম

            </label>

            <input
              type="text"
              name="academy"
              value={examData.academy}
              onChange={handleChange}
              placeholder="যেমন: Saif Academy"
              className="
                w-full
                border
                rounded-2xl
                p-5
                text-2xl
              "
            />

          </div>

          {/* EXAM TITLE */}
          <div>

            <label className="font-bold text-3xl block mb-4">

              পরীক্ষার নাম

            </label>

            <input
              type="text"
              name="title"
              value={examData.title}
              onChange={handleChange}
              placeholder="যেমন: Model Test"
              className="
                w-full
                border
                rounded-2xl
                p-5
                text-2xl
              "
            />

          </div>

          {/* CLASS */}
          <div>

            <label className="font-bold text-3xl block mb-4">

              শ্রেণি

            </label>

            <select
              name="className"
              value={examData.className}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-2xl
                p-5
                text-2xl
                bg-white
              "
            >

              <option>১ম শ্রেণি</option>
              <option>২য় শ্রেণি</option>
              <option>৩য় শ্রেণি</option>
              <option>৪র্থ শ্রেণি</option>
              <option>৫ম শ্রেণি</option>
              <option>৬ষ্ঠ শ্রেণি</option>
              <option>৭ম শ্রেণি</option>
              <option>৮ম শ্রেণি</option>
              <option>৯ম শ্রেণি</option>
              <option>১০ম শ্রেণি</option>
              <option>একাদশ</option>
              <option>দ্বাদশ</option>
              <option>একাদশ-দ্বাদশ</option>

            </select>

          </div>

          {/* SUBJECT */}
          <div>

            <label className="font-bold text-3xl block mb-4">

              বিষয়

            </label>

            <select
              name="subject"
              value={examData.subject}
              onChange={(e) => {

                handleChange(e);

                setChapter("");
              }}
              className="
                w-full
                border
                rounded-2xl
                p-5
                text-2xl
                bg-white
              "
            >

              <option value="">
                বিষয় নির্বাচন করুন
              </option>

              {Object.keys(SUBJECTS).map(
                (sub) => (

                  <option
                    key={sub}
                    value={sub}
                  >
                    {sub}
                  </option>

                )
              )}

            </select>

          </div>

          {/* CHAPTER */}
          <div>

            <label className="font-bold text-3xl block mb-4">

              অধ্যায়

            </label>

            <select
              value={chapter}
              onChange={(e) =>
                setChapter(
                  e.target.value
                )
              }
              className="
                w-full
                border
                rounded-2xl
                p-5
                text-2xl
                bg-white
              "
            >

              <option value="">
                অধ্যায় নির্বাচন করুন
              </option>

              {(
                SUBJECTS[
                  examData.subject
                ] || []
              ).map((chap) => (

                <option
                  key={chap}
                  value={chap}
                >
                  {chap}
                </option>

              ))}

            </select>

          </div>

          {/* MARKS */}
          <div>

            <label className="font-bold text-3xl block mb-4">

              প্রশ্ন সংখ্যা

            </label>

            <input
              type="number"
              name="marks"
              value={examData.marks}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-2xl
                p-5
                text-2xl
              "
            />

          </div>

          {/* DURATION */}
          <div>

            <label className="font-bold text-3xl block mb-4">

              সময় (মিনিট)

            </label>

            <input
              type="number"
              name="duration"
              value={examData.duration}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-2xl
                p-5
                text-2xl
              "
            />

          </div>

        </div>

        {/* ==============================
            QUESTION LIST
        ============================== */}
        <div className="mt-16">

          <h2 className="text-4xl font-bold mb-10">

            প্রশ্ন সিলেক্ট করুন

          </h2>

          <div className="grid gap-6">

            {filteredQuestions.map(
              (q, index) => {

                const selected =
                  selectedQuestions.find(
                    (item) =>
                      item._id === q._id
                  );

                return (

                  <div
                    key={q._id}
                    onClick={() =>
                      toggleQuestion(q)
                    }
                    className={`
                      border-4
                      rounded-2xl
                      p-8
                      cursor-pointer
                      transition
                      ${
                        selected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >

                    <h3 className="text-3xl font-bold mb-6">

                      {index + 1}. {q.question}

                    </h3>

                    <div className="grid md:grid-cols-2 gap-4 text-2xl">

                      {q.options.map(
                        (opt, i) => (

                          <div
                            key={i}
                          >
                            {opt}
                          </div>

                        )
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* ==============================
            BUTTONS
        ============================== */}
        <div className="flex flex-wrap justify-center gap-6 mt-16">

          <button
            onClick={createExam}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-10
              py-5
              rounded-2xl
              text-2xl
              font-bold
            "
          >
            Create Exam
          </button>

          <button
            onClick={downloadPDF}
            className="
              bg-red-500
              hover:bg-red-600
              text-white
              px-10
              py-5
              rounded-2xl
              text-2xl
              font-bold
            "
          >
            Download PDF
          </button>

        </div>

        {/* ==============================
            STUDENT LINK
        ============================== */}
        {examCode && (

          <div className="bg-white rounded-2xl shadow-lg p-8 mt-16">

            <h2 className="text-4xl font-bold mb-8 text-center">

              Student Link

            </h2>

            {/* LINK */}
            <div className="
              bg-gray-100
              p-6
              rounded-2xl
              break-all
              text-2xl
              text-center
              mb-8
            ">

              {window.location.origin}/exam/{examCode}

            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap justify-center gap-6">

              {/* COPY */}
              <button
                onClick={copyLink}
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-10
                  py-4
                  rounded-2xl
                  text-2xl
                  font-bold
                "
              >
                Copy Link
              </button>

              {/* RANKING */}
              <a
                href={`/ranking/${examCode}`}
                target="_blank"
                rel="noreferrer"
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  text-white
                  px-10
                  py-4
                  rounded-2xl
                  text-2xl
                  font-bold
                "
              >
                🏆 View Ranking
              </a>

            </div>

          </div>
        )}

        {/* ==============================
            PDF PAPER
        ============================== */}
        <div
          id="question-paper"
          className="bg-white mt-20 p-10"
        >

          <h1 className="text-5xl font-bold text-center mb-6">

            {examData.subject}

          </h1>

          <h2 className="text-4xl font-bold text-center mb-4">

            {examData.academy}

          </h2>

          <h3 className="text-3xl text-center mb-10">

            {examData.title}

          </h3>

          <div className="flex justify-between mb-12 text-2xl">

            <div>
              সময়: {examData.duration} মিনিট
            </div>

            <div>
              পূর্ণমান: {examData.marks}
            </div>

          </div>

          <div className="grid grid-cols-2 gap-10">

            {selectedQuestions.map(
              (q, index) => (

                <div
                  key={q._id}
                  className="mb-10 break-inside-avoid"
                >

                  <h3 className="font-bold mb-4">

                    {index + 1}. {q.question}

                  </h3>

                  <div className="grid grid-cols-2 gap-3">

                    {q.options.map(
                      (opt, i) => (

                        <div key={i}>
                          {opt}
                        </div>

                      )
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Builder;