import type {Instrument, Note, OscillatorParams} from './instrument';
import {Envelope} from './envelope';

export default class Voice {
    gate: boolean;
    volume!: number; // Volume amount 0.0 thru 1.0.
    instrumentIndex: number;
    srate: number;
    uid: number;

    private oscs!: Oscillator[];
    private modMatrix!: number[][];

    constructor (
        instrument: Instrument,
        private note: Note,
        srate: number)
    {
        this.instrumentIndex = note.instrumentIndex;
        this.srate = srate;
        this.gate = true;
        this.uid = note.uid;

        this.setInstrument(instrument);
    }

    // Initial playback
    setInstrument (instrument: Instrument) {
        this.volume = decibelToScale(instrument.volume);
        this.oscs = instrument.oscs.map(
            (osc: OscillatorParams, index) => {
                const pitch = this.calcPitch(instrument, index);
                const envelope = new Envelope(osc.envelope, this.srate);
                return new Oscillator(pitch, envelope, this.srate);
            });
        this.modMatrix = instrument.oscs.map((osc: OscillatorParams) =>
            osc.modulation.map(scaleOscillation));
    }

    // Live edit instrument
    updateInstrument (instrument: Instrument) {
        this.volume = decibelToScale(instrument.volume);
        this.modMatrix = instrument.oscs.map((osc: OscillatorParams) =>
            osc.modulation.map(scaleOscillation));
        instrument.oscs.forEach((_osc: OscillatorParams, index) => {
            this.oscs[index].setPitch(this.calcPitch(instrument, index));
        });
    }

    // Calculate the pitch for an oscillator on self
    private calcPitch (instrument: Instrument, index: number) {
        return instrument.basePitch *
            instrument.oscs[index].pitchRatio *
            noteToFreq(this.note.note);
    }

    addWave (channels: Float32Array[]) {
        channels.forEach(channel => {
            for (let i=0; i<channel.length; ++i) {
                const oscs = this.getOscillators();
                channel[i] += oscs[this.oscs.length-1] * this.volume;
            }
        });
    }

    getOscillators () : number[] {
        const oscCache: number[] = [];
        this.oscs.forEach((osc: Oscillator, i: number) => {
            oscCache[i] = osc.getSample();
            this.modMatrix[i].forEach((depth: number, i: number) =>
                osc.modulateWith(oscCache[i], depth))
            osc.envelope.stepPosition(this.gate);
        })
        return oscCache;
    }

    isStopped () : boolean {
        return this.oscs[this.oscs.length-1].envelope.isStopped();
    }
}

function noteToFreq(note: number) {
    return Math.pow(2.0, (note - 69)/12.0);
}

function decibelToScale (db: number) :number {
    return Math.pow(2.0, db/6.0) / 2.0;
}

// Depth 0-10 scaled to number 0-1020
function scaleOscillation (depth: number) :number {
    return Math.pow(2, depth) * 4 - 4;
}

class Oscillator {
    phase = 0;
    phaseadd = 1;

    constructor (private pitch: number,
                 public envelope: Envelope,
                 public srate: number)
    {
        this.calcFrequency();
    }

    setPitch (pitch: number) {
        this.pitch = pitch;
        this.calcFrequency();
    }

    calcFrequency () {
        this.phaseadd = Math.PI * 2.0 * this.pitch / this.srate;
    }

    getSample () {
        this.phase += this.phaseadd;
        return Math.sin(this.phase) * this.envelope.getPosition();
    }

    modulateWith (sample: number, modDepth: number) {
        this.phase += sample * modDepth / this.srate * 100;
    }
}
