var personaDB = {
  Kuliner:         {name:'Culinary / Cafe',    target:'Foodies & Urban Professionals',    tags:['Usia 22–35','Urban','Foodie'],        age:'20–40', gender:'Mixed',    conf:88, stitch:'{greeting} {usp} di {loc}. {cta}'},
  FashionWanita:   {name:'Fashion Wanita',     target:'Modern Women & Style Enthusiasts', tags:['Usia 18–35','Trendy','Stylish'],      age:'18–35', gender:'Perempuan', conf:85, stitch:'{greeting} {usp} di {loc}. {cta}'},
  FashionPria:     {name:'Fashion Pria',       target:'Style-Conscious Men',              tags:['Usia 18–40','Stylish','Urban'],       age:'18–40', gender:'Laki-laki', conf:83, stitch:'{greeting} {usp} di {loc}. {cta}'},
  FashionMuslim:     {name:'Fashion Muslim',     target:'Muslimah & Hijab Enthusiasts',     tags:['Usia 18–40','Muslimah','Hijab'],      age:'18–40', gender:'Perempuan', conf:87, stitch:'{greeting} {usp} di {loc}. {cta}'},
  FashionMuslimPria: {name:'Busana Muslim Pria', target:'Muslim Men & Modest Fashion',      tags:['Usia 18–45','Pria Muslim','Koko'],    age:'18–45', gender:'Laki-laki', conf:84, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Kafe:              {name:'Kafe / Coffee Shop', target:'Young Urban Coffee Lovers',        tags:['Usia 18–35','Ngopi','Urban'],         age:'18–35', gender:'Mixed',    conf:89, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Properti:   {name:'Real Estate',        target:'Young Families & Investors',    tags:['Usia 28–45','Investor','Keluarga'], age:'28–50', gender:'Mixed',    conf:82, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Beauty:     {name:'Beauty / Self-care', target:'Skincare & Makeup Lovers',      tags:['Usia 18–32','Beauty','Skincare'],   age:'17–35', gender:'Perempuan', conf:90, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Salon:      {name:'Salon & Perawatan',  target:'Beauty Service & Facial Lovers', tags:['Usia 17–40','Perawatan','Glowing'], age:'17–40', gender:'Mixed',    conf:87, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Barber:     {name:'Barber Shop',        target:'Young Men & Grooming Enthusiasts', tags:['Usia 17–35','Pria','Grooming'],   age:'17–35', gender:'Laki-laki', conf:88, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Bayi:       {name:'Parenting',          target:'New Parents & Young Families',  tags:['Usia 25–40','Orang tua','Keluarga'], age:'25–40', gender:'Mixed',  conf:86, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Gadget:     {name:'Tech / Electronics', target:'Tech Enthusiasts & Professionals', tags:['Usia 18–40','Tech','Digital'],   age:'18–40', gender:'Mixed',    conf:84, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Wisata:     {name:'Tourism',            target:'Solo Travelers & Vacationers',  tags:['Usia 22–40','Traveler','Petualang'], conf:87,                        stitch:'{greeting} {usp} di {loc}. {cta}'},
  Pet:        {name:'Pet Supplies',       target:'Cat & Dog Owners',              tags:['Usia 20–38','Pet lover','Keluarga'], conf:83,                        stitch:'{greeting} {usp} di {loc}. {cta}'},
  Seni:       {name:'Creative / Arts',    target:'Artists & Art Lovers',          tags:['Usia 20–40','Kreator','Seni'],       conf:80,                        stitch:'{greeting} {usp} di {loc}. {cta}'},
  Otomotif:   {name:'Otomotif',           target:'Car & Motorcycle Enthusiasts',  tags:['Usia 20–45','Otomotif','Kendaraan'], age:'20–45', gender:'Mixed',   conf:83, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Pendidikan: {name:'Pendidikan',         target:'Students, Parents & Learners',  tags:['Usia 15–45','Pelajar','Orang tua'],  age:'15–45', gender:'Mixed',   conf:81, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Kerajinan:  {name:'Kerajinan / Craft',  target:'Craft Lovers & Handmade Fans',  tags:['Usia 20–45','Kreator','Handmade'],   age:'20–45', gender:'Mixed',   conf:82, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Olahraga:          {name:'Olahraga & Fitness',    target:'Fitness Enthusiasts & Athletes',        tags:['Usia 16–45','Aktif','Sporty'],         age:'16–45', gender:'Mixed',   conf:83, stitch:'{greeting} {usp} di {loc}. {cta}'},
  Fotografi:         {name:'Fotografi',             target:'Clients Seeking Professional Photos',   tags:['Usia 20–45','Kreatif','Momen'],         age:'20–45', gender:'Mixed',   conf:84, stitch:'{greeting} {usp} di {loc}. {cta}'},
  JasaProfesional:   {name:'Jasa Profesional',      target:'Individuals & Businesses Seeking Help', tags:['Usia 25–50','Profesional','Pengusaha'],  age:'25–50', gender:'Mixed',   conf:80, stitch:'{greeting} {usp} di {loc}. {cta}'},
  EventCatering:     {name:'Event & Catering',      target:'Couples, Families & Event Organizers',  tags:['Usia 22–45','Acara','Keluarga'],         age:'22–45', gender:'Mixed',   conf:82, stitch:'{greeting} {usp} di {loc}. {cta}'},
  KebersihanLaundry: {name:'Kebersihan & Laundry',  target:'Busy Households & Professionals',       tags:['Usia 20–45','Sibuk','Praktis'],          age:'20–45', gender:'Mixed',   conf:79, stitch:'{greeting} {usp} di {loc}. {cta}'},
  General:           {name:'General Content',        target:'Konten umum, cocok untuk semua kalangan', tags:['Semua usia','Lokal','Umum'],             conf:62,                        stitch:'{greeting} {usp} di {loc}. {cta}'}
};

var personaKeys = ['Kuliner','Kafe','FashionWanita','FashionPria','FashionMuslim','FashionMuslimPria','Properti','Beauty','Salon','Barber','Bayi','Gadget','Wisata','Pet','Seni','Otomotif','Pendidikan','Kerajinan','Olahraga','Fotografi','JasaProfesional','EventCatering','KebersihanLaundry'];

/* ── Filename-based persona detection ── */
var filenamePersonaMap = [
  {keys:['craft','kerajinan','handmade','anyaman','batik tulis','tenun','ukir','rajut','bordir','souvenir'], p:{name:'Kerajinan / Craft', target:'Craft Lovers & Handmade Fans', age:'Usia 20–45', gender:'Mixed'}},
  {keys:['batik','kain batik','batik tulis'],                   p:{name:'Heritage & Cultural Fashion',target:'Batik Enthusiasts & Professionals',         age:'Usia 20–45', gender:'Mixed'}},
  {keys:['baju muslim','busana muslim','pakaian muslim','gamis','hijab','muslimah','syari','kerudung','abaya','jilbab'], p:{name:'Fashion Muslim', target:'Muslimah & Hijab Enthusiasts', age:'Usia 18–40', gender:'Perempuan'}},
  {keys:['koko','baju koko','sarung','gamis pria','muslim pria'],        p:{name:'Busana Muslim Pria',   target:'Muslim Men & Modest Fashion',   age:'Usia 18–45', gender:'Laki-laki'}},
  {keys:['kopi','cafe','coffee','latte','espresso','cappuccino','ngopi','barista'], p:{name:'Kafe / Coffee Shop', target:'Young Urban Coffee Lovers', age:'Usia 18–35', gender:'Mixed'}},
  {keys:['baju','dress','fashion','style','pakaian'],           p:{name:'Fashion Wanita',             target:'Modern Women & Style Enthusiasts',            age:'Usia 18–35', gender:'Perempuan'}},
  {keys:['buku','novel','bacaan','kursus','les','belajar','pendidikan','sekolah','kampus','tutor'], p:{name:'Pendidikan', target:'Students, Parents & Learners', age:'Usia 15–45', gender:'Mixed'}},
  {keys:['vespa','motor','mobil','otomotif','auto','kendaraan','sparepart','bengkel','modif'], p:{name:'Otomotif', target:'Car & Motorcycle Enthusiasts', age:'Usia 20–45', gender:'Mixed'}},
  {keys:['makanan','burger','cafe','food','kuliner'],           p:{name:'Culinary/Cafe',              target:'Foodies & Urban Professionals',              age:'Usia 22–40', gender:'Mixed'}},
  {keys:['properti','rumah','griya'],                           p:{name:'Real Estate',                target:'Young Families & Investors',                 age:'Usia 28–50', gender:'Mixed'}},
  {keys:['skincare','kosmetik','beauty','lipstik','makeup','serum','moisturizer'], p:{name:'Beauty / Self-care', target:'Skincare & Makeup Lovers', age:'Usia 17–35', gender:'Perempuan'}},
  {keys:['salon','facial','perawatan wajah','spa','waxing','treatment','klinik kecantikan'], p:{name:'Salon & Perawatan', target:'Beauty Service & Facial Lovers', age:'Usia 17–40', gender:'Mixed'}},
  {keys:['barber','barbershop','cukur','pangkas','pomade','gunting rambut','hairstyle'], p:{name:'Barber Shop', target:'Young Men & Grooming Enthusiasts', age:'Usia 17–35', gender:'Laki-laki'}},
  {keys:['anak','bayi','baby'],                                 p:{name:'Parenting',                  target:'New Parents & Young Families',               age:'Usia 25–40', gender:'Mixed'}},
  {keys:['gadget','hp','laptop','elektronik','tech'],           p:{name:'Tech/Electronics',           target:'Tech Enthusiasts & Professionals',            age:'Usia 18–40', gender:'Mixed'}},
  {keys:['wisata','travel','hotel','tourism'],                  p:{name:'Tourism',                    target:'Solo Travelers & Vacationers',               age:'Usia 22–40', gender:'Mixed'}},
  {keys:['kucing','anjing','pet'],                              p:{name:'Pet Supplies',               target:'Cat & Dog Owners',                           age:'Usia 20–40', gender:'Mixed'}},
  {keys:['home','dekor','interior'],                            p:{name:'Interior Design',            target:'Minimalist Living',                          age:'Usia 25–45', gender:'Mixed'}},
  {keys:['luxury','branded','tas'],                             p:{name:'High-end Goods',             target:'Luxury Lifestyle',                           age:'Usia 25–50', gender:'Mixed'}},
  {keys:['cincin','jewelry','wedding'],                         p:{name:'Wedding/Jewelry',            target:'Engaged Couples',                            age:'Usia 22–35', gender:'Mixed'}},
  {keys:['sepatu','olahraga','sports','fitness','gym','beladiri','martial','karate','silat','boxing','tinju','renang','badminton','futsal','basket'], p:{name:'Olahraga & Fitness', target:'Fitness Enthusiasts & Athletes', age:'Usia 16–45', gender:'Mixed'}},
  {keys:['bank','saham','investasi'],                           p:{name:'Banking/Finance',            target:'Financial Literacy & Investors',             age:'Usia 22–45', gender:'Mixed'}},
  {keys:['konser','musik','event'],                             p:{name:'Music/Events',               target:'Concert Goers',                              age:'Usia 18–35', gender:'Mixed'}},
  {keys:['lukisan','seni','art'],                               p:{name:'Creative/Arts',              target:'Artists & Art Lovers',                       age:'Usia 20–40', gender:'Mixed'}},
  {keys:['hijau','eco','sustainable'],                          p:{name:'Sustainability',             target:'Go Green Advocates',                          age:'Usia 20–40', gender:'Mixed'}},
  {keys:['foto studio','fotografi','photography','fotografer','prewedding','pre wedding','photo booth'], p:{name:'Fotografi',            target:'Clients Seeking Professional Photos',    age:'Usia 20–45', gender:'Mixed'}},
  {keys:['konsultan','konsultasi','notaris','pengacara','advokat','akuntan','law firm','firma hukum'],   p:{name:'Jasa Profesional',     target:'Individuals & Businesses Seeking Help',  age:'Usia 25–50', gender:'Mixed'}},
  {keys:['catering','event organizer','wedding organizer','dekorasi acara','eo wedding'],                p:{name:'Event & Catering',     target:'Couples, Families & Event Organizers',   age:'Usia 22–45', gender:'Mixed'}},
  {keys:['laundry','cuci baju','cuci pakaian','cleaning service','jasa bersih'],                         p:{name:'Kebersihan & Laundry', target:'Busy Households & Professionals',        age:'Usia 20–45', gender:'Mixed'}},
];

function detectPersona(filename) {
  var lower = filename.toLowerCase();
  for (var i = 0; i < filenamePersonaMap.length; i++) {
    var entry = filenamePersonaMap[i];
    for (var j = 0; j < entry.keys.length; j++) {
      if (lower.indexOf(entry.keys[j]) !== -1) return entry.p;
    }
  }
  return {name:'General Content', target:'Konten umum, cocok untuk semua kalangan', age:'Usia 18–55', gender:'Mixed'};
}

/* ── Mapping: onboarding category → personaDB key (sama persis desktop) ── */
var BIZ_CAT_TO_TILE = {
  fnb:                 'Kuliner',
  kafe:                'Kafe',
  fashion:             'FashionWanita',
  fashion_wanita:      'FashionWanita',
  fashion_pria:        'FashionPria',
  fashion_muslim:      'FashionMuslim',
  fashion_muslim_pria: 'FashionMuslimPria',
  kesehatan:           'Beauty',
  salon:               'Salon',
  barber:              'Barber',
  elektronik:          'Gadget',
  properti:            'Properti',
  wisata:              'Wisata',
  otomotif:            'Otomotif',
  pendidikan:          'Pendidikan',
  kerajinan:           'Kerajinan',
  olahraga:            'Olahraga',
  laundry:             'KebersihanLaundry',
  fotografi:           'Fotografi',
  catering:            'EventCatering',
  jasa_profesional:    'JasaProfesional',
  pet:                 'Pet',
};

/* ── ES Module exports untuk Next.js ── */
export { personaDB, personaKeys, filenamePersonaMap, detectPersona, BIZ_CAT_TO_TILE };
