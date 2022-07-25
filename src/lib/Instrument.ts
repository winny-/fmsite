export type Instrument = {
    basePitch: number; // Base pitch in Hz
    volume: number; // Volume in decibels
    envelope: EnvelopeParams; // Volume envelope
    oscs: OscillatorParams[]; // Oscillator config
}

export type OscillatorParams = {
    modulation: number[]; /* How much to modulate phase from previous oscillators.
                             Expected value 0 to 10. Real modulation is 2^x.
                             */
    pitchRatio: number; // Ratio of pitch from the base pitch.
}

export type EnvelopeParams = {
    points: {dx: number, y: number}[]; // List of envelope points.
    sustainPoint: number; // Which point (1-indexed) will sustain. 0 = none
    release: number; // Rate of release (amplitude per second)
}

export type Note  = {
    note: number; // Frequency
    instrumentIndex: number;
    uid: number;
}

export function adsrEnvelope (attack: number, // Attack rate (amplitude per second)
                              decay: number,  // Decay rate
                              sustain: number,// Sustain level
                              release: number,// Release rate
                             ) : EnvelopeParams
{
    return {
        points: [
            {dx: 0, y: 0},
            {dx: 1 / attack, y: 1},
            {dx: (1-sustain) / decay, y: sustain},
        ],
        sustainPoint: 3,
        release,
    }
}

export function defaultInstrument (numOscs = 4) : Instrument {
    return {
        basePitch: 440,
        volume: -12,
        envelope: adsrEnvelope(8, 5, 0.5, 5),
        oscs: Array(numOscs).fill(0).map((_, i) => ({
            modulation: Array(i).fill(0).map(() => 1),
            pitchRatio: 1,
        })),
    }
}

export function randomizeInstrument (params: Instrument) : Instrument {
    return {
        ...params,
        oscs: Array(params.oscs.length).fill(0).map((_, i) => ({
            ...params.oscs[i],
            modulation: Array(i).fill(0).map(() => Math.pow(Math.random(),3)*10),
            pitchRatio: Math.pow(Math.random(), 2) * 10,
        })),
    }
}
