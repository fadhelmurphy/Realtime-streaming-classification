var videoElement = document.querySelector("video");
var canvas = document.getElementById("imageContainer");
var context = canvas.getContext("2d")
// var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector("select#videoSource");
// audioSelect.onchange = getStream;
async function loadModel() {
  try {
    // const net = await tf.loadLayersModel("/static/jsmodel/model.json");
    videoSelect.onchange = getStream;
    getStream().then(getDevices).then(gotDevices);
    onFrame(videoElement 
      // ,net
      );
    // const constraints = window.constraints = {audio: false, video: true};
    //  const stream = await navigator.mediaDevices.getUserMedia(constraints);
    //  onSuccess(stream, net);
  } catch (e) {
    console.log(e);
  }
}

function getDevices() {
  // AFAICT in Safari this only gets default devices until gUM is called :/
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos; // make available to console
  console.log("Available input and output devices:", deviceInfos);
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    // if (deviceInfo.kind === 'audioinput') {
    //   option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
    //   audioSelect.appendChild(option);
    // } else
    if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  // const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    // audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    audio: false,
    video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  };
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  // audioSelect.selectedIndex = [...audioSelect.options].
  //   findIndex(option => option.text === stream.getAudioTracks()[0].label);
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    (option) => option.text === stream.getVideoTracks()[0].label
  );
  videoElement.srcObject = stream;
}

function handleError(error) {
  console.error("Error: ", error);
}

// function onSuccess(stream, net) {
//   const video = document.querySelector('video');
//   const videoTracks = stream.getVideoTracks();
//   // console.log('Got stream with constraints:', constraints);
//   console.log(`Using video device: ${videoTracks[0].label}`);

//   window.stream = stream; // make stream available to console
//   onFrame(video, net);
// }
function onFrame(video
  // , net
  ) {
  // console.log(net.summary());
  async function processFrame() {
    // classify(video, label_element, net);
  var label_element = document.getElementById("label");
    context.drawImage(video,0,0,canvas.width, canvas.height)
    console.log(canvas.toDataURL("image/png"))
    const body = {
      content:canvas.toDataURL("image/png"),
      token:'your token here'
    }
    var ur = await fetch("/api",{
      method:'POST',
      headers: new Headers({
          'Content-Type': 'application/json'
      }),
      body:JSON.stringify(body)
    })
    var dr = await ur.json()
    console.log(dr.percent)
    if (dr.percent > 50.0 && dr!=null) {
      document.getElementById("label").innerHTML = dr.label + " " + dr.percent.toFixed(2) + "%";
    }
    requestAnimationFrame(processFrame);
  }
  processFrame();
}
async function classify(img_element, label_element, net) {
  const label = [
    "kue dadar gulung",
    "kue kastengel",
    "kue klepon",
    "kue lapis",
    "kue lumpur",
    "kue putri salju",
    "kue risoles",
    "kue serabi",
  ];
  const IMAGE_SIZE = 150;
  const normalizationConstant = 1.0 / 255.0;
  let img = tf.browser
    .fromPixels(img_element)
    .resizeBilinear([IMAGE_SIZE, IMAGE_SIZE], false)
    .expandDims(0)
    .toFloat()
    .mul(normalizationConstant);
  const prediction = await net.predict(img);
  const classes = await prediction.data();
  var max_i = 0;
  var max_v = classes[0];
  for (let i = 0; i < classes.length; i++) {
    if (classes[i] > max_v) {
      max_v = classes[i];
      max_i = i;
    }
  }
  const labelpred = label[max_i];
  if (max_v > 0.5) {
    label_element.innerHTML = labelpred + " " + (max_v * 100).toFixed(2) + "%";
  }
}

loadModel();
// init()
