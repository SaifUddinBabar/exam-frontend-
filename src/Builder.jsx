import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

function Builder() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [examCode, setExamCode] = useState("");

  const [examData, setExamData] = useState({
    academy: "",
    title: "",
    duration: "60",
    subject: "ICT",
    className: "HSC",
    version: "Bangla Medium",
    marks: "20"
  });

  // FETCH QUESTIONS
  useEffect(() => {
    if (!chapter) return;

    fetch(`${API}/api/questions?chapter=${encodeURIComponent(chapter)}`)
      .then((res) => res.json())
      .then((data) => setQuestions(data || []))
      .catch(() => setQuestions([]));

  }, [chapter]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setExamData({
      ...examData,
      [e.target.name]: e.target.value
    });

    if (e.target.name === "subject") {
      setChapter("");
    }
  };

  // SELECT QUESTION WITH LIMIT
  const toggleSelect = (id) => {

    // REMOVE
    if (selected.includes(id)) {
      setSelected((prev) =>
        prev.filter((q) => q !== id)
      );
      return;
    }

    // LIMIT
    const limit = Number(examData.marks);

    if (selected.length >= limit) {
      alert(
        `আপনি সর্বোচ্চ ${limit} টি প্রশ্ন সিলেক্ট করতে পারবেন`
      );
      return;
    }

    // ADD
    setSelected((prev) => [...prev, id]);
  };

  // CREATE EXAM
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

  // COPY LINK
  const copyLink = () => {

    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );

    alert("Link Copied");
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-20">

      {/* TOPBAR */}
      <div className="bg-white shadow-sm border-b">

        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">

          <h1 className="text-3xl font-bold text-[#0b2c6b]">
            📝 প্রশ্নব্যাংক
          </h1>

          <button className="bg-green-500 text-white px-5 py-2 rounded-xl">
            মূল তালিকা
          </button>

        </div>

      </div>

      {/* MAIN */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* FORM */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-10">

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
                placeholder="যেমন: রূপচাঁদা একাডেমি"
                value={examData.academy}
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg"
              />
            </div>

            {/* CLASS */}
            <div>
              <label className="font-semibold block mb-2 text-lg">
                শ্রেণী
              </label>

              <select
                name="className"
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg bg-white"
              >
                <option>HSC</option>
              </select>
            </div>

            {/* VERSION */}
            <div>
              <label className="font-semibold block mb-2 text-lg">
                ভার্সন
              </label>

              <select
                name="version"
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg bg-white"
              >
                <option>Bangla Medium</option>
              </select>
            </div>

            {/* SUBJECT */}
            <div>
              <label className="font-semibold block mb-2 text-lg">
                বিষয়
              </label>

              <select
                name="subject"
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg bg-white"
              >
                <option>ICT</option>
              </select>
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

            {/* EXAM NAME */}
            <div>
              <label className="font-semibold block mb-2 text-lg">
                পরীক্ষার নাম
              </label>

              <input
                type="text"
                name="title"
                placeholder="যেমন: HSC ICT Model Test"
                value={examData.title}
                onChange={handleChange}
                className="w-full border rounded-xl p-4 text-lg"
              />
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

        {/* QUESTION TITLE */}
        <div className="text-center mb-8">

          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            প্রশ্ন সিলেক্ট করুন
          </h2>

          <p className="text-gray-500 text-lg">
            প্রশ্নগুলো সিলেক্ট করে সাবমিট করলেই প্রশ্ন তৈরি হয়ে যাবে।
          </p>

          {/* SELECT COUNT */}
          <p className="text-green-600 text-2xl font-bold mt-4">
            Selected: {selected.length} / {examData.marks}
          </p>

        </div>

        {/* QUESTIONS */}
        <div className="space-y-5">

          {questions.map((q, i) => {

            const active = selected.includes(q._id);

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
                  {i + 1}. {q.question}
                </h2>

                {/* OPTIONS */}
                <div className="grid grid-cols-2 gap-y-5 gap-x-10 text-xl text-gray-700">

                  {q.options?.map((opt, index) => {

                    const labels = ["ক", "খ", "গ", "ঘ"];

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

        {/* SUBMIT */}
        <div className="flex justify-center mt-10">

          <button
            onClick={createExam}
            className="
              bg-green-500
              hover:bg-green-600
              text-white
              text-2xl
              font-bold
              px-12
              py-4
              rounded-2xl
              shadow-lg
              transition
            "
          >
            সাবমিট করুন
          </button>

        </div>

        {/* LINK */}
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

        {/* LIVE PREVIEW */}
        <div className="bg-white mt-16 rounded-2xl shadow-xl p-10">

          <h1 className="text-5xl font-bold text-center mb-10">
            {examData.academy}
          </h1>

          <div className="text-center mb-8 text-2xl">
            <p>শ্রেণী: {examData.className}</p>
            <p>বিষয়: {examData.subject}</p>
          </div>

          <div className="flex justify-between mb-10 text-xl">
            <p>সময়: {examData.duration} মিনিট</p>
            <p>পূর্ণমান: {examData.marks}</p>
          </div>

          <div className="space-y-10">

            {questions
              .filter((q) => selected.includes(q._id))
              .map((q, i) => (

                <div key={q._id}>

                  <h2 className="text-2xl font-semibold mb-5">
                    {i + 1}. {q.question}
                  </h2>

                  <div className="grid grid-cols-2 gap-y-4 text-xl">

                    {q.options?.map((opt, idx) => {

                      const labels = ["ক", "খ", "গ", "ঘ"];

                      return (
                        <div key={idx}>
                          {labels[idx]}. {opt}
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