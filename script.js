const pdfInput = document.getElementById("pdfInput");
const quizDiv = document.getElementById("quiz");
const submitBtn = document.getElementById("submitBtn");

let questions = [];
let answers = {};

pdfInput.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str).join(" ");
      text += strings + "\n";
    }

    parseQuestions(text);
    renderQuiz();
  };
  reader.readAsArrayBuffer(file);
});

function parseQuestions(text) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  questions = [];

  for (let i = 0; i < lines.length; i += 5) {
    questions.push({
      question: lines[i],
      options: [
        lines[i + 1],
        lines[i + 2],
        lines[i + 3],
        lines[i + 4],
      ],
      correct: 0 // Default: first option correct
    });
  }
}

function renderQuiz() {
  quizDiv.innerHTML = "";
  submitBtn.style.display = "block";

  questions.forEach((q, qIndex) => {
    const qDiv = document.createElement("div");
    qDiv.className = "question";

    const qTitle = document.createElement("p");
    qTitle.innerHTML = `<b>Q${qIndex + 1}. ${q.question}</b>`;
    qDiv.appendChild(qTitle);

    q.options.forEach((opt, optIndex) => {
      const label = document.createElement("label");
      label.className = "option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "q" + qIndex;
      radio.addEventListener("change", () => {
        answers[qIndex] = optIndex;
      });

      label.appendChild(radio);
      label.append(" " + opt);
      qDiv.appendChild(label);
    });

    quizDiv.appendChild(qDiv);
  });
}

submitBtn.addEventListener("click", () => {
  document.querySelectorAll(".question").forEach((qDiv, qIndex) => {
    const opts = qDiv.querySelectorAll("label");

    opts.forEach((label, optIndex) => {
      if (optIndex === questions[qIndex].correct) {
        label.classList.add("correct");
      } else if (answers[qIndex] === optIndex) {
        label.classList.add("wrong");
      }
    });
  });
});
