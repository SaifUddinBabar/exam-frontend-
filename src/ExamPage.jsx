const downloadResult = async () => {
  const html2pdf = (await import("html2pdf.js")).default;
  const element = document.getElementById("result-sheet");

  if (!element) return;

  element.classList.add("pdf-mode");

  // Give the browser time to apply PDF styles
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    await html2pdf()
      .set({
        margin: [5, 5, 5, 5],

        filename: `${exam.title || "exam-result"}.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#f8fafc",
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.scrollWidth,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },

        // IMPORTANT:
        // Avoid "avoid-all" because it can create unnecessary blank pages.
        pagebreak: {
          mode: ["css", "legacy"],
          before: ".pdf-page-break",
          avoid: [".review-question"],
        },
      })
      .from(element)
      .save();

  } finally {
    element.classList.remove("pdf-mode");
  }
};