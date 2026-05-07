import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

// ==============================
// API
// ==============================
const API = import.meta.env.VITE_API_URL;

function Builder() {

  // ==============================
  // STATES
  // ==============================
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [examCode, setExamCode] = useState("");

  // PDF compact mode
  const [pdfCompact, setPdfCompact] = useState(false);

  // ==============================
  // FORM DATA
  // ==============================
  const [examData, setExamData] = useState({
    academy: "",
    title: "",
    duration: "60",
    subject: "বাংলা প্রথম পত্র",
    marks: "20"
  });

  // ==============================
  // FETCH QUESTIONS
  // ==============================
  useEffect(() => {

    if (!chapter) return;

    fetch(
      `${API}/api/questions?chapter=${encodeURIComponent(chapter)}`
    )
      .then((res) => res.json())
      .then((data) => {

        setQuestions(data || []);

        // merge all chapter questions
        setAllQuestions((prev) => {

          const merged = [...prev];

          data.forEach((q) => {

            const exists = merged.find(
              (item) => item._id === q._id
            );

            if (!exists) {
              merged.push(q);
            }
          });

          return merged;
        });

      })
      .catch(() => setQuestions([]));

  }, [chapter]);

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleChange = (e) => {

    setExamData({
      ...examData,
      [e.target.name]: e.target.value
    });
  };

  // ==============================
  // SELECT QUESTION
  // ==============================
  const toggleSelect = (id) => {

    // remove
    if (selected.includes(id)) {

      setSelected((prev) =>
        prev.filter((q) => q !== id)
      );

      return;
    }

    // limit
    const limit = Number(examData.marks);

    if (selected.length >= limit) {

      alert(
        `আপনি সর্বোচ্চ ${limit} টি প্রশ্ন সিলেক্ট করতে পারবেন`
      );

      return;
    }

    // add
    setSelected((prev) => [...prev, id]);
  };

  // ==============================
  // CREATE EXAM
  // ==============================
  const createExam = async () => {

    if (!examData.academy) {
      return alert("একাডেমির নাম লিখুন");
    }

    if (!examData.title) {
      return alert("পরীক্ষার নাম লিখুন");
    }

    if (!chapter) {
      return alert("অধ্যায় নির্বাচন করুন");
    }

    if (selected.length === 0) {
      return alert("প্রশ্ন সিলেক্ট করুন");
    }

    try {

      const res = await fetch(`${API}/api/exams/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: examData.title,
          duration: examData.duration,
          questions: selected
        })
      });

      const data = await res.json();

      setExamCode(data.examCode);

      alert("Exam Created Successfully");

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
  // PDF DOWNLOAD
  // ==============================
  const downloadPDF = async () => {

    // compact mode
    if (selected.length > 20) {
      setPdfCompact(true);
    } else {
      setPdfCompact(false);
    }

    // wait render
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    const element =
      document.getElementById("question-paper");

    const options = {
      margin: 0.2,
      filename: `${examData.title || "question-paper"}.pdf`,
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
    };

    await html2pdf()
      .set(options)
      .from(element)
      .save();

    // restore
    setPdfCompact(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-20">

      {/* ==============================
          TOPBAR
      ============================== */}
      <div className="bg-white shadow-sm border-b">

        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">

          <h1 className="text-3xl font-bold text-[#0b2c6b]">
            📝 প্রশ্নব্যাংক
          </h1>

          <button className="bg-green-500 text-white px-5 py-2 rounded-xl">
            মূল তালিকা
          </button>

        </div>

      </div>

      {/* ==============================
          MAIN
      ============================== */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ==============================
            FORM
        ============================== */}
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-10">

          <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
            বেসিক তথ্য পূরণ করুন
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {/* ACADEMY */}
            <div>

              <label className="font-semibold block mb-2 text-lg">
                একাডেমি / কলেজের নাম
              </label>

              <input
                type="text"
                name="academy"
                placeholder="যেমন: Saif Academy"
                value={examData.academy}
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg"
              />

            </div>

            {/* EXAM TITLE */}
            <div>

              <label className="font-semibold block mb-2 text-lg">
                পরীক্ষার নাম
              </label>

              <input
                type="text"
                name="title"
                placeholder="যেমন: Model Test"
                value={examData.title}
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg"
              />

            </div>

            {/* SUBJECT */}
            <div>

              <label className="font-semibold block mb-2 text-lg">
                বিষয়
              </label>

              <input
                type="text"
                name="subject"
                value={examData.subject}
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg"
              />

            </div>

            {/* CHAPTER */}
            <div>

              <label className="font-semibold block mb-2 text-lg">
                অধ্যায়
              </label>

              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full border rounded-xl p-4 text-lg bg-white"
              >

                <option value="">
                  অধ্যায় নির্বাচন করুন
                </option>

                <option value="Introduction to ICT">
                  Chapter 1 - ICT Introduction
                </option>

                <option value="Communication Systems">
                  Chapter 2 - Communication Systems
                </option>

                <option value="Numbers & Digital Devices">
                  Chapter 3 - Number System
                </option>

                <option value="Web & HTML">
                  Chapter 4 - Web & HTML
                </option>

                <option value="Programming & Language">
                  Chapter 5 - Programming
                </option>

              </select>

            </div>

            {/* QUESTION LIMIT */}
            <div>

              <label className="font-semibold block mb-2 text-lg">
                প্রশ্ন সংখ্যা
              </label>

              <input
                type="number"
                name="marks"
                value={examData.marks}
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg"
              />

            </div>

            {/* TIME */}
            <div>

              <label className="font-semibold block mb-2 text-lg">
                সময় (মিনিট)
              </label>

              <input
                type="number"
                name="duration"
                value={examData.duration}
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg"
              />

            </div>

          </div>

        </div>

        {/* ==============================
            QUESTION TITLE
        ============================== */}
        <div className="text-center mb-8">

          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            প্রশ্ন সিলেক্ট করুন
          </h2>

          <p className="text-gray-500 text-lg">
            প্রশ্নগুলো সিলেক্ট করে সাবমিট করলেই প্রশ্ন তৈরি হয়ে যাবে।
          </p>

          <p className="text-green-600 text-2xl font-bold mt-4">
            Selected: {selected.length} / {examData.marks}
          </p>

        </div>

        {/* ==============================
            QUESTIONS UI
        ============================== */}
        <div className="space-y-5">

          {questions.map((q) => {

            const active =
              selected.includes(q._id);

            return (

              <div
                key={q._id}
                onClick={() => toggleSelect(q._id)}
                className={`
                  bg-white
                  rounded-2xl
                  border-2
                  cursor-pointer
                  transition-all
                  duration-300
                  p-6

                  ${active
                    ? "border-green-500 shadow-lg"
                    : "border-gray-200 hover:border-green-400"}
                `}
              >

                {/* QUESTION */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 leading-10">
                  {q.question}
                </h2>

                {/* OPTIONS */}
                <div className="grid grid-cols-2 gap-y-5 gap-x-10 text-xl text-gray-700">

                  {q.options?.map((opt, index) => {

                    const labels =
                      ["ক", "খ", "গ", "ঘ"];

                    return (
                      <div key={index}>
                        {labels[index]}. {opt}
                      </div>
                    );
                  })}

                </div>

              </div>
            );
          })}

        </div>

        {/* ==============================
            BUTTONS
        ============================== */}
        <div className="flex flex-wrap justify-center gap-5 mt-10">

          {/* CREATE */}
          <button
            onClick={createExam}
            className="
              bg-green-500
              hover:bg-green-600
              text-white
              text-xl
              font-bold
              px-10
              py-4
              rounded-2xl
              shadow-lg
            "
          >
            সাবমিট করুন
          </button>

          {/* PDF */}
          <button
            onClick={downloadPDF}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-xl
              font-bold
              px-10
              py-4
              rounded-2xl
              shadow-lg
            "
          >
            PDF Download
          </button>

        </div>

        {/* ==============================
            STUDENT LINK
        ============================== */}
        {examCode && (

          <div className="bg-white rounded-2xl shadow-lg p-8 mt-16">

            <h2 className="text-3xl font-bold mb-6 text-center">
              Student Link
            </h2>

            <div className="bg-gray-100 p-5 rounded-xl break-all text-lg text-center mb-6">
              {window.location.origin}/exam/{examCode}
            </div>

            <div className="flex justify-center">

              <button
                onClick={copyLink}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg"
              >
                Copy Link
              </button>

            </div>

          </div>
        )}

        {/* ==============================
            PRINTABLE QUESTION PAPER
        ============================== */}
        <div
          id="question-paper"
          className={`
            bg-white
            mt-10
            shadow-xl
            max-w-5xl
            mx-auto

            ${pdfCompact
              ? "p-3"
              : "p-6"}
          `}
        >

          {/* HEADER */}
          <div className="text-center border-b pb-3 mb-4">

            <div className="inline-block bg-black px-5 py-1 mb-2">

              <h1 className={`
                text-white
                font-bold

                ${pdfCompact
                  ? "text-base"
                  : "text-2xl"}
              `}>
                {examData.subject}
              </h1>

            </div>

            <h2 className={`
              font-bold

              ${pdfCompact
                ? "text-sm"
                : "text-xl"}
            `}>
              {examData.academy}
            </h2>

            <p className={`
              text-gray-700 mt-1

              ${pdfCompact
                ? "text-[10px]"
                : "text-sm"}
            `}>
              {examData.title}
            </p>

            {/* INFO */}
            <div className={`
              flex justify-between mt-3 border-t pt-2

              ${pdfCompact
                ? "text-[9px]"
                : "text-sm"}
            `}>

              <p>
                সময়: {examData.duration} মিনিট
              </p>

              <p>
                পূর্ণমান: {examData.marks}
              </p>

            </div>

          </div>

          {/* ==============================
              QUESTIONS PDF
          ============================== */}
          <div
            className={`
              columns-2

              ${pdfCompact
                ? "gap-4"
                : "gap-8"}
            `}
          >

            {allQuestions
              .filter((q) =>
                selected.includes(q._id)
              )
              .map((q, i) => (

                <div
                  key={q._id}
                  className={`
                    break-inside-avoid

                    ${pdfCompact
                      ? "mb-2"
                      : "mb-4"}
                  `}
                >

                  {/* QUESTION */}
                  <h2 className={`
                    font-bold
                    text-justify

                    ${pdfCompact
                      ? "text-[8px] leading-3 mb-[2px]"
                      : "text-[11px] leading-5 mb-1"}
                  `}>

                    {i + 1}. {q.question}

                  </h2>

                  {/* OPTIONS */}
                  <div className={`
                    grid grid-cols-2

                    ${pdfCompact
                      ? "gap-y-[1px] gap-x-2 text-[7px] leading-3"
                      : "gap-y-1 gap-x-4 text-[10px] leading-4"}
                  `}>

                    {q.options?.map((opt, idx) => {

                      const labels =
                        ["ক", "খ", "গ", "ঘ"];

                      return (

                        <div
                          key={idx}
                          className="flex items-start gap-1"
                        >

                          <span className="font-semibold">
                            {labels[idx]}.
                          </span>

                          <span>
                            {opt}
                          </span>

                        </div>
                      );
                    })}

                  </div>

                </div>
              ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Builder;