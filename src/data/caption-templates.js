/*
 * Caption Templates — 3 alternatif per persona × per platform
 * Tone & style disesuaikan dengan kultur konten masing-masing platform
 * Variabel: {loc} = lokasi BISNIS (dari profil), {area} = area TARGET IKLAN (dari peta), {usp} = keunggulan bisnis
 */
var CAPTION_TEMPLATES = {
  "ig-story": {
    "Kuliner": [
      "{greeting} 👋\n\nWarga {area}, sudah tau belum? Ada kuliner hits dari {loc} yang sayang banget untuk dilewatkan!\n\nSetiap menu dibuat dari bahan segar pilihan — aroma dari dapurnya aja udah bikin lapar dari parkiran. Konsisten enak setiap hari, bukan cuma pas buka doang. {usp}.\n\n{cta}\n\n#KulinerLokal #MakanEnak #{area}",
      "{greeting} 🍽\n\nSoal rasa, kami tidak kompromi.\n\nBahan segar dari supplier terpilih, resep yang tidak berubah sejak hari pertama buka, dan porsi yang bikin kenyang tanpa harus merogoh kocek terlalu dalam. Terbukti dari pelanggan setia yang balik lagi setiap minggu.\n\n{usp}.\n\n{cta}\n\n#KulinerJujur #MakanEnak #FoodLokal",
      "{greeting} ⚡\n\nHari ini stok menu spesial kami TERBATAS!\n\nKemarin habis dalam 2 jam. Hari ini stok lebih sedikit — dan antrian sudah mulai. {usp}.\n\nJangan sampai kehabisan.\n\n{cta}\n\n#PromoHariIni #KulinerLokal #TerbatasStok"
    ],
    "Kuliner/Cafe": [
      "{greeting} ☕\n\nCafe baru di {loc} yang benar-benar worth it untuk dikunjungi!\n\nKopi specialty diseduh manual, makanan yang tidak asal jadi, suasana yang bikin betah berlama-lama — cocok untuk WFH, meeting, atau sekadar me-time. {usp}.\n\n{cta}\n\n#CafeLokal #KopiVibes #{area}",
      "{greeting} ✨\n\nBukan sekadar tempat minum kopi.\n\nSetiap cangkir diseduh dari biji single origin pilihan dengan grind size dan suhu air yang dikontrol ketat. Hasilnya: kopi yang balance, tidak pahit, dan aftertaste-nya bersih. Untuk kamu yang serius soal kopi.\n\n{usp}.\n\n{cta}\n\n#SpecialtyCoffee #KopiSerius #CafeLokal",
      "{greeting} 🎉\n\nPromo hari ini: beli minuman apa saja, gratis slice cake pilihan!\n\nBerlaku hanya hari ini di {loc}. Stok cake terbatas, sudah 40+ transaksi dari pagi tadi. {usp}.\n\n{cta}\n\n#FlashDeal #CafePromo #PromoHariIni"
    ],
    "FashionPria": [
      "{greeting} 👔\n\nTampil percaya diri itu dimulai dari pilihan yang tepat.\n\nKoleksi pria terbaru di {loc} — casual, formal, dan smart casual semua ada. Bahan premium, potongan yang flattering. Bukan sekadar pakaian — ini identitas.\n\n{cta}\n\n#FashionPria #MenStyle #{area}",
      "{greeting} 💼\n\nStyle pria yang baik tidak berteriak — tapi selalu diperhatikan.\n\nKoleksi kami di {loc} dirancang untuk pria urban yang mengerti kualitas. Pilihan warna yang timeless, bahan yang breathable, jahitan yang presisi. {usp}.\n\n{cta}\n\n#MenFashion #StylePria #KoleksiLokal",
      "{greeting} ⚡\n\nNew arrival pria — stok terbatas!\n\nVarian terlaris kemarin sold out dalam 2 jam. Restock hari ini di {loc}. {usp}. Jangan sampai kehabisan lagi.\n\n{cta}\n\n#MenNewArrival #FashionAlert #StylePria"
    ],
    "Fashion": [
      "{greeting} 🌸\n\nKoleksi baru sudah hadir di {loc} — dan penampilanmu langsung naik level!\n\nDesain yang tidak ketinggalan zaman, ukuran yang inklusif, dan kualitas bahan yang bikin nyaman dipakai seharian. Bukan fast fashion — ini investasi penampilan yang sesungguhnya.\n\n{cta}\n\n#FashionLokal #OOTD #{area}",
      "{greeting} 💜\n\nSetiap jahitan dikerjakan dengan standar yang ketat.\n\nBahan kami lolos uji kenyamanan — tidak gerah, tidak luntur setelah puluhan kali cuci. Koleksi terbaru sudah tersedia di {loc}, {usp}. Temukan gaya terbaik versimu.\n\n{cta}\n\n#FashionBerkualitas #MadeToLast #StyleLokal",
      "{greeting} 🛍\n\nPeringatan: koleksi limited edition ini hampir habis!\n\nTiga varian sold out dalam 90 menit kemarin. Hari ini restock terakhir di {loc}, {usp}. Jangan sampai menyesal karena terlambat.\n\n{cta}\n\n#NewArrival #LimitedStock #FashionAlert"
    ],
    "FashionMuslim": [
      "{greeting} 🧕\n\nKoleksi busana muslim terbaru sudah hadir di {loc} — dan tampilanmu langsung makin anggun!\n\nDesain mengikuti tren terkini namun tetap syar'i, bahan yang adem dan nyaman dipakai seharian. Dari gamis casual hingga formal, semua lengkap. {usp}.\n\n{cta}\n\n#FashionMuslim #BusanaMuslim #{area}",
      "{greeting} 💜\n\nTampil muslimah itu tidak harus kaku — bisa tetap stylish dan percaya diri!\n\nKoleksi kami di {loc} dirancang khusus untuk perempuan berhijab yang ingin tampil modern tanpa meninggalkan nilai kesopanan. Bahan berkualitas, jahitan rapi, ukuran lengkap. {usp}.\n\n{cta}\n\n#HijabFashion #MuslimahModern #FashionLokal",
      "{greeting} ⏰\n\nKoleksi busana muslim edisi terbatas hampir habis di {loc}!\n\n3 varian sudah sold out kemarin. {usp}.\n\n{cta}\n\n#BusanaMuslimLimited #FashionHijab #StokTerbatas"
    ],
    "Real Estate": [
      "{greeting} 🏡\n\nSudah lama ingin punya hunian sendiri di {loc}?\n\nRumah bukan sekadar bangunan — ini tentang keamanan keluarga, masa depan anak, dan investasi yang nilainya terus tumbuh. Kami hadir untuk bantu kamu mewujudkannya, dari konsultasi hingga serah terima kunci.\n\n{cta}\n\n#RumahImpian #PropertiLokal #InvestasiKeluarga",
      "{greeting} 📍\n\n{usp}.\n\nSertifikat HM, IMB lengkap, konstruksi menggunakan standar SNI. Akses tol, sekolah favorit, dan fasilitas publik semuanya dalam jangkauan. Ini bukan sekadar janji — ini spesifikasi yang bisa kamu verifikasi sendiri.\n\n{cta}\n\n#PropertiTerpercaya #RumahSNI #InvestasiAman",
      "{greeting} ⚠\n\nUnit tersisa tinggal 3 dengan harga pre-launch!\n\nBegitu terjual, harga naik signifikan. Jangan tunda keputusan yang bisa mengubah masa depan keluargamu. Survei gratis tersedia hari ini di {loc}.\n\n{cta}\n\n#UnitTerbatas #PropertiLokal #JanganTerlambat"
    ],
    "Beauty/Self-care": [
      "{greeting} 🌸\n\nRahasia kulit glowing warga {area} akhirnya terbongkar!\n\nBukan filter, bukan editan — ini hasil nyata dari rangkaian perawatan yang tepat. Ribuan pelanggan sudah merasakan perubahan dalam 2 minggu pertama. Kini giliranmu. {usp}.\n\n{cta}\n\n#BeautyLokal #GlowUpAsli #SkincareJujur",
      "{greeting} ✨\n\nTransparan soal kandungan, jujur soal hasil.\n\nFormula kami mengandung Niacinamide 10%, Tranexamic Acid, dan ekstrak herbal lokal. Telah diuji dermatologi, bebas paraben, fragrance-free — cocok untuk kulit sensitif dan berminyak. {usp}.\n\n{cta}\n\n#SkincareTransparan #FormulaTeruji #BeautyLokal",
      "{greeting} 💥\n\nFlash sale skincare HARI INI SAJA!\n\nHemat hingga 40% untuk paket pilihan di {loc}. Stok promo hanya 15 set — kemarin habis dalam 4 jam. Masih mau scroll dulu?\n\n{cta}\n\n#PromoSkincare #FlashSale #GlowUpSekarang"
    ],
    "Tourism": [
      "{greeting} 🗺\n\n{usp}!\n\nBelum banyak yang tau, tapi yang sudah ke sana selalu ingin kembali. Spot yang indah, fasilitas yang memadai, dan pengalaman lokal yang autentik menunggu kamu di sana.\n\n{cta}\n\n#WisataLokal #HiddenGem #ExploreIndonesia",
      "{greeting} 🌟\n\nRating 4.8/5 dari 500+ ulasan nyata.\n\nBukan sekadar bagus di foto — pengalaman sesungguhnya bahkan lebih berkesan. Pemandu bersertifikat, fasilitas lengkap, dan momen tak terlupakan yang menanti di sekitar {loc}, {usp}.\n\n{cta}\n\n#WisataFasilitas #TravelJujur #DestinasiLokal",
      "{greeting} 🎯\n\nPromo paket wisata weekend ini — diskon 35%!\n\nBooking hari ini untuk perjalanan ke destinasi terbaik di area {area}. Slot sangat terbatas, promo berakhir malam ini. {usp}.\n\n{cta}\n\n#PromoWisata #WeekendTrip #BookingSekarang"
    ],
    "Retro Automotive": [
      "{greeting} 🏍\n\nKomunitas otomotif klasik terbaik di {loc} — bukan kaleng-kaleng!\n\nMekanik berpengalaman, spare part original dari importir resmi, dan brotherhood yang solid. Tempat yang tepat untuk motor klasik kesayanganmu. {usp}.\n\n{cta}\n\n#OtomotifKlasik #MotorKlasik #KomunitasRider",
      "{greeting} 🔧\n\nStandar bengkel kami tidak main-main.\n\nTeknisi bersertifikat, spare part original, garansi pengerjaan 30 hari. Setiap kendaraan keluar dari bengkel kami dalam kondisi prima — bukan asal jalan. {usp}.\n\n{cta}\n\n#BengkelProfesional #SparePartOriginal #GaransiServis",
      "{greeting} ⚡\n\nWeekend ini: servis gratis ongkos jasa!\n\nBawa motor klasikmu ke bengkel kami di {loc} — gratis ongkos jasa untuk servis ringan. Berlaku Sabtu-Minggu, kuota terbatas 10 motor. {usp}.\n\n{cta}\n\n#PromoServis #BengkelLokal #WeekendDeal"
    ],
    "Parenting": [
      "{greeting} 👶\n\nSemua yang terbaik untuk si kecil tersedia di {loc}!\n\nPilihan produk bayi yang sudah dikurasi ketat — aman, teruji, dan terpercaya. Karena setiap tahap tumbuh kembang anak itu berharga dan tidak boleh ada yang terlewat. {usp}.\n\n{cta}\n\n#ProdukBayi #ParentingLokal #SiKecilAman",
      "{greeting} 🌟\n\nKeamanan si kecil bukan untuk dikompromikan.\n\nSemua produk bayi kami telah melewati sertifikasi SNI dan uji keamanan klinis. Bebas BPA, bebas formalin, bebas pewarna berbahaya. Konsultasi gratis tersedia setiap hari di {loc}.\n\n{cta}\n\n#BabyProduct #SNISafe #ParentingJujur",
      "{greeting} 🎁\n\nPromo bundling newborn — hemat 30%, stok terbatas!\n\nPaket lengkap perlengkapan bayi baru lahir di {loc}, {usp}. Tersisa 20 paket hari ini. Untuk para orang tua baru yang tidak ingin ketinggalan.\n\n{cta}\n\n#BundlingBayi #PromoNewborn #OrderSekarang"
    ],
    "Tech/Electronics": [
      "{greeting} 💻\n\nMasih pakai perangkat yang lemot? Waktunya upgrade!\n\nSetup impian bukan soal mahal — tapi soal tahu tempat yang tepat. Gadget terlengkap dengan garansi resmi, di {loc}, {usp}. Tim kami siap bantu pilihkan yang paling sesuai kebutuhanmu.\n\n{cta}\n\n#GadgetLokal #SetupImpian #TechUpgrade",
      "{greeting} ⚡\n\nGaransi resmi distributor, bukan sekadar klaim.\n\nSemua unit di toko kami bergaransi minimum 1 tahun dari distributor resmi. Konsultasi spesifikasi gratis sebelum beli — supaya kamu tidak salah pilih dan tidak menyesal. {usp}.\n\n{cta}\n\n#GadgetGaransi #TechJujur #KonsultasiGratis",
      "{greeting} 🔥\n\nFlash sale gadget — hari ini saja!\n\nDiskon besar untuk smartphone dan laptop pilihan di {loc}. Stok sangat terbatas — 50+ unit sudah terjual dari pagi tadi. {usp}.\n\n{cta}\n\n#FlashSaleGadget #TechDeal #GasSekarang"
    ],
    "Pet Supplies": [
      "{greeting} 🐾\n\nAnabul kesayanganmu layak mendapatkan yang terbaik!\n\nLengkap dari pakan premium, aksesoris, hingga layanan grooming profesional — semua tersedia di {loc}. Karena anabul bahagia berarti kamu juga bahagia. {usp}.\n\n{cta}\n\n#PetLovers #AnabulBahagia #PetShopLokal",
      "{greeting} 🐱\n\nSoal kualitas produk anabul, kami tidak asal pilih.\n\nPakan berstandar nutrisi AAFCO, produk grooming yang dermatologically tested untuk hewan, dan dokter hewan tersedia setiap hari tanpa perlu appointment. {usp}.\n\n{cta}\n\n#PetHealth #PakanBerkualitas #DokterHewan",
      "{greeting} 🐶\n\nPromo grooming profesional minggu ini — slot terbatas!\n\nHanya 15 slot per hari di {loc}. Sudah 10 terisi hari ini. Book segera sebelum jadwal penuh. {usp}.\n\n{cta}\n\n#PromoGrooming #AnabulHappy #BookSekarang"
    ],
    "Creative/Arts": [
      "{greeting} 🎨\n\nSeni lokal {loc} yang sesungguhnya — bukan sekadar hiasan!\n\nKarya dari seniman asli daerah, dibuat dengan tangan, penuh makna dan cerita. Setiap karya dilengkapi sertifikat keaslian. Kualitas museum dengan harga yang terjangkau. {usp}.\n\n{cta}\n\n#SeniLokal #KaryaAsli #SupportSenimanLokal",
      "{greeting} 🖌\n\nKurasi ketat untuk kualitas yang tidak mengecewakan.\n\nGaleri kami di {loc} hanya menampilkan karya yang lolos seleksi ketat — dilengkapi dokumentasi proses dan sertifikat keaslian. Investasi seni yang nilainya bertumbuh. {usp}.\n\n{cta}\n\n#SeniKurator #KaryaBersertifikat #ArtIndonesia",
      "{greeting} ✨\n\nPameran eksklusif — akhir pekan ini saja!\n\nKarya terbaru seniman lokal {loc} dengan harga perdana sebelum masuk galeri resmi. Koleksi terbatas. {usp}. Jangan sampai menyesal karena tidak datang.\n\n{cta}\n\n#PameranLokal #KoleksiTerbatas #ArtWeekend"
    ],
    "Heritage & Cultural Fashion": [
      "{greeting} 🧵\n\nBatik bukan sekadar kain — ini identitas bangsa!\n\nKoleksi batik tulis dari pengrajin lokal {loc}, dibuat dengan pewarna alami dan motif yang bermakna. Setiap helai kain menyimpan cerita warisan budaya yang harus terus hidup. {usp}.\n\n{cta}\n\n#BatikLokal #WarisanBudaya #BanggaBuatanIndonesia",
      "{greeting} 🇮🇩\n\nBatik tulis butuh waktu 2 hingga 6 minggu untuk satu lembar — dan itu bukan kelemahan, itu keistimewaan.\n\nBahan kain primissima berkualitas tinggi, pewarna alami ramah lingkungan. Bukan batik printing — ini warisan yang hidup dan bisa kamu kenakan. {usp}.\n\n{cta}\n\n#BatikTulis #PewarnaAlami #WarisanHidup",
      "{greeting} ⏰\n\nKoleksi edisi terbatas — hampir habis!\n\nHanya 50 lembar diproduksi, dan 30 sudah terjual. Motif eksklusif dari pengrajin {loc} ini tidak akan dibuat ulang. {usp}. Pesan sekarang.\n\n{cta}\n\n#BatikLimited #EdisiTerbatas #PesanSekarang"
    ],
    "Interior Design": [
      "{greeting} 🏡\n\nRumahmu terasa kurang sesuatu? Kami punya solusinya!\n\nLayanan desain interior sat-set — konsultasi, desain, eksekusi, terima beres. Tidak perlu pusing urusan teknis atau bolak-balik toko material. Kami yang handle semuanya. {usp}.\n\n{cta}\n\n#InteriorLokal #DesainRumah #SatSetTerimaJadi",
      "{greeting} 🛋\n\nLihat hasilnya dulu, baru tukang mulai kerja.\n\nKami menyediakan visualisasi 3D sebelum eksekusi — tidak ada kejutan, tidak ada miskomunikasi. Tim kami berpengalaman 8+ tahun dengan 200+ proyek selesai. {usp}.\n\n{cta}\n\n#DesainerInterior #Visualisasi3D #InteriorProfesional",
      "{greeting} 🎁\n\nKonsultasi gratis senilai Rp 500.000 — minggu ini saja!\n\nHanya untuk 10 klien pertama di {loc}. Sudah 6 slot terisi. Daftar sekarang sebelum habis. {usp}.\n\n{cta}\n\n#KonsultasiGratis #InteriorDeal #BookSekarang"
    ],
    "Sports Apparel": [
      "{greeting} 💪\n\nGear olahraga yang tepat nyata bedanya untuk performa!\n\nBukan sekadar kelihatan sporty — produk kami menggunakan teknologi moisture-wicking, anti-odor, dan ergonomic cut yang direkomendasikan trainer dan atlet lokal. {usp}.\n\n{cta}\n\n#GearSport #OlahragaLokal #PerformaOptimal",
      "{greeting} 🏃\n\nInvestasi terbaik untuk kesehatanmu dimulai dari gear yang benar.\n\nLengkap dari sepatu lari, pakaian gym, hingga aksesoris outdoor — semua dari brand terpercaya dengan garansi resmi. Konsultasi produk gratis tersedia di {loc}, {usp}.\n\n{cta}\n\n#SportsTech #GearPerforma #OlahragaSerius",
      "{greeting} ⚡\n\nFlash sale sports gear — weekend ini saja!\n\nDiskon besar untuk koleksi lari dan gym di {loc}. Stok terbatas untuk ukuran populer — sudah banyak yang diambil dari tadi pagi. {usp}.\n\n{cta}\n\n#FlashSaleSports #GearMurah #GasSekarang"
    ],
    "Literature & Education": [
      "{greeting} 📚\n\nBuku yang tepat bisa mengubah cara pandangmu dalam semalam!\n\nKoleksi terlengkap di {loc} — dari novel, non-fiksi, buku akademik, hingga buku anak. Semua dikurasi oleh pembaca yang serius. {usp}.\n\n{cta}\n\n#BukuLokal #LiterasiIndonesia #ReadingCommunity",
      "{greeting} 🎓\n\nInvestasi terbaik adalah investasi pada pengetahuan.\n\nToko buku kami di {loc} tidak hanya menjual buku — kami membantu kamu menemukan bacaan yang benar-benar relevan untuk tujuanmu. Konsultasi rekomendasi gratis. {usp}.\n\n{cta}\n\n#BukuBerkualitas #LiterasiLokal #InvestasiIlmu",
      "{greeting} ⚡\n\nNew arrival buku bulan ini — stok terbatas!\n\nJudul-judul bestseller dan koleksi langka baru masuk ke toko kami di {loc}. {usp}. Jangan sampai kehabisan edisi pertama.\n\n{cta}\n\n#NewArrivalBuku #BukuTerbatas #ReadersOfInstagram"
    ],
    "High-end Goods": [
      "{greeting} 👜\n\nLuxury bukan sekadar harga — ini soal kualitas yang bertahan seumur hidup.\n\nKoleksi premium kami di {loc} dipilih dengan standar ketat. Setiap item dilengkapi sertifikat keaslian dan layanan after-sales eksklusif. {usp}.\n\n{cta}\n\n#LuxuryLokal #PremiumGoods #InvestasiGaya",
      "{greeting} ✨\n\nMereka yang paham kualitas tidak perlu diyakinkan dua kali.\n\nKoleksi luxury kami di {loc} dipilih langsung dari brand heritage terpercaya. Layanan personal shopper tersedia — karena kamu layak mendapat pengalaman belanja yang berbeda. {usp}.\n\n{cta}\n\n#PersonalShopper #LuxuryLifestyle #PremiumExperience",
      "{greeting} 🔔\n\nKoleksi eksklusif baru tiba — sangat terbatas!\n\nHanya tersedia untuk {usp}. Item luxury ini tidak akan restock setelah habis. Hubungi kami untuk reservasi sebelum kehabisan.\n\n{cta}\n\n#LimitedLuxury #ExclusiveCollection #PremiumOnly"
    ],
    "Wedding/Jewelry": [
      "{greeting} 💍\n\nMomen terpenting dalam hidupmu layak perhiasan yang sempurna!\n\nKoleksi cincin, kalung, dan perhiasan pengantin dari pengrajin terpercaya di {loc}. Custom design tersedia — wujudkan cincin impianmu persis seperti yang kamu bayangkan. {usp}.\n\n{cta}\n\n#CincinNikah #PerhiasanLokal #WeddingJewelry",
      "{greeting} ✨\n\nPerhiasan bukan sekadar aksesori — ini kenangan yang bertahan selamanya.\n\nDesain custom, bahan gold certified, pengerjaan presisi oleh pengrajin berpengalaman di {loc}. Konsultasi desain gratis, tanpa tekanan. {usp}.\n\n{cta}\n\n#CustomJewelry #PerhiasanPengantin #GoldCertified",
      "{greeting} ⏰\n\nPromo spesial pasangan — konsultasi & desain gratis bulan ini!\n\nHanya untuk 10 pasangan pertama di {loc}. Sudah 6 slot terisi. Wujudkan perhiasan impian sebelum slot habis. {usp}.\n\n{cta}\n\n#PromoWedding #CincinCustom #BookSekarang"
    ],
    "Banking/Finance": [
      "{greeting} 💰\n\nFinancial freedom dimulai dari langkah pertama yang tepat!\n\nKonsultasi keuangan di {loc} — dari perencanaan investasi, asuransi, hingga manajemen portofolio. Tidak ada biaya konsultasi untuk pertemuan pertama. {usp}.\n\n{cta}\n\n#FinancialLiteracy #InvestasiLokal #CerdasKeuangan",
      "{greeting} 📈\n\nUang yang tidak dikelola dengan benar akan diam di tempat.\n\nTim konsultan keuangan kami di {loc} membantu kamu memahami investasi yang sesuai profil risiko dan tujuan finansialmu — tanpa jargon yang membingungkan. {usp}.\n\n{cta}\n\n#KonsultanKeuangan #InvestasiCerdas #FinancialGoals",
      "{greeting} 🔔\n\nWorkshop literasi keuangan GRATIS — akhir pekan ini!\n\nTerbatas untuk 30 peserta di {loc}. Materi: investasi pemula, manajemen utang, dan perencanaan pensiun. Sudah 22 kursi terisi. {usp}.\n\n{cta}\n\n#WorkshopGratis #LiterasiKeuangan #InvestasiPemula"
    ],
    "Music/Events": [
      "{greeting} 🎵\n\nPengalaman konser lokal terbaik ada di {loc}!\n\nLineup artis pilihan, sound system profesional, dan venue yang nyaman. Bukan sekadar nonton — ini pengalaman yang akan kamu ceritakan. {usp}.\n\n{cta}\n\n#MusicLokal #KonserLokal #EventIndonesia",
      "{greeting} 🎤\n\nDukung musisi lokal {loc} yang karyanya setara internasional!\n\nEvent kami menghadirkan artis independen terbaik daerah — live performance yang jujur dan penuh energi. Tiket tersedia terbatas. {usp}.\n\n{cta}\n\n#SupportMusikaLokal #IndieScene #LiveMusic",
      "{greeting} 🎉\n\nEarly bird tiket habis dalam 3 jam — regular price berlaku sekarang!\n\nEvent di {loc} ini hanya sekali. Tidak ada rerun. Jangan sampai menyesal tidak hadir. {usp}.\n\n{cta}\n\n#EventLokal #TiketTerbatas #GasSekarang"
    ],
    "Sustainability": [
      "{greeting} 🌿\n\nPilihan konsumsi kamu hari ini menentukan bumi seperti apa yang ditinggalkan untuk generasi berikutnya.\n\nProduk eco-friendly dan sustainable dari {loc} — bahan ramah lingkungan, packaging minimal waste, diproduksi etis. {usp}.\n\n{cta}\n\n#EcoFriendly #SustainableLokal #GoGreen",
      "{greeting} ♻\n\nSustainable living tidak harus mahal — harus tepat.\n\nProduk pilihan kami di {loc} sudah tersertifikasi ramah lingkungan. Setiap pembelian berkontribusi pada program penanaman pohon lokal. {usp}.\n\n{cta}\n\n#ZeroWaste #EcoConscious #SustainableChoice",
      "{greeting} 🌱\n\nGerakan eco-friendly {loc} dimulai dari komunitas kita sendiri!\n\nPromo spesial untuk pembelian produk sustainable hari ini — hemat 20% dan gratis tote bag daur ulang. Stok terbatas. {usp}.\n\n{cta}\n\n#EcoPromo #SustainableLifestyle #GoGreenLokal"
    ],
    "Fotografi": [
      "{greeting} 📸\n\nMomen terbaik hanya terjadi sekali — abadikan bersama fotografer profesional di {loc}!\n\nHasil foto yang tajam, natural, dan bercerita. Bukan sekadar gambar — ini kenangan yang akan kamu simpan seumur hidup. {usp}.\n\n{cta}\n\n#FotografiLokal #MomenBerharga #{area}",
      "{greeting} ✨\n\nFoto yang baik bukan soal kamera mahal — tapi soal siapa yang memegangnya.\n\nTim fotografer kami di {loc} berpengalaman dan paham cara menangkap cahaya, ekspresi, dan suasana yang paling pas. {usp}.\n\n{cta}\n\n#FotoProfesional #KualitasFoto #FotograferLokal",
      "{greeting} 📅\n\nSlot sesi foto bulan ini hampir penuh!\n\nHanya tersisa beberapa jadwal di {loc}. {usp}. Jangan tunda — momen yang terlewat tidak bisa diulang.\n\n{cta}\n\n#BookingFoto #SlotTerbatas #FotoSekarang"
    ],
    "JasaProfesional": [
      "{greeting} 💼\n\nButuh bantuan profesional yang bisa benar-benar diandalkan? Serahkan ke ahlinya.\n\nTim profesional kami di {loc} siap membantu dengan solusi yang tepat, jelas, dan tidak berbelit. Konsultasi pertama gratis. {usp}.\n\n{cta}\n\n#JasaProfesional #KonsultasiGratis #SolusiTepat",
      "{greeting} 🤝\n\nKeputusan yang salah bisa merugikan bertahun-tahun — konsultasi dulu sebelum melangkah.\n\nKami di {loc} membantu kamu memahami risiko dan pilihan terbaik dengan bahasa yang mudah dimengerti. Bukan jargon — tapi solusi nyata. {usp}.\n\n{cta}\n\n#KonsultanTerpercaya #JasaProfesional #SolusiNyata",
      "{greeting} 📋\n\nJadwal konsultasi awal GRATIS — terbatas untuk minggu ini!\n\nDi {loc}, kami membuka slot khusus konsultasi tanpa biaya. {usp}. Amankan jadwalmu sekarang.\n\n{cta}\n\n#KonsultasiGratis #JasaProfesional #SlotTerbatas"
    ],
    "EventCatering": [
      "{greeting} 🎉\n\nAcara impianmu layak ditangani oleh tim yang benar-benar profesional!\n\nDari konsep hingga eksekusi, kami di {loc} pastikan setiap detail terjaga. Catering lezat, dekorasi memukau, dan koordinasi yang mulus. {usp}.\n\n{cta}\n\n#EventOrganizer #CateringLokal #AcaraBerkesan",
      "{greeting} ✨\n\nAcara yang sempurna tidak terjadi begitu saja — butuh tim yang tepat.\n\nSudah ratusan acara sukses kami tangani di {loc}: pernikahan, ulang tahun, gathering perusahaan, dan lebih banyak lagi. {usp}. Kamu tinggal hadir dan menikmati.\n\n{cta}\n\n#WeddingOrganizer #EventProfesional #CateringEnak",
      "{greeting} 📅\n\nSlot acara bulan depan sudah mulai terisi!\n\nSegera konsultasikan rencana acaramu dengan tim kami di {loc}. Konsultasi gratis, estimasi harga transparan. {usp}. Jangan sampai tanggal yang kamu inginkan sudah terpakai.\n\n{cta}\n\n#BookingEvent #CateringTerlengkap #AcaraImpian"
    ],
    "KebersihanLaundry": [
      "{greeting} 🧺\n\nPakaian bersih, wangi, rapi — tanpa harus repot dan buang waktu!\n\nLayanan laundry profesional di {loc}: dicuci bersih, disetrika rapi, diantar tepat waktu. {usp}.\n\n{cta}\n\n#LaundryLokal #CuciBaju #PraktisHariIni",
      "{greeting} ✅\n\nWaktu itu berharga — serahkan urusan laundry ke kami.\n\nProses cuci higienis, pewangi pilihan, hasil rapi yang tahan lama. Layanan antar-jemput tersedia di area {area}. {usp}.\n\n{cta}\n\n#LaundryProfesional #AntarJemput #BersihWangi",
      "{greeting} 🔔\n\nPromo laundry kilogram hari ini — harga spesial!\n\nLaundry bersih dan wangi di {loc}. {usp}. Antar sekarang, selesai besok pagi.\n\n{cta}\n\n#PromoLaundry #LaundryMurah #OrderSekarang"
    ],
    "General": [
      "{greeting} 👋\n\nAda yang baru dan menarik di {loc} — dan kamu yang pertama tau!\n\nKami hadir khusus untuk komunitas lokal di sini, bukan korporat besar dari jauh. Tetangga sendiri yang usaha, yang benar-benar paham kebutuhanmu. {usp}.\n\n{cta}\n\n#UsahaLokal #UMKMLokal #BanggaBuatanIndonesia",
      "{greeting} 💪\n\nKonsisten dan terpercaya sejak hari pertama buka.\n\nKualitas yang tidak pernah kami kompromikan, pelayanan yang jujur, dan harga yang bersahabat. Sudah dipercaya warga {area} selama ini. Tidak ada janji lebay — hanya hasil yang bisa kamu rasakan sendiri.\n\n{cta}\n\n#LokalTerpercaya #KualitasKonsisten #UMKMHebat",
      "{greeting} 🔔\n\nPenawaran khusus untuk pelanggan baru hari ini!\n\nPromo spesial di {loc}, {usp}. Stok sangat terbatas — sudah ratusan yang memanfaatkan sejak pagi. Jangan sampai ketinggalan.\n\n{cta}\n\n#PromoLokal #PenawaranKhusus #TerbatasHariIni"
    ]
  },
  "tiktok": {
    "Kuliner": [
      "POV: Kamu baru nemu tempat makan di {loc} yang aromanya bikin lapar sebelum masuk pintu 😭🍽\n\n{greeting}! Bahan fresh, resep original, dan harganya masuk akal. Rating dari pelanggan nyata, bukan buzzer.\n\n{usp}. {cta}",
      "Kalau masih cari-cari tempat makan yang konsisten enak di {loc}, ini jawabannya. ✅\n\n{greeting}! Bahan segar setiap hari, bumbu asli, tidak ada penyedap berlebih. Cek sendiri — {usp}.\n\n{cta}",
      "Menu spesial hari ini TERBATAS — kemarin habis 2 jam 😱\n\n{greeting}! Stok hari ini lebih sedikit lagi. Kami di {loc}, {usp}. Mau nunggu habis dulu?\n\n{cta}"
    ],
    "Kuliner/Cafe": [
      "POV: Nemu cafe di {loc} yang WiFi-nya kenceng, kopinya enak, dan selalu ada kursi 😍☕\n\n{greeting}! Literally jadi basecamp WFH terbaik. {usp}.\n\n{cta}",
      "Specialty coffee itu beda dari kopi biasa — dan ini buktinya. ✨\n\n{greeting}! Di cafe kami, setiap cangkir diseduh manual dari biji single origin. Rasa tidak bisa bohong. {usp}.\n\n{cta}",
      "Promo hari ini: beli kopi dapat cake gratis! 🎂☕\n\n{greeting}! Hanya di {loc}, berlaku sampai stok habis. Sudah 30+ transaksi dari pagi tadi.\n\n{cta}"
    ],
    "FashionPria": [
      "Outfit pria yang always on point ada di sini! 👔\n\n{greeting}! Koleksi baru landing di {loc} — dari casual santai sampai formal kece. Stok terbatas.\n\n{cta}",
      "Pria stylish tahu beda bahan bagus vs biasa 💼\n\n{greeting}! Koleksi premium kami di {loc} — breathable, awet, dan potongannya flattering. {usp}.\n\n{cta}",
      "NEW ARRIVAL PRIA — sold out kemarin balik lagi! ⚡\n\n{greeting}! Restock terakhir di {loc}. {usp}. Gas sebelum kehabisan lagi!\n\n{cta}"
    ],
    "Fashion": [
      "Koleksi baru di {loc} yang langsung sold out kemarin ✨\n\n{greeting}! Tag teman yang butuh fashion upgrade serius!\n\n{cta}",
      "Bahan premium, jahitan rapi, ukuran inklusif 💜\n\n{greeting}! Ini bukan fast fashion — tahan puluhan kali cuci. {usp}.\n\n{cta}",
      "NEW ARRIVAL ALERT — koleksi limited landing di {loc} 🛍\n\n{greeting}! 3 varian sold out dalam 90 menit kemarin. Restock hari ini — terakhir!\n\n{cta}"
    ],
    "FashionMuslim": [
      "Koleksi busana muslim baru di {loc} yang langsung sold out kemarin 🧕✨\n\n{greeting}! Desain syar'i tapi tetap modern dan stylish. Tag sahabat muslimahmu!\n\n{cta}",
      "Tampil anggun seharian tanpa ribet — ini rahasianya 💜\n\n{greeting}! Bahan adem, jahitan rapi, model terkini. Koleksi muslimah di {loc}. {usp}.\n\n{cta}",
      "KOLEKSI MUSLIM LIMITED EDITION — hampir habis! ⏰\n\n{greeting}! 3 varian sold out kemarin di {loc}. Restock terakhir — gas sebelum kehabisan!\n\n{cta}"
    ],
    "Real Estate": [
      "POV: Akhirnya punya rumah sendiri di {loc} setelah bertahun-tahun ngontrak 🏡\n\n{greeting}! Prosesnya dibantu dari awal sampai kunci di tangan.\n\n{cta}",
      "{usp}. Sertifikat HM, konstruksi SNI 📍\n\n{greeting}! Ini spesifikasi yang bisa kamu verifikasi sendiri — bukan janji kosong.\n\n{cta}",
      "Unit tersisa TINGGAL 3 — harga pre-launch ⚠\n\n{greeting}! Harga naik begitu terjual. Survei gratis hari ini — jangan tunda!\n\n{cta}"
    ],
    "Beauty/Self-care": [
      "POV: 2 minggu pakai skincare dari {loc} dan semua orang bertanya rahasianya 😭✨\n\n{greeting}! Bukan filter — ini hasil nyata.\n\n{cta}",
      "Ingredient list yang jujur, hasil yang transparan 🌸\n\n{greeting}! Niacinamide 10%, bebas paraben, dermatologi tested. {usp}.\n\n{cta}",
      "Flash sale skincare HARI INI — diskon 40%! 💥\n\n{greeting}! Stok 15 set tinggal. Kemarin habis dalam 4 jam.\n\n{cta}"
    ],
    "Tourism": [
      "Hidden gem {usp}.\n\n{cta}",
      "Rating 4.8/5 dari 500+ ulasan nyata — bukan bot 🌟\n\n{greeting}! Pengalaman nyatanya lebih keren dari kontennya. Destinasi area {area}.\n\n{cta}",
      "Promo paket wisata weekend — diskon 35%! ✈\n\n{greeting}! Booking hari ini untuk trip area {area}. Slot sangat terbatas.\n\n{cta}"
    ],
    "Retro Automotive": [
      "POV: Bawa motor klasik ke bengkel spesialis di {loc} vs bengkel biasa 🏍\n\n{greeting}! Beda banget hasilnya — ini standar yang kamu deserves.\n\n{cta}",
      "Spare part original, teknisi bersertifikat, garansi 30 hari 🔧\n\n{greeting}! {usp}. Standar yang benar.\n\n{cta}",
      "SERVIS GRATIS weekend ini — ongkos jasa ditanggung! ⚡\n\n{greeting}! Kuota hanya 10 motor. Sudah 7 terisi.\n\n{cta}"
    ],
    "Parenting": [
      "POV: Jadi orang tua baru dan nemu toko bayi terlengkap {usp}.\n\n{cta}",
      "SNI certified, bebas BPA dan bahan berbahaya 🌟\n\n{greeting}! Toko bayi kami di {loc} — tidak ada kompromi soal keamanan si kecil.\n\n{cta}",
      "Bundling newborn spesial — hemat 30%! Stok terbatas 🎁\n\n{greeting}! Hanya 20 paket tersisa di {loc}.\n\n{cta}"
    ],
    "Tech/Electronics": [
      "POV: Nemu toko gadget di {loc} yang harganya wajar dan garansi resmi beneran 💻\n\n{greeting}! Worth it banget. Ini yang paling direkomendasikan.\n\n{cta}",
      "Garansi resmi distributor, konsultasi spesifikasi gratis ⚡\n\n{greeting}! Semua baru, tidak ada rekondisi. {usp}.\n\n{cta}",
      "Flash sale gadget HARI INI 🔥\n\n{greeting}! 50+ unit sudah terjual dari pagi. Stok flash sale terbatas.\n\n{cta}"
    ],
    "Pet Supplies": [
      "POV: Anabul kamu suka banget produk dari {loc} dan kamu nggak mau ganti 🐾\n\n{greeting}! Pakan premium beda kelas — terbukti.\n\n{cta}",
      "Nutrisi standar AAFCO, grooming produk dermatologically tested 🐱\n\n{greeting}! {usp}. Dokter hewan setiap hari.\n\n{cta}",
      "Promo grooming MINGGU INI — slot terbatas! 🐶\n\n{greeting}! Hanya 15 slot per hari. Sudah 10 terisi.\n\n{cta}"
    ],
    "Creative/Arts": [
      "POV: Nemu karya seni lokal {loc} yang kualitasnya setara galeri internasional 🎨\n\n{greeting}! Support seniman asli daerah kita yuk!\n\n{cta}",
      "Sertifikat keaslian, dokumentasi proses pembuatan 🖌\n\n{greeting}! Galeri kami di {loc} hanya tampilkan karya yang lolos kurasi.\n\n{cta}",
      "Pameran terbatas AKHIR PEKAN INI saja ✨\n\n{greeting}! Harga perdana sebelum masuk galeri resmi. {usp}.\n\n{cta}"
    ],
    "Heritage & Cultural Fashion": [
      "Batik tulis asli dari {loc} — bukan printing, bukan cap 🧵\n\n{greeting}! Ini warisan budaya yang masih hidup. Lihat prosesnya langsung.\n\n{cta}",
      "Pewarna alami, kain primissima, 2–6 minggu pengerjaan per lembar 🇮🇩\n\n{greeting}! Batik kami di {loc} bukan fast fashion budaya — nilai investasinya terus naik.\n\n{cta}",
      "Koleksi edisi terbatas — 30 dari 50 lembar sudah terjual! ⏰\n\n{greeting}! Motif eksklusif {loc}, tidak akan diproduksi ulang.\n\n{cta}"
    ],
    "Interior Design": [
      "POV: Rumah di {loc} yang biasa aja jadi dream home setelah disentuh tim interior kami 🏡\n\n{greeting}! Sat-set, terima beres — tidak perlu pusing teknis.\n\n{cta}",
      "Lihat hasil 3D dulu sebelum tukang mulai kerja 🛋\n\n{greeting}! Tim kami di {loc}, 8+ tahun pengalaman, 200+ proyek selesai.\n\n{cta}",
      "Konsultasi gratis MINGGU INI — nilai Rp 500rb! ✨\n\n{greeting}! Hanya 10 slot tersisa. Sudah 6 terisi.\n\n{cta}"
    ],
    "Sports Apparel": [
      "POV: Ganti gear olahraga ke yang benar-benar berkualitas dan langsung ngaruh ke performa 💪\n\n{greeting}! {usp}.\n\n{cta}",
      "Moisture-wicking, anti-odor, ergonomic cut — standar gear kami 🏃\n\n{greeting}! Direkomendasikan trainer dan atlet lokal {loc}.\n\n{cta}",
      "Flash sale sports gear WEEKEND INI ⚡\n\n{greeting}! Diskon besar di {loc}. Ukuran populer cepat habis.\n\n{cta}"
    ],
    "Literature & Education": [
      "POV: Nemu toko buku di {loc} yang rekomendasinya selalu tepat sasaran 📚\n\n{greeting}! Bukan sekadar jual buku — mereka bantu kamu temukan yang paling relevan.\n\n{cta}",
      "Investasi terbaik yang pernah ada? Buku yang tepat. 🎓\n\n{greeting}! Koleksi terlengkap ada di {loc}. {usp}.\n\n{cta}",
      "New arrival buku bulan ini — stok TERBATAS 📖\n\n{greeting}! Judul bestseller dan koleksi langka baru masuk di {loc}. Jangan sampai kehabisan edisi pertama!\n\n{cta}"
    ],
    "High-end Goods": [
      "POV: Pertama kali pegang produk luxury original — dan langsung ngerti kenapa harganya beda 👜\n\n{greeting}! Koleksi premium bersertifikat ada di {loc}. {usp}.\n\n{cta}",
      "Luxury itu bukan flexing — ini investasi kualitas jangka panjang ✨\n\n{greeting}! Personal shopper kami di {loc} siap bantu kamu pilih yang paling worth it.\n\n{cta}",
      "KOLEKSI EKSKLUSIF BARU — stok sangat terbatas! 🔔\n\n{greeting}! Tidak akan restock setelah habis. {usp}. Hubungi kami sekarang!\n\n{cta}"
    ],
    "Wedding/Jewelry": [
      "POV: Custom cincin nikah persis seperti yang diimpikan dan hasilnya melebihi ekspektasi 💍\n\n{greeting}! Pengrajin perhiasan terpercaya di {loc}. {usp}.\n\n{cta}",
      "Perhiasan yang kamu pakai hari pernikahanmu akan dikenang selamanya 💎\n\n{greeting}! Custom design, gold certified, pengerjaan presisi. Konsultasi gratis di {loc}.\n\n{cta}",
      "Slot konsultasi design perhiasan GRATIS hampir penuh! ⏰\n\n{greeting}! Hanya 10 slot, sudah 6 terisi. Hubungi kami sekarang — {usp}.\n\n{cta}"
    ],
    "Banking/Finance": [
      "POV: Akhirnya ngerti cara investasi yang benar setelah konsultasi di {loc} 📈\n\n{greeting}! Konsultan keuangan yang jelasinnya pakai bahasa manusia, bukan jargon.\n\n{cta}",
      "Duit yang nggak dikelola dengan benar itu diam di tempat 💰\n\n{greeting}! Tim keuangan kami di {loc} bantu kamu mulai dari mana pun kondisinya. {usp}.\n\n{cta}",
      "Workshop literasi keuangan GRATIS weekend ini — 30 kursi! 🔔\n\n{greeting}! Sudah 22 terisi di {loc}. Materi: investasi, manajemen utang, perencanaan pensiun.\n\n{cta}"
    ],
    "Music/Events": [
      "POV: Konser lokal {loc} yang kualitasnya setara event nasional — dan tiketnya masih terjangkau 🎵\n\n{greeting}! Pengalaman live music terbaik yang pernah ada.\n\n{cta}",
      "Support musisi lokal bukan karena terpaksa — karena mereka emang keren 🎤\n\n{greeting}! Event kami di {loc} hadirkan artis indie terbaik daerah. {usp}.\n\n{cta}",
      "Early bird habis, regular price berlaku — tapi stok juga hampir habis! 🎉\n\n{greeting}! Event {loc} ini sekali seumur hidup. Gas sebelum sold out!\n\n{cta}"
    ],
    "Sustainability": [
      "POV: Mulai ganti ke produk sustainable dan nggak mau balik ke yang lama 🌿\n\n{greeting}! Produk eco-friendly dari {loc} — ramah lingkungan, kualitas premium.\n\n{cta}",
      "Sustainable living itu bukan tren — ini keputusan 🌱\n\n{greeting}! Produk eco-certified dari {loc}. {usp}. Setiap beli = tanam pohon lokal.\n\n{cta}",
      "Promo eco-friendly HARI INI — hemat 20% + gratis tote daur ulang! ♻\n\n{greeting}! Stok terbatas di {loc}. Pilihan yang baik untuk kamu dan bumi.\n\n{cta}"
    ],
    "Fotografi": [
      "POV: Terima hasil foto dari fotografer profesional dan langsung nangis terharu 📸\n\n{greeting}! Momen yang tidak bisa diulang — abadikan bersama kami di {loc}. {usp}.\n\n{cta}",
      "Beda banget hasil foto asal vs foto profesional — ini buktinya ✨\n\n{greeting}! Tim fotografer kami di {loc} paham cahaya, ekspresi, dan angle terbaik. {usp}.\n\n{cta}",
      "Slot foto hampir penuh bulan ini 📅\n\n{greeting}! Tersisa beberapa jadwal di {loc}. Jangan tunda — momen tidak bisa diulang.\n\n{cta}"
    ],
    "JasaProfesional": [
      "POV: Akhirnya nemu profesional di {loc} yang jelasinnya pakai bahasa manusia, bukan jargon 💼\n\n{greeting}! Konsultasi gratis untuk pertama kali. {usp}.\n\n{cta}",
      "Masalah yang kompleks sebenarnya bisa diselesaikan — kalau sama ahlinya 🤝\n\n{greeting}! Tim profesional kami di {loc}. {usp}.\n\n{cta}",
      "Konsultasi awal GRATIS minggu ini — slot terbatas! 📋\n\n{greeting}! {usp}. Di {loc}, solusi profesional ada untuk kamu.\n\n{cta}"
    ],
    "EventCatering": [
      "POV: Semua detail acaramu ditangani tim profesional dan hasilnya melebihi ekspektasi 🎉\n\n{greeting}! Event & catering terpercaya di {loc}. {usp}.\n\n{cta}",
      "Acara berkesan itu bukan kebetulan — ini kerja keras tim yang tepat ✨\n\n{greeting}! Ratusan acara sukses di {loc}. {usp}.\n\n{cta}",
      "Slot acara bulan depan mulai terisi! Konsultasi gratis sekarang 📅\n\n{greeting}! {usp}. Hubungi kami di {loc} sebelum tanggalmu diambil orang lain.\n\n{cta}"
    ],
    "KebersihanLaundry": [
      "POV: Pertama kali nyoba laundry profesional di {loc} dan nggak mau balik nyuci sendiri lagi 🧺\n\n{greeting}! Bersih, wangi, rapi — antar tepat waktu. {usp}.\n\n{cta}",
      "Waktu itu mahal — serahkan urusan laundry ke kami ✅\n\n{greeting}! Cuci higienis, setrika rapi, antar-jemput ada. {usp}.\n\n{cta}",
      "Promo laundry kilogram HARI INI! 🔔\n\n{greeting}! Harga spesial di {loc}. {usp}. Antar sekarang, selesai besok pagi.\n\n{cta}"
    ],
    "General": [
      "POV: Nemu usaha lokal {loc} yang kualitasnya jauh di atas ekspektasi 💎\n\n{greeting}! {usp}.\n\n{cta}",
      "Dipercaya warga {area} sejak hari pertama buka 💪\n\n{greeting}! Kualitas konsisten, pelayanan jujur, harga bersahabat.\n\n{cta}",
      "Promo khusus hari ini — hanya untuk kamu! 🔔\n\n{greeting}! {usp}. Stok terbatas.\n\n{cta}"
    ]
  },
  "youtube": {
    "Kuliner": [
      "Kalau kamu warga {area} dan belum pernah coba tempat makan ini, kamu beneran rugi. {greeting}! Bahan segar setiap hari, resep yang tidak pernah kompromi, dan konsistensi rasa yang bisa kamu buktikan sendiri. {usp}. {cta}",
      "{greeting}! Di {loc} ini, kami percaya makanan yang baik dimulai dari bahan yang baik. Tidak ada bumbu instan, tidak ada MSG berlebih. Setiap menu punya cerita dari dapur yang sama sejak hari pertama buka. Datang dan rasakan bedanya — {usp}. {cta}",
      "{greeting}! Menu spesial hari ini terbatas — kemarin sold out dalam 2 jam. Kami di {loc}, {usp}. Buka setiap hari dari pagi. Datang lebih awal supaya tidak kehabisan. {cta}"
    ],
    "Kuliner/Cafe": [
      "{greeting}! Cafe yang benar-benar worth it itu langka — tapi di {loc} kami menemukannya. Specialty coffee diseduh serius, makanan yang tidak asal jadi, dan suasana yang bikin betah. {usp}. {cta}",
      "{greeting}! Kopi adalah ritual, dan kami serius soal itu. Di {loc}, setiap cangkir dari biji single origin pilihan — grind size, suhu, waktu ekstraksi semua dikontrol. Hasilnya kopi yang balance dan aftertaste yang bersih. {usp}. {cta}",
      "{greeting}! Promo khusus hari ini di {loc}: beli minuman apa saja, gratis cake. Berlaku hari ini saja, stok terbatas. Cek langsung — {usp}. {cta}"
    ],
    "FashionPria": [
      "{greeting}! Koleksi fashion pria terbaru hadir di {loc} — untuk pria yang paham kualitas. Pilihan smart casual, formal, dan streetwear tersedia lengkap. Bahan premium, potongan presisi. {usp}. {cta}",
      "{greeting}! Style itu investasi jangka panjang. Di {loc}, koleksi pria kami dipilih untuk daya tahan dan timeless look — bukan fast fashion. Konsultasi styling gratis. {usp}. {cta}",
      "{greeting}! New arrival pria eksklusif di {loc} — stok sangat terbatas. Koleksi kemarin sold out dalam 2 jam. Restock terakhir, datang sekarang. {usp}. {cta}"
    ],
    "Fashion": [
      "{greeting}! Koleksi terbaru hadir di {loc} — dan ini bukan fashion biasa. Setiap potongan didesain untuk kenyamanan nyata, bukan sekadar foto bagus. Bahan breathable, jahitan kuat, ukuran inklusif. Temukan gaya terbaik versimu di sini. {usp}. {cta}",
      "{greeting}! Fashion yang baik adalah investasi, bukan pengeluaran. Di {loc}, koleksi kami tahan lama, tidak luntur, desain yang tidak cepat ketinggalan zaman. Konsultasi styling gratis tersedia. {usp}. {cta}",
      "{greeting}! New arrival eksklusif di {loc} — stok terbatas. Tiga varian sold out kemarin dalam 90 menit. Hari ini restock terakhir. Datang sekarang. {usp}. {cta}"
    ],
    "FashionMuslim": [
      "{greeting}! Koleksi busana muslim terbaru hadir di {loc} — untuk muslimah yang ingin tampil modern tanpa melepas nilai kesopanan. Bahan adem, jahitan presisi, model terkini. Dari gamis casual hingga formal, semua lengkap. {usp}. {cta}",
      "{greeting}! Tampil muslimah itu bisa tetap kekinian. Di {loc}, koleksi kami dirancang bersama desainer lokal yang memahami kebutuhan perempuan berhijab Indonesia. Syar'i, nyaman, dan stylish. Konsultasi styling gratis tersedia. {usp}. {cta}",
      "{greeting}! Koleksi busana muslim limited edition di {loc} — stok hampir habis. Model eksklusif yang tidak akan diproduksi ulang. Datang sekarang atau hubungi kami, {usp}. {cta}"
    ],
    "Real Estate": [
      "{greeting}! Membeli rumah adalah keputusan terbesar dalam hidup — dan kami di {loc} pastikan kamu tidak menyesal. Lokasi strategis, sertifikat HM, konstruksi SNI, tim yang mendampingi sampai serah terima. Konsultasi gratis, tanpa tekanan. {usp}. {cta}",
      "{greeting}! Properti di {loc} bukan sekadar bangunan — ini masa depan keluarga. Akses sekolah, pusat kota, fasilitas publik dalam jangkauan {usp}. Nilai investasi terus naik. Jadwalkan kunjungan hari ini. {cta}",
      "{greeting}! Unit tersisa tinggal 3 dengan harga pre-launch. Begitu terjual, harga naik signifikan. Survei gratis bisa dijadwalkan hari ini di {loc}. Jangan tunda. {cta}"
    ],
    "Beauty/Self-care": [
      "{greeting}! Kulit sehat bisa dicapai — tapi harus pakai produk yang tepat. Di {loc}, skincare kami transparan soal formula: Niacinamide 10%, Tranexamic Acid, herbal lokal. Dermatologi tested, bebas paraben. Untuk kulit Indonesia yang sesungguhnya. {usp}. {cta}",
      "{greeting}! Banyak yang sudah merasakan perubahan nyata setelah 2 minggu pakai skincare kami dari {loc}. Bukan filter, bukan editan — hasil yang bisa kamu dokumentasikan sendiri. Beauty expert siap konsultasi gratis. {usp}. {cta}",
      "{greeting}! Flash sale skincare hari ini di {loc} — hemat 40% untuk paket pilihan. Stok 15 set, kemarin habis 4 jam. Datang lebih awal atau hubungi kami untuk reservasi. {cta}"
    ],
    "Tourism": [
      "{greeting}! Ada destinasi {usp}. Fasilitas lengkap, pemandu bersertifikat, rating 4.8/5 dari 500+ ulasan nyata. Pengalaman sesungguhnya lebih dari sekadar foto. {cta}",
      "{greeting}! Liburan tidak harus jauh dan mahal. Di {loc}, kami kurasi destinasi lokal terbaik yang sering terlewatkan. Alam, budaya, kuliner lokal dalam satu paket terencana. Booking sekarang untuk weekend ini. {cta}",
      "{greeting}! Promo paket wisata area {area} akhir pekan ini — diskon 35% untuk booking hari ini. Slot sangat terbatas. Semua sudah disiapkan — kamu tinggal datang dan menikmati. {cta}"
    ],
    "Retro Automotive": [
      "{greeting}! Motor klasik yang terawat benar itu berbeda kelas — dan di {loc}, kami punya standarnya. Mekanik bersertifikat, spare part original importir resmi, garansi 30 hari. Bukan bengkel asal-asalan. {usp}. {cta}",
      "{greeting}! Komunitas otomotif klasik {loc} bukan sekadar kumpul-kumpul. Kami berbagi pengetahuan, spare part, dan ribuan jam pengalaman bersama motor antik. Bergabung — {usp}. {cta}",
      "{greeting}! Servis gratis weekend ini — ongkos jasa ditanggung untuk servis ringan. Kuota 10 motor, sudah 7 terisi. Hubungi sekarang untuk amankan slot kamu di {loc}. {cta}"
    ],
    "Parenting": [
      "{greeting}! Menjadi orang tua baru itu penuh tantangan — tapi pilihan produk bayi seharusnya tidak. Di {loc}, semua produk sudah dikurasi: SNI certified, bebas BPA, bebas formalin. Konsultasi gratis setiap hari. {usp}. {cta}",
      "{greeting}! Setiap tahap tumbuh kembang si kecil itu berharga. Toko bayi kami di {loc} lengkap dari newborn hingga toddler, semua berstandar keamanan ketat. {usp}. {cta}",
      "{greeting}! Bundling newborn spesial — hemat 30% untuk 20 paket pertama hari ini di {loc}. Hubungi kami sekarang sebelum paket habis. {cta}"
    ],
    "Tech/Electronics": [
      "{greeting}! Beli gadget perlu hati-hati — banyak yang mahal tapi garansi tidak jelas. Di {loc}, semua unit bergaransi resmi distributor minimum 1 tahun. Konsultasi gratis sebelum beli. {usp}. {cta}",
      "{greeting}! Setup impian dimulai dari pilihan yang tepat. Di {loc}, kami sediakan gadget untuk semua kebutuhan — kreator, gamer, profesional. Perbandingan jujur, tanpa tekanan beli. {usp}. {cta}",
      "{greeting}! Flash sale gadget hari ini di {loc} — diskon besar untuk pilihan terbaik. Stok sangat terbatas, 50+ unit sudah terjual dari pagi. {cta}"
    ],
    "Pet Supplies": [
      "{greeting}! Anabul kamu layak mendapat yang terbaik — dan di {loc} kami tidak kompromi soal kualitas. Pakan standar AAFCO, grooming dermatologically tested, dokter hewan tersedia setiap hari tanpa appointment. {usp}. {cta}",
      "{greeting}! Happy pet bukan soal mahal, tapi soal tepat. Toko pet supply kami di {loc} menyediakan produk yang dikurasi untuk kebutuhan nyata hewan peliharaan Indonesia. {usp}. {cta}",
      "{greeting}! Promo grooming profesional minggu ini di {loc} — slot terbatas 15 ekor per hari. Sudah 10 terisi. Book sekarang sebelum jadwal penuh. {cta}"
    ],
    "Creative/Arts": [
      "{greeting}! Seni lokal {loc} bukan sekadar dekorasi — ini warisan yang hidup. Galeri kami mengkurasi karya dengan standar ketat: setiap karya bersertifikat keaslian, didokumentasi prosesnya. Kualitas museum, harga terjangkau. {usp}. {cta}",
      "{greeting}! Support seniman lokal {loc} adalah investasi budaya. Di galeri kami kamu tidak hanya beli karya — kamu ikut menjaga tradisi seni daerah tetap hidup. Custom art bisa dipesan. {cta}",
      "{greeting}! Pameran terbatas akhir pekan ini di {loc} — karya eksklusif seniman lokal harga perdana. Setelah pameran, harga naik. Jangan lewatkan. {usp}. {cta}"
    ],
    "Heritage & Cultural Fashion": [
      "{greeting}! Batik tulis dari {loc} butuh 2 hingga 6 minggu per lembar — itu keunggulan, bukan kelemahan. Setiap motif bermakna, setiap warna dari bahan alami. Warisan yang bisa kamu kenakan. {usp}. {cta}",
      "{greeting}! Ada perbedaan besar antara batik printing, cap, dan tulis — dan kami di {loc} menyediakan yang terakhir. Kain primissima, pewarna alami, pengrajin bersertifikat. {usp}. {cta}",
      "{greeting}! Koleksi edisi terbatas — 50 lembar, 30 sudah terjual. Motif eksklusif dari pengrajin {loc} tidak akan diproduksi ulang. Pesan sekarang sebelum benar-benar habis. {cta}"
    ],
    "Interior Design": [
      "{greeting}! Transformasi ruang tidak harus mahal — tapi harus tepat. Tim desainer kami di {loc} berpengalaman 8+ tahun, 200+ proyek. Visualisasi 3D sebelum eksekusi — tidak ada kejutan buruk. Konsultasi gratis. {usp}. {cta}",
      "{greeting}! Sat-set, terima beres — itu prinsip kami di {loc}. Dari konsultasi hingga koordinasi tukang dan material, semua kami handle. Kamu tinggal approval dan menikmati hasilnya. {usp}. {cta}",
      "{greeting}! Konsultasi desain interior gratis senilai Rp 500rb — hanya untuk 10 klien pertama minggu ini di {loc}. Sudah 6 slot terisi. Hubungi sekarang. {cta}"
    ],
    "Sports Apparel": [
      "{greeting}! Gear olahraga yang tepat nyata pengaruhnya ke performa. Di {loc}, produk kami berteknologi moisture-wicking, anti-odor, ergonomic cut — direkomendasikan trainer dan atlet lokal. {usp}. {cta}",
      "{greeting}! Olahraga adalah investasi jangka panjang — gear yang tepat membuatnya lebih efektif. Toko sports kami di {loc} lengkap dari lari, gym, hingga outdoor. Konsultasi gratis. {usp}. {cta}",
      "{greeting}! Flash sale sports gear weekend ini — diskon besar untuk koleksi lari dan gym di {loc}. Ukuran populer cepat habis. {cta}"
    ],
    "Literature & Education": [
      "{greeting}! Buku yang tepat bisa mengubah cara pandang seseorang sepenuhnya — dan di {loc} kami bantu kamu menemukannya. Koleksi lengkap dari novel, non-fiksi, akademik, hingga buku anak. Konsultasi rekomendasi bacaan gratis, tanpa tekanan. {usp}. {cta}",
      "{greeting}! Toko buku bukan sekadar tempat beli buku — ini tempat kamu menemukan perspektif baru. Di {loc}, tim kami siap merekomendasikan bacaan sesuai minat, tujuan, dan level pemahamanmu. Koleksi diperbarui setiap minggu. {usp}. {cta}",
      "{greeting}! New arrival buku bulan ini sudah masuk di {loc} — judul bestseller internasional, koleksi langka, dan buku lokal berkualitas. Stok edisi pertama selalu terbatas. Datang atau hubungi kami sekarang, {usp}. {cta}"
    ],
    "High-end Goods": [
      "{greeting}! Ada perbedaan nyata antara produk mahal dan produk berkualitas — dan di {loc} kami pastikan kamu mendapat keduanya. Koleksi luxury kami dilengkapi sertifikat keaslian, layanan personal shopper, dan after-sales yang tidak asal-asalan. {usp}. {cta}",
      "{greeting}! Luxury bukan soal pamer — ini soal memilih yang bertahan seumur hidup. Di {loc}, kami kurasi produk premium dari heritage brand terpercaya. Tidak ada replica, tidak ada grey market. Konsultasi personal shopper gratis untuk pertama kali. {usp}. {cta}",
      "{greeting}! Koleksi eksklusif baru tiba di {loc} — dan stok ini tidak akan restock setelah habis. Item limited edition dari brand terpilih, {usp}. Hubungi kami hari ini untuk reservasi sebelum terlambat. {cta}"
    ],
    "Wedding/Jewelry": [
      "{greeting}! Momen pernikahan terjadi sekali — dan perhiasan yang kamu kenakan akan menjadi kenangan selamanya. Di {loc}, kami mengerjakan custom jewelry dengan standar ketat: gold certified, pengrajin berpengalaman, konsultasi desain gratis. {usp}. {cta}",
      "{greeting}! Tidak ada dua cincin yang persis sama — karena setiap pasangan punya cerita yang unik. Tim desainer perhiasan kami di {loc} mengerjakan custom piece dari konsep hingga selesai, dengan visualisasi 3D sebelum pengerjaan dimulai. {usp}. {cta}",
      "{greeting}! Promo konsultasi dan desain perhiasan gratis bulan ini — hanya untuk 10 pasangan pertama di {loc}. Sudah 6 slot terisi. Hubungi kami sekarang untuk amankan slot kamu. {cta}"
    ],
    "Banking/Finance": [
      "{greeting}! Financial planning bukan hanya untuk yang sudah kaya — justru paling dibutuhkan ketika kamu baru mulai. Konsultan keuangan kami di {loc} membantu dari mana pun kondisi finansialmu sekarang. Konsultasi pertama gratis, tanpa komitmen. {usp}. {cta}",
      "{greeting}! Uang yang tidak dikelola dengan strategi yang tepat akan stagnan, bahkan tergerus inflasi. Di {loc}, tim kami bantu kamu membuat rencana investasi yang realistis sesuai profil risiko dan tujuan jangka panjangmu. {usp}. {cta}",
      "{greeting}! Workshop literasi keuangan gratis akhir pekan ini di {loc} — materi mencakup investasi pemula, manajemen utang produktif, dan perencanaan pensiun dini. Hanya 30 kursi, sudah 22 terisi. Daftar sekarang sebelum penuh. {cta}"
    ],
    "Music/Events": [
      "{greeting}! Konser dan event lokal {loc} yang kami hadirkan bukan sekadar hiburan — ini pengalaman yang akan kamu ceritakan bertahun-tahun kemudian. Lineup artis pilihan, sound system profesional, venue yang nyaman. {usp}. {cta}",
      "{greeting}! Musisi lokal {loc} yang tampil di event kami bukan yang sembarangan — mereka adalah yang terbaik dari daerah ini, dengan kualitas yang layak panggung nasional. Dukung mereka dengan hadir langsung. {usp}. {cta}",
      "{greeting}! Early bird sudah habis, dan tiket reguler juga hampir sold out. Event di {loc} ini hanya sekali — tidak ada penayangan ulang, tidak ada rerun. Pesan sekarang sebelum benar-benar kehabisan. {usp}. {cta}"
    ],
    "Sustainability": [
      "{greeting}! Setiap pilihan konsumsi kita hari ini berdampak pada generasi berikutnya — dan perubahan itu dimulai dari hal kecil. Produk eco-friendly kami di {loc} sudah tersertifikasi ramah lingkungan, diproduksi etis, dan packaging minimal waste. {usp}. {cta}",
      "{greeting}! Sustainable living bukan tren sesaat — ini perubahan cara pandang tentang konsumsi yang bertanggung jawab. Di {loc}, setiap produk yang kami jual sudah melewati seleksi ketat soal dampak lingkungan. Setiap pembelian berkontribusi pada program penanaman pohon lokal. {usp}. {cta}",
      "{greeting}! Promo eco-friendly spesial hari ini di {loc} — hemat 20% untuk semua produk sustainable pilihan, plus gratis tote bag dari bahan daur ulang. Stok promo terbatas. Pilihan yang baik untuk kamu, dan lebih baik lagi untuk bumi. {cta}"
    ],
    "Fotografi": [
      "{greeting}! Momen terbaik hanya terjadi sekali — dan kamu layak punya foto yang benar-benar mengabadikannya. Fotografer profesional kami di {loc} berpengalaman menangkap ekspresi, cahaya, dan suasana yang paling berkesan. Bukan sekadar foto — ini kenangan permanen. {usp}. {cta}",
      "{greeting}! Ada perbedaan besar antara foto asal-asalan dan foto yang benar-benar bercerita. Di {loc}, tim fotografer kami memastikan setiap frame punya makna — komposisi tepat, cahaya natural, ekspresi otentik. Konsultasi konsep gratis. {usp}. {cta}",
      "{greeting}! Slot sesi foto di {loc} hampir penuh untuk bulan ini. Tersisa beberapa jadwal — {usp}. Booking sekarang sebelum momen yang kamu rencanakan tidak kebagian jadwal. {cta}"
    ],
    "JasaProfesional": [
      "{greeting}! Masalah yang tidak ditangani oleh ahlinya bisa berujung kerugian besar. Di {loc}, tim profesional kami membantu kamu memahami risiko dan solusi terbaik — dengan bahasa yang mudah dimengerti, bukan jargon. Konsultasi pertama gratis. {usp}. {cta}",
      "{greeting}! Keputusan yang baik dimulai dari informasi yang akurat. Tim profesional kami di {loc} sudah membantu ratusan individu dan usaha menemukan solusi yang tepat dan efisien untuk kebutuhan mereka. {usp}. {cta}",
      "{greeting}! Jadwal konsultasi awal gratis masih tersedia minggu ini di {loc}. Kami bantu kamu temukan solusi terbaik — tanpa biaya di pertemuan pertama. Slot terbatas. {usp}. {cta}"
    ],
    "EventCatering": [
      "{greeting}! Acara yang berkesan tidak terjadi begitu saja — butuh perencanaan matang dan eksekusi yang presisi. Tim event & catering kami di {loc} sudah menangani ratusan acara: dari pernikahan, gathering korporat, hingga ulang tahun. Kamu tinggal datang dan menikmati. {usp}. {cta}",
      "{greeting}! Dari konsep hingga selesai, kami yang handle semuanya di {loc}. Catering dengan bahan segar, dekorasi yang sesuai tema, dan koordinasi on-the-day yang mulus. Tidak ada detail yang terlewat. Konsultasi gratis dan estimasi harga transparan. {usp}. {cta}",
      "{greeting}! Slot acara bulan depan sudah mulai terisi di {loc}. Jika kamu sedang merencanakan pernikahan, gathering, atau acara spesial — konsultasikan sekarang sebelum tanggal yang kamu inginkan sudah terpakai. {usp}. {cta}"
    ],
    "KebersihanLaundry": [
      "{greeting}! Waktu itu terlalu berharga untuk dihabiskan mencuci dan menyetrika. Layanan laundry profesional kami di {loc} mengerjakan semuanya: dicuci bersih, disetrika rapi, dikemas, dan diantar tepat waktu. Kamu bisa fokus ke hal yang lebih penting. {usp}. {cta}",
      "{greeting}! Laundry yang baik bukan sekadar bersih — tapi juga aman untuk pakaian kesayanganmu. Di {loc}, kami menggunakan deterjen berkualitas, proses higienis, dan penanganan khusus untuk bahan-bahan sensitif. Layanan antar-jemput tersedia. {usp}. {cta}",
      "{greeting}! Promo laundry kilogram hari ini di {loc} — harga spesial untuk pelanggan baru. {usp}. Antar sekarang, selesai besok pagi, langsung diantar ke pintumu. {cta}"
    ],
    "General": [
      "{greeting}! Usaha lokal {loc} yang sudah dipercaya warga sejak hari pertama buka. Bukan korporat besar — kami tetangga sendiri yang paham kebutuhan komunitas. {usp}. {cta}",
      "{greeting}! Kualitas konsisten dan pelayanan jujur — itu yang kami jaga setiap hari di {loc}. Tidak ada janji berlebihan. Yang ada: produk yang bisa diandalkan. {usp}. {cta}",
      "{greeting}! Promo khusus pelanggan baru dari radius {usp}. Stok terbatas — sudah ratusan yang memanfaatkan. Jangan sampai ketinggalan. {cta}"
    ]
  },
  "meta": {
    "Kuliner": [
      "{greeting} Ada tempat makan baru yang lagi ramai dibicarakan di {loc}! 🍽\n\nBahan segar, resep jujur, rasa yang bikin balik lagi. {usp}.\n\n{cta}",
      "{greeting} Konsisten enak setiap hari — bukan cuma pas buka doang. 😋\n\nKuliner kami di {loc}. {usp}.\n\n{cta}",
      "{greeting} PROMO HARI INI SAJA! 🔥\n\nDiskon pelanggan baru di {loc}. Menu terbatas, kemarin sold out 2 jam.\n\n{cta}"
    ],
    "Kuliner/Cafe": [
      "{greeting} Cafe terbaru di {loc} yang benar-benar worth it! ☕\n\nSpecialty coffee, suasana cozy, WiFi kenceng. {usp}.\n\n{cta}",
      "{greeting} WFH dari cafe yang supportif beda produktivitasnya. 💻\n\nCafe kami di {loc} — kopi enak, kursi nyaman, koneksi stabil. {usp}.\n\n{cta}",
      "{greeting} Promo hari ini: beli kopi gratis cake! 🎉\n\n{usp}. Stok terbatas.\n\n{cta}"
    ],
    "FashionPria": [
      "{greeting} Koleksi pria terbaru di {loc}! 👔\n\nSmart casual, formal, streetwear — semua ada. Bahan premium, potongan flattering.\n\n{cta}",
      "{greeting} Style pria yang timeless, bukan sekadar tren. 💼\n\n{usp}.\n\n{cta}",
      "{greeting} NEW ARRIVAL PRIA — STOK TERBATAS! ⚡\n\nSold out kemarin, restock hari ini di {loc}. {usp}.\n\n{cta}"
    ],
    "Fashion": [
      "{greeting} Koleksi terbaru landing di {loc}! 👗\n\nBahan premium, jahitan rapi, ukuran inklusif. Investasi penampilan bukan fast fashion.\n\n{cta}",
      "{greeting} Tampil percaya diri setiap hari dimulai dari pilihan yang tepat. 💜\n\n{usp}.\n\n{cta}",
      "{greeting} NEW ARRIVAL — STOK TERBATAS! 🛍\n\n3 varian sold out 90 menit kemarin. Restock hari ini, terakhir.\n\n{cta}"
    ],
    "FashionMuslim": [
      "{greeting} Koleksi busana muslim terbaru hadir di {loc}! 🧕\n\nSyar'i, modern, nyaman seharian. Dari gamis hingga outer — semua ada. {usp}.\n\n{cta}",
      "{greeting} Tampil muslimah modern dan percaya diri! 💜\n\nKoleksi hijab fashion kami di {loc} — bahan premium, model terkini, harga terjangkau.\n\n{cta}",
      "{greeting} KOLEKSI LIMITED — HAMPIR HABIS! ⏰\n\n3 varian sold out kemarin di {loc}. Restock terakhir. {usp}.\n\n{cta}"
    ],
    "Real Estate": [
      "{greeting} Hunian impian di {loc} masih tersedia! 🏡\n\nSertifikat HM, konstruksi SNI, lokasi strategis. Survei gratis, tanpa tekanan.\n\n{cta}",
      "{greeting} Investasi terbaik adalah yang tidak akan kamu sesali. 📈\n\n{usp}.\n\n{cta}",
      "{greeting} UNIT TERSISA TINGGAL 3! ⚠\n\nHarga pre-launch masih berlaku. Survei gratis hari ini juga.\n\n{cta}"
    ],
    "Beauty/Self-care": [
      "{greeting} Rahasia glowing warga {area} akhirnya terbongkar! ✨\n\nFormula transparan, dermatologi tested, bebas paraben.\n\n{cta}",
      "{greeting} Self-care yang efektif itu ada — dan ada di {loc}. 🌸\n\nNiacinamide 10%, herbal lokal, fragrance-free. {usp}.\n\n{cta}",
      "{greeting} FLASH SALE — HARI INI SAJA! 💥\n\nHemat 40% paket skincare di {loc}. Stok 15 set, kemarin habis 4 jam.\n\n{cta}"
    ],
    "Tourism": [
      "{greeting} Destinasi terbaik {usp}.8/5, fasilitas lengkap, pengalaman nyata tak terlupakan.\n\n{cta}",
      "{greeting} Liburan berkesan tidak harus jauh dan mahal. 🌟\n\nDestinansi terbaik area {area} — alam, budaya, kuliner dalam satu paket.\n\n{cta}",
      "{greeting} PROMO WEEKEND — DISKON 35%! 🎯\n\nBooking hari ini untuk trip area {area}. Slot sangat terbatas.\n\n{cta}"
    ],
    "Retro Automotive": [
      "{greeting} Bengkel spesialis motor klasik di {loc}! 🏍\n\nSpare part original, mekanik bersertifikat, garansi 30 hari.\n\n{cta}",
      "{greeting} Motor klasik kamu layak perawatan terbaik. 🔧\n\n{usp}.\n\n{cta}",
      "{greeting} SERVIS GRATIS WEEKEND INI! ⚡\n\nOngkos jasa gratis servis ringan. Kuota 10 motor, sudah 7 terisi.\n\n{cta}"
    ],
    "Parenting": [
      "{greeting} Semua kebutuhan si kecil, tersertifikasi, di {loc}! 👶\n\nSNI certified, bebas BPA, konsultasi gratis. {usp}.\n\n{cta}",
      "{greeting} Keamanan si kecil tidak bisa dikompromikan. 🌟\n\nToko bayi kami di {loc} — kurasi ketat, konsultasi gratis setiap hari.\n\n{cta}",
      "{greeting} BUNDLING NEWBORN — HEMAT 30%! 🎁\n\nHanya 20 paket di {loc}. Orang tua baru, ini yang kamu butuhkan.\n\n{cta}"
    ],
    "Tech/Electronics": [
      "{greeting} Gadget garansi resmi, harga kompetitif — di {loc}! 💻\n\nKonsultasi spesifikasi gratis sebelum beli.\n\n{cta}",
      "{greeting} Upgrade device yang beneran bergaransi. ⚡\n\n{usp}. 1 tahun.\n\n{cta}",
      "{greeting} FLASH SALE HARI INI! 🔥\n\n50+ unit terjual dari pagi. Stok flash sale terbatas.\n\n{cta}"
    ],
    "Pet Supplies": [
      "{greeting} Anabul kamu layak yang terbaik — ada di {loc}! 🐾\n\nPakan AAFCO, grooming dermatologically tested, dokter hewan on-site.\n\n{cta}",
      "{greeting} Happy anabul sama dengan happy owner. 🐱\n\n{usp}.\n\n{cta}",
      "{greeting} PROMO GROOMING MINGGU INI! 🐶\n\nSlot terbatas 15 ekor/hari. Sudah 10 terisi hari ini.\n\n{cta}"
    ],
    "Creative/Arts": [
      "{greeting} Karya seni lokal {loc} — bersertifikat, berkelas, terjangkau! 🎨\n\nSetiap karya dilengkapi sertifikat keaslian.\n\n{cta}",
      "{greeting} Dekorasi rumah dengan seni yang punya makna. 🖌\n\nGaleri kami di {loc} mengkurasi karya terbaik seniman lokal.\n\n{cta}",
      "{greeting} PAMERAN TERBATAS — AKHIR PEKAN INI! ✨\n\nHarga perdana. {usp}. Jangan lewatkan.\n\n{cta}"
    ],
    "Heritage & Cultural Fashion": [
      "{greeting} Batik tulis asli pengrajin {loc} — bukan printing! 🧵\n\nPewarna alami, motif bermakna.\n\n{cta}",
      "{greeting} Bangga pakai batik lokal — dan ini alasannya. 🇮🇩\n\nBatik dari {loc} dibuat tangan, pewarna alami, 2-6 minggu pengerjaan.\n\n{cta}",
      "{greeting} KOLEKSI LIMITED — 30 dari 50 sudah terjual! ⏰\n\nMotif eksklusif {loc}, tidak diproduksi ulang.\n\n{cta}"
    ],
    "Interior Design": [
      "{greeting} Wujudkan rumah impian bersama kami di {loc}! 🏡\n\nKonsultasi gratis, visualisasi 3D, sat-set terima beres.\n\n{cta}",
      "{greeting} Transformasi ruang tidak harus rumit. ✨\n\nTim kami di {loc} — 8+ tahun, 200+ proyek selesai.\n\n{cta}",
      "{greeting} KONSULTASI GRATIS — HANYA 10 SLOT! 🛋\n\nSudah 6 terisi minggu ini. Nilai Rp 500rb — gratis untuk kamu.\n\n{cta}"
    ],
    "Sports Apparel": [
      "{greeting} Gear olahraga yang beneran ngaruh ke performa — di {loc}! 💪\n\nMoisture-wicking, anti-odor, ergonomic cut.\n\n{cta}",
      "{greeting} Olahraga lebih efektif dengan gear yang tepat. 🏃\n\n{usp}.\n\n{cta}",
      "{greeting} FLASH SALE SPORTS — WEEKEND INI! ⚡\n\nDiskon besar di {loc}. Ukuran populer cepat habis.\n\n{cta}"
    ],
    "Literature & Education": [
      "{greeting} Buku yang tepat bisa mengubah hidupmu! 📚\n\nKoleksi terlengkap di {loc} — novel, non-fiksi, akademik, buku anak. Konsultasi rekomendasi gratis. {usp}.\n\n{cta}",
      "{greeting} Investasi ilmu adalah yang paling menguntungkan. 🎓\n\nToko buku kami di {loc} bantu kamu temukan bacaan yang paling relevan. {usp}.\n\n{cta}",
      "{greeting} NEW ARRIVAL BUKU — STOK TERBATAS! 📖\n\nJudul bestseller dan koleksi langka baru masuk di {loc}. {usp}.\n\n{cta}"
    ],
    "High-end Goods": [
      "{greeting} Luxury yang sesungguhnya — bersertifikat, terpercaya, di {loc}! 👜\n\nPersonal shopper siap membantu. {usp}.\n\n{cta}",
      "{greeting} Kualitas yang bertahan seumur hidup — itu definisi luxury kami. ✨\n\n{usp}. Sertifikat keaslian terjamin.\n\n{cta}",
      "{greeting} KOLEKSI EKSKLUSIF BARU — TIDAK AKAN RESTOCK! 🔔\n\nStok sangat terbatas di {loc}. Hubungi kami sekarang untuk reservasi.\n\n{cta}"
    ],
    "Wedding/Jewelry": [
      "{greeting} Perhiasan custom untuk momen terpenting hidupmu! 💍\n\nGold certified, pengrajin terpercaya di {loc}. Konsultasi desain gratis. {usp}.\n\n{cta}",
      "{greeting} Cincin yang kamu kenakan hari pernikahanmu — buat jadi sempurna. 💎\n\nCustom design, visualisasi 3D, pengerjaan presisi. {usp}.\n\n{cta}",
      "{greeting} SLOT KONSULTASI GRATIS — TERSISA 4! ⏰\n\nHanya 10 pasangan, sudah 6 terisi. {usp}. Hubungi sekarang!\n\n{cta}"
    ],
    "Banking/Finance": [
      "{greeting} Financial freedom dimulai dari langkah pertama yang tepat! 💰\n\nKonsultasi keuangan gratis di {loc}. Investasi, asuransi, perencanaan — semua ada. {usp}.\n\n{cta}",
      "{greeting} Uang yang tidak dikelola akan stagnan — yuk mulai sekarang. 📈\n\nKonsultan keuangan kami di {loc} bantu dari kondisi finansial apapun. {usp}.\n\n{cta}",
      "{greeting} WORKSHOP KEUANGAN GRATIS — SABTU INI! 🔔\n\nHanya 30 kursi, sudah 22 terisi di {loc}. Daftar sekarang!\n\n{cta}"
    ],
    "Music/Events": [
      "{greeting} Event musik lokal terbaik ada di {loc}! 🎵\n\nLineup artis pilihan, sound profesional, pengalaman tak terlupakan. {usp}.\n\n{cta}",
      "{greeting} Support musisi lokal {loc} yang karyanya luar biasa! 🎤\n\nLive performance terbaik — jujur, energik, berkesan. Tiket terbatas. {usp}.\n\n{cta}",
      "{greeting} TIKET HAMPIR HABIS — PESAN SEKARANG! 🎉\n\nEvent {loc} ini hanya sekali. Tidak ada rerun. {usp}.\n\n{cta}"
    ],
    "Sustainability": [
      "{greeting} Pilihan konsumsi yang lebih baik, mulai dari {loc}! 🌿\n\nProduk eco-friendly bersertifikat, ramah lingkungan, packaging minimal waste. {usp}.\n\n{cta}",
      "{greeting} Sustainable living yang praktis dan terjangkau. ♻\n\nProduk eco-certified di {loc} — setiap pembelian = tanam pohon lokal. {usp}.\n\n{cta}",
      "{greeting} PROMO ECO-FRIENDLY — HEMAT 20% + TOTE GRATIS! 🌱\n\nStok terbatas di {loc}. Pilihan baik untuk kamu dan bumi. {usp}.\n\n{cta}"
    ],
    "Fotografi": [
      "{greeting} Abadikan momenmu bersama fotografer profesional di {loc}! 📸\n\nHasil tajam, natural, dan bercerita. Bukan sekadar foto — ini kenangan seumur hidup. {usp}.\n\n{cta}",
      "{greeting} Foto yang baik bukan soal kamera — tapi siapa yang memegangnya. ✨\n\nTim fotografer kami di {loc} paham cahaya, ekspresi, dan komposisi. {usp}.\n\n{cta}",
      "{greeting} SLOT FOTO HAMPIR PENUH BULAN INI! 📅\n\nTersisa beberapa jadwal di {loc}. Booking sekarang. {usp}.\n\n{cta}"
    ],
    "JasaProfesional": [
      "{greeting} Butuh bantuan profesional yang tepat sasaran? Serahkan ke ahlinya! 💼\n\nKonsultasi pertama GRATIS di {loc}. {usp}.\n\n{cta}",
      "{greeting} Keputusan yang tepat dimulai dari profesional yang bisa dipercaya. 🤝\n\nTim kami di {loc} bantu kamu dari A sampai Z. {usp}.\n\n{cta}",
      "{greeting} KONSULTASI GRATIS — MINGGU INI SAJA! 📋\n\nSlot terbatas di {loc}. {usp}. Amankan sekarang.\n\n{cta}"
    ],
    "EventCatering": [
      "{greeting} Wujudkan acara impianmu bersama tim profesional kami! 🎉\n\nCatering lezat, dekorasi memukau, koordinasi mulus — di {loc}. {usp}.\n\n{cta}",
      "{greeting} Ratusan acara sukses, satu tim yang bisa kamu percaya. ✨\n\nEvent & catering terpercaya di {loc}. Konsultasi gratis. {usp}.\n\n{cta}",
      "{greeting} SLOT ACARA BULAN DEPAN MULAI TERISI! 📅\n\nKonsultasi gratis sekarang di {loc} sebelum tanggalmu diambil. {usp}.\n\n{cta}"
    ],
    "KebersihanLaundry": [
      "{greeting} Pakaian bersih, wangi, rapi — tanpa repot! 🧺\n\nLayanan laundry profesional di {loc}. Antar-jemput tersedia. {usp}.\n\n{cta}",
      "{greeting} Serahkan urusan laundry ke kami — kamu fokus ke hal yang lebih penting. ✅\n\nCuci higienis, setrika rapi, tepat waktu. {usp}.\n\n{cta}",
      "{greeting} PROMO LAUNDRY HARI INI! 🔔\n\nHarga spesial di {loc}. {usp}. Antar sekarang, selesai besok pagi.\n\n{cta}"
    ],
    "General": [
      "{greeting} Ada yang baru dan menarik di {loc}! 👋\n\nUsaha lokal yang dipercaya komunitas sekitar. {usp}.\n\n{cta}",
      "{greeting} Kualitas konsisten, pelayanan jujur — itu yang kami jaga. 💪\n\nHadir di {loc} untuk melayani kamu sepenuh hati.\n\n{cta}",
      "{greeting} PROMO KHUSUS HARI INI! 🔔\n\n{usp}. Stok terbatas.\n\n{cta}"
    ]
  }
};
