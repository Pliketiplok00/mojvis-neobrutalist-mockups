/**
 * Fauna Content Data
 *
 * Bilingual content for the Fauna of Vis Island screen.
 * Structure mirrors floraContent.ts for consistency.
 *
 * Content structure supports HR and EN via { hr, en } objects.
 * UI selects appropriate language based on app locale.
 */

// ============================================================
// Types
// ============================================================

export interface BilingualText {
  hr: string;
  en: string;
}

export interface FaunaImage {
  url: string;
  author?: string;
  license?: string;
  sourcePage?: string;
}

export interface FaunaSpecies {
  id: string;
  priority?: 'critical';
  title: BilingualText;
  latin: string;
  description: BilingualText;
  howToRecognize?: BilingualText;
  habitat?: BilingualText;
  notes?: BilingualText;
  legalBasis?: BilingualText;
  images: FaunaImage[];
}

export interface FaunaContent {
  hero: {
    title: BilingualText;
    subtitle: BilingualText;
    badge: BilingualText;
    images: FaunaImage[];
  };
  doNotDisturb: {
    title: BilingualText;
    text: BilingualText;
    bullets: BilingualText[];
    note: BilingualText;
  };
  whySpecial: {
    title: BilingualText;
    text: BilingualText;
  };
  highlights: {
    title: BilingualText;
    items: Array<{
      headline: BilingualText;
      description: BilingualText;
    }>;
  };
  sensitiveAreas: {
    title: BilingualText;
    text: BilingualText;
    image: FaunaImage;
  };
  speciesSection: {
    title: BilingualText;
    intro: BilingualText;
  };
  species: FaunaSpecies[];
  closingNote: BilingualText;
  criticalTag: BilingualText;
}

// ============================================================
// Content Data
// ============================================================

