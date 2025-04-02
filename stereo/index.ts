// DOM
const audioEl = document.querySelector(".audio") as HTMLAudioElement;
const playPauseBtn = document.querySelector(
  ".playPauseBtn"
) as HTMLButtonElement;
const previousBtn = document.querySelector(".previousBtn") as HTMLButtonElement;
const nextBtn = document.querySelector(".nextBtn") as HTMLButtonElement;
const seekBar = document.querySelector(".seekBar") as HTMLInputElement;
const volumeBar = document.querySelector(".volumeBar") as HTMLInputElement;
const elapsedTime = document.querySelector(".elapsedTime") as HTMLSpanElement;
const totalTime = document.querySelector(".totalTime") as HTMLSpanElement;
const canvas = document.querySelector(".canvas") as HTMLCanvasElement;
const canvasCtx = canvas.getContext("2d");

let audioCtx: AudioContext;
let analyser: AnalyserNode;
let dataArray: Uint8Array;
let bufferLength: number;

let currentTrackIndex = 0;

const playlist = [
  "./audio/lou.mp3",
  "./audio/sleptwell.mp3",
  "/audio/leftthewalls.mp3",
];

function initializeAudio() {
  audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaElementSource(audioEl);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 256; // frequency visualization
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function visualize() {
  requestAnimationFrame(visualize);
  analyser.getByteFrequencyData(dataArray);
  canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] * 4;
    if (canvasCtx) {
      canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
      canvasCtx.fillRect(
        x,
        canvas.height - barHeight / 2,
        barWidth,
        barHeight / 2
      );
    }
    x += barWidth + 1;
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.6;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function togglePlayPause() {
  if (audioEl.paused) {
    audioEl.play();
    playPauseBtn.textContent = "Pause";
  } else {
    audioEl.pause();
    playPauseBtn.textContent = "Play";
  }
}

function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex);
}

function playPreviousTrack() {
  currentTrackIndex =
    (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
}

function loadTrack(index: number) {
  audioEl.src = playlist[index];
  audioEl.load();
  audioEl.play();
  playPauseBtn.textContent = "Pause";
}

function updateSeekBar() {
  seekBar.value = ((audioEl.currentTime / audioEl.duration) * 100).toString();
  elapsedTime.textContent = formatTime(audioEl.currentTime);
}

function seekAudio() {
  const seekTo = audioEl.duration * (parseFloat(seekBar.value) / 100);
  audioEl.currentTime = seekTo;
}

function updateVolume() {
  audioEl.volume = parseFloat(volumeBar.value);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secondsPart = Math.floor(seconds % 60);
  return `${minutes}:${secondsPart < 10 ? "0" : ""}${secondsPart}`;
}

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();
  initializeAudio();
  visualize();
  playPauseBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", playNextTrack);
  previousBtn.addEventListener("click", playPreviousTrack);
  seekBar.addEventListener("input", seekAudio);
  volumeBar.addEventListener("input", updateVolume);
  audioEl.addEventListener("timeupdate", updateSeekBar);
  audioEl.addEventListener("loadedmetadata", () => {
    totalTime.textContent = formatTime(audioEl.duration);
  });
  audioEl.addEventListener("loadeddata", () => {
    totalTime.textContent = formatTime(audioEl.duration);
    seekBar.max = audioEl.duration.toString();
  });
  loadTrack(currentTrackIndex);
});

window.addEventListener("resize", () => {
  resizeCanvas();
});
