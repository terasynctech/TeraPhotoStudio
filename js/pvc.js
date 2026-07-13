// ==========================================
// TeraPhotoStudio Professional v5.0
// PVC Card Studio
// Part 1 - Initialization
// ==========================================

// Upload Controls
const frontUpload = document.getElementById("frontUpload");
const backUpload = document.getElementById("backUpload");

// Buttons
const cropFrontBtn = document.getElementById("cropFrontBtn");
const cropBackBtn = document.getElementById("cropBackBtn");

const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const printBtn = document.getElementById("printBtn");

// Preview
const frontPreview = document.getElementById("frontPreview");
const backPreview = document.getElementById("backPreview");

// Canvas
const pvcCanvas = document.getElementById("pvcCanvas");
const ctx = pvcCanvas.getContext("2d");

// Canvas Size
pvcCanvas.width = 1016;
pvcCanvas.height = 638;

// Variables
let frontCropper = null;
let backCropper = null;

let frontImage = "";
let backImage = "";

function clearCanvas(){

    ctx.fillStyle="#ffffff";
    ctx.fillRect(
        0,
        0,
        pvcCanvas.width,
        pvcCanvas.height
    );

}

clearCanvas();

console.log("PVC Studio Loaded");
// ==========================================
// PART 2
// Upload Front
// ==========================================

frontUpload.addEventListener("change",function(e){

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=function(event){

        frontImage=event.target.result;

        frontPreview.innerHTML="";

        const img=document.createElement("img");

        img.id="frontCropImage";
        img.src=frontImage;

        img.style.width="100%";
        img.style.display="block";

        frontPreview.appendChild(img);

        if(frontCropper){

            frontCropper.destroy();

        }

        frontCropper=new Cropper(img,{

            aspectRatio:86/54,

            viewMode:1,

            autoCropArea:1,

            movable:true,

            zoomable:true,

            rotatable:true,

            scalable:true,

            responsive:true,

            guides:true,

            background:false

        });

    };

    reader.readAsDataURL(file);

});
// ==========================================
// PART 3
// Upload Back
// ==========================================

backUpload.addEventListener("change",function(e){

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=function(event){

        backImage=event.target.result;

        backPreview.innerHTML="";

        const img=document.createElement("img");

        img.id="backCropImage";
        img.src=backImage;

        img.style.width="100%";
        img.style.display="block";

        backPreview.appendChild(img);

        if(backCropper){

            backCropper.destroy();

        }

        backCropper=new Cropper(img,{

            aspectRatio:86/54,

            viewMode:1,

            autoCropArea:1,

            movable:true,

            zoomable:true,

            rotatable:true,

            scalable:true,

            responsive:true,

            guides:true,

            background:false

        });

    };

    reader.readAsDataURL(file);

});
// ==========================================
// PART 4
// Crop Front
// ==========================================

cropFrontBtn.addEventListener("click", function () {

    if (!frontCropper) {
        alert("Please upload Front Scan first.");
        return;
    }

    const canvas = frontCropper.getCroppedCanvas({

        width: 1016,
        height: 638,

        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high"

    });

    frontImage = canvas.toDataURL("image/png");

    frontPreview.innerHTML = "";

    const img = document.createElement("img");

    img.src = frontImage;
    img.style.width = "100%";

    frontPreview.appendChild(img);

});


// ==========================================
// Crop Back
// ==========================================

cropBackBtn.addEventListener("click", function () {

    if (!backCropper) {
        alert("Please upload Back Scan first.");
        return;
    }

    const canvas = backCropper.getCroppedCanvas({

        width: 1016,
        height: 638,

        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high"

    });

    backImage = canvas.toDataURL("image/png");

    backPreview.innerHTML = "";

    const img = document.createElement("img");

    img.src = backImage;
    img.style.width = "100%";

    backPreview.appendChild(img);

});