export const faunaContent: FaunaContent = {
  hero: {
    title: { hr: "FAUNA", en: "FAUNA" },
    subtitle: { hr: "NATURA 2000", en: "NATURA 2000" },
    badge: { hr: "OTOK VIS", en: "VIS ISLAND" },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Komiza%2C_Island_of_Vis%2C_Croatia.JPG",
        author: "Hedwig Storch",
        license: "CC BY-SA 3.0",
        sourcePage: "https://commons.wikimedia.org/wiki/File:Komiza,_Island_of_Vis,_Croatia.JPG",
      },
    ]
  },

  doNotDisturb: {
    title: {
      hr: "Ne uznemiravajte i ne lovite",
      en: "Please don't disturb or catch wildlife"
    },
    text: {
      hr: "Na Visu i okolnim otocima obitavaju brojne zakonom zaštićene ili osjetljive životinjske vrste. Najsigurnije pravilo je jednostavno: promatrajte, fotografirajte i ostavite kako jest.",
      en: "Vis and its surrounding islands are home to many legally protected or sensitive animal species. The safest rule is simple: observe, photograph, and leave them as they are."
    },
    bullets: [
      { hr: "Ne lovite i ne hvatajte životinje", en: "Do not catch or trap animals" },
      { hr: "Ne uznemiravajte gnijezda i mlade", en: "Do not disturb nests or young animals" },
      { hr: "Ne hranite divlje životinje", en: "Do not feed wild animals" }
    ],
    note: {
      hr: "Ako niste sigurni je li neka vrsta zaštićena — ponašajte se kao da jest.\n\nU nastavku su primjeri životinja koje ne treba uznemiravati. Prve tri su najstrože zaštićene.",
      en: "If you're not sure whether a species is protected — assume it is.\n\nBelow are examples of animals that should not be disturbed. The first three are the most strictly protected."
    }
  },

  whySpecial: {
    title: {
      hr: "Zašto je fauna Visa posebna",
      en: "Why the fauna of Vis is special"
    },
    text: {
      hr: "Viški arhipelag ima izuzetno bogatu faunu oblikovanu izolacijom, čistim morem i netaknutim prirodnim staništima. Na malom prostoru susreću se endemske vrste, rijetke ptice gnjezdarice i morski sisavci.\n\nMnoge životinje osjetljive su na uznemiravanje, a neka staništa su iznimno krhka.",
      en: "The Vis archipelago has exceptionally rich fauna shaped by isolation, clean seas, and pristine natural habitats. In a small area, endemic species, rare nesting birds, and marine mammals coexist.\n\nMany animals are sensitive to disturbance, and some habitats are extremely fragile."
    }
  },

  highlights: {
    title: { hr: "Zanimljivosti", en: "Highlights" },
    items: [
      {
        headline: { hr: "Modra spilja i sredozemna medvjedica", en: "Blue Cave and Mediterranean monk seal" },
        description: {
          hr: "Bisevo je jedno od posljednjih utocista ugrožene sredozemne medvjedice u Jadranu.",
          en: "Bisevo is one of the last refuges for the endangered Mediterranean monk seal in the Adriatic."
        }
      },
      {
        headline: { hr: "Eleonorin sokol", en: "Eleonora's falcon" },
        description: {
          hr: "Viški arhipelag jedno je od rijetkih gnjezdilišta ove fascinantne ptice grabljivice.",
          en: "The Vis archipelago is one of the rare nesting sites for this fascinating bird of prey."
        }
      },
      {
        headline: { hr: "Viška gušterica", en: "Vis lizard" },
        description: {
          hr: "Endemska podvrsta gušterice koja živi samo na otocima viškog arhipelaga.",
          en: "An endemic subspecies of lizard that lives only on the islands of the Vis archipelago."
        }
      }
    ]
  },

  sensitiveAreas: {
    title: {
      hr: "Posebno osjetljiva područja",
      en: "Especially sensitive areas"
    },
    text: {
      hr: "Otoci Brusnik, Sveti Andrija i Biševo izuzetno su osjetljiva prirodna područja s gnijezdištima morskih ptica i rijetkim endemskim vrstama.\n\nMolimo posjetitelje da ne uznemiravaju životinje, ne prilaze gnijezdima i poštuju oznake zaštićenih područja.",
      en: "The islands of Brusnik, Sveti Andrija, and Biševo are extremely sensitive natural areas with seabird nesting sites and rare endemic species.\n\nVisitors are kindly asked not to disturb animals, approach nests, or ignore protected area signs."
    },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Bisevo-Andrija-Brusnik-Jabuka.jpg",
      author: "Sl-Ziga",
      license: "Public domain",
      sourcePage: "https://commons.wikimedia.org/wiki/File:Bisevo-Andrija-Brusnik-Jabuka.jpg",
    },
  },

  speciesSection: {
    title: {
      hr: "Fauna otoka Visa — životinje koje ne treba uznemiravati",
      en: "Fauna of Vis Island — animals that should not be disturbed"
    },
    intro: {
      hr: "Ove životinje su zakonom strogo zaštićene ili posebno osjetljive za prirodu otoka Visa.",
      en: "These animals are strictly protected by law or particularly sensitive within the natural environment of Vis Island."
    }
  },

  species: [
    {
      id: "monachus-monachus",
      priority: "critical",
      title: { hr: "Sredozemna medvjedica", en: "Mediterranean monk seal" },
      latin: "Monachus monachus",
      description: {
        hr: "Sredozemna medvjedica jedan je od najugroženijih sisavaca na svijetu. U Jadranu preostaje samo nekoliko desetaka jedinki. Viški arhipelag, osobito Biševo i okolni otoci, jedno je od posljednjih sigurnih utočišta. Ova morska medvjedica izuzetno je osjetljiva na uznemiravanje — čak i kratkotrajno približavanje može natjerati ženku da napusti mladunče.",
        en: "The Mediterranean monk seal is one of the most endangered mammals in the world. Only a few dozen individuals remain in the Adriatic. The Vis archipelago, especially Biševo and surrounding islands, is one of the last safe refuges. This marine seal is extremely sensitive to disturbance — even brief approaches can cause a female to abandon her pup."
      },
      howToRecognize: {
        hr: "Veliki morski sisar s tamnosmeđim ili sivim krznom. Često se odmara u špiljama.",
        en: "Large marine mammal with dark brown or gray fur. Often rests in sea caves."
      },
      habitat: {
        hr: "Morske špilje, usamljene plaže i hridine.",
        en: "Sea caves, isolated beaches, and rocky shores."
      },
      notes: {
        hr: "Ako ugledate medvjedicu — polako se udaljite. Ne približavajte se ni fotografirajte izbliza.",
        en: "If you spot a monk seal — slowly back away. Do not approach or photograph up close."
      },
      legalBasis: {
        hr: "Zakon o zaštiti prirode, Pravilnik o strogo zaštićenim vrstama",
        en: "Nature Protection Act, Ordinance on Strictly Protected Species"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/8/88/Adult_female_monk_seal.jpg",
          author: "Wanax01",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Adult_female_monk_seal.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Monachus_monachus_DSC_0274.jpg",
          author: "Marinko Babic",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Monachus_monachus_DSC_0274.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/8/84/Monachus_monachus_DSC_0057.jpg",
          author: "Marinko Babic",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Monachus_monachus_DSC_0057.jpg",
        },
      ]
    },

    {
      id: "falco-eleonorae",
      priority: "critical",
      title: { hr: "Eleonorin sokol", en: "Eleonora's falcon" },
      latin: "Falco eleonorae",
      description: {
        hr: "Eleonorin sokol elegantna je ptica grabljivica koja gnijezdi na strmim liticama jadranskih otoka. Viški arhipelag jedno je od rijetkih gnjezdilišta u Hrvatskoj. Gnijezdi kasno u sezoni (kolovoz-rujan) kako bi hranio mlade pticama selicama. Izuzetno je osjetljiv na uznemiravanje gnijezda — približavanje liticama može uzrokovati napuštanje jaja ili mladih.",
        en: "Eleonora's falcon is an elegant bird of prey that nests on steep cliffs of Adriatic islands. The Vis archipelago is one of the rare nesting sites in Croatia. It nests late in the season (August-September) to feed its young with migrating birds. It is extremely sensitive to nest disturbance — approaching cliffs can cause abandonment of eggs or chicks."
      },
      howToRecognize: {
        hr: "Vitki sokol s dugim, šiljatim krilima. Dolazi u tamnoj i svijetloj formi.",
        en: "Slender falcon with long, pointed wings. Comes in dark and light morphs."
      },
      habitat: {
        hr: "Stjenovite litice i otočne hridi.",
        en: "Rocky cliffs and island crags."
      },
      notes: {
        hr: "Tijekom gnjezdenja ne prilazite liticama. Promatrajte dalekozorom s mora.",
        en: "During nesting, do not approach cliffs. Observe with binoculars from the sea."
      },
      legalBasis: {
        hr: "Pravilnik o strogo zaštićenim vrstama, Direktiva o pticama EU",
        en: "Ordinance on Strictly Protected Species, EU Birds Directive"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Eleonora%27s_Falcon%2C_Carloforte%2C_Sardinia_1.jpg",
          author: "Charles J. Sharp",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Eleonora's_Falcon,_Carloforte,_Sardinia_1.jpg",
        },
      ]
    },

    {
      id: "podarcis-melisellensis",
      priority: "critical",
      title: { hr: "Jadranska gušterica", en: "Dalmatian wall lizard" },
      latin: "Podarcis melisellensis",
      description: {
        hr: "Jadranska gušterica endemska je vrsta Jadrana s više podvrsta na različitim otocima. Na viškom arhipelagu žive jedinstvene populacije koje su se razvijale izolirano tisućama godina. Ove gušterice osjetljive su na hvatanje i uznemiravanje. Čak i kratko hvatanje može uzrokovati stres i ozljede.",
        en: "The Dalmatian wall lizard is an endemic Adriatic species with multiple subspecies on different islands. The Vis archipelago hosts unique populations that evolved in isolation for thousands of years. These lizards are sensitive to catching and disturbance. Even brief handling can cause stress and injury."
      },
      howToRecognize: {
        hr: "Mala gušterica s varijabilnim bojama — od zelene do smeđe, često s uzorcima.",
        en: "Small lizard with variable coloring — from green to brown, often with patterns."
      },
      habitat: {
        hr: "Suhe kamene zidove, stijene i ruševine.",
        en: "Dry stone walls, rocks, and ruins."
      },
      notes: {
        hr: "Promatrajte, fotografirajte, ali ne hvatajte. Svaki otok ima jedinstvenu populaciju.",
        en: "Observe, photograph, but do not catch. Each island has a unique population."
      },
      legalBasis: {
        hr: "Pravilnik o strogo zaštićenim vrstama",
        en: "Ordinance on Strictly Protected Species"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adriatische_Mauereidechse_Podarcis_melisellensis.jpg",
          author: "Holger Krisp",
          license: "CC BY 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Adriatische_Mauereidechse_Podarcis_melisellensis.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Benny_Trapp_Podarcis_melisselensis.jpg",
          author: "Benny Trapp",
          license: "CC BY 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Benny_Trapp_Podarcis_melisselensis.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Podarcis_melisellensis-Vis_island.jpg",
          author: "Jadvinia",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Podarcis_melisellensis-Vis_island.jpg",
        },
      ]
    },

    {
      id: "tursiops-truncatus",
      title: { hr: "Dobri dupin", en: "Common bottlenose dolphin" },
      latin: "Tursiops truncatus",
      description: {
        hr: "Dobri dupin najčešći je morski sisar jadranskog mora. Oko viškog arhipelaga česta su viđenja skupina koje love i igraju se. Iako djeluju prijateljski, približavanje brodicama može ometati njihovo hranjenje i socijalne interakcije. Dupini su zaštićeni — zabranjeno je namjerno približavanje na manje od 50 metara.",
        en: "The common bottlenose dolphin is the most frequent marine mammal in the Adriatic Sea. Around the Vis archipelago, sightings of groups hunting and playing are common. Although they seem friendly, approaching by boat can disrupt their feeding and social interactions. Dolphins are protected — intentional approaches closer than 50 meters are prohibited."
      },
      howToRecognize: {
        hr: "Sivi morski sisar s karakterističnim zaobljenim čelom i kratkim kljunom.",
        en: "Gray marine mammal with characteristic rounded forehead and short beak."
      },
      habitat: {
        hr: "Otvoreno more i kanali između otoka.",
        en: "Open sea and channels between islands."
      },
      notes: {
        hr: "Ako vas dupini priđu — uživajte, ali ne jurite za njima brodicom.",
        en: "If dolphins approach you — enjoy, but don't chase them by boat."
      },
      legalBasis: {
        hr: "Zakon o zaštiti prirode, Pravilnik o zaštiti morskih sisavaca",
        en: "Nature Protection Act, Ordinance on Marine Mammal Protection"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Tursiops_truncatus_01.jpg",
          author: "NASA",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Tursiops_truncatus_01.jpg",
        },
      ]
    },

    {
      id: "calonectris-diomedea",
      title: { hr: "Kaukal", en: "Scopoli's shearwater" },
      latin: "Calonectris diomedea",
      description: {
        hr: "Kaukal je morska ptica koja gnijezdi u špiljama i pukotinama stjenovitih otoka. Na viškom arhipelagu nalazi se značajna kolonija. Noću izdaje karakteristične krikove nalik ljudskom plaču. Gnijezda su izuzetno osjetljiva — svijetlo, buka i prisustvo ljudi mogu uzrokovati napuštanje jaja.",
        en: "Scopoli's shearwater is a seabird that nests in caves and crevices of rocky islands. The Vis archipelago hosts a significant colony. At night, it produces characteristic calls resembling human crying. Nests are extremely sensitive — light, noise, and human presence can cause abandonment of eggs."
      },
      howToRecognize: {
        hr: "Srednjevelika morska ptica sa sivosmeđim gornjim dijelom i bijelim trbuhom.",
        en: "Medium-sized seabird with gray-brown upperparts and white belly."
      },
      habitat: {
        hr: "Stjenovite morske špilje i pukotine na otočnim liticama.",
        en: "Rocky sea caves and crevices on island cliffs."
      },
      notes: {
        hr: "Noću izbjegavajte osvjetljavati litice i ulaze u špilje.",
        en: "At night, avoid illuminating cliffs and cave entrances."
      },
      legalBasis: {
        hr: "Pravilnik o strogo zaštićenim vrstama, Direktiva o pticama EU",
        en: "Ordinance on Strictly Protected Species, EU Birds Directive"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Scopoli%27s_Shearwater.jpg",
          author: "Telegro",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Scopoli's_Shearwater.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/13/Berta_maggiore.jpg",
          author: "F.Lo Valvo",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Berta_maggiore.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Puffin_de_Scopoli.jpg",
          author: "Frederic Coulon",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Puffin_de_Scopoli.jpg",
        },
      ]
    },

    {
      id: "testudo-hermanni",
      title: { hr: "Kopnena kornjača", en: "Hermann's tortoise" },
      latin: "Testudo hermanni",
      description: {
        hr: "Kopnena kornjača česta je na suhim mediteranskim staništima Visa. Može se sresti na putovima, u maslinicima i makiji. Iako izgleda robusno, vrlo je osjetljiva na hvatanje i premještanje. Kornjače imaju snažan osjećaj za teritorij — premještena kornjača često ne preživi.",
        en: "Hermann's tortoise is common in dry Mediterranean habitats of Vis. It can be encountered on paths, in olive groves, and in Mediterranean scrub. Although it looks robust, it is very sensitive to catching and relocating. Tortoises have a strong sense of territory — a relocated tortoise often does not survive."
      },
      howToRecognize: {
        hr: "Žuto-smeđi oklop s tamnim uzorcima. Sporohodna životinja.",
        en: "Yellow-brown shell with dark patterns. Slow-moving animal."
      },
      habitat: {
        hr: "Makija, maslinici i suhi travnjaci.",
        en: "Mediterranean scrub, olive groves, and dry grasslands."
      },
      notes: {
        hr: "Ako vidite kornjaču na cesti — pomognite joj prijeći u smjeru kretanja, ali je ne nosite kući.",
        en: "If you see a tortoise on the road — help it cross in its direction of travel, but don't take it home."
      },
      legalBasis: {
        hr: "Pravilnik o strogo zaštićenim vrstama, CITES",
        en: "Ordinance on Strictly Protected Species, CITES"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Testudo_hermanni_boettgeri_01.JPG",
          author: "H. Zell",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_boettgeri_01.JPG",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Testudo_hermanni_BW_1.JPG",
          author: "Berthold Werner",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_BW_1.JPG",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Testudo_hermanni_BW_2.JPG",
          author: "Berthold Werner",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_BW_2.JPG",
        },
      ]
    },

    {
      id: "phalacrocorax-aristotelis",
      title: { hr: "Morski vranac", en: "European shag" },
      latin: "Phalacrocorax aristotelis desmarestii",
      description: {
        hr: "Morski vranac elegantna je morska ptica crnog perja sa zelenkastim sjajem. Na viškim otocima gnijezdi na nepristupačnim liticama. Tijekom gnjezdenja izuzetno je osjetljiv na uznemiravanje — približavanje brodicom može uzrokovati napuštanje gnijezda.",
        en: "The European shag is an elegant seabird with black plumage and greenish sheen. On the Vis islands, it nests on inaccessible cliffs. During nesting, it is extremely sensitive to disturbance — approaching by boat can cause nest abandonment."
      },
      howToRecognize: {
        hr: "Crna ptica s dugim vratom i kukmastom glavom u proljeće. Često suši krila na stijenama.",
        en: "Black bird with long neck and crested head in spring. Often dries wings on rocks."
      },
      habitat: {
        hr: "Stjenovite litice i hridi uz more.",
        en: "Rocky cliffs and crags by the sea."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/7/7c/European_shags_%28Gulosus_aristotelis_aristotelis%29_Argyll.jpg",
          author: "Charles J. Sharp",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:European_shags_(Gulosus_aristotelis_aristotelis)_Argyll.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/European_shag_%28Gulosus_aristotelis_aristotelis%29_in_flight_Flatey.jpg",
          author: "Charles J. Sharp",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:European_shag_(Gulosus_aristotelis_aristotelis)_in_flight_Flatey.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/European_shag_%28Phalacrocorax_aristotelis%29.jpg",
          author: "Bouke ten Cate",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:European_shag_(Phalacrocorax_aristotelis).jpg",
        },
      ]
    },

    {
      id: "caretta-caretta",
      title: { hr: "Glavata želva", en: "Loggerhead sea turtle" },
      latin: "Caretta caretta",
      description: {
        hr: "Glavata želva povremeni je posjetitelj voda oko Visa. Ova morska kornjača može narasti do metra i težiti preko 100 kg. Iako ne gnijezdi na Visu, prolazi ovim vodama tijekom migracija. Ugrožena je plastikom, mrežama i sudarima s brodovima.",
        en: "The loggerhead sea turtle is an occasional visitor to the waters around Vis. This sea turtle can grow up to one meter and weigh over 100 kg. Although it doesn't nest on Vis, it passes through these waters during migrations. It is threatened by plastic, fishing nets, and boat strikes."
      },
      howToRecognize: {
        hr: "Velika morska kornjača s crvenkasto-smeđim oklopom.",
        en: "Large sea turtle with reddish-brown shell."
      },
      habitat: {
        hr: "Otvoreno more i obalne zone.",
        en: "Open sea and coastal zones."
      },
      notes: {
        hr: "Ako vidite ozlijeđenu želvu, kontaktirajte lokalne vlasti ili centar za spašavanje.",
        en: "If you see an injured turtle, contact local authorities or a rescue center."
      },
      legalBasis: {
        hr: "Zakon o zaštiti prirode, Pravilnik o strogo zaštićenim vrstama",
        en: "Nature Protection Act, Ordinance on Strictly Protected Species"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Loggerhead_Sea_Turtle_%28Caretta_caretta%29.jpg",
          author: "The High Fin Sperm Whale",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Loggerhead_Sea_Turtle_(Caretta_caretta).jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/6/66/Ada_sea_turtle.JPG",
          author: "SanBa",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Ada_sea_turtle.JPG",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Anamur_caretta_caretta.jpg",
          author: "Walterhelbling",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Anamur_caretta_caretta.jpg",
        },
      ]
    },

    {
      id: "elaphe-situla",
      title: { hr: "Leopard zmija", en: "Leopard snake" },
      latin: "Elaphe situla",
      description: {
        hr: "Leopard zmija jedna je od najljepših europskih zmija. Ima karakteristične crveno-smeđe mrlje na svijetloj pozadini. Na Visu je rijetka i zaštićena. Potpuno je bezopasna za ljude — ne grize ni kada je uhvaćena. Ubijanje zmija strogo je zabranjeno.",
        en: "The leopard snake is one of the most beautiful European snakes. It has characteristic red-brown spots on a light background. On Vis, it is rare and protected. It is completely harmless to humans — it doesn't bite even when caught. Killing snakes is strictly prohibited."
      },
      howToRecognize: {
        hr: "Tanka zmija s crvenkasto-smeđim mrljama na sivkasto-žutoj pozadini.",
        en: "Slender snake with reddish-brown spots on a grayish-yellow background."
      },
      habitat: {
        hr: "Suhi kamenjari, stari zidovi i ruševine.",
        en: "Dry rocky areas, old walls, and ruins."
      },
      notes: {
        hr: "Ako vidite zmiju — samo je fotografirajte i pustite da ode. Sve zmije u Hrvatskoj su zaštićene.",
        en: "If you see a snake — just photograph it and let it go. All snakes in Croatia are protected."
      },
      legalBasis: {
        hr: "Pravilnik o strogo zaštićenim vrstama",
        en: "Ordinance on Strictly Protected Species"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/49/Leopardsnake.jpg",
          author: "Berkay353",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Leopardsnake.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Zamenis_situla.jpg",
          author: "Sebottendorf",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Zamenis_situla.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Elaphe_situla.jpg",
          author: "Atanas Grozdanov",
          license: "CC BY 2.5",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Elaphe_situla.jpg",
        },
      ]
    },

    {
      id: "larus-audouinii",
      title: { hr: "Sredozemni galeb", en: "Audouin's gull" },
      latin: "Larus audouinii",
      description: {
        hr: "Sredozemni galeb rijetka je morska ptica s crvenim kljunom i tamnim vrhom krila. Gnijezdi na malim otocima i hridima. Na viškom arhipelagu povremeno se viđa tijekom gnijezdenja. Osjetljiv je na uznemiravanje gnijezda i konkurenciju s većim galebovima.",
        en: "Audouin's gull is a rare seabird with a red bill and dark wingtips. It nests on small islands and rocks. In the Vis archipelago, it is occasionally seen during breeding season. It is sensitive to nest disturbance and competition with larger gulls."
      },
      howToRecognize: {
        hr: "Srednje velik galeb s crvenim kljunom i sivim gornjim dijelom.",
        en: "Medium-sized gull with red bill and gray upperparts."
      },
      habitat: {
        hr: "Male hridi i otočići bez vegetacije.",
        en: "Small rocks and islets without vegetation."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Audouin%27s_gull_%28Ichthyaetus_audouinii%29.jpg",
          author: "Hobbyfotowiki",
          license: "CC0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Audouin's_gull_(Ichthyaetus_audouinii).jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Audouin%27s_Gull_Larus_audouinii_%288470613496%29.jpg",
          author: "Len Worthington",
          license: "CC BY-SA 2.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Audouin's_Gull_Larus_audouinii_(8470613496).jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Audouin%60s_gull_%28Larus_audouinii%29_%281%29.jpg",
          author: "Ken Billington",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Audouin`s_gull_(Larus_audouinii)_(1).jpg",
        },
      ]
    },
  ],

  closingNote: {
    hr: "Hvala što pomažete očuvati faunu viškog arhipelaga.",
    en: "Thank you for helping preserve the fauna of the Vis archipelago."
  },

  criticalTag: {
    hr: "najstroži stupanj zaštite",
    en: "highest level of protection"
  }
};

export default faunaContent;
