var socket;
var isConnected;

setupOsc(12004, 4560);


let sequencer = new Nexus.Sequencer('#sequencer', {
  columns: 16,
  rows: 9,
  size: [600, 200]
});

let genSequencer = new Nexus.Sequencer('#genSequencer', {
  columns: 16,
  rows: 9,
  size: [600, 200]
});


sequencer.colorize('fill', '#fd0');
sequencer.colorize('accent', '#03f');

genSequencer.colorize('fill', '#FF1493');
genSequencer.colorize('accent', '#ff8c00');


socket.emit('message', ['/wek6/outputs', 0]);

function selectKit() {
  let kits = document.getElementById("kits").value;
  console.log(kits);
  socket.emit('message', ['/wek6/outputs', kits]);
}

let sequenceRows = [36, 46, 38, 42, 51, 48, 50, 49, 45];
sequencer.on('change', ({
  column,
  row,
  state
}) => {
  sequencer.colorize('fill', '#da0');
})

genSequencer.on('change', ({
  column,
  row,
  state
}) => {

  genSequencer.colorize('fill', '#d6d');
});

document.getElementById('clear').onclick = async () => {
  sequencer.matrix.populate.all(0);
}

let playGen = document.getElementsByName("playOrNot");
playGen[0].onclick = (() => {
  socket.emit('message', ['/wek5/outputs', 1]);
})
playGen[1].onclick = (() => {
  socket.emit('message', ['/wek5/outputs', 0]);
})
playGen[2].onclick = (() => {
  socket.emit('message', ['/wek5/outputs', 2]);
})


document.getElementById('matrix').onclick = async () => {
  checkMatrix();
}

function checkMatrix() {
  let a = sequencer.matrix.pattern;
  let drumSounds = [];
  let drumHits = [];
  for (let j = 0; j < sequencer.columns; j++) {
    for (let i = 0; i < sequencer.rows; i++) {
      if (a[i][j] == true) {
        drumSounds.push(sequenceRows[i]);
        drumHits.push(j)
      }
    }
  }
  sendBeat(drumSounds, drumHits);
  makeDrumObject(drumSounds, drumHits)
  sequencer.colorize('fill', '#fd0');
}

let drumsObject = {
  notes: [],
  quantizationInfo: {
    stepsPerQuarter: 4
  },
  tempos: [{
    time: 0,
    qpm: 120
  }],
  totalQuantizedSteps: 16
};

function makeDrumObject(notes, steps) {

  drumsObject = {
    notes: [],
    quantizationInfo: {
      stepsPerQuarter: 4
    },
    tempos: [{
      time: 0,
      qpm: 120
    }],
    totalQuantizedSteps: 16
  };

  if (notes.length > 0) {
    for (let i = 0; i < notes.length; i++) {
      drumsObject.notes.push({
        pitch: notes[i],
        quantizedStartStep: steps[i],
        quantizedEndStep: steps[i] + 1,
        isDrum: true
      })
    }
  }
}


function sendBeat(note, step) {
  if (isConnected) {
    socket.emit('message', ['/wek/outputs', note]);
    socket.emit('message', ['/wek2/outputs', step]);
    if (playGen[0].checked) {
      socket.emit('message', ['/wek5/outputs', 1]);
    } else if (playGen[1].checked) {
      socket.emit('message', ['/wek5/outputs', 0]);
    }
  }
}

function sendGenBeat(note, step) {
  if (isConnected) {
    socket.emit('message', ['/wek3/outputs', note]);
    socket.emit('message', ['/wek4/outputs', step]);
  }
  if (playGen[0].checked) {
    socket.emit('message', ['/wek5/outputs', 1]);
  } else if (playGen[1].checked) {
    socket.emit('message', ['/wek5/outputs', 0]);
  }
  genSequencer.colorize('fill', '#FF1493');
}

music_rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn');
let modelLoaded = music_rnn.initialize();
let rnn_temperature = 1.25;
document.getElementById("generate").onclick = async () => {
  await modelLoaded;

  let rnn_steps = 16;

  genSequencer.matrix.populate.all(0);
  let results = await music_rnn.continueSequence(drumsObject, rnn_steps, rnn_temperature)
  for (let note of results.notes) {
    let column = note.quantizedStartStep;
    let row = sequenceRows.indexOf(note.pitch)
    if (row >= 0) {
      genSequencer.matrix.set.cell(column, row, 1);
    }
  }
  genSequencer.colorize('fill', '#d6d');
}

document.getElementById('switch').onclick = async () => {
  switchMatrix();
}

let switchMatrix = (() => {
  sequencer.matrix.populate.all(0);
  let genMatrix = genSequencer.matrix.pattern;
  for (let i = 0; i < genMatrix.length; i++) {
    sequencer.matrix.populate.row(i, genMatrix[i]);
  }
  sequencer.colorize('fill', '#da0');
});

document.getElementById('send-generate').onclick = async () => {
  checkGenMatrix()
}

let checkGenMatrix = (() => {
  let a = genSequencer.matrix.pattern;
  let drumSounds = [];
  let drumHits = [];
  for (let j = 0; j < genSequencer.columns; j++) {
    for (let i = 0; i < genSequencer.rows; i++) {
      if (a[i][j] == true) {
        drumSounds.push(sequenceRows[i]);
        drumHits.push(j)
      }
    }
  }
  sendGenBeat(drumSounds, drumHits);
});

let tempSlider = document.getElementById("temp");
let output = document.getElementById("demo");
output.innerHTML = rnn_temperature;
tempSlider.oninput = (evt) => {
  rnn_temperature = +evt.target.value;
  output.innerHTML = rnn_temperature;
}

sequencer.stepper.value = true;
genSequencer.stepper.value = true;

function receiveOsc(address, value) {
  console.log("received OSC: " + address + ", " + value);

  if (address == '/druminfo') {
    let receivedOsc = value[0];
    let whichSeq = value[1]
    sequencer.stepper.value = receivedOsc - 1;
    genSequencer.stepper.value = receivedOsc - 1;
    if (whichSeq == 0) {
      sequencer.next();
    } else if (whichSeq == 1) {
      genSequencer.next();
    }
  }
}

function sendOsc(address, value) {
  socket.emit('message', [address, value]);
}

function setupOsc(oscPortIn, oscPortOut) {

  socket = io.connect('http://127.0.0.1:8081', {
    port: 8081,
    rememberTransport: false
  });
  socket.on('connect', function() {
    socket.emit('config', {
      server: {
        port: oscPortIn,
        host: '127.0.0.1'
      },
      client: {
        port: oscPortOut,
        host: '127.0.0.1'
      }
    });
  });
  socket.on('connect', function() {
    isConnected = true;
  });
  socket.on('message', function(msg) {
    if (msg[0] == '#bundle') {
      for (var i = 2; i < msg.length; i++) {
        receiveOsc(msg[i][0], msg[i].splice(1));
      }
    } else {
      receiveOsc(msg[0], msg.splice(1));
    }
  });

}
