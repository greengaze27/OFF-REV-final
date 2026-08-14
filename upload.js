async function uploadFile() {

    const fileInput = document.getElementById("reviewerFile");
    const message = document.getElementById("message");

    if (!fileInput) {
        console.error("File input not found.");
        return;
    }

    const file = fileInput.files[0];

    if (!file) {
        message.textContent =
            "⚠️ Please select a reviewer file first.";
        return;
    }

    const fileName = file.name.toLowerCase();

    try {

        message.textContent = "⏳ Reading file...";

        let text = "";


        // ==========================================
        // TXT
        // ==========================================

        if (fileName.endsWith(".txt")) {

            text = await file.text();

        }


        // ==========================================
        // CSV
        // ==========================================

        else if (fileName.endsWith(".csv")) {

            text = await file.text();

        }


        // ==========================================
        // DOCX
        // ==========================================

        else if (fileName.endsWith(".docx")) {

            if (typeof mammoth === "undefined") {

                throw new Error(
                    "DOCX reader is not loaded."
                );

            }

            const arrayBuffer =
                await file.arrayBuffer();

            const result =
                await mammoth.extractRawText({
                    arrayBuffer: arrayBuffer
                });

            text = result.value;

        }


        // ==========================================
        // PDF
        // ==========================================

       else if (fileName.endsWith(".pdf")) {

    message.textContent = "⏳ Reading PDF...";

    text = await readPDF(file);

    console.log("PDF text:", text);

}

        // ==========================================
        // UNSUPPORTED FILE
        // ==========================================

        else {

            throw new Error(
                "Unsupported file type."
            );

        }


        console.log(
            "OFF-REV extracted text:"
        );

        console.log(text);


        // ==========================================
        // PARSE FLASHCARDS
        // ==========================================

        const flashcards =
            parseFlashcards(text);


        console.log(
            "OFF-REV flashcards found:",
            flashcards.length
        );


        // ==========================================
        // NO FLASHCARDS
        // ==========================================

        if (flashcards.length === 0) {

            message.textContent =
                "❌ No valid flashcards found.";

            return;
        }


        // ==========================================
        // SAVE FLASHCARDS
        // ==========================================

        localStorage.setItem(
            "flashcards",
            JSON.stringify(flashcards)
        );

        localStorage.setItem(
            "uploadedFileName",
            file.name
        );


        // ==========================================
        // SUCCESS
        // ==========================================

        message.textContent =
            "✅ " +
            flashcards.length +
            " flashcards loaded successfully!";


        // ==========================================
        // OPEN FLASHCARD MODE
        // ==========================================

        setTimeout(function () {

            window.location.href =
                "flashcard.html";

        }, 500);

    }


    catch (error) {

        console.error(
            "OFF-REV Upload Error:",
            error
        );

        message.textContent =
            "❌ Unable to read the file.";

        console.error(
            "Error details:",
            error.message
        );

    }

}


/* ==========================================
   PDF READER
========================================== */
async function readPDF(file) {

    const pdfLibrary = window.pdfjsLib;

    if (!pdfLibrary) {
        throw new Error("PDF.js is not available.");
    }

    try {

        const arrayBuffer =
            await file.arrayBuffer();

        const pdf =
            await pdfLibrary.getDocument({
                data: new Uint8Array(arrayBuffer)
            }).promise;

        let text = "";

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(pageNumber);

            const content =
                await page.getTextContent();


            // Get PDF text items
            const items = content.items;


            // Reconstruct lines based on PDF positions
            let lines = [];
            let currentLine = [];
            let currentY = null;


            items.forEach(function(item) {

                const y = item.transform[5];


                if (
                    currentY !== null &&
                    Math.abs(currentY - y) > 5
                ) {

                    if (currentLine.length > 0) {

                        lines.push(
                            currentLine.join(" ")
                        );

                    }

                    currentLine = [];

                }


                currentLine.push(item.str);

                currentY = y;

            });


            if (currentLine.length > 0) {

                lines.push(
                    currentLine.join(" ")
                );

            }


            text +=
                lines.join("\n") +
                "\n";

        }


        console.log(
            "Extracted PDF text:",
            text
        );


        return text;

    }

    catch (error) {

        console.error(
            "PDF ERROR:",
            error
        );

        throw new Error(
            "PDF could not be read: " +
            error.message
        );

    }
}


/* ==========================================
   FLASHCARD PARSER
========================================== */

function parseFlashcards(text) {

    const lines =
        text.split(/\r?\n/);


    const flashcards = [];


    lines.forEach(function(line) {

        line = line.trim();


        if (line === "") {
            return;
        }


        let question = "";
        let answer = "";


        // ==================================
        // FORMAT:
        // Question | Answer
        // ==================================

        if (line.includes("|")) {

            const parts =
                line.split("|");


            question =
                parts[0].trim();


            answer =
                parts
                    .slice(1)
                    .join("|")
                    .trim();

        }


        // ==================================
        // FORMAT:
        // Question,Answer
        // ==================================

        else if (line.includes(",")) {

            const parts =
                parseCSVLine(line);


            if (parts.length >= 2) {

                question =
                    parts[0].trim();


                answer =
                    parts
                        .slice(1)
                        .join(",")
                        .trim();

            }

        }


        // ==================================
        // REMOVE QUOTATION MARKS
        // ==================================

        question =
            question
                .replace(/^"(.*)"$/, "$1")
                .trim();


        answer =
            answer
                .replace(/^"(.*)"$/, "$1")
                .trim();


        // ==================================
        // SKIP CSV HEADER
        // ==================================

        if (
            question.toLowerCase() === "question" &&
            answer.toLowerCase() === "answer"
        ) {

            return;

        }


        // ==================================
        // ADD FLASHCARD
        // ==================================

        if (
            question !== "" &&
            answer !== ""
        ) {

            flashcards.push({

                question: question,

                answer: answer

            });

        }

    });


    return flashcards;

}


/* ==========================================
   CSV LINE READER
   Handles:
   "Question","Answer"
========================================== */

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const character =
            line[i];


        // Quotation mark
        if (character === '"') {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                current += '"';

                i++;

            }

            else {

                insideQuotes =
                    !insideQuotes;

            }

        }


        // Comma outside quotes
        else if (
            character === "," &&
            !insideQuotes
        ) {

            result.push(current);

            current = "";

        }


        // Normal character
        else {

            current += character;

        }

    }


    result.push(current);


    return result;

}
