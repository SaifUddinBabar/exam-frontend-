import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

// ==============================
// SUBJECT + CHAPTER DATA
// ==============================
const SUBJECTS = {

  "তথ্য ও যোগাযোগ প্রযুক্তি": [

    {
      label:
        "প্রথম অধ্যায় : তথ্য ও যোগাযোগ প্রযুক্তি",
      value: "ict"
    },

    {
      label:
        "দ্বিতীয় অধ্যায় : কমিউনিকেশন সিস্টেম",
      value: "communication"
    },

    {
      label:
        "তৃতীয় অধ্যায় : সংখ্যা পদ্ধতি",
      value: "number-system"
    },

    {
      label:
  "চতুর্থ অধ্যায় : ওয়েব ও HTML",
value:
  "Web & HTML"
    },

    {
      label:
  "পঞ্চম অধ্যায় : প্রোগ্রামিং ও ভাষা",
value:
  "Programming & Language"
    }

  ],

  "পদার্থবিজ্ঞান": [
    {
      label: "ভেক্টর",
      value: "vector"
    },
    {
      label: "নিউটনিয়ান বলবিদ্যা",
      value: "newton"
    }
  ],

  "রসায়ন": [
    {
      label: "পরমাণুর গঠন",
      value: "atom"
    },
    {
      label: "জৈব রসায়ন",
      value: "organic"
    }
  ],

  "জীববিজ্ঞান": [
    {
      label: "কোষ ও এর গঠন",
      value: "cell"
    },
    {
      label: "মানবদেহ",
      value: "human-body"
    }
  ]
};

