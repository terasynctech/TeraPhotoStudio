// =========================================
// TeraPhotoStudio Passport Module
// Developed by Terasync Tech
// =========================================

const upload = document.getElementById("upload");
const preview = document.getElementById("preview");

upload.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        preview.innerHTML = "";

        const img = document.createElement("img");

        img.src = e.target.result;

        img.style.maxWidth = "350px";
        img.style.maxHeight = "450px";
        img.style.border = "2px solid #0d6efd";
        img.style.borderRadius = "8px";

        preview.appendChild(img);

    };

    reader.readAsDataURL(file);

});
