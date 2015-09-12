// Influenced by Scala.lua
// http://forum.renoise.com/index.php/topic/28495-snippet-load-scala-scl-tuning-file/
// Scala Format: http://www.huygens-fokker.org/scala/scl_format.html

'use strict';

var fs = require('fs');

function readFile(filepath) {
    try {
        return fs.readFileSync(filepath, { "encoding": "utf-8" });
    } catch (e) { 
        return ''; 
    }
}

function sclToFrequencies(baseNote, baseFrequency, fileName) {

    let tunings = [];
    let counter = 0;
    let file = readFile(fileName);
    let lines = file.split('\n');
    let description = '';

    if (file) {
        for (let i = 0, ln = lines.length; i < ln; i++) {
            if (lines[i].substring(0,1) !== '!' && lines[i].replace(/\s/g, '')) {
                counter++;
                if (counter === 1) description = lines[i];
                if (counter > 2) {
                    if (lines[i].match(/^.*\./)) {
                        let cents = lines[i].replace(/\s/g, '');
                        tunings.push(Math.pow(2, cents / 1200));
                    } else if (lines[i].match(/[0-9]\/[0-9]/)) {
                        let ratio = lines[i].split('/');
                        tunings.push(ratio[0] / ratio[1]);
                    } else {
                        tunings.push(lines[i]);
                    }
                }
            }
        }
    } else {
        console.log('Hmmm... The .scl file did not load for some reason.');
    }

    // Generate object containe all 128 MIDI note frequencies
    var notesPerOctave = Object.keys(tunings).length;
    var frequencies = [];
    for (var i = 0; i < 128; i++) {
        var note = i - baseNote;
        var degree = Math.abs(note % notesPerOctave);
        var octave = Math.floor(note / notesPerOctave);
        var frequency = baseFrequency * Math.pow(tunings[notesPerOctave - 1], 
                (octave * notesPerOctave) / notesPerOctave);
        if (degree > 0) frequency *= tunings[degree - 1];
        frequency = Math.max(0.0, Math.min(22050.0, frequency));
        frequencies.push(frequency);
    }
    return frequencies.sort((a, b) => a - b);
}

// C-4
const baseNote = 48;

// Middle C
const baseFrequency = 261.625565300598623000;

// .scl filename
const fileName = process.argv[2];

var frequencies = sclToFrequencies(baseNote, baseFrequency, fileName);

console.log(frequencies);
