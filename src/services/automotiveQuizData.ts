// Dokter Otomotif: 10 Soal Kuis Uji Kompetensi & Edukasi Mesin / Tune-Up
// Dirancang berbobot untuk Siswa SMK TBSM, Montir Bengkel, Mahasiswa Teknik, & Guru Otomotif

export interface QuizQuestion {
  id: number;
  category: string;
  badgeColor: string;
  question: string;
  codeOrCase?: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  aiDoctorExplanation: {
    coreReason: string;
    scientificBasis: string;
    workshopStandard: string;
    practicalProTip: string;
  };
  diagramType:
    | 'valve'
    | 'spark_plug'
    | 'compression_ring'
    | 'cvt_pulley'
    | 'tps_sensor'
    | 'clutch_jaso'
    | 'brake_hydraulic'
    | 'ignition_timing'
    | 'thermostat'
    | 'regulator_kiprok';
}

export const AUTOMOTIVE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Mekanisme Katup & Kepala Silinder',
    badgeColor: 'bg-blue-600 text-white',
    question:
      'Pada saat tune-up mesin 4-tak, apa akibat paling fatal jika celah katup hisap (inlet valve clearance) disetel terlalu rapat (0 mm / tanpa celah bebas) pada kondisi mesin dingin?',
    codeOrCase: 'Studi Kasus: Teknisi menyetel klep terlalu kencang tanpa menggunakan feeler gauge.',
    options: [
      { key: 'A', text: 'Tenaga mesin bertambah besar di semua putaran tanpa efek samping.' },
      {
        key: 'B',
        text: 'Saat mesin panas batang klep memuai, katup tidak menutup rapat, terjadi kebocoran kompresi & klep berisiko terbakar/bengkok.',
      },
      { key: 'C', text: 'Oli mesin menjadi sangat encer dan cepat menguap lewat knalpot.' },
      { key: 'D', text: 'Busi mengeluarkan api berwarna merah dan filter udara tersumbat oli.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Logam batang katup (valve stem) selalu memuai panjang saat menerima panas pembakaran ratusan derajat Celcius.',
      scientificBasis:
        'Celah bebas (clearance) wajib diberikan saat dingin. Jika celah 0 mm, ketika memuai katup akan tertekan terus sehingga dudukannya (valve seat) tidak merapat. Gas panas bertekanan tinggi akan menyelinap membakar bibir klep (burned valve) dan menghilangkan tenaga kompresi.',
      workshopStandard:
        'Gunakan selalu Feeler Gauge presisi. Standar celah klep bebek/matic umumnya: In: 0.08 - 0.10 mm, Ex: 0.10 - 0.14 mm (atau sesuai buku manual servis).',
      practicalProTip:
        'Pastikan posisi piston berada tepat di Titik Mati Atas (TMA) pada langkah kompresi (kedua rocker arm bebas goyang) sebelum menyetel.',
    },
    diagramType: 'valve',
  },
  {
    id: 2,
    category: 'Diagnosa Sistem Pembakaran & Busi',
    badgeColor: 'bg-amber-600 text-white',
    question:
      'Saat pemeriksaan berkala, elektroda busi dilepas dan terlihat berwarna putih pucat berkerak kering seperti kapur. Apa diagnosa dokter otomotif terhadap kondisi mesin?',
    codeOrCase: 'Inspeksi Visual: Insulator pucat kering, mesin terasa cepat panas dan sering timbul detonasi (knocking).',
    options: [
      { key: 'A', text: 'Campuran bahan bakar terlalu kaya bensin (Rich Mixture / bensin berlebih).' },
      {
        key: 'B',
        text: 'Campuran bahan bakar terlalu miskin/kurus (Lean Mixture / AFR > 15:1) atau tingkat panas busi terlalu panas.',
      },
      { key: 'C', text: 'Oli samping atau oli mesin bocor merembes masuk ke ruang bakar.' },
      { key: 'D', text: 'Saringan udara motor terlalu kotor dan tersumbat debu basah.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Warna putih pucat pada elektroda menandakan ruang bakar mengalami suhu pembakaran berlebih akibat kekurangan bensin (terlalu banyak udara).',
      scientificBasis:
        'Air-Fuel Ratio (AFR) ideal stoikiometri adalah 14.7:1. Jika AFR naik ke 15.5:1 - 17:1, pembakaran menjadi lambat dan sangat panas. Suhu ruang bakar yang terlampau tinggi menyebabkan kepala busi memutih dan memicu knocking (detonasi) yang berisiko melubangi piston.',
      workshopStandard:
        'Warna pembakaran sempurna yang sehat adalah cokelat kemerahan atau abu-abu bata muda (tan brown). Hitam basah = oli bocor; Hitam kering = boros bensin/karbon.',
      practicalProTip:
        'Periksa apakah ada kebocoran manifold (kebocoran udara palsu) atau injektor tersumbat kerak jika motor injeksi menunjukkan busi putih.',
    },
    diagramType: 'spark_plug',
  },
  {
    id: 3,
    category: 'Diagnosa Kompresi & Ring Piston',
    badgeColor: 'bg-emerald-600 text-white',
    question:
      'Tekanan kompresi terukur hanya 6 bar (standar 10-12 bar). Ketika teknisi memasukkan 2-3 tetes oli bersih melalui lubang busi lalu mengukur ulang, kompresi melonjak ke 11 bar. Di mana letak kerusakannya?',
    codeOrCase: 'Metode Diagnosa: Dry Compression Test vs Wet Compression Test.',
    options: [
      { key: 'A', text: 'Kebocoran pada paking silinder head (gasket bocor).' },
      { key: 'B', text: 'Katup klep hisap mengalami bengkok atau gosong pada sitting.' },
      {
        key: 'C',
        text: 'Ring piston dan/atau dinding liner silinder sudah aus (terjadi celah ring blow-by).',
      },
      { key: 'D', text: 'Knalpot tersumbat endapan kerak arang karbon.' },
    ],
    correctKey: 'C',
    aiDoctorExplanation: {
      coreReason:
        'Oli cair yang dimasukkan ke lubang busi akan mengalir ke sekeliling celah antara piston dan silinder, bertindak sebagai perapat (seal) sementara.',
      scientificBasis:
        'Pada "Wet Compression Test", jika kompresi naik drastis setelah diberi oli, dipastikan kebocoran terjadi di batas piston-silinder (ring kompresi lemah atau dinding silinder baret/ovalis). Namun jika kompresi tetap rendah (tidak naik), maka kebocoran berada di klep bocor atau paking head koyak.',
      workshopStandard:
        'Celah celah ujung ring kompresi (ring end gap) baru berkisar 0.15 - 0.30 mm. Batas servis maksimal umumnya 0.50 mm.',
      practicalProTip:
        'Jangan langsung mengganti klep sebelum melakukan tes basah ini, karena tes ini membedakan secara akurat antara kerusakan blok seher vs head silinder.',
    },
    diagramType: 'compression_ring',
  },
  {
    id: 4,
    category: 'Transmisi Otomatis CVT',
    badgeColor: 'bg-indigo-600 text-white',
    question:
      'Mengapa penggantian roller CVT dengan bobot yang jauh lebih ringan dari standar pabrikan dapat meningkatkan respons akselerasi awal tetapi mengorbankan kecepatan puncak (top speed)?',
    codeOrCase: 'Fenomena CVT: Mengubah bobot roller dari 13 gram ke 8 gram.',
    options: [
      { key: 'A', text: 'Roller ringan membuat V-belt menjadi lebih panjang dan kendor.' },
      {
        key: 'B',
        text: 'Roller ringan membutuhkan gaya sentrifugal (RPM lebih tinggi) untuk terlempar keluar, sehingga rasio transmisi bertahan di rasio rendah (gigi 1) lebih lama.',
      },
      { key: 'C', text: 'Roller ringan menurunkan putaran kruk as mesin sehingga mesin tidak lelah.' },
      { key: 'D', text: 'Roller ringan mengunci pulley belakang agar tidak berputar sama sekali.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Gaya sentrifugal roller dirumuskan dengan F = m * r * ω². Semakin ringan massa (m), dibutuhkan kecepatan sudut putaran (ω / RPM) yang jauh lebih tinggi untuk menghasilkan gaya dorong yang sama.',
      scientificBasis:
        'Akibatnya, pulley depan (drive face) lambat menutup dan v-belt tertahan di diameter kecil (low gear ratio) pada RPM tinggi. Tarikan awal motor menjadi sangat responsif dan galak (seperti tertahan di gigi 1), namun pada putaran atas roller tidak mampu menekan v-belt hingga ke lingkar diameter terluar, membatasi top speed.',
      workshopStandard:
        'Untuk penggunaan harian optimal, kurangi bobot roller maksimal 1-2 gram dari standar pabrik untuk menjaga keseimbangan akselerasi dan efisiensi bensin.',
      practicalProTip:
        'Roller yang terlalu ringan membuat mesin meraung keras tanpa pertambahan laju kecepatan sebanding, menyebabkan boros bahan bakar.',
    },
    diagramType: 'cvt_pulley',
  },
  {
    id: 5,
    category: 'Sistem Injeksi Elektronik & Sensor EFI',
    badgeColor: 'bg-red-600 text-white',
    question:
      'Sebuah motor injeksi mengalami gejala brebet (stumbling) dan kehilangan tenaga hanya pada saat bukaan gas di kisaran 30% - 40%, tetapi kembali normal di gas penuh. Komponen manakah yang paling dicurigai?',
    codeOrCase: 'Diagnosa Scan Tool: Grafik voltase sensor mengalami drop tiba-tiba di bukaan tertentu.',
    options: [
      { key: 'A', text: 'Fuel pump rusak total dan tidak memompa bahan bakar sama sekali.' },
      {
        key: 'B',
        text: 'Lapisan resistansi karbon pada Throttle Position Sensor (TPS) aus/tergores pada sudut bukaan tersebut.',
      },
      { key: 'C', text: 'Aki motor tekor atau kehabisan cairan elektrolit.' },
      { key: 'D', text: 'Busi terendam oli pada bagian luar cop busi.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'TPS bekerja seperti potensiometer geser yang mengubah sudut putaran katup gas menjadi sinyal voltase linier (0.5 Volt saat tertutup hingga 4.5 Volt saat terbuka penuh).',
      scientificBasis:
        'Karena pengendara motor harian paling sering menahan gas di posisi 30%-40%, plat geser mengikis lintasan karbon resistor di titik tersebut. Ketika slider melintasi titik aus, tegangan sinyal drop ke 0V sekejap. ECU mengira pengendara menutup gas mendadak, memotong suplai bensin sehingga motor tersendat parah.',
      workshopStandard:
        'Gunakan diagnostic scanner atau multimeter digital pada mode grafik. Putar gas perlahan dan amati apakah kenaikan voltase naik mulus tanpa ada lonjakan atau penurunan tiba-tiba.',
      practicalProTip:
        'Membersihkan throttle body dengan carbu cleaner keras secara langsung dapat merusak sil karet seal TPS.',
    },
    diagramType: 'tps_sensor',
  },
  {
    id: 6,
    category: 'Standarisasi Oli & Pelumasan',
    badgeColor: 'bg-cyan-600 text-white',
    question:
      'Apa yang akan terjadi jika oli mesin bersertifikasi JASO MB (khusus motor matic) digunakan pada mesin motor bebek atau motor sport berkopling basah?',
    codeOrCase: 'Spesifikasi Pelumas: JASO MA (Kopling Basah) vs JASO MB (Kopling Kering).',
    options: [
      { key: 'A', text: 'Tenaga motor bertambah kuat dan perpindahan gigi menjadi sangat presisi.' },
      {
        key: 'B',
        text: 'Kampas kopling akan mengalami selip (clutch slip) parah karena kandungan friction modifier (zat pelicin) yang terlalu tinggi.',
      },
      { key: 'C', text: 'Mesin langsung macet (seher terkunci) dalam waktu 5 menit.' },
      { key: 'D', text: 'Air radiator akan tercampur ke dalam ruang pembakaran mesin.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Motor kopling basah (wet clutch) merendam kampas dan plat kopling di dalam oli mesin yang sama.',
      scientificBasis:
        'Standar JASO MB dirancang khusus mesin matic di mana ruang kruk as terpisah total dari transmisi CVT. Oli JASO MB sarat zat aditif pengurang gesekan (Molybdenum / Friction Modifier) agar putaran kruk as seringan mungkin. Jika zat ini masuk ke kopling basah, koefisien gesek turun drastis dan kampas kopling akan selip saat menyalurkan torsi.',
      workshopStandard:
        'Gunakan oli bertanda JASO MA atau MA2 untuk semua motor manual/semi-otomatis. Gunakan JASO MB hanya untuk motor transmisi matic CVT.',
      practicalProTip:
        'Tanda awal selip kopling akibat salah oli: RPM mesin meraung tinggi tetapi motor tidak bertambah cepat saat akselerasi.',
    },
    diagramType: 'clutch_jaso',
  },
  {
    id: 7,
    category: 'Sistem Rem Hidrolik & Fluida',
    badgeColor: 'bg-rose-600 text-white',
    question:
      'Saat tuas rem cakram ditarik terasa sangat empuk/amblas (*spongy feel*) dan rem tidak menggigit pakem, teknisi melakukan proses *bleeding*. Prinsip fisika apa yang menjelaskan fenomena ini?',
    codeOrCase: 'Fenomena Hidrolik: Gelembung udara terjebak di dalam sirkuit selang minyak rem.',
    options: [
      { key: 'A', text: 'Cairan minyak rem berubah menjadi logam padat di dalam master rem.' },
      {
        key: 'B',
        text: 'Fluida cair bersifat inkompresibel (tak bisa dimampatkan), sedangkan gas/udara bersifat kompresibel sehingga tekanan piston terbuang memampatkan udara.',
      },
      { key: 'C', text: 'Piringan cakram menghasilkan gelombang magnetik penolak kaliper.' },
      { key: 'D', text: 'Slang rem menyusut diameternya karena suhu dingin malam hari.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Hukum Pascal hanya bekerja sempurna pada zat cair (incompressible fluid) yang tidak dapat dimampatkan.',
      scientificBasis:
        'Jika terdapat gelembung udara di dalam selang rem, gaya tekan tangan dari master rem akan digunakan untuk memampatkan volume gelembung udara tersebut terlebih dahulu, bukan mendorong piston kaliper. Akibatnya piston kaliper tidak bergerak menekan kampas ke piringan.',
      workshopStandard:
        'Ganti minyak rem secara berkala minimal setiap 2 tahun atau 20.000 km. Minyak rem berbahan glikol bersifat higroskopis (menyerap air dari udara) yang menurunkan titik didih fluida.',
      practicalProTip:
        'Jangan pernah meneteskan minyak rem ke bodi motor karena bersifat merusak cat (paint stripper alami).',
    },
    diagramType: 'brake_hydraulic',
  },
  {
    id: 8,
    category: 'Manajemen Pengapian & Ignition Timing',
    badgeColor: 'bg-purple-600 text-white',
    question:
      'Mengapa derajat pengapian (ignition timing) harus dimajukan (*advance*, misal dari 10° sebelum TMA menjadi 32° sebelum TMA) seiring naiknya putaran mesin (RPM)?',
    codeOrCase: 'Kurva Pengapian: Perbedaan sudut pemantikan api busi di 1.500 RPM vs 9.000 RPM.',
    options: [
      { key: 'A', text: 'Agar aki tidak cepat kehabisan daya listrik di kecepatan tinggi.' },
      {
        key: 'B',
        text: 'Karena waktu yang dibutuhkan api untuk membakar bensin relatif konstan, sementara kecepatan piston naik, sehingga api harus dinyalakan lebih awal agar puncak ledakan tepat 10°-15° setelah TMA.',
      },
      { key: 'C', text: 'Supaya suara knalpot terdengar lebih padat dan menggelegar.' },
      { key: 'D', text: 'Untuk mencegah katup buang terbuka terlalu cepat.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Kecepatan rambat lidah api pembakaran bensin di ruang bakar relatif konstan (sekitar 20 - 30 meter per detik).',
      scientificBasis:
        'Pada 1.500 RPM, waktu yang tersedia untuk langkah kompresi jauh lebih lama dibanding pada 9.000 RPM. Agar Tekanan Puncak Silinder (Peak Cylinder Pressure) tercapai pada posisi lengan kruk as paling efisien (10° - 15° Setelah Titik Mati Atas / ATDC), busi harus menyala jauh lebih awal (Advance) saat RPM tinggi.',
      workshopStandard:
        'Pengapian yang terlalu maju (over advance) menyebabkan detonasi keras (knocking) dan mesin panas. Pengapian terlalu mundur (retard) menyebabkan mesin loyo dan knalpot membara merah.',
      practicalProTip:
        'ECU modern menggunakan sensor putaran kruk as (CKP) untuk memajukan pengapian secara presisi berdasarkan pulsa gigi flywheel.',
    },
    diagramType: 'ignition_timing',
  },
  {
    id: 9,
    category: 'Sistem Pendinginan Radiator',
    badgeColor: 'bg-teal-600 text-white',
    question:
      'Sering dijumpai montir melepas katup thermostat pada motor berpendingin cairan dengan alasan "biar mesin selalu dingin terus". Apakah diagnosa dokter otomotif terhadap tindakan ini?',
    codeOrCase: 'Analisa Modifikasi: Melepas katup thermostat pendingin radiator.',
    options: [
      { key: 'A', text: 'Sangat dianjurkan karena membuat mesin motor awet hingga puluhan tahun.' },
      {
        key: 'B',
        text: 'Keliru & merugikan: Mesin lambat mencapai suhu kerja ideal (80°-90°C), bahan bakar boros (mode warming up terus), dan memicu keausan tinggi akibat oli kental & sludge.',
      },
      { key: 'C', text: 'Menghilangkan fungsi pompa oli mesin.' },
      { key: 'D', text: 'Membuat aki motor mengalami korsleting listrik.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Thermostat bukanlah penghambat aliran, melainkan gerbang pengatur suhu termal yang sangat vital.',
      scientificBasis:
        'Mesin dirancang bekerja paling presisi pada suhu kerja 80° - 90°C di mana celah komponen logam mengembang pas dan atomisasi bensin sempurna. Jika thermostat dicopot, air selalu mengalir ke radiator sehingga mesin overcooling (kedinginan). Sensor suhu (ECT) akan mendeteksi mesin dingin dan menyuruh ECU menyemprot bensin kaya terus menerus, boros bensin dan oli cepat rusak terkena bensin yang tidak terbakar.',
      workshopStandard:
        'Thermostat mulai membuka pada suhu ~75°C dan terbuka penuh pada ~90°C. Jangan pernah mencopot thermostat; jika rusak gantilah dengan yang baru.',
      practicalProTip:
        'Jika motor overheating, periksa apakah kipas mati, radiator tersumbat kerak, atau thermostat macet tertutup, bukan melepasnya permanen.',
    },
    diagramType: 'thermostat',
  },
  {
    id: 10,
    category: 'Kelistrikan & Pengisian Aki',
    badgeColor: 'bg-slate-700 text-white',
    question:
      'Saat mesin digeber di 5.000 RPM, tegangan pada kedua kutub aki terukur melonjak hingga 18.2 Volt (standar 14.0 - 14.8 Volt). Komponen apa yang rusak dan apa bahaya terbesarnya?',
    codeOrCase: 'Diagnosa Multimeter: Tegangan sistem pengisian melebihi batas regulasi (Overcharging).',
    options: [
      { key: 'A', text: 'Spul pengisian terbakar dan putus kawat tembaganya.' },
      {
        key: 'B',
        text: 'Regulator Rectifier (Kiprok) rusak/jebol; berisiko membuat aki mendidih/meledak dan merusak ECU serta komponen lampu motor.',
      },
      { key: 'C', text: 'Sekring utama motor putus total.' },
      { key: 'D', text: 'Busi motor mati sehingga listrik menumpuk di aki.' },
    ],
    correctKey: 'B',
    aiDoctorExplanation: {
      coreReason:
        'Kiprok memiliki dua fungsi utama: Rectifier (penyearah arus AC dari spul menjadi DC) dan Regulator (pembatas tegangan maksimal pengisian).',
      scientificBasis:
        'Rangkaian zener diode dan thyristor pemotong kelebihan voltase di dalam kiprok bertugas membuang tegangan lebih ke massa ketika voltase menyentuh ~14.8V. Jika regulator jebol, arus puluhan volt dari spul dialirkan mentah-mentah ke aki. Aki 12V akan mendidih (cairan elektrolit menguap menghasilkan gas hidrogen mudah meledak) dan merusak mikrokontroler ECU yang sensitif.',
      workshopStandard:
        'Voltase pengisian normal: 13.5V - 14.8V pada 5.000 RPM. Jika di bawah 12.8V = Undercharging (aki tekor); Jika di atas 15.2V = Overcharging fatal.',
      practicalProTip:
        'Segera matikan mesin jika bohlam lampu utama tiba-tiba putus berulang kali saat digas tinggi, itu tanda utama kiprok jebol.',
    },
    diagramType: 'regulator_kiprok',
  },
];
