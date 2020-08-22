# sonic-pi-drum-rnn-gui
A GUI that uses Magenta Drum RNN to create and generate drum patterns to send to Sonic Pi via OSC

This project was created as a way to incorporate machine learning into a live coding performative context. It aims to make the collaborative process between musician and machine learning model happen in real time in an ongoing feedback cycle where the machine makes output based on the human and then the human can in turn react to the model output, creating an ongoing interactive loop that takes place within the context of a performance.

The control is always in the human’s hand. There is the ability to alter and edit the machine output. There is also the ability to take the machine output and channel it back into input, creating a ML feedback loop but this is always at the discretion of the human in charge.

There is also the option to move from the interface to the Sonic PI IDE and add additional sounds and instruments. The user also has the option to change and add different samples into Sonic Pi to change the sounds being played.

All sounds and timing are handled in Sonic Pi. The graphic user interface is meant to provide a more accessible way to engage with Machine learning as a tool for performance without needing to know the technical aspects. The GUI provides visual representations of the Model output.

<h2>What you need</h2>
This project uses the p5js-OSC library and modified code examples by Gene Kogan to handle the OSC messaging between the GUI and Sonic Pi. 
Go to this link for info on how to download and install: https://github.com/genekogan/p5js-osc <br><br>

You will also need to download Sonic Pi. This code is for Sonic Pi v3.2.0
Go to this link for info on how to download and install: https://sonic-pi.net/

<h2>Getting Started</h2>

1. Start p5js-osc in terminal

2. Create local server

3. Open GUI Code

4. Paste Sonic Pi code into an empty buffer in the Sonic Pi IDE <br>
**Note:** The Sonic Pi code will not run until you chosen a drum kit and have sent at least one beat from the GUI.






