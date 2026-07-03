// =========================================
// TeraPhotoStudio Passport Module
// =========================================

const upload = document.getElementById("upload");
const preview = document.getElementById("preview");

let uploadedImage = "";

// Upload
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

// Generate

document.getElementById("generateBtn").onclick = function () {

    if (uploadedImage === "") {
        alert("Please upload a photo first.");
        return;
    }

    preview.innerHTML = "";

    const sheet = document.createElement("div");
    sheet.className = "photoSheet";

    for (let i = 0; i < 8; i++) {

        const photo = document.createElement("img");
        photo.src = uploadedImage;

        sheet.appendChild(photo);

    }

    preview.appendChild(sheet);

};

// Download

document.getElementById("downloadBtn").onclick = function () {

    alert("Download feature will be added in the next step.");

};

// Print

document.getElementById("printBtn").onclick = function () {

    window.print();

};
