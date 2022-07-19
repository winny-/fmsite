export default class Voice {
    srate = 48000;
    numOscillators = 2;
    oscillators = [];
    modDepth = 0;

    constructor () {
        for (let i=0; i<this.numOscillators; ++i) {
            this.oscillators.push(new SineWave());
        }
        this.oscillators[1].freqMultiply = 0.4;
    }

    // Given an array of channels, write the voice into a buffer
    writeWave (channels) {
        channels.forEach(channel => {
            for (let i=0; i<channel.length; ++i) {
                this.oscillators[0].modulateWith(this.oscillators[1], this.modDepth);
                channel[i] = this.oscillators[0].getSample();
            }
        });
    }

    setSrate (srate) {
        this.oscillators.forEach((osc) => osc.srate = srate);
    }

    setFrequency (freq) {
        this.oscillators.forEach((osc) => osc.setFrequency(freq));
    }

    setCarPitchRatio (r) {
        this.oscillators[1].freqMultiply = r;
    }
}

class SineWave {
    srate = 48000;
    phase = 0;
    phaseadd = 1;
    freqMultiply = 1;

    constructor () {
    }

    setFrequency (pitch) {
        this.phaseadd = Math.PI * 2.0 * pitch / this.srate;
    }

    getSample () {
        this.phase += (this.phaseadd * this.freqMultiply);
        return Math.sin(this.phase);
    }

    modulateWith (other, modDepth) {
        this.phase += other.getSample() * modDepth / this.srate * 100;
    }
}