function Builder() {

  // ==============================
  // STATES
  // ==============================
  const [questions, setQuestions] =
    useState([]);

  const [
    selectedQuestions,
    setSelectedQuestions
  ] = useState([]);

  const [chapter, setChapter] =
    useState("");

  const [examCode, setExamCode] =
    useState("");

  // ==============================
  // FORM DATA
  // ==============================
  const [examData, setExamData] =
    useState({

      academy: "",

      title: "",

      className: "একাদশ-দ্বাদশ",

      duration: "60",

      subject:
        "তথ্য ও যোগাযোগ প্রযুক্তি",

      marks: "20"
    });

  // ==============================
  // FETCH QUESTIONS
  // ==============================
useEffect(() => {

  if (!chapter) {

    setQuestions([]);

    return;
  }

  console.log(
    "Selected Chapter:",
    chapter
  );

  fetch(
    `${API}/api/questions?chapter=${encodeURIComponent(chapter)}`
  )
    .then((res) => res.json())
    .then((data) => {

      console.log(
        "Fetched Questions:",
        data
      );

      setQuestions(data || []);

    })
    .catch((err) => {

      console.log(err);

      setQuestions([]);

    });

}, [chapter]);
  // ==============================
  // HANDLE CHANGE
  // ==============================
  const handleChange = (e) => {

    setExamData({

      ...examData,

      [e.target.name]:
        e.target.value
    });
  };

  // ==============================
  // FILTER QUESTIONS
  // ==============================
const filteredQuestions =
  questions;

  // ==============================
  // SELECT QUESTION
  // ==============================
  const toggleQuestion = (q) => {

    const exists =
      selectedQuestions.find(
        (item) =>
          item._id === q._id
      );

    // REMOVE
    if (exists) {

      setSelectedQuestions(

        selectedQuestions.filter(
          (item) =>
            item._id !== q._id
        )
      );

      return;
    }

    // LIMIT
    if (
      selectedQuestions.length >=
      Number(examData.marks)
    ) {

      alert(
        `সর্বোচ্চ ${examData.marks} টি প্রশ্ন নির্বাচন করা যাবে`
      );

      return;
    }

    // ADD
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

    try {

      const res = await fetch(
        `${API}/api/exams/create`,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            title:
              examData.title,

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

      const data =
        await res.json();

      setExamCode(data.examCode);

      alert(
        "Exam Created Successfully"
      );

    } catch {

      alert("Create Failed");
    }
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
/* ==============================
   DOWNLOAD PDF
============================== */

const downloadPDF = () => {

  const element =
    document.getElementById(
      "question-paper"
    );

  html2pdf()
    .set({

      margin: [2, 2, 2, 2],

      filename:
        `${examData.title}.pdf`,

      image: {
        type: "jpeg",
        quality: 1
      },

      html2canvas: {

        scale: 3,

        useCORS: true

      },

      jsPDF: {

        unit: "mm",

        format: "a4",

        orientation:
          "portrait"

      }

    })
    .from(element)
    .save();
};

  return (

    <div className="min-h-screen bg-gray-100 pb-16">

      {/* ==============================
          TOPBAR
      ============================== */}
      <div className="bg-white shadow-sm border-b">

        <div className="
          max-w-7xl
          mx-auto
          px-4
          py-4
          flex
          justify-between
          items-center
        ">

          <h1 className="
            text-2xl
            md:text-4xl
            font-bold
            text-blue-900
          ">
            📄 প্রশ্নব্যাংক
          </h1>

          <a
            href="/"
            className="
              bg-green-500
              hover:bg-green-600
              text-white
              px-4
              md:px-6
              py-2
              md:py-3
              rounded-xl
              font-bold
              text-sm
              md:text-base
            "
          >
            মূল তালিকা
          </a>

        </div>

      </div>

      {/* ==============================
          MAIN BOX
      ============================== */}
      <div className="
        max-w-7xl
        mx-auto
        bg-white
        mt-6
        md:mt-10
        rounded-3xl
        shadow-lg
        p-4
        md:p-10
      ">

        {/* TITLE */}
        <h1 className="
          text-2xl
          md:text-5xl
          font-bold
          text-center
          mb-10
          md:mb-16
          text-slate-800
        ">

          বেসিক তথ্য পূরণ করুন

        </h1>

        {/* FORM GRID */}
        <div className="
          grid
          md:grid-cols-2
          gap-5
          md:gap-8
        ">

          {/* ACADEMY */}
          <div>

            <label className="
              font-bold
              text-lg
              md:text-2xl
              block
              mb-3
            ">
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
                p-3
                md:p-5
                text-base
                md:text-xl
              "
            />

          </div>

          {/* TITLE */}
          <div>

            <label className="
              font-bold
              text-lg
              md:text-2xl
              block
              mb-3
            ">
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
                p-3
                md:p-5
                text-base
                md:text-xl
              "
            />

          </div>

          {/* CLASS */}
          <div>

            <label className="
              font-bold
              text-lg
              md:text-2xl
              block
              mb-3
            ">
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
                p-3
                md:p-5
                text-base
                md:text-xl
                bg-white
              "
            >

              <option>
                ১ম শ্রেণি
              </option>

              <option>
                ২য় শ্রেণি
              </option>

              <option>
                ৩য় শ্রেণি
              </option>

              <option>
                ৪র্থ শ্রেণি
              </option>

              <option>
                ৫ম শ্রেণি
              </option>

              <option>
                ৬ষ্ঠ শ্রেণি
              </option>

              <option>
                ৭ম শ্রেণি
              </option>

              <option>
                ৮ম শ্রেণি
              </option>

              <option>
                ৯ম শ্রেণি
              </option>

              <option>
                ১০ম শ্রেণি
              </option>

              <option>
                একাদশ
              </option>

              <option>
                দ্বাদশ
              </option>

              <option>
                একাদশ-দ্বাদশ
              </option>

            </select>

          </div>

          {/* SUBJECT */}
          <div>

            <label className="
              font-bold
              text-lg
              md:text-2xl
              block
              mb-3
            ">
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
                p-3
                md:p-5
                text-base
                md:text-xl
                bg-white
              "
            >

              {Object.keys(
                SUBJECTS
              ).map((sub) => (

                <option
                  key={sub}
                  value={sub}
                >
                  {sub}
                </option>

              ))}

            </select>

          </div>

          {/* CHAPTER */}
          <div>

            <label className="
              font-bold
              text-lg
              md:text-2xl
              block
              mb-3
            ">
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
                p-3
                md:p-5
                text-base
                md:text-xl
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
                  key={chap.value}
                  value={chap.value}
                >
                  {chap.label}
                </option>

              ))}

            </select>

          </div>

          {/* QUESTION LIMIT */}
          <div>

            <label className="
              font-bold
              text-lg
              md:text-2xl
              block
              mb-3
            ">
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
                p-3
                md:p-5
                text-base
                md:text-xl
              "
            />

          </div>

          {/* DURATION */}
          <div>

            <label className="
              font-bold
              text-lg
              md:text-2xl
              block
              mb-3
            ">
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
                p-3
                md:p-5
                text-base
                md:text-xl
              "
            />

          </div>

        </div>

        {/* QUESTIONS */}
        <div className="mt-12">

          <h2 className="
            text-2xl
            md:text-4xl
            font-bold
            mb-8
          ">
            প্রশ্ন সিলেক্ট করুন
          </h2>

          <div className="grid gap-5">

            {filteredQuestions.map(
              (q, index) => {

                const selected =
                  selectedQuestions.find(
                    (item) =>
                      item._id ===
                      q._id
                  );

                return (

                  <div
                    key={q._id}
                    onClick={() =>
                      toggleQuestion(q)
                    }
                    className={`
                      border-2
                      rounded-2xl
                      p-4
                      md:p-6
                      cursor-pointer
                      transition

                      ${
                        selected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >

                    <h3 className="
                      text-lg
                      md:text-2xl
                      font-bold
                      mb-4
                      leading-relaxed
                    ">

                      {index + 1}.
                      {" "}
                      {q.question}

                    </h3>

                    <div className="
                      grid
                      md:grid-cols-2
                      gap-3
                      text-sm
                      md:text-lg
                    ">

                      {q.options.map(
                        (opt, i) => (

                          <div key={i}>
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

        {/* BUTTONS */}
        <div className="
          flex
          flex-wrap
          justify-center
          gap-4
          mt-12
        ">

          <button
            onClick={createExam}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-6
              md:px-10
              py-3
              md:py-5
              rounded-2xl
              text-base
              md:text-xl
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
              px-6
              md:px-10
              py-3
              md:py-5
              rounded-2xl
              text-base
              md:text-xl
              font-bold
            "
          >
            Download PDF
          </button>

        </div>

        {/* STUDENT LINK */}
        {examCode && (

          <div className="
            bg-white
            rounded-2xl
            shadow-lg
            p-5
            md:p-8
            mt-14
          ">

            <h2 className="
              text-2xl
              md:text-4xl
              font-bold
              mb-6
              text-center
            ">
              Student Link
            </h2>

            <div className="
              bg-gray-100
              p-4
              rounded-2xl
              break-all
              text-sm
              md:text-xl
              text-center
              mb-6
            ">

              {window.location.origin}
              /exam/
              {examCode}

            </div>

            <div className="
              flex
              flex-wrap
              justify-center
              gap-4
            ">

              <button
                onClick={copyLink}
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-6
                  md:px-10
                  py-3
                  rounded-2xl
                  text-base
                  md:text-xl
                  font-bold
                "
              >
                Copy Link
              </button>

              <a
                href={`/ranking/${examCode}`}
                target="_blank"
                rel="noreferrer"
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  text-white
                  px-6
                  md:px-10
                  py-3
                  rounded-2xl
                  text-base
                  md:text-xl
                  font-bold
                "
              >
                🏆 View Ranking
              </a>

            </div>

          </div>
        )}

        {/* PDF SECTION */}
        
   PDF SECTION
============================== */}

<div
  id="question-paper"
  className="
    bg-white
    mt-16
    w-[210mm]
    min-h-[297mm]
    mx-auto
    px-[10mm]
    py-[8mm]
    text-black
  "
>

  {/* SUBJECT */}
  <h1 className="
    text-[18px]
    font-bold
    text-center
    mb-2
  ">

    {examData.subject}

  </h1>

  {/* ACADEMY */}
  <h2 className="
    text-[15px]
    font-bold
    text-center
    mb-1
  ">

    {examData.academy}

  </h2>

  {/* EXAM TITLE */}
  <h3 className="
    text-[13px]
    font-semibold
    text-center
    mb-4
  ">

    {examData.title}

  </h3>

  {/* INFO BAR */}
  <div className="
    flex
    justify-between
    items-center
    border-y
    border-black
    py-2
    mb-4
    text-[11px]
    font-semibold
  ">

    <div>
      সময়:
      {" "}
      {examData.duration}
      {" "}
      মিনিট
    </div>

    <div>
      পূর্ণমান:
      {" "}
      {examData.marks}
    </div>

  </div>

  {/* QUESTIONS */}
  <div className="
    grid
    grid-cols-2
    gap-x-5
    gap-y-3
  ">

    {selectedQuestions.map(
      (q, index) => (

        <div
          key={q._id}
          className="
            break-inside-avoid
            page-break-inside-avoid
          "
        >

          {/* QUESTION */}
          <h3 className="
            font-semibold
            text-[11px]
            leading-[16px]
            mb-1
          ">

            {index + 1}.
            {" "}
            {q.question}

          </h3>

          {/* OPTIONS */}
          <div className="
            grid
            grid-cols-2
            gap-x-3
            gap-y-1
            pl-2
            text-[10px]
            leading-[14px]
          ">

            {q.options.map(
              (opt, i) => (

                <div
                  key={i}
                  className="
                    flex
                    items-start
                    gap-1
                  "
                >

                  <span>

                    {String.fromCharCode(
                      97 + i
                    )}

                    )

                  </span>

                  <span>
                    {opt}
                  </span>

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