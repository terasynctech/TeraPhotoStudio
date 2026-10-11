# TeraPhotoStudio V3 — TeraSyncTech

Browser-based passport/visa photo sheet and PVC-card workflow. Photo preparation is handled locally in the browser.

## Updated in this package
- Print paper and quality preference selectors with clear printer-driver instructions.
- Print checklist in the print window: A4 portrait, 100% scale, matching photo paper, High/Best quality, headers/footers off.
- Open Graph and Twitter Card metadata plus a 1200×630 share-preview image for link previews.
- Branded home page text.

## Printing for Canon G2010 (and similar printers)
1. Generate the A4 sheet and click **Print Photos**.
2. In the browser print dialog, select the Canon printer, A4 paper, Portrait, 100% / Actual size, and disable headers/footers.
3. Open **Printer Properties / Preferences**. Select the exact media type matching your loaded paper (Glossy Photo Paper or Matte Photo Paper) and **High / Best** print quality.
4. Use suitable photo paper and follow its printable-side instructions. For best results, test one sheet first.

The app prepares its sheet at approximately 300-DPI A4 dimensions (2480×3508 pixels). Browser JavaScript cannot force the printer driver's media type or quality setting; those must be selected in the printer properties dialog. Actual output also depends on source photo quality, paper and printer settings.

## Photo selection fix and colourful dashboard\n- The home page now uses a colourful gradient hero and coloured workspace cards.\n- The photo upload control uses a transparent clickable input overlay, rather than `display:none`, to make selecting files more reliable in browsers.\n\n## GitHub Pages link preview
The page metadata points to `https://terasynctech.github.io/TeraPhotoStudio/assets/teraphotostudio-preview.jpg`. Commit and push the full folder, including the `assets` directory, to the repository's published branch. Social apps may cache previews; use their link-preview debugger/refresh option if an old thumbnail continues to appear.

## Offline note
The PDF button currently loads jsPDF from a CDN, so PDF export needs internet unless the library is bundled locally. Core photo sheet generation and browser printing run locally.
\n\n### If WhatsApp still does not show the preview image\nAfter committing all files, open the image URL directly in a browser and confirm it loads. Social apps may cache link previews, and a GitHub Pages website cannot force WhatsApp to refresh its cache. Test by sending the exact homepage URL to a new chat or use a link-preview debugger where available.\n