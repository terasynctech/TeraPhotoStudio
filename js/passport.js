// =========================================
// TeraPhotoStudio Passport Module
// Developed by Terasync Tech
// =========================================

const upload = document.getElementById("upload");
const preview = document.getElementById("preview");

let uploadedImage = "";

// ===============================
// Upload Photo
// ===============================

upload.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        uploadedImage = e.target.result;

        preview.innerHTML = "";

        const img = document.createElement("img");

        img.src = uploadedImage;
        img.id = "previewImage";

        img.style.maxWidth = "350px";
        img.style.maxHeight = "450px";

        preview.appendChild(img);

    };

    reader.readAsDataURL(file);

});


// ===============================
// Generate Passport Photos
// ===============================

document.getElementById("generateBtn").addEventListener("click", function () {

    if (uploadedImage === "") {

        alert("Please upload a photo first.");

        return;

    }

    preview.innerHTML = "";

    const sheet = document.createElement("div");
    sheet.className = "photoSheet";

    const copies = parseInt(document.getElementById("copies").value);
    const bgColor = document.getElementById("bgColor").value;

    for (let i = 0; i < copies; i++) {

        const box = document.createElement("div");
        box.className = "photoBox";
        box.style.backgroundColor = bgColor;

        const img = document.createElement("img");
        img.src = uploadedImage;

        box.appendChild(img);

        sheet.appendChild(box);

    }

    preview.appendChild(sheet);

});


// ===============================
// Download
// ===============================

document.getElementById("downloadBtn").addEventListener("click", function () {

    alert("Download feature will be implemented in the next step.");

});


// ===============================
// Print
// ===============================

document.getElementById("printBtn").addEventListener("click", function () {

    window.print();

});
