(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const fileInput = $('file');
  const photoArea = $('photoArea');
  const cropBox = $('cropBox');
  const status = $('status');
  const preview = $('preview');
  const sizeSelect = $('size');
  const copiesSelect = $('copies');
  const bgSelect = $('bg');
  const customColor = $('custom');
  const paperTypeSelect = $('paperType');
  const printQualitySelect = $('printQuality');

  // Validate that this script and passport.html are from the same release.
  // A mismatched old HTML file previously caused null.addEventListener and stopped all photo tools.
  const requiredIds = ['file','photoArea','cropBox','status','preview','size','copies','bg','custom','paperType','cropBtn','applyBtn','generate','print','pdf','newBtn','reset'];
  const missingIds = requiredIds.filter(id => !$(id));
  if (missingIds.length) {
    const message = 'TeraPhotoStudio files do not match. Missing page elements: ' + missingIds.join(', ') + '. Replace passport.html and the js folder together, then refresh with Ctrl+F5.';
    const statusEl = $('status');
    if (statusEl) { statusEl.textContent = message; statusEl.className = 'status err'; }
    console.error(message);
    return;
  }

  let sourceImage = null;
  let workingCanvas = null;
  let pages = [];
  let cropMode = false;
  let dragging = false;
  let resizing = false;
  let dragStart = null;

  function setStatus(text, type) {
    status.textContent = text;
    status.className = 'status' + (type ? ' ' + type : '');
  }

  function canvasFromImage(img) {
    // Limit working resolution to prevent memory exhaustion with large phone photos.
    // Keep the full aspect ratio and enough pixels for normal passport-photo printing.
    const maxSide = 5000;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    c.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Your browser could not create an image canvas. Please use Chrome or Edge.');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  function showCanvas(c) {
    photoArea.querySelectorAll('img.previewPhoto,canvas.previewPhoto').forEach(n => n.remove());
    const hint = photoArea.querySelector('.hint');
    if (hint) hint.style.display = 'none';
    const display = document.createElement('img');
    display.className = 'previewPhoto';
    display.alt = 'Selected photo preview';
    display.style.maxWidth = '100%';
    display.style.maxHeight = '100%';
    display.style.width = 'auto';
    display.style.height = 'auto';
    display.style.objectFit = 'contain';
    display.style.position = 'relative';
    display.style.zIndex = '0';
    display.onload = function () {
      photoArea.dataset.photoLoaded = 'true';
      setStatus('Photo displayed. Click Crop, then Apply Crop and Generate Sheet.', 'ok');
    };
    display.onerror = function () {
      setStatus('The image preview failed. Try saving the picture as JPG or PNG and selecting it again.', 'err');
    };
    try {
      display.src = c.toDataURL('image/jpeg', 0.95);
      photoArea.prepend(display);
    } catch (err) {
      setStatus('Could not prepare this image for preview: ' + (err.message || err), 'err');
      throw err;
    }
  }

  function resetCropBox() {
    cropBox.style.display = 'none';
    cropMode = false;
  }

  fileInput.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.type || '') && !/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name || '')) {
      setStatus('Please select a JPG, JPEG or PNG image.', 'err');
      return;
    }
    setStatus('Reading selected photo…', 'ok');
    try {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        try {
          if (!img.naturalWidth || !img.naturalHeight) throw new Error('The image has no readable dimensions.');
          sourceImage = img;
          workingCanvas = canvasFromImage(img);
          showCanvas(workingCanvas);
          resetCropBox();
          preview.innerHTML = '<span class="hint">Click Generate Sheet to create the A4 photo-only sheet.</span>';
          pages = [];
          URL.revokeObjectURL(objectUrl);
        } catch (err) {
          console.error('TeraPhotoStudio image processing error:', err);
          setStatus('Photo selected, but the browser could not process it: ' + (err.message || err) + '. Try a smaller JPG or PNG.', 'err');
          URL.revokeObjectURL(objectUrl);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        setStatus('The selected file could not be decoded. Open it in Paint and save as JPG, then try again.', 'err');
      };
      img.src = objectUrl;
    } catch (err) {
      console.error('TeraPhotoStudio file selection error:', err);
      setStatus('Could not open this photo: ' + (err.message || err), 'err');
    }
  });

  $('cropBtn').addEventListener('click', function () {
    if (!workingCanvas) { setStatus('Select a photo first.', 'err'); return; }
    cropMode = true;
    const area = photoArea.getBoundingClientRect();
    const displayedPhoto = photoArea.querySelector('.previewPhoto');
    if (!displayedPhoto) { setStatus('The photo preview is not ready yet. Please select the photo again.', 'err'); return; }
    const imageRect = displayedPhoto.getBoundingClientRect();
    const w = Math.min(imageRect.width * 0.72, 300);
    const h = Math.min(imageRect.height * 0.72, 360);
    cropBox.style.display = 'block';
    cropBox.style.left = (imageRect.left - area.left + (imageRect.width - w) / 2) + 'px';
    cropBox.style.top = (imageRect.top - area.top + (imageRect.height - h) / 2) + 'px';
    cropBox.style.width = w + 'px';
    cropBox.style.height = h + 'px';
    setStatus('Drag the blue crop box. Use the blue corner to resize, then click Apply Crop.', 'ok');
  });

  function pointerPosition(e) {
    const r = photoArea.getBoundingClientRect();
    return { x: Math.max(0, Math.min(r.width, (e.clientX || e.touches?.[0]?.clientX) - r.left)),
             y: Math.max(0, Math.min(r.height, (e.clientY || e.touches?.[0]?.clientY) - r.top)) };
  }

  cropBox.addEventListener('pointerdown', function (e) {
    if (!cropMode) return;
    e.preventDefault();
    const handle = e.target.classList.contains('handle');
    const r = cropBox.getBoundingClientRect();
    const ar = photoArea.getBoundingClientRect();
    dragging = !handle;
    resizing = handle;
    dragStart = { px: e.clientX, py: e.clientY, left: r.left - ar.left, top: r.top - ar.top, width: r.width, height: r.height };
    cropBox.setPointerCapture(e.pointerId);
  });

  cropBox.addEventListener('pointermove', function (e) {
    if ((!dragging && !resizing) || !dragStart) return;
    const ar = photoArea.getBoundingClientRect();
    const dx = e.clientX - dragStart.px;
    const dy = e.clientY - dragStart.py;
    if (dragging) {
      const left = Math.max(0, Math.min(ar.width - dragStart.width, dragStart.left + dx));
      const top = Math.max(0, Math.min(ar.height - dragStart.height, dragStart.top + dy));
      cropBox.style.left = left + 'px';
      cropBox.style.top = top + 'px';
    } else {
      const width = Math.max(60, Math.min(ar.width - dragStart.left, dragStart.width + dx));
      const height = Math.max(60, Math.min(ar.height - dragStart.top, dragStart.height + dy));
      cropBox.style.width = width + 'px';
      cropBox.style.height = height + 'px';
    }
  });

  function stopPointer() { dragging = false; resizing = false; dragStart = null; }
  cropBox.addEventListener('pointerup', stopPointer);
  cropBox.addEventListener('pointercancel', stopPointer);

  $('applyBtn').addEventListener('click', function () {
    if (!workingCanvas) { setStatus('Select a photo first.', 'err'); return; }
    if (!cropMode) { setStatus('Click Crop first and select the area.', 'err'); return; }
    const displayCanvas = photoArea.querySelector('.previewPhoto');
    if (!displayCanvas) { setStatus('Photo preview is missing. Please select the photo again.', 'err'); return; }
    const imageRect = displayCanvas.getBoundingClientRect();
    const box = cropBox.getBoundingClientRect();
    const sx = Math.max(0, (box.left - imageRect.left) / imageRect.width * workingCanvas.width);
    const sy = Math.max(0, (box.top - imageRect.top) / imageRect.height * workingCanvas.height);
    const sw = Math.min(workingCanvas.width - sx, box.width / imageRect.width * workingCanvas.width);
    const sh = Math.min(workingCanvas.height - sy, box.height / imageRect.height * workingCanvas.height);
    if (sw < 10 || sh < 10) { setStatus('Crop area is too small.', 'err'); return; }
    const c = document.createElement('canvas');
    c.width = Math.round(sw); c.height = Math.round(sh);
    c.getContext('2d').drawImage(workingCanvas, sx, sy, sw, sh, 0, 0, c.width, c.height);
    workingCanvas = c;
    showCanvas(workingCanvas);
    resetCropBox();
    setStatus('Crop applied. Choose the background and Generate Sheet.', 'ok');
  });

  function selectedBackground() {
    return bgSelect.value === 'custom' ? customColor.value : bgSelect.value;
  }

  function replaceBackground(canvas, color) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data, w = canvas.width, h = canvas.height;
    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let head = 0, tail = 0;
    const seeds = [];
    for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 80))) { seeds.push(x); seeds.push((h - 1) * w + x); }
    for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 80))) { seeds.push(y * w); seeds.push(y * w + (w - 1)); }
    function luminance(idx) { return (d[idx] * 0.299 + d[idx+1] * 0.587 + d[idx+2] * 0.114); }
    const cornerLum = [];
    for (const p of seeds.slice(0, Math.min(seeds.length, 20))) cornerLum.push(luminance(p * 4));
    const base = cornerLum.reduce((a,b) => a+b, 0) / cornerLum.length;
    const threshold = 48;
    seeds.forEach(p => { if (!visited[p]) { visited[p] = 1; queue[tail++] = p; } });
    const hex = color.replace('#','');
    const tr = parseInt(hex.slice(0,2),16), tg = parseInt(hex.slice(2,4),16), tb = parseInt(hex.slice(4,6),16);
    while (head < tail) {
      const p = queue[head++], i = p * 4;
      const lum = luminance(i);
      const colorDist = Math.sqrt((d[i]-d[seeds[0]*4])**2 + (d[i+1]-d[seeds[0]*4+1])**2 + (d[i+2]-d[seeds[0]*4+2])**2);
      if (Math.abs(lum - base) > threshold && colorDist > 75) continue;
      d[i] = tr; d[i+1] = tg; d[i+2] = tb;
      const x = p % w, y = Math.floor(p / w);
      const ns = [p-1,p+1,p-w,p+w];
      if (x === 0) ns[0] = -1; if (x === w-1) ns[1] = -1; if (y === 0) ns[2] = -1; if (y === h-1) ns[3] = -1;
      for (const n of ns) if (n >= 0 && !visited[n]) { visited[n] = 1; queue[tail++] = n; }
    }
    ctx.putImageData(img, 0, 0);
  }

  function photoDimensions() {
    const mm = sizeSelect.value === '35x45' ? [35,45] : sizeSelect.value === '25x35' ? [25,35] : [50.8,50.8];
    return { mmW:mm[0], mmH:mm[1], pxW:Math.round(mm[0] / 25.4 * 300), pxH:Math.round(mm[1] / 25.4 * 300) };
  }

  function makePhotoCanvas() {
    if (!workingCanvas) return null;
    const { pxW, pxH } = photoDimensions();
    const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
    const ctx = c.getContext('2d');
    ctx.fillStyle = selectedBackground(); ctx.fillRect(0,0,c.width,c.height);
    const srcRatio = workingCanvas.width / workingCanvas.height;
    const targetRatio = pxW / pxH;
    let sx=0, sy=0, sw=workingCanvas.width, sh=workingCanvas.height;
    if (srcRatio > targetRatio) { sw = workingCanvas.height * targetRatio; sx = (workingCanvas.width-sw)/2; }
    else { sh = workingCanvas.width / targetRatio; sy = (workingCanvas.height-sh)/2; }
    ctx.drawImage(workingCanvas, sx, sy, sw, sh, 0, 0, pxW, pxH);
    if (bgSelect.value !== '#ffffff' || selectedBackground() !== '#ffffff') {
      try { replaceBackground(c, selectedBackground()); } catch (e) { /* keep original if processing fails */ }
    }
    return c;
  }

  function makePages(photoCanvas, count) {
    const dpi = 300, A4W = 2480, A4H = 3508, gap = 24, margin = 60;
    const pages = [];
    let page = null, ctx = null, x = margin, y = margin, colW = 0;
    function newPage() { page = document.createElement('canvas'); page.width=A4W; page.height=A4H; ctx=page.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,A4W,A4H); x=margin; y=margin; colW=0; pages.push(page); }
    newPage();
    for (let n=0; n<count; n++) {
      if (x + photoCanvas.width > A4W - margin) { x=margin; y += colW + gap; colW=0; }
      if (y + photoCanvas.height > A4H - margin) newPage();
      ctx.drawImage(photoCanvas, x, y);
      x += photoCanvas.width + gap;
      colW = Math.max(colW, photoCanvas.height);
    }
    return pages;
  }

  $('generate').addEventListener('click', function () {
    if (!workingCanvas) { setStatus('Select a photo first.', 'err'); return; }
    try {
      const photo = makePhotoCanvas();
      pages = makePages(photo, parseInt(copiesSelect.value,10));
      preview.innerHTML = '';
      pages.forEach((p, i) => {
        const title = document.createElement('div'); title.className='hint'; title.textContent = pages.length > 1 ? 'A4 Page ' + (i+1) : '';
        const img = document.createElement('img'); img.src=p.toDataURL('image/jpeg',0.95); img.style.width='100%'; img.style.display='block'; img.style.background='#fff';
        const wrap=document.createElement('div'); wrap.className='page'; wrap.appendChild(img); preview.appendChild(title); preview.appendChild(wrap);
      });
      setStatus('A4 sheet generated with ' + copiesSelect.value + ' photo(s).', 'ok');
    } catch (e) { console.error(e); setStatus('Could not generate the sheet: ' + e.message, 'err'); }
  });

  $('print').addEventListener('click', function () {
    if (!pages.length) $('generate').click();
    if (!pages.length) return;
    const win = window.open('', '_blank');
    if (!win) { setStatus('Please allow pop-ups for Print Photos.', 'err'); return; }
    const paperType = paperTypeSelect ? paperTypeSelect.value : 'Photo Paper';
    const quality = printQualitySelect ? printQualitySelect.value : 'High / Best';
    win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>TeraPhotoStudio Print Sheet</title><style>@page{size:A4 portrait;margin:0}html,body{margin:0;padding:0;background:#fff}.print-help{font:14px Arial,sans-serif;padding:16px;background:#f2f6fc;border-bottom:1px solid #ccd5df;line-height:1.5}.page{width:210mm;height:297mm;page-break-after:always}.page:last-child{page-break-after:auto}.page img{width:210mm;height:297mm;display:block;object-fit:contain}@media print{.print-help{display:none}}</style></head><body><div class="print-help"><strong>TeraPhotoStudio print checklist</strong><br>Paper: ' + paperType + ' · Quality: ' + quality + ' · Output: A4 portrait at 300-DPI source resolution.<br>Open Printer Properties/Preferences and select the matching paper and quality. In browser print settings choose A4, Portrait, Scale 100% / Actual size, and turn off headers/footers. Then print.</div>');
    pages.forEach(p => { win.document.write('<div class="page"><img src="' + p.toDataURL('image/jpeg',0.98) + '"></div>'); });
    win.document.write('</body></html>'); win.document.close(); win.onload=function(){ win.focus(); setTimeout(()=>win.print(),350); };
    setStatus('Print sheet ready. Choose ' + paperType + ' and ' + quality + ' in Printer Properties, then print at A4 / 100% scale.', 'ok');
  });

  $('pdf').addEventListener('click', function () {
    if (!pages.length) $('generate').click();
    if (!pages.length) return;
    if (typeof window.jspdf === 'undefined') {
      setStatus('PDF library is loading. Please click PDF again in a moment.', 'err');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({orientation:'p',unit:'mm',format:'a4',compress:true});
    pages.forEach((p,i) => { if (i) doc.addPage(); doc.addImage(p.toDataURL('image/jpeg',0.96),'JPEG',0,0,210,297,undefined,'FAST'); });
    doc.save('passport-photos.pdf');
    setStatus('PDF generated. It contains photos only.', 'ok');
  });

  function newPhoto() {
    fileInput.value=''; sourceImage=null; workingCanvas=null; pages=[]; preview.innerHTML='<span class="hint">Generate the sheet to preview.</span>';
    photoArea.querySelectorAll('img.previewPhoto,canvas.previewPhoto').forEach(n=>n.remove()); const hint=photoArea.querySelector('.hint'); if(hint) hint.style.display=''; resetCropBox(); setStatus('Select a photo to begin.');
  }
  $('newBtn').addEventListener('click', newPhoto);
  $('reset').addEventListener('click', newPhoto);
  bgSelect.addEventListener('change', function(){ if (workingCanvas) setStatus('Background set to ' + (this.value==='custom' ? customColor.value : this.options[this.selectedIndex].text) + '. Generate the sheet to apply it.', 'ok'); });
  customColor.addEventListener('input', function(){ if (bgSelect.value==='custom' && workingCanvas) setStatus('Custom background selected. Generate the sheet to apply it.', 'ok'); });
  [paperTypeSelect, printQualitySelect].filter(Boolean).forEach(el => el.addEventListener('change', function(){ const paper = paperTypeSelect ? paperTypeSelect.value : 'Photo Paper'; const quality = printQualitySelect ? printQualitySelect.value : 'High / Best'; setStatus('Print preference selected: ' + paper + ', ' + quality + '. Remember to choose the same options in Printer Properties.', 'ok'); }));
})();
