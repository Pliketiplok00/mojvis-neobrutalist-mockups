/**
 * Flora Content Data
 *
 * Bilingual content for the Flora of Vis Island screen.
 * Source: docs/flora.ts (canonical)
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

export interface FloraImage {
  url: string;
  author?: string;
  license?: string;
  sourcePage?: string;
}

export interface FloraSpecies {
  id: string;
  priority?: 'critical';
  title: BilingualText;
  latin: string;
  description: BilingualText;
  howToRecognize?: BilingualText;
  habitat?: BilingualText;
  notes?: BilingualText;
  legalBasis?: BilingualText;
  images: FloraImage[];
}

export interface FloraContent {
  hero: {
    title: BilingualText;
    subtitle: BilingualText;
    badge: BilingualText;
    images: FloraImage[];
  };
  doNotTouch: {
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
    image: FloraImage;
  };
  speciesSection: {
    title: BilingualText;
    intro: BilingualText;
  };
  species: FloraSpecies[];
  closingNote: BilingualText;
  criticalTag: BilingualText;
}

// ============================================================
// Content Data (from docs/flora.ts)
// ============================================================

export const floraContent: FloraContent = {
  hero: {
    title: { hr: "FLORA", en: "FLORA" },
    subtitle: { hr: "NATURA 2000", en: "NATURA 2000" },
    badge: { hr: "OTOK VIS", en: "VIS ISLAND" },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/J32_479_Vis%2C_S%C3%BCdk%C3%BCste.jpg",
        author: "Falk2",
        license: "CC BY-SA 4.0",
        sourcePage: "https://commons.wikimedia.org/wiki/File:J32_479_Vis,_S%C3%BCdk%C3%BCste.jpg",
      },
    ]
  },

  doNotTouch: {
    title: {
      hr: "Ne berite i ne odnosite iz prirode",
      en: "Please don't pick or remove plants"
    },
    text: {
      hr: "Na Visu rastu biljke koje su strogo zaštićene ili izuzetno osjetljive. Najsigurnije pravilo je jednostavno: promatrajte, fotografirajte i ostavite kako jest.",
      en: "On Vis, some plants are strictly protected or exceptionally sensitive. The safest rule is simple: observe, take photos, and leave them as they are."
    },
    bullets: [
      { hr: "Ne berite biljke", en: "Do not pick plants" },
      { hr: "Ne čupajte i ne lomite", en: "Do not uproot or break them" },
      { hr: "Ne odnosite ništa iz prirode", en: "Do not remove anything from nature" }
    ],
    note: {
      hr: "Ako niste sigurni je li neka biljka zaštićena — ostavite je tamo gdje jest.\n\nU nastavku su primjeri biljaka koje ne treba brati ni dirati. Prve tri su najstrože zaštićene i posebno osjetljive.",
      en: "If you're not sure whether a plant is protected — leave it where it is.\n\nBelow are examples of plants that should not be picked or disturbed. The first three are the most strictly protected and sensitive."
    }
  },

  whySpecial: {
    title: {
      hr: "Zašto je flora Visa posebna",
      en: "Why the flora of Vis is special"
    },
    text: {
      hr: "Vis ima iznimno raznoliku mediteransku floru, oblikovanu sušom, vjetrom i izolacijom otoka. Na malom prostoru susreću se šume crnike, makija, suhi travnjaci i rijetka otočna staništa.\n\nMnoge biljke rastu sporo, na vrlo ograničenim područjima i lako nestaju ako ih se dira ili bere.",
      en: "Vis has an exceptionally diverse Mediterranean flora shaped by drought, wind, and island isolation. Within a small area, holm oak forests, Mediterranean scrub, dry grasslands, and rare island habitats coexist.\n\nMany plants grow slowly, occupy very limited areas, and disappear easily if disturbed or picked."
    }
  },

  highlights: {
    title: { hr: "Zanimljivosti", en: "Highlights" },
    items: [
      {
        headline: { hr: "Više od 870 vrsta", en: "Over 870 species" },
        description: {
          hr: "Na Visu je zabilježeno više od 870 biljnih vrsta — iznimna raznolikost za tako mali otok.",
          en: "More than 870 plant species have been recorded on Vis — exceptional diversity for such a small island."
        }
      },
      {
        headline: { hr: "Biševo — botanički dragulj", en: "Biševo — a botanical gem" },
        description: {
          hr: "Biševo je jedno od botanički najbogatijih otočnih područja u Hrvatskoj.",
          en: "Biševo is one of the most botanically rich island areas in Croatia."
        }
      },
      {
        headline: { hr: "Natura 2000", en: "Natura 2000" },
        description: {
          hr: "Brojne biljne vrste dio su europske mreže Natura 2000 za očuvanje prirode.",
          en: "Many plant species are part of the European Natura 2000 ecological network."
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
      hr: "Otoci Brusnik, Sveti Andrija i Biševo izuzetno su osjetljiva prirodna područja s velikim brojem endemskih i zaštićenih biljnih vrsta.\n\nMolimo sve posjetitelje da ne beru, ne odnose i ne diraju ništa iz prirode – čak ni biljke, kamenje ili pijesak.",
      en: "The islands of Brusnik, Sveti Andrija, and Biševo are extremely sensitive natural areas with many endemic and protected plant species.\n\nVisitors are kindly asked not to pick, remove, or disturb anything from nature – including plants, stones, or sand."
    },
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Bisevo-Andrija-Brusnik-Jabuka.jpg',
      author: 'Sl-Ziga',
      license: 'Public domain',
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Bisevo-Andrija-Brusnik-Jabuka.jpg',
    },
  },

  speciesSection: {
    title: {
      hr: "Flora otoka Visa – biljke koje ne treba brati ni dirati",
      en: "Flora of Vis Island – plants that should not be picked or touched"
    },
    intro: {
      hr: "Ove biljke su zakonom strogo zaštićene, imaju regulirano sakupljanje ili su posebno osjetljive za prirodu otoka Visa.",
      en: "These plants are strictly protected by law, subject to regulated harvesting, or particularly sensitive within the natural environment of Vis Island."
    }
  },

  species: [
    {
      id: "orchids",
      priority: "critical",
      title: { hr: "Divlje orhideje", en: "Wild orchids" },
      latin: "Orchidaceae spp.",
      description: {
        hr: "Divlje orhideje spadaju među najosjetljivije biljke u prirodi. Na Visu raste više vrsta koje ovise o vrlo specifičnim uvjetima tla i mikroklime. Često imaju neobične, složene cvjetove koji nalikuju kukcima ili imaju izražene uzorke. Izuzetno su osjetljive na gaženje i čupanje. Čak i kratko vađenje iz tla najčešće znači trajno uništenje biljke.",
        en: "Wild orchids are among the most sensitive plants in nature. Several species grow on Vis, relying on very specific soil and microclimatic conditions. They often have unusual, complex flowers resembling insects or featuring striking patterns. They are extremely sensitive to trampling and uprooting. Even brief removal from the ground usually results in the plant's death."
      },
      howToRecognize: {
        hr: "Neobični cvjetovi, često nalik kukcima, s izraženim oblicima i uzorcima.",
        en: "Unusual flowers, often insect-like, with distinctive shapes and patterns."
      },
      habitat: {
        hr: "Travnjaci, rubovi makije i otvorena prirodna staništa.",
        en: "Grasslands, edges of Mediterranean scrub, and open natural habitats."
      },
      notes: {
        hr: "Posebno osjetljive na gaženje i uznemiravanje.",
        en: "Especially sensitive to trampling and disturbance."
      },
      legalBasis: {
        hr: "Pravilnik o strogo zaštićenim vrstama (NN 144/13, 73/16)",
        en: "Ordinance on Strictly Protected Species (OG 144/13, 73/16)"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/46/Serapias_lingua_2.jpg",
          author: "Thomas Krucker",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Serapias_lingua_2.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/2/27/Anacamptis_pyramidalis_2.jpg",
          author: "Franz Xaver",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Anacamptis_pyramidalis_2.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Ophrys_bombyliflora.jpg",
          author: "luis Nunes Alberto",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Ophrys_bombyliflora.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/5/58/Ophrys_sphegodes_Leopoldsberg.jpg",
          author: "Allefant",
          license: "CC0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Ophrys_sphegodes_Leopoldsberg.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Orchis_italica_kz06.jpg",
          author: "Krzysztof Ziarnek, Kenraiz",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Orchis_italica_kz06.jpg",
        },
      ]
    },

    {
      id: "centaurea-ragusina",
      priority: "critical",
      title: { hr: "Dubrovačka zečina", en: "Ragusa knapweed" },
      latin: "Centaurea ragusina",
      description: {
        hr: "Dubrovačka zečina je rijetka endemska biljka jadranske obale, prepoznatljiva po srebrnastim listovima. Na Visu raste na stjenovitim obalnim područjima i padinama. Listovi su prekriveni finim dlačicama koje biljci daju sivi sjaj. Cvjetovi su svijetloplavi do ljubičasti. Branje ili oštećivanje ove biljke trajno narušava lokalne populacije.",
        en: "Ragusa knapweed is a rare endemic plant of the Adriatic coast, easily recognized by its silvery leaves. On Vis, it grows on rocky coastal areas and slopes. The leaves are covered with fine hairs that give the plant a silvery appearance. The flowers are pale blue to violet. Picking or damaging this plant permanently harms local populations."
      },
      habitat: {
        hr: "Kamenite padine i obalna područja.",
        en: "Rocky slopes and coastal areas."
      },
      notes: {
        hr: "Jedna od vizualno najprepoznatljivijih zaštićenih biljaka.",
        en: "One of the most visually recognizable protected plants."
      },
      legalBasis: {
        hr: "Pravilnik o strogo zaštićenim vrstama",
        en: "Ordinance on Strictly Protected Species"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Dubrovacka_zecina.JPG",
          author: "Croq",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Dubrovacka_zecina.JPG",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Centaurea_ragusina_Risan_Bay_of_Kotor_yard_of_the_St._Michael.JPG",
          author: "Orjen",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Centaurea_ragusina_Risan_Bay_of_Kotor_yard_of_the_St._Michael.JPG",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Centaurea_ragusina_3_%28Corse%29.JPG",
          author: "Ghislain118",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Centaurea_ragusina_3_(Corse).JPG",
        },
      ]
    },

    {
      id: "pancratium-maritimum",
      priority: "critical",
      title: { hr: "Morski ljiljan", en: "Sea daffodil" },
      latin: "Pancratium maritimum",
      description: {
        hr: "Morski ljiljan raste isključivo na prirodnim pješčanim plažama i dinama. Ima velike bijele cvjetove jakog, slatkog mirisa. Cvjeta ljeti, često u uvjetima jake suše. Iako izgleda snažno, podzemni dijelovi su vrlo osjetljivi. Gaženje ili branje često uništava cijelu biljku.",
        en: "The sea daffodil grows exclusively on natural sandy beaches and dunes. It has large white flowers with a strong, sweet fragrance. It blooms in summer, often under extreme drought conditions. Although it appears robust, its underground parts are very sensitive. Trampling or picking often destroys the entire plant."
      },
      habitat: {
        hr: "Pješčane plaže i dine.",
        en: "Sandy beaches and dunes."
      },
      legalBasis: {
        hr: "Zaštita staništa – Natura 2000",
        en: "Habitat protection – Natura 2000"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Pancratium_maritimum_Corsica_2008.jpg",
          author: "Calimo",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Pancratium_maritimum_Corsica_2008.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Pancratium_maritimum_Greece.jpg",
          author: "Gorillo.Chimpo",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Pancratium_maritimum_Greece.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/42/Lliri_de_mar_a_les_dunes_de_la_platja_de_les_Deveses%2C_D%C3%A9nia.jpg",
          author: "Joanbanjo",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Lliri_de_mar_a_les_dunes_de_la_platja_de_les_Deveses,_D%C3%A9nia.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Azucena_de_mar_%28Pancratium_maritimum%29.jpg",
          author: "Juan Emilio Prades Bel",
          license: "CC BY 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Azucena_de_mar_(Pancratium_maritimum).jpg",
        },
      ]
    },

    {
      id: "asparagus-acutifolius",
      title: { hr: "Divlja šparoga", en: "Wild asparagus" },
      latin: "Asparagus acutifolius",
      description: {
        hr: "Divlja šparoga je samonikla mediteranska biljka s tankim, tamnozelenim izbojcima i bodljikavim granama. Najčešće se bere u proljeće, dok su mladi izboji mekani. Iako je jestiva i popularna, prekomjerno branje značajno osiromašuje prirodne populacije. Biljka se sporo obnavlja ako se čupa s korijenom. Na otoku Visu preporučuje se da se ne bere u prirodi.",
        en: "Wild asparagus is a self-growing Mediterranean plant with thin dark green shoots and thorny branches. It is most often harvested in spring when the young shoots are tender. Although edible and popular, excessive harvesting significantly depletes natural populations. The plant regenerates slowly if uprooted. On Vis Island, it is recommended not to harvest it in the wild."
      },
      habitat: {
        hr: "Makija, rubovi šuma i kamenjari.",
        en: "Mediterranean scrub, forest edges, and rocky terrain."
      },
      notes: {
        hr: "Često se zamjenjuje s uzgojenom šparogom, ali ima tanje i tamnije izdanke.",
        en: "Often confused with cultivated asparagus, but has thinner and darker shoots."
      },
      legalBasis: {
        hr: "Pravilnik o sakupljanju zavičajnih divljih vrsta (NN 114/17)",
        en: "Ordinance on the harvesting of native wild species (OG 114/17)"
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Asparagus_acutifolius_Brote_2010-5-08_DehesaBoyaldePuertollano.jpg",
          author: "Javier martin",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Asparagus_acutifolius_Brote_2010-5-08_DehesaBoyaldePuertollano.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Asparagus_acutifolius_TalloyHojas_2010-5-08_DehesaBoyaldePuertollano.jpg",
          author: "Javier martin",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Asparagus_acutifolius_TalloyHojas_2010-5-08_DehesaBoyaldePuertollano.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Asparagus_acutifolius_kz03.jpg",
          author: "Krzysztof Ziarnek, Kenraiz",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Asparagus_acutifolius_kz03.jpg",
        },
      ]
    },

    {
      id: "salvia-fruticosa",
      title: { hr: "Grčka kadulja", en: "Greek sage" },
      latin: "Salvia fruticosa",
      description: {
        hr: "Grčka kadulja je aromatična biljka s mekano dlakavim sivkastim listovima. Često se bere zbog mirisa i čajeva. Na otoku Visu prirodne populacije mogu biti osjetljive na prekomjerno branje. Biljka raste sporo i ne obnavlja se lako ako se čupa. Preporučuje se da se ostavi netaknuta u prirodi.",
        en: "Greek sage is an aromatic plant with soft, hairy grey-green leaves. It is often picked for its scent and herbal teas. On Vis, natural populations can be sensitive to excessive harvesting. The plant grows slowly and does not regenerate easily if uprooted. It is best left undisturbed in nature."
      },
      habitat: {
        hr: "Suha, kamenita područja i makija.",
        en: "Dry, rocky areas and Mediterranean scrub."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Salvia_fruticosa_RF.jpg",
          author: "Robert Flogaus-Faust",
          license: "CC BY 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Salvia_fruticosa_RF.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/13/Salvia_fruticosa_2_RF.jpg",
          author: "Robert Flogaus-Faust",
          license: "CC BY 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Salvia_fruticosa_2_RF.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Salvia_fruticosa_1.jpg",
          author: "Aroche",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Salvia_fruticosa_1.jpg",
        },
      ]
    },

    {
      id: "salvia-officinalis",
      title: { hr: "Prava kadulja", en: "Common sage" },
      latin: "Salvia officinalis",
      description: {
        hr: "Prava kadulja jedna je od najpoznatijih mediteranskih biljaka. Ima čvrste sivozelene listove i ljubičaste cvjetove. Iako je česta, samonikle populacije mogu biti ugrožene prekomjernim branjem. Posebno je osjetljiva ako se čupa s korijenom. Preporučuje se branje samo iz uzgoja.",
        en: "Common sage is one of the most well-known Mediterranean plants. It has firm grey-green leaves and purple flowers. Although widespread, wild populations can be threatened by excessive harvesting. It is particularly sensitive when uprooted. Harvesting should be limited to cultivated plants."
      },
      habitat: {
        hr: "Sunčane padine i makija.",
        en: "Sunny slopes and Mediterranean scrub."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Kadulja_Krizisce_240508_2.jpg",
          author: "Roberta F.",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Kadulja_Krizisce_240508_2.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Salbei_auf_der_Causse_Noir.jpg",
          author: "GerritR",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Salbei_auf_der_Causse_Noir.jpg",
        },
      ]
    },

    {
      id: "helichrysum-italicum",
      title: { hr: "Smilje", en: "Immortelle" },
      latin: "Helichrysum italicum",
      description: {
        hr: "Smilje je biljka intenzivnog mirisa s malim žutim cvjetovima. Raste na suhim i otvorenim terenima. Posljednjih godina bila je masovno brana zbog eteričnih ulja. Prekomjerno branje dovelo je do osiromašenja populacija. U prirodi je najbolje ostaviti je netaknutom.",
        en: "Immortelle is a strongly scented plant with small yellow flowers. It grows in dry, open areas. In recent years, it was heavily harvested for essential oils. Excessive harvesting has depleted natural populations. In nature, it should be left untouched."
      },
      habitat: {
        hr: "Suha, otvorena područja.",
        en: "Dry, open areas."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Helichrysum_italicum_%28corsica%29.jpg",
          author: "Bj.schoenmakers",
          license: "CC0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Helichrysum_italicum_(corsica).jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Helichrysum_italicum_%28immortelle%29.JPG",
          author: "Zubro",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Helichrysum_italicum_(immortelle).JPG",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Flora_della_Sardegna_317_%281%29.JPG",
          author: "Gianni Careddu",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Flora_della_Sardegna_317_(1).JPG",
        },
      ]
    },

    {
      id: "satureja-montana",
      title: { hr: "Primorski čubar", en: "Winter savory" },
      latin: "Satureja montana",
      description: {
        hr: "Primorski čubar je aromatična biljka s uskim listovima i sitnim cvjetovima. Raste na kamenitim i suhim terenima. Često se bere zbog jakog mirisa i okusa. Na otočnim staništima populacije mogu biti osjetljive. Preporučuje se da se ne bere u prirodi.",
        en: "Winter savory is an aromatic plant with narrow leaves and small flowers. It grows on rocky and dry terrain. It is often collected for its strong scent and flavor. In island habitats, populations can be sensitive. It is best not to harvest it in nature."
      },
      habitat: {
        hr: "Kamenjari i sunčane padine.",
        en: "Rocky ground and sunny slopes."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Satureja_montana_in_bloom.jpg",
          author: "Oblutak",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Satureja_montana_in_bloom.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/b/bc/SATUREJA_MONTANA_-_CADINELL_-_IB-415_%28Sajolida%29.JPG",
          author: "Isidre blanc",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:SATUREJA_MONTANA_-_CADINELL_-_IB-415_(Sajolida).JPG",
        },
      ]
    },

    {
      id: "thymus-spp",
      title: { hr: "Majčina dušica", en: "Wild thyme" },
      latin: "Thymus spp.",
      description: {
        hr: "Majčina dušica je niska biljka koja stvara guste jastučiće. Ima sitne listove i ružičaste ili ljubičaste cvjetove. Često se bere zbog mirisa i ljekovitosti. Vrlo je osjetljiva na gaženje i čupanje. Preporučuje se da se ne bere u prirodi.",
        en: "Wild thyme is a low-growing plant forming dense cushions. It has small leaves and pink or purple flowers. It is often collected for its fragrance and medicinal uses. It is highly sensitive to trampling and uprooting. It should not be picked in nature."
      },
      habitat: {
        hr: "Suhi travnjaci i kamenjari.",
        en: "Dry grasslands and rocky terrain."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Thymus_longicaulis_subsp._longicaulis_sl1.jpg",
          author: "Stefan.lefnaer",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Thymus_longicaulis_subsp._longicaulis_sl1.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Thymus_longicaulis_subsp._longicaulis_sl4.jpg",
          author: "Stefan.lefnaer",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Thymus_longicaulis_subsp._longicaulis_sl4.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/9/93/20200611Thymus_serpyllum3.jpg",
          author: "AnRo0002",
          license: "CC0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:20200611Thymus_serpyllum3.jpg",
        },
      ]
    },

    {
      id: "crithmum-maritimum",
      title: { hr: "Motar", en: "Rock samphire" },
      latin: "Crithmum maritimum",
      description: {
        hr: "Motar je obalna biljka mesnatih listova. Raste u pukotinama stijena uz more. Često se čupa iz stijena, čime se trajno oštećuje stanište. Biljka se vrlo sporo obnavlja. Preporučuje se da se ostavi netaknuta.",
        en: "Rock samphire is a coastal plant with fleshy leaves. It grows in rock crevices by the sea. It is often pulled from rocks, causing permanent habitat damage. The plant regenerates very slowly. It should be left untouched."
      },
      habitat: {
        hr: "Stjenovita obala.",
        en: "Rocky coastline."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Crithmum_maritimum.jpg",
          author: "Júlio Reis",
          license: "CC BY-SA 2.5",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Crithmum_maritimum.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Crithmum_maritimum_%28Habitus%29.jpg",
          author: "Ixitixel",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Crithmum_maritimum_(Habitus).jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Criste_marine_-_Plage_de_Porto_2022.jpg",
          author: "René Hourdry",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Criste_marine_-_Plage_de_Porto_2022.jpg",
        },
      ]
    },

    {
      id: "limonium-spp",
      title: { hr: "Morske lavande", en: "Sea lavenders" },
      latin: "Limonium spp.",
      description: {
        hr: "Morske lavande rastu na obalnim stijenama izloženima morskom aerosolu. Imaju kožaste listove i nježne ljubičaste cvjetove. Rastu izuzetno sporo. Čupanje lako uništava cijelu biljku. Posebno su osjetljive zbog ograničenih staništa.",
        en: "Sea lavenders grow on coastal cliffs exposed to sea spray. They have leathery leaves and delicate purple flowers. They grow extremely slowly. Uprooting easily destroys the entire plant. They are particularly sensitive due to limited habitats."
      },
      habitat: {
        hr: "Obalne stijene.",
        en: "Coastal cliffs."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/8/89/Caryophyllales_-_Limonium_vulgare_-_1.jpg",
          author: "Emőke Dénes",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Caryophyllales_-_Limonium_vulgare_-_1.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/31-08-2010_Limonium-vulgare-habitus.JPG",
          author: "Sten Porse",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:31-08-2010_Limonium-vulgare-habitus.JPG",
        },
      ]
    },

    {
      id: "euphorbia-dendroides",
      title: { hr: "Drvolika mlječika", en: "Tree spurge" },
      latin: "Euphorbia dendroides",
      description: {
        hr: "Drvolika mlječika je velika grmolika biljka s mesnatim granama. U proljeće ima upečatljive žutozelene cvatove. Lomljenje grana lako oštećuje biljku. Sok biljke može biti nadražujuć. Preporučuje se da se ne dira.",
        en: "Tree spurge is a large shrub with thick, fleshy branches. In spring it has striking yellow-green flower clusters. Breaking branches easily damages the plant. Its sap can be irritating. It should not be touched."
      },
      habitat: {
        hr: "Suhe kamene padine.",
        en: "Dry rocky slopes."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Euphorbia_dendroides_RF.jpg",
          author: "Robert Flogaus-Faust",
          license: "CC BY 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Euphorbia_dendroides_RF.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Euphorbia_dendroides_Zingaro_0047.JPG",
          author: "tato grasso",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Euphorbia_dendroides_Zingaro_0047.JPG",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Euphorbia_dendroides_Zingaro_0054.JPG",
          author: "tato grasso",
          license: "CC BY-SA 3.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Euphorbia_dendroides_Zingaro_0054.JPG",
        },
      ]
    },

    {
      id: "cistus-spp",
      title: { hr: "Bušin", en: "Rockrose" },
      latin: "Cistus spp.",
      description: {
        hr: "Bušin je grmolika biljka s velikim bijelim ili ružičastim cvjetovima. Cvjetovi su kratkog vijeka, ali vrlo upečatljivi. Često se bere zbog mirisa i izgleda. Dio je prirodne makije. Prekomjerno branje narušava stanište.",
        en: "Rockrose is a shrubby plant with large white or pink flowers. The flowers are short-lived but very striking. It is often picked for its scent and appearance. It is an important part of Mediterranean scrub. Excessive picking damages the habitat."
      },
      habitat: {
        hr: "Makija i suhi travnjaci.",
        en: "Mediterranean scrub and dry grasslands."
      },
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cistus_salviifolius_Blossom_SierraMadrona.jpg",
          author: "Javier martin",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Cistus_salviifolius_Blossom_SierraMadrona.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Cistus_salviifolius_Habitus_SierraMadrona.jpg",
          author: "Javier martin",
          license: "Public domain",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Cistus_salviifolius_Habitus_SierraMadrona.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Cistus_creticus_bush_in_Mount_Carmel.jpg",
          author: "Aaadir",
          license: "CC0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Cistus_creticus_bush_in_Mount_Carmel.jpg",
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/0/04/Cistus_creticus_-_Pink_rock-rose_01.jpg",
          author: "Zeynel Cebeci",
          license: "CC BY-SA 4.0",
          sourcePage: "https://commons.wikimedia.org/wiki/File:Cistus_creticus_-_Pink_rock-rose_01.jpg",
        },
      ]
    }
  ],

  closingNote: {
    hr: "Hvala što pomažete očuvati floru viškog arhipelaga.",
    en: "Thank you for helping preserve the flora of the Vis archipelago."
  },

  criticalTag: {
    hr: "najstroži stupanj zaštite",
    en: "highest level of protection"
  }
};

export default floraContent;
