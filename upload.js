function uploadFile() {

    const fileInput = document.getElementById("reviewerFile");

    if (!fileInput) {
        alert("File input not found.");
        return;
    }

    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a TXT file first.");
        return;
    }

    
    if (!file.name.toLowerCase().endsWith(".txt")) {
        alert("Please select a .txt file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        const text = event.target.result;

        
        const lines = text.split(/\r?\n/);

        const flashcards = [];

        lines.forEach(function (line) {

            line = line.trim();

        
            if (line === "") {
                return;
            }

            const parts = line.split("|");

            if (parts.length >= 2) {

                const question = parts[0].trim();
                const answer = parts.slice(1).join("|").trim();

                if (question !== "" && answer !== "") {

                    flashcards.push({
                        question: question,
                        answer: answer
                    });

                }
            }

        });

        
        if (flashcards.length === 0) {

            alert(
                "No valid flashcards found.\n\n" +
                "Please make sure your TXT file uses this format:\n\n" +
                "Question | Answer"
            );

            return;
        }

        
        localStorage.setItem(
            "flashcards",
            JSON.stringify(flashcards)
        );

        
        localStorage.setItem(
            "uploadedFileName",
            file.name
        );

        alert(
            "TXT file successfully loaded!\n\n" +
            "File: " + file.name + "\n" +
            "Flashcards: " + flashcards.length
        );

        
        window.location.href = "flashcard.html";
    };

    reader.onerror = function () {

        alert("Unable to read the TXT file.");

    };

    reader.readAsText(file);
}
