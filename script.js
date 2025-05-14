(function(){
  const video = document.getElementById('video');
  const frameOverlay = document.getElementById('frame-overlay');
  const captureBtn = document.getElementById('capture-btn');
  const frameSelector = document.getElementById('frame-selector');
  const photosContainer = document.getElementById('photos');
  const photoboothContainer = document.getElementById('photobooth-container');
  const toggleLayoutBtn = document.getElementById('toggle-layout-btn');

  const frames = [
    {
      name: 'Neon Glow',
      src: ''
    },
    {
      name: 'Polaroid',
      src: ''
    },
    {
      name: 'Comic Pop',
      src: ''
    }
  ];

  let selectedFrameIndex = 0;
  let isHorizontalLayout = false;
  let timerInterval = null;

  // Setup webcam
  async function setupCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      video.srcObject = stream;
      return new Promise(resolve => {
        video.onloadedmetadata = () => {
          resolve();
        };
      });
    } catch (e) {
      alert('Could not access the camera. Please allow camera access and refresh.');
      console.error('Camera error:', e);
    }
  }

  // Populate frame selector
  function populateFrames() {
    frameSelector.innerHTML = '';
    frames.forEach((frame, i) => {
      const div = document.createElement('div');
      div.classList.add('frame-option');
      if (i === selectedFrameIndex) div.classList.add('selected');
      div.title = frame.name;

      const img = document.createElement('img');
      img.src = frame.src;
      img.alt = frame.name + ' frame preview';

      div.appendChild(img);
      div.addEventListener('click', () => {
        selectFrame(i);
      });

      frameSelector.appendChild(div);
    });
    updateFrameOverlay();
  }

  // Select frame
  function selectFrame(index) {
    selectedFrameIndex = index;
    Array.from(frameSelector.children).forEach((child, i) => {
      if (i === index) child.classList.add('selected');
      else child.classList.remove('selected');
    });
    updateFrameOverlay();
  }

  // Update overlay image
  function updateFrameOverlay() {
    const src = frames[selectedFrameIndex].src;
    frameOverlay.src = src;
    captureBtn.disabled = false;
  }

  // Add photo to DOM and enable download on click
  function addPhoto(dataUrl) {
    const div = document.createElement('div');
    div.className = 'photo';

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'Captured photo with frame';

    div.appendChild(img);

    div.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'photobooth-' + Date.now() + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    photosContainer.prepend(div);
  }

  // Capture photo
  function capturePhoto() {
    // Disable capture button during countdown
    captureBtn.disabled = true;

    let countdown = 3; // countdown seconds
    const originalBtnText = captureBtn.textContent;
    captureBtn.textContent = `Capturing in ${countdown}...`;

    timerInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        captureBtn.textContent = `Capturing in ${countdown}...`;
      } else {
        clearInterval(timerInterval);
        captureBtn.textContent = originalBtnText;

        const canvas = document.createElement('canvas');
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext('2d');

        // Draw video
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        // Draw frame overlay
        const overlayImg = new Image();
        overlayImg.crossOrigin = "anonymous";
        overlayImg.src = frames[selectedFrameIndex].src;

        overlayImg.onload = () => {
          ctx.drawImage(overlayImg, 0, 0, videoWidth, videoHeight);
          addPhoto(canvas.toDataURL('image/png'));
          // Re-enable capture button after capture
          captureBtn.disabled = false;
        };
      }
    }, 1000);
  }

  // Toggle layout
  function toggleLayout() {
    isHorizontalLayout = !isHorizontalLayout;
    if (isHorizontalLayout) {
      photoboothContainer.classList.add('horizontal-layout');
      toggleLayoutBtn.textContent = 'Vertical Layout';
    } else {
      photoboothContainer.classList.remove('horizontal-layout');
      toggleLayoutBtn.textContent = 'Switch Layout';
    }
  }

  // Initialize
  async function init() {
    await setupCamera();
    populateFrames();
    captureBtn.disabled = false;

    captureBtn.addEventListener('click', () => {
      if (!captureBtn.disabled) capturePhoto();
    });
    toggleLayoutBtn.addEventListener('click', toggleLayout);
  }

  init();

})();

