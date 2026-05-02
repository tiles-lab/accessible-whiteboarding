import tuba from '@audio/earcons/tuba.mp3';
import cello from '@audio/earcons/cello.mp3';
import erhu from '@audio/earcons/erhu.mp3';
import steeldrum from '@audio/earcons/steeldrum.mp3';
import handpan from '@audio/earcons/handpan.mp3';
import kulintang from '@audio/earcons/kulintang.mp3';
import harpsichord from '@audio/earcons/harpsichord.mp3';
import bassdrum from '@audio/earcons/bassdrum.mp3';
import udu from '@audio/earcons/udu.mp3';
import kickdrum from '@audio/earcons/kickdrum.mp3';
import swell from '@audio/earcons/swell.mp3';
import shakuhachi from '@audio/earcons/shakuhachi.mp3';
import bassoon from '@audio/earcons/bassoon.mp3';
import piano from '@audio/earcons/piano.mp3';
import guitarElectric from '@audio/earcons/guitar-electric.mp3';
import guitar from '@audio/earcons/guitar.mp3';

export const EarconRegistry = {
    sticky_note: {
        red: { audio: tuba },
        pink: { audio: cello },
        light_pink: { audio: erhu },
        blue: { audio: steeldrum },
        light_blue: { audio: handpan },
        dark_blue: { audio: kulintang },
        cyan: { audio: harpsichord },
        green: { audio: bassdrum },
        light_green: { audio: udu },
        dark_green: { audio: kickdrum },
        yellow: { audio: swell },
        light_yellow: { audio: shakuhachi },
        orange: { audio: bassoon },
        violet: { audio: piano },
        gray: { audio: guitarElectric },
        black: { audio: guitar },
    }
};
