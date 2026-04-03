/**
 * scripts/seed-all-lgas.js
 *
 * Seeds ALL 57 Lagos LGAs/LCDAs and their wards.
 * No election results, no users — just LGAs + wards.
 *
 * Safe to re-run — wipes LGAs and wards first, then re-inserts.
 * Users and election results are NOT touched.
 *
 * Run: node scripts/seed-all-lgas.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import LCDA from './models/LCDA.js';
import Ward from './models/Ward.js';

// ── All 57 Lagos LGAs/LCDAs ──────────────────────────────────────────────────
const LCDA_DATA = [
  { name: 'Mushin',                     code: 'MUSHIN'        },
  { name: 'Odi Olowo/Ojuwoye',          code: 'ODI-OLOWO'     },
  { name: 'Agege',                      code: 'AGEGE'         },
  { name: 'Ifako-Ijaiye',               code: 'IFAKO'         },
  { name: 'Ojokoro',                    code: 'OJOKORO'       },
  { name: 'Alimosho',                   code: 'ALIMOSHO'      },
  { name: 'Agbado/Oke-Odo',             code: 'AGBADO'        },
  { name: 'Mosan-Okunola',              code: 'MOSAN'         },
  { name: 'Igando/Ikotun',              code: 'IGANDO'        },
  { name: 'Ayobo/Ipaja',                code: 'AYOBO'         },
  { name: 'Isolo',                      code: 'ISOLO'         },
  { name: 'Egbe/Idimu',                 code: 'EGBE'          },
  { name: 'Lagos Mainland',             code: 'LAGOS-MAINLAND'},
  { name: 'Yaba',                       code: 'YABA'          },
  { name: 'Ebute Metta East',           code: 'EBUTE-METTA'   },
  { name: 'Lagos Island',               code: 'LAGOS-ISLAND'  },
  { name: 'Lagos Island East',          code: 'LAGOS-ISLAND-EAST' },
  { name: 'Eti-Osa',                    code: 'ETI-OSA'       },
  { name: 'Ikoyi-Obalende',             code: 'IKOYI'         },
  { name: 'Eti-Osa East',               code: 'ETI-OSA-EAST'  },
  { name: 'Ibeju-Lekki',                code: 'IBEJU'         },
  { name: 'Epe',                        code: 'EPE'           },
  { name: 'Epe East',                   code: 'EPE-EAST'      },
  { name: 'Epe West',                   code: 'EPE-WEST'      },
  { name: 'Ikorodu',                    code: 'IKORODU'       },
  { name: 'Ikorodu West',               code: 'IKORODU-WEST'  },
  { name: 'Ikorodu North',              code: 'IKORODU-NORTH' },
  { name: 'Igbogbo/Baiyeku',            code: 'IGBOGBO'       },
  { name: 'Imota',                      code: 'IMOTA'         },
  { name: 'Kosofe',                     code: 'KOSOFE'        },
  { name: 'Agboyi-Ketu',                code: 'AGBOYI'        },
  { name: 'Ikosi-Isheri',               code: 'IKOSI-ISHERI'  },
  { name: 'Ikeja',                      code: 'IKEJA'         },
  { name: 'Onigbongbo',                 code: 'ONIGBONGBO'    },
  { name: 'Ojodu',                      code: 'OJODU'         },
  { name: 'Surulere',                   code: 'SURULERE'      },
  { name: 'Coker/Aguda',                code: 'COKER'         },
  { name: 'Itire/Ikate',                code: 'ITIRE'         },
  { name: 'Ajeromi/Ifelodun',           code: 'AJEROMI'       },
  { name: 'Ifelodun',                   code: 'IFELODUN'      },
  { name: 'Apapa',                      code: 'APAPA'         },
  { name: 'Apapa Iganmu',               code: 'APAPA-IGANMU'  },
  { name: 'Amuwo-Odofin',               code: 'AMUWO'         },
  { name: 'Oriade',                     code: 'ORIADE'        },
  { name: 'Ojo',                        code: 'OJO'           },
  { name: 'Iba',                        code: 'IBA'           },
  { name: 'Badagry',                    code: 'BADAGRY'       },
  { name: 'Oto-Awori',                  code: 'OTO-AWORI'     },
  { name: 'Ibeju Lekki (LASIEC 49)',    code: 'IBEJU-2'       },
  { name: 'Lekki',                      code: 'LEKKI'         },
  { name: 'Badagry West',               code: 'BADAGRY-WEST'  },
  { name: 'Epe East (LASIEC 52)',        code: 'EPE-EAST-2'    },
  { name: 'Ojokoro (LASIEC 53)',         code: 'OJOKORO-2'     },
  { name: 'Eti-Osa West',               code: 'ETI-OSA-WEST'  },
  { name: 'Agbado/Oke-Odo (LASIEC 55)', code: 'AGBADO-2'      },
  { name: 'Yaba (LASIEC 56)',            code: 'YABA-2'        },
  { name: 'Surulere (LASIEC 57)',        code: 'SURULERE-2'    },
];

// ── All wards per LGA ────────────────────────────────────────────────────────
const WARD_DATA = {
  MUSHIN:           ['Mushin Atewolara','Papa Ajao','Alafia','Adeoyo','Igbehin','Baba Olosa','Moshalasi/Agoro','Onitire','Oduselu/Ola','Odo Eran/Ogunlana Idi Araba'],
  'ODI-OLOWO':      ['Alakara','Idi-Oro/Odi-Olowo','Babalosa','Ojuwoye','Ilupeju','Owodunni','Olatedju','Kayode/Fadeyi','Ilupeju Industrial Estate'],
  AGEGE:            ['Isale Oja','Dopemu','Papa Uku/Olusanya','Awori/Oniwaya','Atobaje','Keke','Sango'],
  IFAKO:            ['Ijaiye/Onibuku','Fadayi/Abule Egba','Oke-Ira/Ajuwon','Obama/Okera','Oke Ifo/Aiyeteju','Ojokoro/Akinyele','Oke Odo/Atan','Adelaja/Obele','Aiyetoro/Alakuko','Ijaiye/Ojokoro'],
  OJOKORO:          ['Ojokoro','Meiran/Agbede','Ijaiye','Aiyetoro','Abule-Egba','Aiyetoro II','Abule Egba II'],
  ALIMOSHO:         ['Agbado/Oke Odo','Alimosho','Ipaja South','Ipaja North','Mosan','Idimu','Akowonjo','Egbe','Shasha','Isolo'],
  AGBADO:           ['Agbado','Oke Odo','Oke Isalu','Agbado II','Agbado III','Agbado IV'],
  MOSAN:            ['Mosan','Okunola','Baruwa','Oke Odo','Ikotun','Ishaga','Agbado','Agbado II'],
  IGANDO:           ['Igando','Ikotun','Egan','Ojodu','Egan II','Agbado','Egan III'],
  AYOBO:            ['Ayobo','Ipaja','Meiran','Oke Odo','Oluwole','Ipaja II'],
  ISOLO:            ['Isolo','Ilasamaja','Ajao Estate','Oke Afa','Okota','Isolo II'],
  EGBE:             ['Egbe','Idimu','Igando','Ikotun','Igando II','Isheri','Idimu II'],
  'LAGOS-MAINLAND': ['Eboyi/Igbobi','Alagomeji','Ebute Meta West','Ebute Meta East','Apapa Road','Otto/Iddo','Otto','Oyadiran','Fadayi/Alagomeji','Adekunle'],
  YABA:             ['Sabo','Makoko','Ebute Meta','Alagomeji','Oyadiran','Adekunle','Abule Ije','Abule Oja','Oyingbo','Ebute Meta II'],
  'EBUTE-METTA':    ['Ebute Meta','Otto','Iddo','Otto II','Apapa Road','Sabo','Makoko'],
  'LAGOS-ISLAND':   ['Olowogbowo','Idumagbo','Isale Eko','Ita Faji','Ojuolape','Oja-Oba','Ojuolape II','Idumota','Oko Awo','Oko Faji'],
  'LAGOS-ISLAND-EAST': ['Isale Eko','Idumagbo','Idumota','Oko Faji','Oko Awo','Olowogbowo'],
  'ETI-OSA':        ['Ikoyi','Obalende','Victoria Island','Ilasan','Ado/Okun Ajah','Lafiaji','Obalende II','Ikate','Ilubirin'],
  IKOYI:            ['Ikoyi','Obalende','Lafiaji','Obalende II','Ilubirin','Dolphin Estate'],
  'ETI-OSA-EAST':   ['Addo/Okun','Ajah','Ilasan','Ikate','Ado II','Ajah Okun Mola'],
  IBEJU:            ['Akodo','Eleko','Lakowe','Ajah','Ibeju','Okun Ajah','Abule Panshire','Ibeju II','Lakowe II','Ajah II'],
  EPE:              ['Poka','Epe','Popo-Obadore','Odo-Egiri','Lagos Road','Epe II','Ajegunle','Itoikin','Ogunmodi','Ilara'],
  'EPE-EAST':       ['Odo Egiri','Ilara','Ogunmodi','Itoikin','Ajegunle'],
  'EPE-WEST':       ['Popo Obadore','Lagos Road','Poka','Epe','Epe II'],
  IKORODU:          ['Agura/Ipakodo','Ikorodu I','Ikorodu II','Bayeku/Ogolonto','Erikorodo','Imota','Igbogbo I','Igbogbo II','Iwerekun','Owutu'],
  'IKORODU-WEST':   ['Owutu','Erikorodo','Ogolonto','Isawo','Agbede'],
  'IKORODU-NORTH':  ['Agura','Ipakodo','Igbe','Agric','Isiu'],
  IGBOGBO:          ['Igbogbo I','Igbogbo II','Bayeku','Offin','Ilupeju'],
  IMOTA:            ['Imota','Erinlu','Igbogun','Odokekere','Imota II'],
  KOSOFE:           ['Ojota','Ketu','Alapere','Agboyi','Ifako','Anthony','Maryland','Ojodu','Ifako II','Ifako III'],
  AGBOYI:           ['Agboyi','Ketu','Alapere','Alapere II','Ojota'],
  'IKOSI-ISHERI':   ['Ikosi','Isheri','Ojodu','Ojodu II','Ojodu III'],
  IKEJA:            ['Ikeja','Alausa','Opebi','Oregun','Maryland','Anthony','Ojodu','Ogba','Agidingbi','Ikeja GRA'],
  ONIGBONGBO:       ['Onigbongbo','Opebi','Ikeja GRA','Oregun','Alausa'],
  OJODU:            ['Ojodu','Ogba','Agidingbi','Oke-Ira','Ifako'],
  SURULERE:         ['Akerele','Ijeshatedo','Itire','Lawanson','Mushin','Orile','Aguda','Shitta','Rabiu','Tejuosho'],
  COKER:            ['Aguda','Coker','Oluwalemu','Tejuosho','Ojuelegba'],
  ITIRE:            ['Itire','Ikate','Lawanson','Shitta','Rabiu'],
  AJEROMI:          ['Tolu','Ijegun','Ijegun II','Ijegun III','Oriwu','Ifelodun','Ijora Badia','Ojo Road','Ijora Badia II','Ifelodun II'],
  IFELODUN:         ['Ifelodun','Ijora Badia','Ojo Road','Ijora Badia II','Oriwu'],
  APAPA:            ['Apapa','Iganmu','Ijora','Ijora II','Ojora','Iganmu II','Marine Beach','Ajegunle','Ojo Road','Tincan'],
  'APAPA-IGANMU':   ['Apapa','Iganmu','Iganmu II','Marine Beach','Tincan'],
  AMUWO:            ['Festac','Mile 2','Kirikiri','Ijegun','Trade Fair','Satellite','Kirikiri II','Abule Ado','Ilasamaja','Kirikiri III'],
  ORIADE:           ['Kirikiri','Abule Ado','Trade Fair','Kirikiri II','Kirikiri III'],
  OJO:              ['Ojo','Okokomaiko','Ajangbadi','Iba','Ojo II','Iyana-Iba','Ajangbadi II','Ojo III','Ojo IV','Ojo V'],
  IBA:              ['Iba','Iyana-Iba','Okokomaiko','Ojo II','Ajangbadi'],
  BADAGRY:          ['Ajara','Ikoga','Topo','Ilogbo','Whiskey','Mosafejo','Popo','Badagry','Gberefu','Awhanjigoh'],
  'OTO-AWORI':      ['Igborosun','Ajara','Ilogbo','Topo','Mosafejo'],
  'IBEJU-2':        ['Ibeju Lekki','Akodo','Eleko','Ajah','Lakowe','Oke-Ogun','Panshire','Lakowe II','Ajah II','Eleko II'],
  LEKKI:            ['Lekki','Akodo','Eleko','Oke-Ogun','Panshire'],
  'BADAGRY-WEST':   ['Igborosun','Ajara','Popo','Gberefu','Awhanjigoh'],
  'EPE-EAST-2':     ['Ilara','Ogunmodi','Itoikin','Ajegunle','Odo Egiri'],
  'OJOKORO-2':      ['Ojokoro','Meiran','Aiyetoro','Abule Egba','Meiran II'],
  'ETI-OSA-WEST':   ['Ikoyi','Obalende','Victoria Island','Lafiaji','Dolphin Estate'],
  'AGBADO-2':       ['Agbado','Oke Odo','Isalu','Agbado II','Agbado III'],
  'YABA-2':         ['Oyadiran','Adekunle','Alagomeji','Makoko','Abule Oja'],
  'SURULERE-2':     ['Shitta','Lawanson','Tejuosho','Rabiu','Akerele'],
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  console.log('✅  Connected\n');

  // Wipe LGAs and wards only — users and results untouched
  await Ward.deleteMany({});
  await LCDA.deleteMany({});
  console.log('🗑  Cleared existing LGAs and wards\n');

  // Seed LGAs
  console.log('🏙  Seeding 57 LGAs…');
  const lcdaDocs = await LCDA.insertMany(LCDA_DATA);
  console.log(`   ↳ ${lcdaDocs.length} LGAs created`);

  const lcdaByCode = {};
  lcdaDocs.forEach(l => { lcdaByCode[l.code] = l._id; });

  // Seed wards
  console.log('🏘  Seeding wards…');
  const wardRows = [];
  for (const [code, names] of Object.entries(WARD_DATA)) {
    const lcdaId = lcdaByCode[code];
    if (!lcdaId) { console.warn(`   ⚠  No LGA for code "${code}" — skipping`); continue; }
    names.forEach((name, i) => {
      wardRows.push({
        name,
        code:  `${code}-W${String(i + 1).padStart(2, '0')}`,
        lcda:  lcdaId,
      });
    });
  }
  const wardDocs = await Ward.insertMany(wardRows);
  console.log(`   ↳ ${wardDocs.length} wards created\n`);

  console.log('─────────────────────────────────────');
  console.log('✅  DONE');
  console.log(`   LGAs  : ${await LCDA.countDocuments()}`);
  console.log(`   Wards : ${await Ward.countDocuments()}`);
  console.log('   Users and results untouched.');
  console.log('─────────────────────────────────────\n');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌  Failed:', err);
  mongoose.disconnect();
  process.exit(1);
});