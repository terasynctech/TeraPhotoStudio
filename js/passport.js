// =========================================
// TeraPhotoStudio Passport Module
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
        img.id = "previewImage";

        img.style.maxWidth = "350px";
        img.style.maxHeight = "450px";

        preview.appendChild(img);

    };

    reader.readAsDataURL(file);

});

// PRINT BUTTON

document.getElementById("printBtn").addEventListener("click", function(){

    window.print();

});
