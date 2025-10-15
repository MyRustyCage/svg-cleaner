// plugin.js - SVG Cleaner Test Plugin
console.log("[SVG Test] Loading...");

penpot.ui.open("SVG Cleaner Test", "./svg-cleaner-test/ui.html", {
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

async function importSVG(svgString) {
  console.log("[SVG Test] Importing SVG, length:", svgString.length);
  console.log("[SVG Test] SVG content:", svgString.substring(0, 200) + "...");

  try {
    // Convert SVG string to Uint8Array
    const encoder = new TextEncoder();
    const uint8 = encoder.encode(svgString);
    console.log("[SVG Test] Encoded to Uint8Array:", uint8.byteLength, "bytes");

    // Upload as SVG
    console.log("[SVG Test] Calling uploadMediaData...");
    const svgMedia = await penpot.uploadMediaData(
      "image",
      uint8,
      "image/svg+xml"
    );
    console.log("[SVG Test] Upload success:", svgMedia);

    // Create rectangle with SVG fill
    console.log("[SVG Test] Creating shape...");
    const rect = penpot.createRectangle();
    rect.resize(800, 600);
    rect.x = 100;
    rect.y = 100;
    rect.fills = [{ fillOpacity: 1, fillImage: svgMedia }];
    console.log("[SVG Test] Shape created");

    sendToUI("import-success", "SVG imported successfully!");
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

  if (msg.type === "import-svg") {
    console.log("[SVG Test] Processing SVG import");
    importSVG(msg.svgString);
  }
});

console.log("[SVG Test] Ready");
