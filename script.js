const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("toggle-button");

let model;
let isDetecting = false;
let detectionInterval;

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadModel() {
  model = await cocoSsd.load();
}

async function detect() {
  const predictions = await model.detect(video);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  predictions.forEach((prediction) => {
    ctx.beginPath();
    ctx.rect(...prediction.bbox);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.stroke();
    ctx.fillText(
      `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
      prediction.bbox[0],
      prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
    );
  });
}

button.addEventListener("click", () => {
  isDetecting = !isDetecting;

  if (isDetecting) {
    button.textContent = "Stop Detection";
    detectionInterval = setInterval(detect, 100); // Call detect every 100 ms
  } else {
    button.textContent = "Start Detection";
    clearInterval(detectionInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas when stopping detection
  }
});

async function main() {
  await setupCamera();
  await loadModel();
}

main();
