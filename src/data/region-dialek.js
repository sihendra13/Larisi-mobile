/* ── LARAS v2.2: Region detection from coordinates ── */

var REGION_BOUNDS = [
  /* [name, latMin, latMax, lngMin, lngMax] */
  ['medan',    2.5,  4.2,   97.5, 99.5],
  ['jakarta', -6.5, -5.8,  106.5,107.2],
  ['surabaya',-7.5, -7.0,  112.5,113.0],
  ['bandung', -7.2, -6.7,  107.3,107.9],
  ['makassar',-5.3, -4.9,  119.2,119.7],
  ['jogja',   -8.1, -7.5,  110.1,110.6],
  ['solo',    -7.7, -7.4,  110.7,111.1],
  ['bali',    -8.9, -8.1,  114.4,115.7],
  ['manado',   1.3,  1.7,  124.7,125.1],
  ['palembang',-3.1,-2.8,  104.5,104.9],
  ['semarang', -7.1,-6.9,  110.3,110.6],
  ['malang',  -8.1, -7.9,  112.5,112.8],
  ['pontianak',-0.2, 0.2,  109.1,109.5],
  ['banjarmasin',-3.5,-3.2,114.5,114.7],
  ['medan_area', 2.5, 4.2,  97.5, 99.5],
  ['lampung',  -5.6, -5.2, 105.1,105.5],
  ['ambon',    -3.8, -3.6, 128.1,128.3],
  ['lombok',   -8.8, -8.3, 116.0,116.7],
  ['papua',    -8.6,  2.0, 130.0,141.0]
];

var REGION_DIALEK = {
  'jogja':       { greeting: 'Sugeng rawuh',      cta: 'Mampir yuk!',      style: 'jogja'    },
  'solo':        { greeting: 'Sugeng rawuh',      cta: 'Mampir yuk!',      style: 'jogja'    },
  'medan':       { greeting: 'Horas Ketua!',      cta: 'Gas Sekarang!',    style: 'medan'    },
  'medan_area':  { greeting: 'Horas Ketua!',      cta: 'Gas Sekarang!',    style: 'medan'    },
  'jakarta':     { greeting: 'Halo Bestie!',      cta: 'Sikat Sekarang!',  style: 'jakarta'  },
  'surabaya':    { greeting: 'Halo Rek!',         cta: 'Budal Saiki!',     style: 'surabaya' },
  'malang':      { greeting: 'Halo Rek!',         cta: 'Budal Saiki!',     style: 'surabaya' },
  'bandung':     { greeting: 'Sampurasun',        cta: 'Mangga Mampir!',   style: 'bandung'  },
  'makassar':    { greeting: 'Ewako, Daeng!',     cta: 'Sikat Mentong!',   style: 'makassar' },
  'bali':        { greeting: 'Rahajeng semeton',  cta: 'Luungan Mai!',     style: 'bali'     },
  'manado':      { greeting: 'Halo Kita Samua!',  cta: 'Ayo Coba!',        style: 'manado'   },
  'palembang':   { greeting: 'Apo Kabar Kawan!',  cta: 'Ayo Gaskeun!',     style: 'palembang'},
  'semarang':    { greeting: 'Sugeng rawuh',      cta: 'Mampir yuk!',      style: 'jogja'    },
  'pontianak':   { greeting: 'Kamek Siap Bantu!', cta: 'Jangan Sampai Ketinggalan!', style: 'pontianak'},
  'banjarmasin': { greeting: 'Assalamualaikum Sahabat!', cta: 'Jangan Dilewatkan!', style: 'banjar'},
  'lampung':     { greeting: 'Sai Bumi Kham!',   cta: 'Ayo Segera!',      style: 'lampung'  },
  'ambon':       { greeting: 'Beta Sapa Samua!',  cta: 'Ayo Gaspol!',      style: 'ambon'    },
  'lombok':      { greeting: 'Sugek Dateng!',     cta: 'Mara Mai!',        style: 'lombok'   },
  'papua':       { greeting: 'Halo Kaka!',        cta: 'Mari Jo!',         style: 'papua'    },
  'default':     { greeting: 'Halo Sahabat!',     cta: 'Cek Sekarang!',    style: 'default'  }
};

function detectRegionFromCoords(lat, lng) {
  for (var i = 0; i < REGION_BOUNDS.length; i++) {
    var b = REGION_BOUNDS[i];
    if (lat >= b[1] && lat <= b[2] && lng >= b[3] && lng <= b[4]) {
      return b[0];
    }
  }
  return 'default';
}
