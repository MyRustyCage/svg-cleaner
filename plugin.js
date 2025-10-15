// plugin.js - SVG Cleaner Test Plugin (Fixed Upload Handling)
console.log("[SVG Test] Loading...");

penpot.ui.open("SVG Cleaner Test", "./svg-cleaner/ui.html", {
  width: 500,
  height: 700,
});
console.log("[SVG Test] UI opened");

function sendToUI(type, detail) {
  console.log(`[SVG Test → UI] ${type}:`, detail);
  try {
    penpot.ui.sendMessage({ type, detail });
  } catch (e) {
    console.error("[SVG Test] sendToUI error:", e);
  }
}

// Manual string to Uint8Array conversion (UTF-8)
function stringToUint8Array(str) {
  // Proper UTF-8 encoding
  const utf8 = unescape(encodeURIComponent(str));
  const len = utf8.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = utf8.charCodeAt(i);
  }
  return bytes;
}

async function importSVG(svgString) {
  console.log("[SVG Test] Importing SVG, length:", svgString.length);
  console.log("[SVG Test] SVG content:", svgString.substring(0, 200) + "...");

  try {
    // Convert SVG string to Uint8Array with proper UTF-8 encoding
    const uint8 = stringToUint8Array(svgString);
    console.log("[SVG Test] Encoded to Uint8Array:", uint8.byteLength, "bytes");

    // Upload as SVG
    console.log("[SVG Test] Calling uploadMediaData...");
    const svgMedia = await penpot.uploadMediaData(
      "image",
      uint8,
      "image/svg+xml"
    );
    console.log("[SVG Test] Upload response:", svgMedia);
    console.log("[SVG Test] Upload response keys:", Object.keys(svgMedia));

    // Check if upload was successful
    if (!svgMedia || !svgMedia.id) {
      console.error("[SVG Test] Upload failed - no ID in response:", svgMedia);
      throw new Error(
        "SVG upload failed - no media ID returned. Penpot may not support SVG fills."
      );
    }

    console.log("[SVG Test] Upload success with ID:", svgMedia.id);

    // Create rectangle with SVG fill
    console.log("[SVG Test] Creating shape...");
    const rect = penpot.createRectangle();
    rect.resize(800, 600);
    rect.x = 100;
    rect.y = 100;

    console.log("[SVG Test] Applying fill with media:", svgMedia);
    rect.fills = [{ fillOpacity: 1, fillImage: svgMedia }];

    console.log("[SVG Test] Shape created");

    sendToUI("import-success", "SVG imported successfully!");
    console.log("[SVG Test] Import complete");
  } catch (err) {
    console.error("[SVG Test] ERROR:", err);
    console.error("[SVG Test] Stack:", err.stack);

    // More detailed error message
    let errorMsg = `Upload failed: ${err.message || err}`;
    if (err.message && err.message.includes("no media ID")) {
      errorMsg +=
        "\n\nNote: Penpot may not support SVG images as fills. Try converting to PNG first.";
    }

    sendToUI("import-error", errorMsg);
  }
}

penpot.ui.onMessage((message) => {
  console.log("[SVG Test] Received message:", message);
  const msg = message.pluginMessage || message;

  if (msg.type === "import-svg") {
    console.log("[SVG Test] Processing SVG import");
    importSVG(msg.svgString);
  }
});

console.log("[SVG Test] Ready");
