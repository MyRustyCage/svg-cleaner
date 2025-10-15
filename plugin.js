// plugin.js - SVG Cleaner Test Plugin (PNG conversion)
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

async function importPNG(imageDataArray, width, height) {
  console.log("[SVG Test] Importing PNG, length:", imageDataArray.length);
  console.log("[SVG Test] Dimensions:", width, "x", height);

  try {
    // Convert Array back to Uint8Array
    const uint8 = new Uint8Array(imageDataArray);
    console.log("[SVG Test] Uint8Array created:", uint8.byteLength, "bytes");

    // Upload as PNG
    console.log("[SVG Test] Calling uploadMediaData...");
    const imageMedia = await penpot.uploadMediaData(
      "image",
      uint8,
      "image/png"
    );
    console.log("[SVG Test] Upload response:", imageMedia);

    if (!imageMedia || !imageMedia.id) {
      throw new Error("PNG upload failed - no media ID returned");
    }

    console.log("[SVG Test] Upload success with ID:", imageMedia.id);

    // Create rectangle with image fill
    console.log("[SVG Test] Creating shape...");
    const rect = penpot.createRectangle();
    rect.resize(width, height);
    rect.x = 100;
    rect.y = 100;
    rect.fills = [{ fillOpacity: 1, fillImage: imageMedia }];
    console.log("[SVG Test] Shape created");

    sendToUI("import-success", "SVG imported successfully (as PNG)!");
    console.log("[SVG Test] Import complete");
  } catch (err) {
    console.error("[SVG Test] ERROR:", err);
    console.error("[SVG Test] Stack:", err.stack);
    sendToUI("import-error", `Upload failed: ${err.message || err}`);
  }
}

penpot.ui.onMessage((message) => {
  console.log("[SVG Test] Received message:", message);
  const msg = message.pluginMessage || message;

  if (msg.type === "import-png") {
    console.log("[SVG Test] Processing PNG import");
    importPNG(msg.imageData, msg.width, msg.height);
  }
});

console.log("[SVG Test] Ready");
