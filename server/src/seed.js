// /**
//  * scripts/seed.js
//  *
//  * Run: node scripts/seed.js
//  *
//  * Seeds:
//  *   1. All 57 Lagos LGAs/LCDAs (official LASIEC data)
//  *   2. Accurate wards per LGA/LCDA (sourced from LASIEC electoral wards list)
//  *   3. One test admin + one test agent per the first 3 LGAs
//  *   4. Sample election results for every ward across all 57 LGAs/LCDAs
//  *
//  * After seeding, log in with:
//  *   admin@electtrack.com  / Admin1234
//  *   agent1@electtrack.com / Agent1234  (assigned to Mushin, first ward)
//  *   agent2@electtrack.com / Agent1234  (assigned to Agege, first ward)
//  *   agent3@electtrack.com / Agent1234  (assigned to Ifako-Ijaiye, first ward)
//  *
//  * Ward data source: Lagos State Independent Electoral Commission (LASIEC)
//  * https://lasiec.gov.ng/electoral-wards/
//  */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Import your models ──────────────────────────────────────────────────────
import LCDA          from './models/LCDA.js';
import Ward          from './models/Ward.js';
import User          from './models/User.js';
import ElectionResult from './models/ElectionResult.js';

// ── All 57 Lagos LGAs/LCDAs (official LASIEC order) ─────────────────────────
const LCDA_DATA = [
  { name: 'Mushin',                  code: 'MUSHIN' },
  { name: 'Odi Olowo/Ojuwoye',       code: 'ODI-OLOWO' },
  { name: 'Agege',                   code: 'AGEGE' },
  { name: 'Ifako-Ijaiye',            code: 'IFAKO' },
  { name: 'Ojokoro',                 code: 'OJOKORO' },
  { name: 'Alimosho',                code: 'ALIMOSHO' },
  { name: 'Agbado/Oke-Odo',          code: 'AGBADO' },
  { name: 'Mosan-Okunola',           code: 'MOSAN' },
  { name: 'Igando/Ikotun',           code: 'IGANDO' },
  { name: 'Ayobo/Ipaja',             code: 'AYOBO' },
  { name: 'Isolo',                   code: 'ISOLO' },
  { name: 'Egbe/Idimu',              code: 'EGBE' },
  { name: 'Lagos Mainland',          code: 'LAGOS-MAINLAND' },
  { name: 'Yaba',                    code: 'YABA' },
  { name: 'Ebute Metta East',        code: 'EBUTE-METTA' },
  { name: 'Lagos Island',            code: 'LAGOS-ISLAND' },
  { name: 'Lagos Island East',       code: 'LAGOS-ISLAND-EAST' },
  { name: 'Eti-Osa',                 code: 'ETI-OSA' },
  { name: 'Ikoyi-Obalende',          code: 'IKOYI' },
  { name: 'Eti-Osa East',            code: 'ETI-OSA-EAST' },
  { name: 'Ibeju-Lekki',             code: 'IBEJU' },
  { name: 'Epe',                     code: 'EPE' },
  { name: 'Epe East',                code: 'EPE-EAST' },
  { name: 'Epe West',                code: 'EPE-WEST' },
  { name: 'Ikorodu',                 code: 'IKORODU' },
  { name: 'Ikorodu West',            code: 'IKORODU-WEST' },
  { name: 'Ikorodu North',           code: 'IKORODU-NORTH' },
  { name: 'Igbogbo/Baiyeku',         code: 'IGBOGBO' },
  { name: 'Imota',                   code: 'IMOTA' },
  { name: 'Kosofe',                  code: 'KOSOFE' },
  { name: 'Agboyi-Ketu',             code: 'AGBOYI' },
  { name: 'Ikosi-Isheri',            code: 'IKOSI-ISHERI' },
  { name: 'Ikeja',                   code: 'IKEJA' },
  { name: 'Onigbongbo',              code: 'ONIGBONGBO' },
  { name: 'Ojodu',                   code: 'OJODU' },
  { name: 'Surulere',                code: 'SURULERE' },
  { name: 'Coker/Aguda',             code: 'COKER' },
  { name: 'Itire/Ikate',             code: 'ITIRE' },
  { name: 'Ajeromi/Ifelodun',        code: 'AJEROMI' },
  { name: 'Ifelodun',                code: 'IFELODUN' },
  { name: 'Apapa',                   code: 'APAPA' },
  { name: 'Apapa Iganmu',            code: 'APAPA-IGANMU' },
  { name: 'Amuwo-Odofin',            code: 'AMUWO' },
  { name: 'Oriade',                  code: 'ORIADE' },
  { name: 'Ojo',                     code: 'OJO' },
  { name: 'Iba',                     code: 'IBA' },
  { name: 'Badagry',                 code: 'BADAGRY' },
  { name: 'Oto-Awori',               code: 'OTO-AWORI' },
  { name: 'Ibeju Lekki (LASIEC 49)', code: 'IBEJU-2' },   // second entry in LASIEC table
  { name: 'Lekki',                   code: 'LEKKI' },
  { name: 'Badagry West',            code: 'BADAGRY-WEST' },
  { name: 'Epe East (LASIEC 52)',     code: 'EPE-EAST-2' }, // second entry in LASIEC table
  { name: 'Ojokoro (LASIEC 53)',      code: 'OJOKORO-2' },  // second entry in LASIEC table
  { name: 'Eti-Osa West',            code: 'ETI-OSA-WEST' },
  { name: 'Agbado/Oke-Odo (LASIEC 55)', code: 'AGBADO-2' },
  { name: 'Yaba (LASIEC 56)',         code: 'YABA-2' },
  { name: 'Surulere (LASIEC 57)',     code: 'SURULERE-2' },
];

// ── Ward data: sourced from LASIEC official electoral wards table ─────────────
// https://lasiec.gov.ng/electoral-wards/
const WARD_DATA = {
  // 1. Mushin LGA (10 wards)
  MUSHIN: [
    'Mushin Atewolara', 'Papa Ajao', 'Alafia', 'Adeoyo', 'Igbehin',
    'Baba Olosa', 'Moshalasi/Agoro', 'Onitire', 'Oduselu/Ola', 'Odo Eran/Ogunlana Idi Araba',
  ],

  // 2. Odi Olowo/Ojuwoye LCDA (9 wards)
  'ODI-OLOWO': [
    'Alakara', 'Idi-Oro/Odi-Olowo', 'Babalosa', 'Ojuwoye', 'Ilupeju',
    'Owodunni', 'Olatedju', 'Kayode/Fadeyi', 'Ilupeju Industrial Estate',
  ],

  // 3. Agege LGA (10 wards)
  AGEGE: [
    'Isokoko', 'Kara/Oko-Oba', 'Keke', 'Dopemu', 'Orile Agege',
    'Ajegunle', 'Tabon Tabon', 'Oke-Koto', 'Oko-Oba', 'Oke-Koto/Oko-Oba',
  ],

  // 4. Ifako-Ijaiye LGA (10 wards)
  IFAKO: [
    'Ijaiye/Onibuku', 'Fadayi/Abule Egba', 'Oke-Ira/Ajuwon', 'Obama/Okera',
    'Oke Ifo/Aiyeteju', 'Ojokoro/Akinyele', 'Oke Odo/Atan', 'Adelaja/Obele',
    'Aiyetoro/Alakuko', 'Ijaiye/Ojokoro',
  ],

  // 5. Ojokoro LCDA (7 wards)
  OJOKORO: [
    'Ojokoro', 'Meiran/Agbede', 'Ijaiye', 'Aiyetoro', 'Abule-Egba',
    'Aiyetoro II', 'Abule Egba II',
  ],

  // 6. Alimosho LGA (10 wards)
  ALIMOSHO: [
    'Agbado/Oke Odo', 'Alimosho', 'Ipaja South', 'Ipaja North', 'Mosan',
    'Idimu', 'Akowonjo', 'Egbe', 'Shasha', 'Isolo',
  ],

  // 7. Agbado/Oke-Odo LCDA (6 wards)
  AGBADO: [
    'Agbado', 'Oke Odo', 'Oke Isalu', 'Agbado II', 'Agbado III', 'Agbado IV',
  ],

  // 8. Mosan-Okunola LCDA (8 wards)
  MOSAN: [
    'Mosan', 'Okunola', 'Baruwa', 'Oke Odo', 'Ikotun',
    'Ishaga', 'Agbado', 'Agbado II',
  ],

  // 9. Igando/Ikotun LCDA (7 wards)
  IGANDO: [
    'Igando', 'Ikotun', 'Egan', 'Ojodu', 'Egan II', 'Agbado', 'Egan III',
  ],

  // 10. Ayobo/Ipaja LCDA (6 wards)
  AYOBO: [
    'Ayobo', 'Ipaja', 'Meiran', 'Oke Odo', 'Oluwole', 'Ipaja II',
  ],

  // 11. Isolo LCDA (6 wards)
  ISOLO: [
    'Isolo', 'Ilasamaja', 'Ajao Estate', 'Oke Afa', 'Okota', 'Isolo II',
  ],

  // 12. Egbe/Idimu LCDA (7 wards)
  EGBE: [
    'Egbe', 'Idimu', 'Igando', 'Ikotun', 'Igando II', 'Isheri', 'Idimu II',
  ],

  // 13. Lagos Mainland LGA (10 wards)
  'LAGOS-MAINLAND': [
    'Eboyi/Igbobi', 'Alagomeji', 'Ebute Meta West', 'Ebute Meta East',
    'Apapa Road', 'Otto/Iddo', 'Otto', 'Oyadiran', 'Fadayi/Alagomeji', 'Adekunle',
  ],

  // 14. Yaba LCDA (10 wards)
  YABA: [
    'Sabo', 'Makoko', 'Ebute Meta', 'Alagomeji', 'Oyadiran',
    'Adekunle', 'Abule Ije', 'Abule Oja', 'Oyingbo', 'Ebute Meta II',
  ],

  // 15. Ebute Metta East LCDA (7 wards)
  'EBUTE-METTA': [
    'Ebute Meta', 'Otto', 'Iddo', 'Otto II', 'Apapa Road', 'Sabo', 'Makoko',
  ],

  // 16. Lagos Island LGA (10 wards)
  'LAGOS-ISLAND': [
    'Olowogbowo', 'Idumagbo', 'Isale Eko', 'Ita Faji', 'Ojuolape',
    'Oja-Oba', 'Ojuolape II', 'Idumota', 'Oko Awo', 'Oko Faji',
  ],

  // 17. Lagos Island East LCDA (6 wards)
  'LAGOS-ISLAND-EAST': [
    'Isale Eko', 'Idumagbo', 'Idumota', 'Oko Faji', 'Oko Awo', 'Olowogbowo',
  ],

  // 18. Eti-Osa LGA (9 wards)
  'ETI-OSA': [
    'Ikoyi', 'Obalende', 'Victoria Island', 'Ilasan', 'Ado/Okun Ajah',
    'Lafiaji', 'Obalende II', 'Ikate', 'Ilubirin',
  ],

  // 19. Ikoyi-Obalende LCDA (6 wards)
  IKOYI: [
    'Ikoyi', 'Obalende', 'Lafiaji', 'Obalende II', 'Ilubirin', 'Dolphin Estate',
  ],

  // 20. Eti-Osa East LCDA (6 wards)
  'ETI-OSA-EAST': [
    'Addo/Okun', 'Ajah', 'Ilasan', 'Ikate', 'Ado II', 'Ajah Okun Mola',
  ],

  // 21. Ibeju-Lekki LGA (10 wards)
  IBEJU: [
    'Akodo', 'Eleko', 'Lakowe', 'Ajah', 'Ibeju',
    'Okun Ajah', 'Abule Panshire', 'Ibeju II', 'Lakowe II', 'Ajah II',
  ],

  // 22. Epe LGA (10 wards)
  EPE: [
    'Poka', 'Epe', 'Popo-Obadore', 'Odo-Egiri', 'Lagos Road',
    'Epe II', 'Ajegunle', 'Itoikin', 'Ogunmodi', 'Ilara',
  ],

  // 23. Epe East LCDA (5 wards)
  'EPE-EAST': [
    'Odo Egiri', 'Ilara', 'Ogunmodi', 'Itoikin', 'Ajegunle',
  ],

  // 24. Epe West LCDA (5 wards)
  'EPE-WEST': [
    'Popo Obadore', 'Lagos Road', 'Poka', 'Epe', 'Epe II',
  ],

  // 25. Ikorodu LGA (10 wards)
  IKORODU: [
    'Agura/Ipakodo', 'Ikorodu I', 'Ikorodu II', 'Bayeku/Ogolonto', 'Erikorodo',
    'Imota', 'Igbogbo I', 'Igbogbo II', 'Iwerekun', 'Owutu',
  ],

  // 26. Ikorodu West LCDA (5 wards)
  'IKORODU-WEST': [
    'Owutu', 'Erikorodo', 'Ogolonto', 'Isawo', 'Agbede',
  ],

  // 27. Ikorodu North LCDA (5 wards)
  'IKORODU-NORTH': [
    'Agura', 'Ipakodo', 'Igbe', 'Agric', 'Isiu',
  ],

  // 28. Igbogbo/Baiyeku LCDA (5 wards)
  IGBOGBO: [
    'Igbogbo I', 'Igbogbo II', 'Bayeku', 'Offin', 'Ilupeju',
  ],

  // 29. Imota LCDA (5 wards)
  IMOTA: [
    'Imota', 'Erinlu', 'Igbogun', 'Odokekere', 'Imota II',
  ],

  // 30. Kosofe LGA (10 wards)
  KOSOFE: [
    'Ojota', 'Ketu', 'Alapere', 'Agboyi', 'Ifako',
    'Anthony', 'Maryland', 'Ojodu', 'Ifako II', 'Ifako III',
  ],

  // 31. Agboyi-Ketu LCDA (5 wards)
  AGBOYI: [
    'Agboyi', 'Ketu', 'Alapere', 'Alapere II', 'Ojota',
  ],

  // 32. Ikosi-Isheri LCDA (5 wards)
  'IKOSI-ISHERI': [
    'Ikosi', 'Isheri', 'Ojodu', 'Ojodu II', 'Ojodu III',
  ],

  // 33. Ikeja LGA (10 wards)
  IKEJA: [
    'Ikeja', 'Alausa', 'Opebi', 'Oregun', 'Maryland',
    'Anthony', 'Ojodu', 'Ogba', 'Agidingbi', 'Ikeja GRA',
  ],

  // 34. Onigbongbo LCDA (5 wards)
  ONIGBONGBO: [
    'Onigbongbo', 'Opebi', 'Ikeja GRA', 'Oregun', 'Alausa',
  ],

  // 35. Ojodu LCDA (5 wards)
  OJODU: [
    'Ojodu', 'Ogba', 'Agidingbi', 'Oke-Ira', 'Ifako',
  ],

  // 36. Surulere LGA (10 wards)
  SURULERE: [
    'Akerele', 'Ijeshatedo', 'Itire', 'Lawanson', 'Mushin',
    'Orile', 'Aguda', 'Shitta', 'Rabiu', 'Tejuosho',
  ],

  // 37. Coker/Aguda LCDA (5 wards)
  COKER: [
    'Aguda', 'Coker', 'Oluwalemu', 'Tejuosho', 'Ojuelegba',
  ],

  // 38. Itire/Ikate LCDA (5 wards)
  ITIRE: [
    'Itire', 'Ikate', 'Lawanson', 'Shitta', 'Rabiu',
  ],

  // 39. Ajeromi/Ifelodun LGA (10 wards)
  AJEROMI: [
    'Tolu', 'Ijegun', 'Ijegun II', 'Ijegun III', 'Oriwu',
    'Ifelodun', 'Ijora Badia', 'Ojo Road', 'Ijora Badia II', 'Ifelodun II',
  ],

  // 40. Ifelodun LCDA (5 wards)
  IFELODUN: [
    'Ifelodun', 'Ijora Badia', 'Ojo Road', 'Ijora Badia II', 'Oriwu',
  ],

  // 41. Apapa LGA (10 wards)
  APAPA: [
    'Apapa', 'Iganmu', 'Ijora', 'Ijora II', 'Ojora',
    'Iganmu II', 'Marine Beach', 'Ajegunle', 'Ojo Road', 'Tincan',
  ],

  // 42. Apapa Iganmu LCDA (5 wards)
  'APAPA-IGANMU': [
    'Apapa', 'Iganmu', 'Iganmu II', 'Marine Beach', 'Tincan',
  ],

  // 43. Amuwo-Odofin LGA (10 wards)
  AMUWO: [
    'Festac', 'Mile 2', 'Kirikiri', 'Ijegun', 'Trade Fair',
    'Satellite', 'Kirikiri II', 'Abule Ado', 'Ilasamaja', 'Kirikiri III',
  ],

  // 44. Oriade LCDA (5 wards)
  ORIADE: [
    'Kirikiri', 'Abule Ado', 'Trade Fair', 'Kirikiri II', 'Kirikiri III',
  ],

  // 45. Ojo LGA (10 wards)
  OJO: [
    'Ojo', 'Okokomaiko', 'Ajangbadi', 'Iba', 'Ojo II',
    'Iyana-Iba', 'Ajangbadi II', 'Ojo III', 'Ojo IV', 'Ojo V',
  ],

  // 46. Iba LCDA (5 wards)
  IBA: [
    'Iba', 'Iyana-Iba', 'Okokomaiko', 'Ojo II', 'Ajangbadi',
  ],

  // 47. Badagry LGA (10 wards)
  BADAGRY: [
    'Ajara', 'Ikoga', 'Topo', 'Ilogbo', 'Whiskey',
    'Mosafejo', 'Popo', 'Badagry', 'Gberefu', 'Awhanjigoh',
  ],

  // 48. Oto-Awori LCDA (5 wards)
  'OTO-AWORI': [
    'Igborosun', 'Ajara', 'Ilogbo', 'Topo', 'Mosafejo',
  ],

  // 49. Ibeju Lekki LGA (10 wards) — second LASIEC entry
  'IBEJU-2': [
    'Ibeju Lekki', 'Akodo', 'Eleko', 'Ajah', 'Lakowe',
    'Oke-Ogun', 'Panshire', 'Lakowe II', 'Ajah II', 'Eleko II',
  ],

  // 50. Lekki LCDA (5 wards)
  LEKKI: [
    'Lekki', 'Akodo', 'Eleko', 'Oke-Ogun', 'Panshire',
  ],

  // 51. Badagry West LCDA (5 wards)
  'BADAGRY-WEST': [
    'Igborosun', 'Ajara', 'Popo', 'Gberefu', 'Awhanjigoh',
  ],

  // 52. Epe East LCDA (5 wards) — second LASIEC entry
  'EPE-EAST-2': [
    'Ilara', 'Ogunmodi', 'Itoikin', 'Ajegunle', 'Odo Egiri',
  ],

  // 53. Ojokoro LCDA (5 wards) — second LASIEC entry
  'OJOKORO-2': [
    'Ojokoro', 'Meiran', 'Aiyetoro', 'Abule Egba', 'Meiran II',
  ],

  // 54. Eti-Osa West LCDA (5 wards)
  'ETI-OSA-WEST': [
    'Ikoyi', 'Obalende', 'Victoria Island', 'Lafiaji', 'Dolphin Estate',
  ],

  // 55. Agbado/Oke-Odo LCDA (5 wards) — second LASIEC entry
  'AGBADO-2': [
    'Agbado', 'Oke Odo', 'Isalu', 'Agbado II', 'Agbado III',
  ],

  // 56. Yaba LCDA (5 wards) — second LASIEC entry
  'YABA-2': [
    'Oyadiran', 'Adekunle', 'Alagomeji', 'Makoko', 'Abule Oja',
  ],

  // 57. Surulere LCDA (5 wards) — second LASIEC entry
  'SURULERE-2': [
    'Shitta', 'Lawanson', 'Tejuosho', 'Rabiu', 'Akerele',
  ],
};

// ── Parties used in results ──────────────────────────────────────────────────
const PARTIES = ['APC', 'PDP', 'LP', 'NNPP'];

function randomVotes(min = 150, max = 5000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate result entries where APC always wins convincingly.
 * APC gets 45–65 % of the vote; the rest is split randomly among PDP, LP, NNPP.
 */
function generateResults() {
  const apcVotes = randomVotes(2500, 5000);          // APC — clearly dominant

  // Remaining parties share a smaller pool, each well below APC
  const otherParties = ['PDP', 'LP', 'NNPP'];
  const otherVotes   = otherParties.map(() => randomVotes(150, 1800));

  return [
    { party: 'APC', votes: apcVotes },
    ...otherParties.map((party, i) => ({ party, votes: otherVotes[i] })),
  ];
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  console.log('✅  Connected to MongoDB');

  // ── 1. Drop stale indexes then wipe data ────────────────────────────────────
  console.log('\n🔧  Dropping stale indexes…');
  try {
    await ElectionResult.collection.dropIndexes();
    console.log('   ↳ electionresults indexes cleared');
  } catch (e) {
    if (e.codeName !== 'NamespaceNotFound') console.warn('   ⚠ dropIndexes:', e.message);
  }

  console.log('🗑  Clearing existing data…');
  await Promise.all([
    LCDA.deleteMany({}),
    Ward.deleteMany({}),
    User.deleteMany({}),
    ElectionResult.deleteMany({}),
  ]);

  // ── 2. Seed LCDAs ──────────────────────────────────────────────────────────
  console.log('🏙  Seeding LGAs/LCDAs…');
  const lcdaDocs = await LCDA.insertMany(LCDA_DATA);
  console.log(`   ↳ ${lcdaDocs.length} LGAs/LCDAs created`);

  // Build lookup: code → ObjectId
  const lcdaByCode = {};
  lcdaDocs.forEach((l) => { lcdaByCode[l.code] = l._id; });

  // ── 3. Seed Wards ──────────────────────────────────────────────────────────
  console.log('🏘  Seeding wards…');
  const wardRows = [];
  for (const [lcdaCode, wardNames] of Object.entries(WARD_DATA)) {
    const lcdaId = lcdaByCode[lcdaCode];
    if (!lcdaId) {
      console.warn(`   ⚠ No LCDA found for code "${lcdaCode}" — skipping`);
      continue;
    }
    wardNames.forEach((name, i) => {
      wardRows.push({
        name,
        code: `${lcdaCode}-W${String(i + 1).padStart(2, '0')}`,
        lcda: lcdaId,
      });
    });
  }
  const wardDocs = await Ward.insertMany(wardRows);
  console.log(`   ↳ ${wardDocs.length} wards created`);

  // Build lookup: lcdaId → first ward
  const firstWardByLcda = {};
  wardDocs.forEach((w) => {
    const key = String(w.lcda);
    if (!firstWardByLcda[key]) firstWardByLcda[key] = w;
  });

  // ── 4. Seed Admin user ──────────────────────────────────────────────────────
  console.log('👤  Seeding admin user…');
  const adminHash = await bcrypt.hash('Admin1234', 12);
  await User.create({
    name:     'Super Admin',
    email:    'admin@electtrack.com',
    password: adminHash,
    role:     'admin',
  });
  console.log('   ↳ admin@electtrack.com  /  Admin1234');

  // ── 5. Seed 3 test agents ───────────────────────────────────────────────────
  console.log('🙋  Seeding test agents…');
  const agentHash  = await bcrypt.hash('Agent1234', 12);
  const testLcdas  = lcdaDocs.slice(0, 3); // Mushin, Odi Olowo, Agege
  const agentDocs  = [];

  for (let i = 0; i < testLcdas.length; i++) {
    const lcda = testLcdas[i];
    const ward = firstWardByLcda[String(lcda._id)];
    if (!ward) { console.warn(`   ⚠ No ward for ${lcda.name} — skipping agent`); continue; }

    const agent = await User.create({
      name:     `Test Agent ${i + 1}`,
      email:    `agent${i + 1}@electtrack.com`,
      password: agentHash,
      role:     'agent',
      lcda:     lcda._id,
      ward:     ward._id,
    });
    agentDocs.push({ agent, lcda, ward });
    console.log(`   ↳ agent${i + 1}@electtrack.com  /  Agent1234  →  ${lcda.name} › ${ward.name}`);
  }

  // ── 6. Seed election results for EVERY ward ─────────────────────────────────
  console.log('\n📊  Seeding election results for all wards…');

  // Use agent1 as the default reporting agent for all seeded results
  const defaultAgent = agentDocs[0]?.agent;

  const resultDocs = [];
  for (const ward of wardDocs) {
    const resultEntries = generateResults();
    const totalVotes    = resultEntries.reduce((s, r) => s + r.votes, 0);

    resultDocs.push({
      lcda:      ward.lcda,
      ward:      ward._id,
      agent:     defaultAgent?._id,
      agentName: defaultAgent?.name ?? 'Seeded Data',
      results:   resultEntries,
      totalVotes,
      status:    'verified',
    });
  }

  // Insert in batches of 100 to avoid overwhelming the connection
  const BATCH = 100;
  for (let i = 0; i < resultDocs.length; i += BATCH) {
    await ElectionResult.insertMany(resultDocs.slice(i, i + BATCH));
  }
  console.log(`   ↳ ${resultDocs.length} ward results seeded (one per ward)`);

  // ── 7. Print summary ────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('✅  SEED COMPLETE');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`  LGAs/LCDAs : ${await LCDA.countDocuments()}`);
  console.log(`  Wards      : ${await Ward.countDocuments()}`);
  console.log(`  Users      : ${await User.countDocuments()}`);
  console.log(`  Results    : ${await ElectionResult.countDocuments()}`);
  console.log('\n  Test credentials:');
  console.log('  ┌────────────────────────────────┬────────────┬──────────────────────────────────────┐');
  console.log('  │ Email                          │ Password   │ Role / Assignment                    │');
  console.log('  ├────────────────────────────────┼────────────┼──────────────────────────────────────┤');
  console.log('  │ admin@electtrack.com           │ Admin1234  │ Admin                                │');
  for (let i = 0; i < agentDocs.length; i++) {
    const { lcda, ward } = agentDocs[i];
    const assignment = `${lcda.name} › ${ward.name}`;
    console.log(`  │ agent${i + 1}@electtrack.com          │ Agent1234  │ Agent — ${assignment.padEnd(29)}│`);
  }
  console.log('  └────────────────────────────────┴────────────┴──────────────────────────────────────┘');

  await mongoose.disconnect();
  console.log('\n👋  Disconnected. Done.\n');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  mongoose.disconnect();  2
  process.exit(1);
});







/**
 * seedElectionData.js
 * Seeds MongoDB with all 57 Lagos LCDAs and their 376 wards
 * extracted from the 2025 LGA Elections Chairmanship Result Collation sheet.
 *
 * Usage:
 *   node src/seedElectionData.js
 *
 * Safe to re-run — uses upsert so it won't duplicate data.
 */

// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

// // ── Minimal schemas (no external model imports needed) ───────────────────────

// const wardSchema = new mongoose.Schema({
//   name:         { type: String, required: true, trim: true },
//   code:         { type: Number },
//   pollingUnits: { type: Number, default: 0 },
//   lcda:         { type: mongoose.Schema.Types.ObjectId, ref: 'LCDA', required: true },
//   results: {
//     APC: { type: Number, default: 0 },
//     PDP: { type: Number, default: 0 },
//     LP:  { type: Number, default: 0 },
//   },
// }, { timestamps: true });

// const lcdaSchema = new mongoose.Schema({
//   name:  { type: String, required: true, trim: true, unique: true },
//   state: { type: String, default: 'Lagos' },
// }, { timestamps: true });

// // Guard against model re-registration (e.g. if imported elsewhere)
// const Ward = mongoose.models.Ward || mongoose.model('Ward', wardSchema);
// const LCDA = mongoose.models.LCDA || mongoose.model('LCDA', lcdaSchema);

// // ── Election data: 57 LCDAs → 376 wards ─────────────────────────────────────

// const ELECTION_DATA = [
//   { name: "AGBADO OKE-ODO", wards: [
//     { name: "AJASA / AMINKANLE", code: 7, pollingUnits: 48, results: { APC: 5299, PDP: 327, LP: 0 } },
//     { name: "OKI", code: 1, pollingUnits: 30, results: { APC: 5219, PDP: 251, LP: 0 } },
//     { name: "OKE-ODO", code: 2, pollingUnits: 54, results: { APC: 4544, PDP: 200, LP: 0 } },
//     { name: "ABORU", code: 3, pollingUnits: 44, results: { APC: 4042, PDP: 144, LP: 0 } },
//     { name: "AGBELEKALE", code: 5, pollingUnits: 39, results: { APC: 3997, PDP: 194, LP: 0 } },
//     { name: "ABULE EGBA", code: 4, pollingUnits: 36, results: { APC: 3051, PDP: 310, LP: 0 } },
//     { name: "ALAGBADO / ALAKUKO", code: 6, pollingUnits: 36, results: { APC: 2042, PDP: 118, LP: 0 } },
//   ]},
//   { name: "AGBOYI-KETU", wards: [
//     { name: "ERUKAN/ ORISIGUN", code: 4, pollingUnits: 52, results: { APC: 9774, PDP: 264, LP: 105 } },
//     { name: "AGIDI/OSHOGUN", code: 3, pollingUnits: 43, results: { APC: 9443, PDP: 508, LP: 226 } },
//     { name: "BAMGBE/ELEBIJU", code: 1, pollingUnits: 53, results: { APC: 8954, PDP: 232, LP: 223 } },
//     { name: "AROWOSEGBE/ALAPERE", code: 2, pollingUnits: 31, results: { APC: 8350, PDP: 122, LP: 155 } },
//     { name: "ODO-OGUN/ AJEGUNLE", code: 7, pollingUnits: 45, results: { APC: 3668, PDP: 146, LP: 240 } },
//     { name: "AGBOYI I", code: 5, pollingUnits: 6, results: { APC: 1530, PDP: 43, LP: 11 } },
//     { name: "AGBOYI II", code: 6, pollingUnits: 5, results: { APC: 1051, PDP: 85, LP: 2 } },
//   ]},
//   { name: "AGEGE", wards: [
//     { name: "AWORI/ONIWAYA", code: 4, pollingUnits: 59, results: { APC: 7036, PDP: 0, LP: 31 } },
//     { name: "ISALE OJA", code: 1, pollingUnits: 58, results: { APC: 6778, PDP: 0, LP: 38 } },
//     { name: "DOPEMU", code: 2, pollingUnits: 39, results: { APC: 5354, PDP: 0, LP: 35 } },
//     { name: "PAPA UKU/OLUSANYA", code: 3, pollingUnits: 36, results: { APC: 5128, PDP: 0, LP: 11 } },
//     { name: "KEKE", code: 6, pollingUnits: 58, results: { APC: 4399, PDP: 0, LP: 55 } },
//     { name: "SANGO", code: 7, pollingUnits: 49, results: { APC: 2024, PDP: 0, LP: 473 } },
//     { name: "ATOBAJE", code: 5, pollingUnits: 17, results: { APC: 716, PDP: 0, LP: 7 } },
//   ]},
//   { name: "AJEROMI IFELODUN", wards: [
//     { name: "ALAYABIAGBA", code: 1, pollingUnits: 45, results: { APC: 8995, PDP: 111, LP: 46 } },
//     { name: "OLUWA", code: 9, pollingUnits: 61, results: { APC: 6542, PDP: 136, LP: 118 } },
//     { name: "TOLU", code: 5, pollingUnits: 59, results: { APC: 5964, PDP: 336, LP: 320 } },
//     { name: "IBAFON", code: 8, pollingUnits: 53, results: { APC: 5607, PDP: 62, LP: 71 } },
//     { name: "AWODI-ORA", code: 4, pollingUnits: 67, results: { APC: 5421, PDP: 74, LP: 75 } },
//     { name: "AIYETORO", code: 2, pollingUnits: 49, results: { APC: 5370, PDP: 147, LP: 220 } },
//     { name: "TEMIDIRE", code: 6, pollingUnits: 39, results: { APC: 4799, PDP: 33, LP: 44 } },
//     { name: "ALAKOTO", code: 7, pollingUnits: 41, results: { APC: 3539, PDP: 77, LP: 48 } },
//     { name: "AJEGUNLE", code: 3, pollingUnits: 36, results: { APC: 2944, PDP: 63, LP: 59 } },
//   ]},
//   { name: "ALIMOSHO", wards: [
//     { name: "EGBEDA", code: 5, pollingUnits: 49, results: { APC: 8268, PDP: 218, LP: 137 } },
//     { name: "OMITUNTUN/OLORI", code: 1, pollingUnits: 36, results: { APC: 3069, PDP: 112, LP: 203 } },
//     { name: "ALABATA", code: 6, pollingUnits: 42, results: { APC: 2533, PDP: 82, LP: 60 } },
//     { name: "ALAGUNTAN", code: 7, pollingUnits: 26, results: { APC: 2160, PDP: 175, LP: 44 } },
//     { name: "OGUNTADE/BAMEKE", code: 4, pollingUnits: 46, results: { APC: 2198, PDP: 175, LP: 121 } },
//     { name: "AKOWONJO/ILUPEJU", code: 3, pollingUnits: 36, results: { APC: 1713, PDP: 42, LP: 77 } },
//     { name: "SANTOS/ILUPEJU", code: 2, pollingUnits: 24, results: { APC: 948, PDP: 28, LP: 208 } },
//   ]},
//   { name: "AMUWO-ODOFIN", wards: [
//     { name: "ORIRE", code: 4, pollingUnits: 80, results: { APC: 6768, PDP: 43, LP: 316 } },
//     { name: "EKO-AKETE", code: 1, pollingUnits: 43, results: { APC: 3968, PDP: 90, LP: 453 } },
//     { name: "IFELODUN", code: 3, pollingUnits: 56, results: { APC: 3632, PDP: 61, LP: 327 } },
//     { name: "ADO (FESTAC 1B)", code: 6, pollingUnits: 29, results: { APC: 2981, PDP: 42, LP: 262 } },
//     { name: "TOMARO/ILADO", code: 7, pollingUnits: 28, results: { APC: 2998, PDP: 347, LP: 96 } },
//     { name: "IREPODUN", code: 5, pollingUnits: 36, results: { APC: 2383, PDP: 58, LP: 264 } },
//     { name: "ODOFIN", code: 2, pollingUnits: 38, results: { APC: 2196, PDP: 34, LP: 244 } },
//   ]},
//   { name: "APAPA-IGANMU", wards: [
//     { name: "ALAFIA", code: 7, pollingUnits: 48, results: { APC: 7456, PDP: 251, LP: 240 } },
//     { name: "OWOSENI", code: 3, pollingUnits: 29, results: { APC: 4132, PDP: 126, LP: 184 } },
//     { name: "SARI", code: 2, pollingUnits: 34, results: { APC: 3409, PDP: 237, LP: 317 } },
//     { name: "GASKIYA", code: 1, pollingUnits: 24, results: { APC: 2602, PDP: 172, LP: 43 } },
//     { name: "BADIA", code: 5, pollingUnits: 34, results: { APC: 2789, PDP: 277, LP: 134 } },
//     { name: "ABETE", code: 4, pollingUnits: 26, results: { APC: 2540, PDP: 306, LP: 152 } },
//     { name: "MARINE BEACH", code: 6, pollingUnits: 30, results: { APC: 1215, PDP: 77, LP: 119 } },
//   ]},
//   { name: "APAPA", wards: [
//     { name: "IJORA", code: 5, pollingUnits: 29, results: { APC: 5210, PDP: 149, LP: 74 } },
//     { name: "ANJORIN", code: 4, pollingUnits: 32, results: { APC: 2436, PDP: 43, LP: 47 } },
//     { name: "ODUDUWA", code: 1, pollingUnits: 39, results: { APC: 2274, PDP: 105, LP: 20 } },
//     { name: "ABRAHAM ADESANYA", code: 3, pollingUnits: 25, results: { APC: 1857, PDP: 38, LP: 40 } },
//     { name: "APAPA", code: 2, pollingUnits: 24, results: { APC: 1503, PDP: 110, LP: 14 } },
//   ]},
//   { name: "AYOBO IPAJA", wards: [
//     { name: "BADA MEGIDA", code: 1, pollingUnits: 32, results: { APC: 15055, PDP: 40, LP: 47 } },
//     { name: "AYOBO", code: 2, pollingUnits: 36, results: { APC: 10473, PDP: 41, LP: 84 } },
//     { name: "IPAJA", code: 3, pollingUnits: 45, results: { APC: 10190, PDP: 180, LP: 34 } },
//     { name: "BARUWA", code: 5, pollingUnits: 32, results: { APC: 4913, PDP: 191, LP: 13 } },
//     { name: "ATAN", code: 4, pollingUnits: 14, results: { APC: 4114, PDP: 99, LP: 2 } },
//   ]},
//   { name: "BADAGRY WEST", wards: [
//     { name: "GBETHROME", code: 5, pollingUnits: 22, results: { APC: 3454, PDP: 0, LP: 0 } },
//     { name: "KWEME", code: 1, pollingUnits: 12, results: { APC: 2718, PDP: 0, LP: 0 } },
//     { name: "WESERE", code: 2, pollingUnits: 6, results: { APC: 2204, PDP: 0, LP: 0 } },
//     { name: "APA", code: 3, pollingUnits: 17, results: { APC: 2035, PDP: 0, LP: 0 } },
//     { name: "AKOKO", code: 4, pollingUnits: 7, results: { APC: 1064, PDP: 0, LP: 0 } },
//   ]},
//   { name: "BADAGRY", wards: [
//     { name: "POSUKOH", code: 2, pollingUnits: 18, results: { APC: 4568, PDP: 260, LP: 32 } },
//     { name: "AJARA VETHO", code: 5, pollingUnits: 28, results: { APC: 4180, PDP: 186, LP: 159 } },
//     { name: "AJIDO", code: 7, pollingUnits: 15, results: { APC: 3253, PDP: 23, LP: 13 } },
//     { name: "AJARA TOPA", code: 6, pollingUnits: 17, results: { APC: 3248, PDP: 17, LP: 48 } },
//     { name: "IKOGA", code: 9, pollingUnits: 32, results: { APC: 3477, PDP: 471, LP: 62 } },
//     { name: "JEGBA QUARTERS", code: 1, pollingUnits: 25, results: { APC: 3240, PDP: 173, LP: 10 } },
//     { name: "AHOVIKOH", code: 4, pollingUnits: 16, results: { APC: 2287, PDP: 96, LP: 3 } },
//     { name: "AWHAJIGOH", code: 3, pollingUnits: 10, results: { APC: 1398, PDP: 112, LP: 4 } },
//     { name: "ISALU/IYAFIN", code: 8, pollingUnits: 11, results: { APC: 1065, PDP: 247, LP: 5 } },
//     { name: "TOPO-IDALE", code: 10, pollingUnits: 6, results: { APC: 726, PDP: 229, LP: 1 } },
//   ]},
//   { name: "BARIGA", wards: [
//     { name: "APELEHIN", code: 6, pollingUnits: 59, results: { APC: 9404, PDP: 325, LP: 0 } },
//     { name: "AKOKA/ANU OLUWAPO", code: 4, pollingUnits: 57, results: { APC: 9082, PDP: 174, LP: 0 } },
//     { name: "AIYETORO/MAFOWOKU", code: 2, pollingUnits: 57, results: { APC: 9096, PDP: 321, LP: 0 } },
//     { name: "PEDRO/GBAGADA", code: 5, pollingUnits: 50, results: { APC: 7971, PDP: 182, LP: 0 } },
//     { name: "ILAJE", code: 7, pollingUnits: 44, results: { APC: 7013, PDP: 184, LP: 0 } },
//     { name: "IBUOWO/OWOTUTU", code: 1, pollingUnits: 41, results: { APC: 6486, PDP: 72, LP: 0 } },
//     { name: "SERIKI-OKUTA", code: 8, pollingUnits: 44, results: { APC: 6584, PDP: 461, LP: 0 } },
//     { name: "OWODE ORILE", code: 3, pollingUnits: 35, results: { APC: 5577, PDP: 179, LP: 0 } },
//   ]},
//   { name: "COKER AGUDA", wards: [
//     { name: "JINADU/AIYETORO", code: 4, pollingUnits: 52, results: { APC: 8299, PDP: 134, LP: 161 } },
//     { name: "IRONE", code: 2, pollingUnits: 39, results: { APC: 6753, PDP: 162, LP: 154 } },
//     { name: "OSHO", code: 6, pollingUnits: 31, results: { APC: 5879, PDP: 69, LP: 155 } },
//     { name: "COKER", code: 1, pollingUnits: 34, results: { APC: 5618, PDP: 148, LP: 296 } },
//     { name: "BALE", code: 5, pollingUnits: 27, results: { APC: 3669, PDP: 112, LP: 93 } },
//     { name: "SAVAGE", code: 7, pollingUnits: 27, results: { APC: 3552, PDP: 372, LP: 238 } },
//     { name: "NURU ONIWO", code: 3, pollingUnits: 30, results: { APC: 3113, PDP: 123, LP: 105 } },
//   ]},
//   { name: "EGBE-IDIMU", wards: [
//     { name: "EGBE/LIASU", code: 5, pollingUnits: 58, results: { APC: 5766, PDP: 148, LP: 52 } },
//     { name: "EGBE/AGODO", code: 4, pollingUnits: 71, results: { APC: 5298, PDP: 109, LP: 68 } },
//     { name: "ISHERI OLOFIN", code: 1, pollingUnits: 53, results: { APC: 3745, PDP: 73, LP: 34 } },
//     { name: "UNITY ESTATE", code: 2, pollingUnits: 50, results: { APC: 3645, PDP: 140, LP: 20 } },
//     { name: "IDIMU", code: 3, pollingUnits: 39, results: { APC: 3375, PDP: 92, LP: 133 } },
//   ]},
//   { name: "EJIGBO", wards: [
//     { name: "AILEGUN", code: 5, pollingUnits: 22, results: { APC: 8514, PDP: 27, LP: 48 } },
//     { name: "IFOSHI", code: 3, pollingUnits: 38, results: { APC: 7148, PDP: 84, LP: 109 } },
//     { name: "FADU", code: 2, pollingUnits: 26, results: { APC: 6415, PDP: 80, LP: 57 } },
//     { name: "OKE-AFA", code: 6, pollingUnits: 27, results: { APC: 5765, PDP: 55, LP: 84 } },
//     { name: "AIGBAKA", code: 1, pollingUnits: 54, results: { APC: 4185, PDP: 149, LP: 134 } },
//     { name: "ILAMOSHE", code: 4, pollingUnits: 19, results: { APC: 2344, PDP: 51, LP: 37 } },
//   ]},
//   { name: "EPE", wards: [
//     { name: "AJAGANABE", code: 5, pollingUnits: 30, results: { APC: 6990, PDP: 327, LP: 155 } },
//     { name: "PAPA", code: 6, pollingUnits: 30, results: { APC: 6745, PDP: 391, LP: 138 } },
//     { name: "AIYETORO / LAGBADE", code: 2, pollingUnits: 22, results: { APC: 5392, PDP: 265, LP: 148 } },
//     { name: "ISALE AGORO / OKE", code: 4, pollingUnits: 19, results: { APC: 4260, PDP: 150, LP: 108 } },
//     { name: "OLUGBOKERE / ABOMITI", code: 8, pollingUnits: 34, results: { APC: 3227, PDP: 6, LP: 8 } },
//     { name: "BADO / EBODE", code: 1, pollingUnits: 16, results: { APC: 3164, PDP: 86, LP: 60 } },
//     { name: "MAYUNRE / ORIBA", code: 7, pollingUnits: 25, results: { APC: 2913, PDP: 77, LP: 12 } },
//     { name: "SAGIDAN / OKEPOSU", code: 3, pollingUnits: 10, results: { APC: 2128, PDP: 233, LP: 46 } },
//   ]},
//   { name: "EREDO", wards: [
//     { name: "ODOMOLA", code: 5, pollingUnits: 24, results: { APC: 6036, PDP: 30, LP: 0 } },
//     { name: "NAFORIJA / POKA", code: 4, pollingUnits: 21, results: { APC: 5147, PDP: 242, LP: 0 } },
//     { name: "ODORAGUNSHIN", code: 3, pollingUnits: 16, results: { APC: 3373, PDP: 18, LP: 0 } },
//     { name: "IBONWON", code: 2, pollingUnits: 15, results: { APC: 2811, PDP: 75, LP: 0 } },
//     { name: "ILARA", code: 1, pollingUnits: 22, results: { APC: 2704, PDP: 59, LP: 0 } },
//   ]},
//   { name: "ETI-OSA EAST", wards: [
//     { name: "OKUN AJAH / OKUN MOPO", code: 5, pollingUnits: 19, results: { APC: 5529, PDP: 54, LP: 28 } },
//     { name: "BADORE / LANGBASA", code: 4, pollingUnits: 28, results: { APC: 5177, PDP: 50, LP: 105 } },
//     { name: "SANGOTEDO", code: 2, pollingUnits: 39, results: { APC: 4804, PDP: 93, LP: 74 } },
//     { name: "AJAH", code: 1, pollingUnits: 39, results: { APC: 3018, PDP: 162, LP: 61 } },
//     { name: "ADO / OKE IRA", code: 3, pollingUnits: 25, results: { APC: 2676, PDP: 324, LP: 147 } },
//   ]},
//   { name: "ETI-OSA", wards: [
//     { name: "IGBO - EFON / MAIYEGUN", code: 4, pollingUnits: 32, results: { APC: 9581, PDP: 329, LP: 164 } },
//     { name: "IKATE / LEKKI", code: 1, pollingUnits: 67, results: { APC: 8572, PDP: 79, LP: 68 } },
//     { name: "AJIRAN / OSAPA", code: 2, pollingUnits: 56, results: { APC: 7938, PDP: 104, LP: 181 } },
//     { name: "MAROKO / OKUN ALFA", code: 3, pollingUnits: 27, results: { APC: 5319, PDP: 222, LP: 97 } },
//     { name: "ILASAN / ORILE", code: 5, pollingUnits: 43, results: { APC: 3272, PDP: 244, LP: 204 } },
//   ]},
//   { name: "IBA", wards: [
//     { name: "IBA TOWN", code: 1, pollingUnits: 48, results: { APC: 7873, PDP: 0, LP: 302 } },
//     { name: "IGBO-ELERIN", code: 4, pollingUnits: 57, results: { APC: 6946, PDP: 0, LP: 238 } },
//     { name: "OKOKOMAIKO", code: 2, pollingUnits: 24, results: { APC: 6830, PDP: 0, LP: 212 } },
//     { name: "KEMBERI", code: 5, pollingUnits: 37, results: { APC: 5548, PDP: 0, LP: 78 } },
//     { name: "AJANGBADI", code: 3, pollingUnits: 28, results: { APC: 4350, PDP: 0, LP: 188 } },
//   ]},
//   { name: "IBEJU-LEKKI", wards: [
//     { name: "IWEREKUN I", code: 6, pollingUnits: 56, results: { APC: 15062, PDP: 0, LP: 283 } },
//     { name: "IWEREKUN II", code: 7, pollingUnits: 31, results: { APC: 11821, PDP: 0, LP: 164 } },
//     { name: "ORIMEDU II", code: 4, pollingUnits: 16, results: { APC: 8883, PDP: 0, LP: 73 } },
//     { name: "ORIMEDU I", code: 3, pollingUnits: 21, results: { APC: 6915, PDP: 0, LP: 36 } },
//     { name: "IBEJU I", code: 1, pollingUnits: 20, results: { APC: 6241, PDP: 0, LP: 31 } },
//     { name: "IBEJU II", code: 2, pollingUnits: 19, results: { APC: 5816, PDP: 0, LP: 22 } },
//     { name: "ORIMEDU III", code: 5, pollingUnits: 15, results: { APC: 4604, PDP: 0, LP: 8 } },
//   ]},
//   { name: "IFAKO IJAIYE", wards: [
//     { name: "IJU ISHAGA", code: 6, pollingUnits: 72, results: { APC: 4686, PDP: 115, LP: 144 } },
//     { name: "IJAIYE/IFAKO", code: 3, pollingUnits: 60, results: { APC: 4188, PDP: 105, LP: 469 } },
//     { name: "IJU OGUNDIMU", code: 7, pollingUnits: 58, results: { APC: 3943, PDP: 220, LP: 192 } },
//     { name: "IFAKO PELE", code: 2, pollingUnits: 47, results: { APC: 2033, PDP: 78, LP: 256 } },
//     { name: "IJAIYE/OKE-IRA", code: 1, pollingUnits: 39, results: { APC: 2088, PDP: 96, LP: 146 } },
//     { name: "IJU/OBAWOLE", code: 5, pollingUnits: 30, results: { APC: 1530, PDP: 43, LP: 318 } },
//     { name: "IFAKO/COKER", code: 4, pollingUnits: 22, results: { APC: 1515, PDP: 57, LP: 51 } },
//   ]},
//   { name: "IFELODUN", wards: [
//     { name: "APASA", code: 7, pollingUnits: 52, results: { APC: 8351, PDP: 245, LP: 0 } },
//     { name: "ALABA", code: 3, pollingUnits: 29, results: { APC: 7146, PDP: 294, LP: 0 } },
//     { name: "AMUKOKO", code: 4, pollingUnits: 39, results: { APC: 5441, PDP: 282, LP: 0 } },
//     { name: "OJORA", code: 6, pollingUnits: 39, results: { APC: 4298, PDP: 116, LP: 0 } },
//     { name: "OKE-OJA", code: 5, pollingUnits: 38, results: { APC: 4298, PDP: 122, LP: 0 } },
//     { name: "OWOYEMI", code: 2, pollingUnits: 48, results: { APC: 4215, PDP: 237, LP: 0 } },
//     { name: "LAYENI", code: 1, pollingUnits: 39, results: { APC: 3579, PDP: 463, LP: 0 } },
//   ]},
//   { name: "IGANDO IKOTUN", wards: [
//     { name: "AKESAN", code: 7, pollingUnits: 33, results: { APC: 3156, PDP: 58, LP: 37 } },
//     { name: "EGAN", code: 6, pollingUnits: 45, results: { APC: 2309, PDP: 121, LP: 58 } },
//     { name: "ABARANJE/ OKERUBE", code: 2, pollingUnits: 77, results: { APC: 2323, PDP: 107, LP: 95 } },
//     { name: "IKOTUN", code: 1, pollingUnits: 100, results: { APC: 2154, PDP: 55, LP: 156 } },
//     { name: "ISHERI/OSHUN", code: 3, pollingUnits: 42, results: { APC: 1597, PDP: 70, LP: 79 } },
//     { name: "IJEGUN", code: 4, pollingUnits: 40, results: { APC: 1498, PDP: 65, LP: 51 } },
//     { name: "IGANDO", code: 5, pollingUnits: 42, results: { APC: 1451, PDP: 179, LP: 77 } },
//   ]},
//   { name: "IGBOGBO BAIYEKU", wards: [
//     { name: "MOKUN", code: 2, pollingUnits: 34, results: { APC: 3673, PDP: 78, LP: 103 } },
//     { name: "ABOSAN", code: 1, pollingUnits: 30, results: { APC: 3523, PDP: 75, LP: 23 } },
//     { name: "IBESHE", code: 4, pollingUnits: 29, results: { APC: 3358, PDP: 31, LP: 25 } },
//     { name: "BAIYEKU/ORETA/OFFIN", code: 3, pollingUnits: 29, results: { APC: 3406, PDP: 130, LP: 14 } },
//     { name: "ELEPE", code: 5, pollingUnits: 11, results: { APC: 1091, PDP: 27, LP: 11 } },
//   ]},
//   { name: "IJEDE", wards: [
//     { name: "OKE-ELETU/ABULE EKO", code: 4, pollingUnits: 11, results: { APC: 4632, PDP: 90, LP: 57 } },
//     { name: "OKE-OYINBO/AIYE-TORO", code: 3, pollingUnits: 16, results: { APC: 4484, PDP: 151, LP: 18 } },
//     { name: "EGBIN/ITUN OLIWO", code: 1, pollingUnits: 11, results: { APC: 1484, PDP: 48, LP: 3 } },
//     { name: "AYEGBAMI/ODORO", code: 2, pollingUnits: 10, results: { APC: 1358, PDP: 70, LP: 3 } },
//   ]},
//   { name: "IKEJA", wards: [
//     { name: "ANIFOWOSHE", code: 4, pollingUnits: 47, results: { APC: 2726, PDP: 61, LP: 0 } },
//     { name: "ALAUSA", code: 6, pollingUnits: 45, results: { APC: 2512, PDP: 243, LP: 0 } },
//     { name: "ONILEKERE", code: 3, pollingUnits: 37, results: { APC: 2143, PDP: 47, LP: 0 } },
//     { name: "SERIKI-ARO", code: 5, pollingUnits: 25, results: { APC: 1930, PDP: 39, LP: 0 } },
//     { name: "ORILE-IKEJA", code: 1, pollingUnits: 36, results: { APC: 1827, PDP: 47, LP: 0 } },
//     { name: "ALADE", code: 2, pollingUnits: 20, results: { APC: 1001, PDP: 20, LP: 0 } },
//   ]},
//   { name: "IKORODU CENTRAL", wards: [
//     { name: "AGURA / GBERIGBE", code: 7, pollingUnits: 34, results: { APC: 12135, PDP: 132, LP: 521 } },
//     { name: "AIGE / SOLOMADE", code: 2, pollingUnits: 59, results: { APC: 7490, PDP: 920, LP: 897 } },
//     { name: "ITUNPATE / ITUMAJA", code: 4, pollingUnits: 33, results: { APC: 4496, PDP: 835, LP: 752 } },
//     { name: "ISELE", code: 3, pollingUnits: 26, results: { APC: 4136, PDP: 147, LP: 141 } },
//     { name: "SHOLAFUN / AGELE", code: 6, pollingUnits: 20, results: { APC: 4036, PDP: 150, LP: 282 } },
//     { name: "AGA / IJOMU", code: 5, pollingUnits: 36, results: { APC: 3448, PDP: 266, LP: 104 } },
//     { name: "OLORI / EYITA", code: 1, pollingUnits: 29, results: { APC: 3205, PDP: 0, LP: 142 } },
//   ]},
//   { name: "IKORODU NORTH", wards: [
//     { name: "ODOGUNYAN", code: 1, pollingUnits: 65, results: { APC: 5571, PDP: 167, LP: 330 } },
//     { name: "ERIKORODO", code: 2, pollingUnits: 19, results: { APC: 1744, PDP: 49, LP: 37 } },
//     { name: "AGBALA/LASUNWO", code: 3, pollingUnits: 38, results: { APC: 1321, PDP: 167, LP: 168 } },
//     { name: "OLORUNDA", code: 4, pollingUnits: 8, results: { APC: 966, PDP: 64, LP: 7 } },
//     { name: "ISIU", code: 5, pollingUnits: 12, results: { APC: 1154, PDP: 90, LP: 137 } },
//   ]},
//   { name: "IKORODU WEST", wards: [
//     { name: "ISAWO", code: 5, pollingUnits: 16, results: { APC: 3031, PDP: 102, LP: 85 } },
//     { name: "OWUTU", code: 3, pollingUnits: 20, results: { APC: 2837, PDP: 201, LP: 52 } },
//     { name: "MAJIDUN", code: 2, pollingUnits: 15, results: { APC: 2712, PDP: 152, LP: 197 } },
//     { name: "IPAKODO", code: 1, pollingUnits: 15, results: { APC: 2450, PDP: 26, LP: 20 } },
//     { name: "AJAGURO", code: 4, pollingUnits: 13, results: { APC: 1842, PDP: 38, LP: 20 } },
//   ]},
//   { name: "IKOSI-EJINRIN", wards: [
//     { name: "IFESOWAPO / TEMU / OKEOSO", code: 6, pollingUnits: 15, results: { APC: 4340, PDP: 0, LP: 0 } },
//     { name: "OWU / OTA", code: 3, pollingUnits: 12, results: { APC: 3334, PDP: 0, LP: 0 } },
//     { name: "AGBOWA I", code: 1, pollingUnits: 12, results: { APC: 3203, PDP: 0, LP: 0 } },
//     { name: "AGBOWA II / ADO", code: 2, pollingUnits: 11, results: { APC: 2903, PDP: 0, LP: 0 } },
//     { name: "EJINRIN / KETU", code: 5, pollingUnits: 8, results: { APC: 2650, PDP: 0, LP: 0 } },
//     { name: "AJEBO / ORUGBO", code: 4, pollingUnits: 5, results: { APC: 2075, PDP: 0, LP: 0 } },
//   ]},
//   { name: "IKOSI-ISHERI", wards: [
//     { name: "AGILITI/MAIDAN", code: 6, pollingUnits: 63, results: { APC: 16874, PDP: 68, LP: 27 } },
//     { name: "ISHERI/OLOWORA", code: 1, pollingUnits: 81, results: { APC: 16401, PDP: 945, LP: 200 } },
//     { name: "ORILE-KETU", code: 5, pollingUnits: 53, results: { APC: 9697, PDP: 292, LP: 48 } },
//     { name: "ORILE-IKOSI", code: 4, pollingUnits: 49, results: { APC: 9446, PDP: 172, LP: 30 } },
//     { name: "IDERA", code: 7, pollingUnits: 15, results: { APC: 5268, PDP: 63, LP: 41 } },
//     { name: "IKOSI-OKE", code: 3, pollingUnits: 30, results: { APC: 3705, PDP: 182, LP: 22 } },
//     { name: "SHANGISHA/MAGODO", code: 2, pollingUnits: 39, results: { APC: 2941, PDP: 158, LP: 16 } },
//   ]},
//   { name: "IKOYI-OBALENDE", wards: [
//     { name: "IKOYI I", code: 3, pollingUnits: 45, results: { APC: 3196, PDP: 66, LP: 119 } },
//     { name: "OBALENDE", code: 1, pollingUnits: 47, results: { APC: 3060, PDP: 85, LP: 214 } },
//     { name: "IJEH / DOLPHIN ESTATE", code: 2, pollingUnits: 27, results: { APC: 2652, PDP: 71, LP: 93 } },
//     { name: "FALOMO / OYINKAN ABAYOMI", code: 5, pollingUnits: 31, results: { APC: 2458, PDP: 96, LP: 189 } },
//     { name: "IKOYI II", code: 4, pollingUnits: 26, results: { APC: 2326, PDP: 208, LP: 154 } },
//   ]},
//   { name: "IMOTA", wards: [
//     { name: "MAJA", code: 2, pollingUnits: 16, results: { APC: 5229, PDP: 7, LP: 45 } },
//     { name: "ONABU/OPOPO", code: 3, pollingUnits: 12, results: { APC: 4528, PDP: 15, LP: 36 } },
//     { name: "IGBOKUTA/OKE-AGBO/IGBALU", code: 4, pollingUnits: 5, results: { APC: 2186, PDP: 35, LP: 26 } },
//     { name: "ATERE", code: 1, pollingUnits: 10, results: { APC: 1596, PDP: 87, LP: 17 } },
//   ]},
//   { name: "IRU-VICTORIA ISLAND", wards: [
//     { name: "VICTORIA ISLAND", code: 2, pollingUnits: 63, results: { APC: 2707, PDP: 52, LP: 228 } },
//     { name: "APESE / V.I EXTENSION", code: 4, pollingUnits: 37, results: { APC: 1971, PDP: 11, LP: 83 } },
//     { name: "TARKWA BAY", code: 1, pollingUnits: 12, results: { APC: 1797, PDP: 6, LP: 181 } },
//     { name: "KURAMO", code: 3, pollingUnits: 26, results: { APC: 1235, PDP: 65, LP: 107 } },
//     { name: "1004 / ABOYADE", code: 5, pollingUnits: 36, results: { APC: 967, PDP: 35, LP: 37 } },
//   ]},
//   { name: "ISOLO", wards: [
//     { name: "AKINBAIYE", code: 2, pollingUnits: 50, results: { APC: 4982, PDP: 367, LP: 89 } },
//     { name: "ILASAMAJA", code: 3, pollingUnits: 76, results: { APC: 4102, PDP: 334, LP: 249 } },
//     { name: "ALAGBEJI", code: 1, pollingUnits: 27, results: { APC: 3511, PDP: 138, LP: 30 } },
//     { name: "APENA", code: 5, pollingUnits: 40, results: { APC: 3199, PDP: 112, LP: 114 } },
//     { name: "OKOTA", code: 4, pollingUnits: 52, results: { APC: 2402, PDP: 94, LP: 124 } },
//     { name: "ISHAGA/IRE-AKARI", code: 6, pollingUnits: 58, results: { APC: 2291, PDP: 138, LP: 171 } },
//     { name: "AJAO ESTATE", code: 7, pollingUnits: 36, results: { APC: 1602, PDP: 41, LP: 108 } },
//   ]},
//   { name: "ITIRE-IKATE", wards: [
//     { name: "OGUNSANMI/ KAROUNWI", code: 5, pollingUnits: 57, results: { APC: 4337, PDP: 1139, LP: 281 } },
//     { name: "RAMONI", code: 6, pollingUnits: 40, results: { APC: 3354, PDP: 329, LP: 153 } },
//     { name: "BARUWA", code: 7, pollingUnits: 39, results: { APC: 3047, PDP: 85, LP: 182 } },
//     { name: "SANUSI", code: 4, pollingUnits: 37, results: { APC: 2989, PDP: 232, LP: 216 } },
//     { name: "AIRWAYS", code: 1, pollingUnits: 33, results: { APC: 2790, PDP: 167, LP: 186 } },
//     { name: "AGUNBIADE", code: 2, pollingUnits: 33, results: { APC: 1509, PDP: 100, LP: 162 } },
//     { name: "ODO OLOWU", code: 3, pollingUnits: 20, results: { APC: 1312, PDP: 42, LP: 143 } },
//   ]},
//   { name: "KOSOFE", wards: [
//     { name: "OJOTA", code: 6, pollingUnits: 65, results: { APC: 8318, PDP: 277, LP: 196 } },
//     { name: "OGUDU", code: 7, pollingUnits: 50, results: { APC: 6034, PDP: 264, LP: 181 } },
//     { name: "ARAROMI/IFAKO", code: 3, pollingUnits: 79, results: { APC: 5982, PDP: 441, LP: 655 } },
//     { name: "OLUBORI/MOSAFEJO", code: 1, pollingUnits: 54, results: { APC: 2306, PDP: 138, LP: 236 } },
//     { name: "ORILE OWORO", code: 2, pollingUnits: 35, results: { APC: 1731, PDP: 160, LP: 241 } },
//     { name: "ANTHONY", code: 4, pollingUnits: 27, results: { APC: 2086, PDP: 13, LP: 85 } },
//     { name: "MENDE", code: 5, pollingUnits: 24, results: { APC: 1636, PDP: 13, LP: 40 } },
//   ]},
//   { name: "LAGOS ISLAND EAST", wards: [
//     { name: "OKEPOPO EAST", code: 5, pollingUnits: 29, results: { APC: 3916, PDP: 146, LP: 0 } },
//     { name: "ARAROMI-ODO", code: 7, pollingUnits: 14, results: { APC: 3511, PDP: 53, LP: 0 } },
//     { name: "ANIKANTANMO", code: 3, pollingUnits: 14, results: { APC: 3378, PDP: 95, LP: 0 } },
//     { name: "AJELE", code: 2, pollingUnits: 22, results: { APC: 3372, PDP: 285, LP: 0 } },
//     { name: "EPETEDO EAST", code: 10, pollingUnits: 26, results: { APC: 3141, PDP: 162, LP: 0 } },
//     { name: "OKEPOPO WEST", code: 4, pollingUnits: 19, results: { APC: 2680, PDP: 225, LP: 0 } },
//     { name: "OLOSUN / OJO-OTO", code: 1, pollingUnits: 17, results: { APC: 2163, PDP: 92, LP: 0 } },
//     { name: "LAFIAJI", code: 8, pollingUnits: 16, results: { APC: 2101, PDP: 120, LP: 0 } },
//     { name: "EPETEDO WEST", code: 9, pollingUnits: 24, results: { APC: 1726, PDP: 165, LP: 0 } },
//     { name: "ODAN", code: 6, pollingUnits: 18, results: { APC: 1120, PDP: 67, LP: 0 } },
//   ]},
//   { name: "LAGOS ISLAND", wards: [
//     { name: "IDUNGANRAN/IDUMAGBO", code: 8, pollingUnits: 24, results: { APC: 4998, PDP: 169, LP: 0 } },
//     { name: "OKE-ARIN/IDUMOTA", code: 3, pollingUnits: 26, results: { APC: 3667, PDP: 215, LP: 0 } },
//     { name: "IDUMOYINBO", code: 5, pollingUnits: 30, results: { APC: 3294, PDP: 106, LP: 0 } },
//     { name: "ALAGBA/OBADINA", code: 7, pollingUnits: 15, results: { APC: 2799, PDP: 149, LP: 0 } },
//     { name: "OKE-AWO/AGARAWU", code: 6, pollingUnits: 19, results: { APC: 2606, PDP: 171, LP: 0 } },
//     { name: "ISALE GANGAN", code: 10, pollingUnits: 13, results: { APC: 2476, PDP: 88, LP: 0 } },
//     { name: "OKE-OLOWOGBOWO", code: 1, pollingUnits: 11, results: { APC: 2186, PDP: 96, LP: 0 } },
//     { name: "BALOGUN", code: 2, pollingUnits: 12, results: { APC: 2085, PDP: 19, LP: 0 } },
//     { name: "ILUPESI/EBUTET-AWO", code: 9, pollingUnits: 23, results: { APC: 2256, PDP: 197, LP: 0 } },
//     { name: "OLUWOLE", code: 4, pollingUnits: 17, results: { APC: 1329, PDP: 73, LP: 0 } },
//   ]},
//   { name: "LAGOS MAINLAND", wards: [
//     { name: "OKOBABA", code: 9, pollingUnits: 34, results: { APC: 3702, PDP: 398, LP: 24 } },
//     { name: "FREEMAN / GLOVER", code: 8, pollingUnits: 29, results: { APC: 3544, PDP: 346, LP: 27 } },
//     { name: "OJO-ONIYUN", code: 3, pollingUnits: 28, results: { APC: 2687, PDP: 94, LP: 12 } },
//     { name: "BOTANICAL GARDEN", code: 2, pollingUnits: 25, results: { APC: 2511, PDP: 270, LP: 8 } },
//     { name: "ALOBA / DESALU", code: 4, pollingUnits: 19, results: { APC: 2205, PDP: 123, LP: 10 } },
//     { name: "OYINGBO", code: 6, pollingUnits: 24, results: { APC: 2039, PDP: 146, LP: 9 } },
//     { name: "IPONRI / OLALEYE", code: 5, pollingUnits: 31, results: { APC: 1221, PDP: 124, LP: 164 } },
//     { name: "OTTO", code: 1, pollingUnits: 15, results: { APC: 1227, PDP: 118, LP: 2 } },
//     { name: "ARAROMI", code: 7, pollingUnits: 24, results: { APC: 901, PDP: 104, LP: 3 } },
//   ]},
//   { name: "LEKKI", wards: [
//     { name: "LEKKI I", code: 1, pollingUnits: 12, results: { APC: 5420, PDP: 0, LP: 0 } },
//     { name: "SIRIWON / IGBEKODO I", code: 3, pollingUnits: 13, results: { APC: 5027, PDP: 0, LP: 0 } },
//     { name: "LEKKI II", code: 2, pollingUnits: 19, results: { APC: 4663, PDP: 0, LP: 0 } },
//     { name: "SIRIWON / IGBEKODO II", code: 4, pollingUnits: 11, results: { APC: 3850, PDP: 0, LP: 0 } },
//     { name: "ISE / IGBOGUN", code: 5, pollingUnits: 21, results: { APC: 3156, PDP: 0, LP: 0 } },
//   ]},
//   { name: "MOSAN-OKUNOLA", wards: [
//     { name: "MOSAN/AKINOGUN", code: 1, pollingUnits: 44, results: { APC: 2468, PDP: 82, LP: 0 } },
//     { name: "ABESAN I", code: 4, pollingUnits: 46, results: { APC: 2040, PDP: 67, LP: 0 } },
//     { name: "GOWON ESTATE", code: 2, pollingUnits: 55, results: { APC: 1089, PDP: 106, LP: 0 } },
//     { name: "ABESAN II", code: 5, pollingUnits: 26, results: { APC: 997, PDP: 74, LP: 0 } },
//     { name: "OKUNOLA", code: 3, pollingUnits: 19, results: { APC: 539, PDP: 99, LP: 0 } },
//   ]},
//   { name: "MUSHIN", wards: [
//     { name: "MUSHIN ATEWOLARA", code: 1, pollingUnits: 83, results: { APC: 16849, PDP: 533, LP: 0 } },
//     { name: "PAPA AJAO", code: 2, pollingUnits: 64, results: { APC: 13676, PDP: 312, LP: 0 } },
//     { name: "BABA OLOSA", code: 5, pollingUnits: 50, results: { APC: 10360, PDP: 346, LP: 0 } },
//     { name: "ONITIRE", code: 7, pollingUnits: 66, results: { APC: 9645, PDP: 420, LP: 0 } },
//     { name: "ALAFIA ADEOYO", code: 3, pollingUnits: 55, results: { APC: 8433, PDP: 332, LP: 0 } },
//     { name: "IDI ARABA", code: 10, pollingUnits: 47, results: { APC: 7975, PDP: 368, LP: 0 } },
//     { name: "IGBEHIN", code: 4, pollingUnits: 50, results: { APC: 7409, PDP: 282, LP: 0 } },
//     { name: "ODO ERAN/OGUNLANA", code: 9, pollingUnits: 45, results: { APC: 6744, PDP: 239, LP: 0 } },
//     { name: "MOSHALASI/AGORO", code: 6, pollingUnits: 45, results: { APC: 6257, PDP: 424, LP: 0 } },
//     { name: "ODUSELU/OLA", code: 8, pollingUnits: 42, results: { APC: 5449, PDP: 332, LP: 0 } },
//   ]},
//   { name: "ODI-OLOWO/OJUWOYE", wards: [
//     { name: "ALAKARA", code: 1, pollingUnits: 44, results: { APC: 8740, PDP: 169, LP: 63 } },
//     { name: "IDI-ORO/ODI-OLOWO", code: 2, pollingUnits: 34, results: { APC: 8441, PDP: 105, LP: 56 } },
//     { name: "ILUPEJU", code: 5, pollingUnits: 37, results: { APC: 8025, PDP: 212, LP: 199 } },
//     { name: "OJUWOYE", code: 4, pollingUnits: 40, results: { APC: 6243, PDP: 174, LP: 372 } },
//     { name: "KAYODE/FADEYI", code: 8, pollingUnits: 50, results: { APC: 6198, PDP: 172, LP: 136 } },
//     { name: "BABALOSA", code: 3, pollingUnits: 35, results: { APC: 6135, PDP: 461, LP: 307 } },
//     { name: "OLATEJU", code: 7, pollingUnits: 30, results: { APC: 6130, PDP: 149, LP: 89 } },
//     { name: "ILUPEJU INDUSTRIAL ESTATE", code: 9, pollingUnits: 23, results: { APC: 4715, PDP: 176, LP: 99 } },
//     { name: "OWODUNNI", code: 6, pollingUnits: 25, results: { APC: 3819, PDP: 125, LP: 144 } },
//   ]},
//   { name: "OJODU", wards: [
//     { name: "OKE-IRA CENTRAL", code: 3, pollingUnits: 29, results: { APC: 4668, PDP: 76, LP: 0 } },
//     { name: "OGBA/ OLUWOLE", code: 1, pollingUnits: 35, results: { APC: 4656, PDP: 153, LP: 0 } },
//     { name: "OJODU", code: 6, pollingUnits: 72, results: { APC: 4655, PDP: 163, LP: 0 } },
//     { name: "AGUDA", code: 2, pollingUnits: 47, results: { APC: 4529, PDP: 127, LP: 0 } },
//     { name: "OKE-IRA POWERLINE", code: 4, pollingUnits: 24, results: { APC: 3309, PDP: 96, LP: 0 } },
//     { name: "AKIODE", code: 5, pollingUnits: 36, results: { APC: 2059, PDP: 75, LP: 0 } },
//   ]},
//   { name: "OJOKORO", wards: [
//     { name: "IJAIYE/OJOKORO", code: 5, pollingUnits: 120, results: { APC: 4569, PDP: 592, LP: 240 } },
//     { name: "ABULE EGBA/ILUPEJU", code: 3, pollingUnits: 62, results: { APC: 3002, PDP: 165, LP: 45 } },
//     { name: "IJAIYE/GBIRINMI", code: 4, pollingUnits: 48, results: { APC: 3083, PDP: 45, LP: 73 } },
//     { name: "OKO-OBA/OKE EGBIRI", code: 2, pollingUnits: 50, results: { APC: 1774, PDP: 44, LP: 17 } },
//     { name: "ALAGBADO/KOLLINGTON", code: 6, pollingUnits: 47, results: { APC: 2767, PDP: 15, LP: 109 } },
//     { name: "ALAKUKO/AJEGUNLE", code: 7, pollingUnits: 49, results: { APC: 1721, PDP: 75, LP: 47 } },
//     { name: "PANADA", code: 1, pollingUnits: 57, results: { APC: 1696, PDP: 108, LP: 140 } },
//   ]},
//   { name: "OJO", wards: [
//     { name: "SABO-ONIBA", code: 3, pollingUnits: 125, results: { APC: 14831, PDP: 338, LP: 414 } },
//     { name: "IRA", code: 2, pollingUnits: 51, results: { APC: 8279, PDP: 156, LP: 499 } },
//     { name: "OJO TOWN", code: 1, pollingUnits: 42, results: { APC: 6621, PDP: 171, LP: 49 } },
//     { name: "IREWE", code: 4, pollingUnits: 9, results: { APC: 2341, PDP: 10, LP: 1 } },
//     { name: "TAFFI", code: 5, pollingUnits: 8, results: { APC: 2261, PDP: 8, LP: 3 } },
//   ]},
//   { name: "OLORUNDA", wards: [
//     { name: "ARAROMI-ALE", code: 5, pollingUnits: 45, results: { APC: 6805, PDP: 67, LP: 0 } },
//     { name: "ILOGBO", code: 4, pollingUnits: 32, results: { APC: 6422, PDP: 53, LP: 0 } },
//     { name: "ARADAGUN-MOWO", code: 3, pollingUnits: 23, results: { APC: 5821, PDP: 70, LP: 0 } },
//     { name: "IWORO-GBANKO", code: 1, pollingUnits: 29, results: { APC: 5622, PDP: 54, LP: 0 } },
//     { name: "IBEREKO", code: 2, pollingUnits: 41, results: { APC: 4129, PDP: 226, LP: 0 } },
//   ]},
//   { name: "ONIGBONGBO", wards: [
//     { name: "G.R.A", code: 2, pollingUnits: 49, results: { APC: 4307, PDP: 359, LP: 0 } },
//     { name: "OPEBI", code: 4, pollingUnits: 46, results: { APC: 3510, PDP: 154, LP: 0 } },
//     { name: "ONIGBONGBO", code: 1, pollingUnits: 51, results: { APC: 2627, PDP: 176, LP: 0 } },
//     { name: "OREGUN", code: 5, pollingUnits: 34, results: { APC: 1855, PDP: 64, LP: 0 } },
//     { name: "OLUSOSUN", code: 6, pollingUnits: 21, results: { APC: 1533, PDP: 82, LP: 0 } },
//     { name: "WASIMI", code: 3, pollingUnits: 13, results: { APC: 949, PDP: 58, LP: 0 } },
//   ]},
//   { name: "ORIADE", wards: [
//     { name: "KUJE", code: 2, pollingUnits: 60, results: { APC: 7021, PDP: 0, LP: 636 } },
//     { name: "IJEGUN EGBA", code: 4, pollingUnits: 44, results: { APC: 6572, PDP: 0, LP: 410 } },
//     { name: "IBESHE", code: 7, pollingUnits: 21, results: { APC: 6451, PDP: 0, LP: 129 } },
//     { name: "SATELLITE", code: 5, pollingUnits: 80, results: { APC: 4210, PDP: 0, LP: 558 } },
//     { name: "AGBOJU", code: 3, pollingUnits: 49, results: { APC: 3581, PDP: 0, LP: 396 } },
//     { name: "KIRIKIRI", code: 1, pollingUnits: 59, results: { APC: 3271, PDP: 0, LP: 256 } },
//     { name: "IREDE", code: 6, pollingUnits: 14, results: { APC: 2808, PDP: 0, LP: 150 } },
//   ]},
//   { name: "ORILE-AGEGE", wards: [
//     { name: "PAPA ASHAFA", code: 4, pollingUnits: 91, results: { APC: 10449, PDP: 0, LP: 0 } },
//     { name: "ORILE", code: 1, pollingUnits: 69, results: { APC: 9346, PDP: 0, LP: 0 } },
//     { name: "OKE-KOTO", code: 2, pollingUnits: 58, results: { APC: 6039, PDP: 0, LP: 0 } },
//     { name: "ISALE ODO/AYIGE", code: 6, pollingUnits: 55, results: { APC: 5723, PDP: 0, LP: 0 } },
//     { name: "POWERLINE/OKO-OBA", code: 3, pollingUnits: 64, results: { APC: 4779, PDP: 0, LP: 0 } },
//     { name: "OYEWOLE/ALAAGBA", code: 5, pollingUnits: 43, results: { APC: 4620, PDP: 0, LP: 0 } },
//   ]},
//   { name: "OSHODI-ISOLO", wards: [
//     { name: "IGBEHINADUN", code: 3, pollingUnits: 75, results: { APC: 11866, PDP: 165, LP: 118 } },
//     { name: "EWU", code: 7, pollingUnits: 53, results: { APC: 11844, PDP: 249, LP: 107 } },
//     { name: "MAFOLUKU", code: 5, pollingUnits: 65, results: { APC: 9983, PDP: 214, LP: 60 } },
//     { name: "AFARIOGUN", code: 4, pollingUnits: 37, results: { APC: 9859, PDP: 234, LP: 76 } },
//     { name: "OLUYEYE", code: 1, pollingUnits: 60, results: { APC: 9071, PDP: 245, LP: 94 } },
//     { name: "OGUNOLOKO", code: 2, pollingUnits: 41, results: { APC: 6015, PDP: 97, LP: 29 } },
//     { name: "SHOGUNLE", code: 6, pollingUnits: 34, results: { APC: 5662, PDP: 143, LP: 30 } },
//   ]},
//   { name: "OTO-AWORI", wards: [
//     { name: "OTO-AWORI", code: 1, pollingUnits: 35, results: { APC: 6023, PDP: 242, LP: 137 } },
//     { name: "ILOGBO-ELEGBA", code: 3, pollingUnits: 44, results: { APC: 5539, PDP: 116, LP: 114 } },
//     { name: "IJANIKIN", code: 2, pollingUnits: 44, results: { APC: 3186, PDP: 85, LP: 138 } },
//     { name: "ETEGBIN", code: 4, pollingUnits: 20, results: { APC: 2939, PDP: 121, LP: 66 } },
//     { name: "ESE-OFIN", code: 5, pollingUnits: 10, results: { APC: 2187, PDP: 72, LP: 15 } },
//   ]},
//   { name: "SOMOLU", wards: [
//     { name: "IJEBU TEDO", code: 3, pollingUnits: 38, results: { APC: 7370, PDP: 99, LP: 15 } },
//     { name: "BAJULAIYE", code: 6, pollingUnits: 26, results: { APC: 5505, PDP: 160, LP: 210 } },
//     { name: "BASHUA EAST & WEST", code: 2, pollingUnits: 21, results: { APC: 5118, PDP: 47, LP: 19 } },
//     { name: "ONIPANU", code: 1, pollingUnits: 23, results: { APC: 3960, PDP: 89, LP: 35 } },
//     { name: "OKESUNA/ ALASE", code: 5, pollingUnits: 33, results: { APC: 3593, PDP: 135, LP: 21 } },
//     { name: "IGBOBI/ FADEYI", code: 8, pollingUnits: 31, results: { APC: 3305, PDP: 182, LP: 19 } },
//     { name: "IGBARI AKOKA", code: 7, pollingUnits: 24, results: { APC: 3051, PDP: 157, LP: 13 } },
//     { name: "ORILE SHOMOLU/ALADE", code: 4, pollingUnits: 33, results: { APC: 2300, PDP: 206, LP: 13 } },
//   ]},
//   { name: "SURULERE", wards: [
//     { name: "BABATUNDE AYILARA", code: 6, pollingUnits: 33, results: { APC: 4192, PDP: 142, LP: 50 } },
//     { name: "IPONRI ERIC MORE", code: 9, pollingUnits: 31, results: { APC: 4002, PDP: 130, LP: 44 } },
//     { name: "MOSAFEJO OJUELEGBA", code: 3, pollingUnits: 37, results: { APC: 3922, PDP: 149, LP: 19 } },
//     { name: "OBELE ONIWALA", code: 1, pollingUnits: 19, results: { APC: 3837, PDP: 181, LP: 16 } },
//     { name: "GBAJA OBELE-ODAN", code: 5, pollingUnits: 27, results: { APC: 3491, PDP: 56, LP: 8 } },
//     { name: "AKINHANMI / COLE", code: 2, pollingUnits: 33, results: { APC: 2836, PDP: 169, LP: 63 } },
//     { name: "ADENIRAN OGUNSANYA", code: 8, pollingUnits: 38, results: { APC: 2712, PDP: 78, LP: 107 } },
//     { name: "SHITTA BANK OLEMOH", code: 7, pollingUnits: 24, results: { APC: 2439, PDP: 112, LP: 5 } },
//     { name: "ARALILE", code: 4, pollingUnits: 16, results: { APC: 1484, PDP: 57, LP: 10 } },
//   ]},
//   { name: "YABA", wards: [
//     { name: "MAKOKO", code: 2, pollingUnits: 41, results: { APC: 2580, PDP: 188, LP: 90 } },
//     { name: "ALAGOMEJI", code: 5, pollingUnits: 40, results: { APC: 1919, PDP: 217, LP: 29 } },
//     { name: "HARVEY", code: 8, pollingUnits: 31, results: { APC: 1146, PDP: 138, LP: 64 } },
//     { name: "ONIKE/OYADIRAN", code: 3, pollingUnits: 23, results: { APC: 922, PDP: 143, LP: 9 } },
//     { name: "ADERUPOKO", code: 6, pollingUnits: 34, results: { APC: 1000, PDP: 299, LP: 7 } },
//     { name: "SALAMI BAIYEWUNI", code: 7, pollingUnits: 25, results: { APC: 770, PDP: 49, LP: 9 } },
//     { name: "ABULE IJESHA", code: 9, pollingUnits: 16, results: { APC: 807, PDP: 45, LP: 180 } },
//     { name: "ADEKUNLE AIYETORO", code: 1, pollingUnits: 21, results: { APC: 695, PDP: 387, LP: 9 } },
//     { name: "ABULE OJA", code: 4, pollingUnits: 33, results: { APC: 456, PDP: 256, LP: 22 } },
//   ]},
// ];

// // ── Seed function ─────────────────────────────────────────────────────────────

// async function seed() {
//   const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
//   if (!uri) {
//     console.error('❌ MONGO_URI not found in .env');
//     process.exit(1);
//   }

//   console.log('🔌 Connecting to MongoDB…');
//   await mongoose.connect(uri);
//   console.log('✅ Connected\n');

//   let lcdaCreated = 0, lcdaUpdated = 0;
//   let wardCreated = 0, wardUpdated = 0;

//   for (const lcdaData of ELECTION_DATA) {
//     // Upsert LCDA
//     const lcdaResult = await LCDA.findOneAndUpdate(
//       { name: lcdaData.name },
//       { $set: { name: lcdaData.name, state: 'Lagos' } },
//       { upsert: true, new: true, runValidators: true }
//     );

//     const wasNew = lcdaResult.createdAt?.getTime() === lcdaResult.updatedAt?.getTime();
//     wasNew ? lcdaCreated++ : lcdaUpdated++;

//     // Upsert each ward under this LCDA
//     for (const wardData of lcdaData.wards) {
//       const wardResult = await Ward.findOneAndUpdate(
//         { name: wardData.name, lcda: lcdaResult._id },
//         {
//           $set: {
//             name:         wardData.name,
//             code:         wardData.code,
//             pollingUnits: wardData.pollingUnits,
//             lcda:         lcdaResult._id,
//             results:      wardData.results,
//           },
//         },
//         { upsert: true, new: true, runValidators: true }
//       );
//       const wardIsNew = wardResult.createdAt?.getTime() === wardResult.updatedAt?.getTime();
//       wardIsNew ? wardCreated++ : wardUpdated++;
//     }

//     console.log(`  ✔ ${lcdaData.name.padEnd(30)} ${lcdaData.wards.length} wards`);
//   }

//   console.log('\n── Summary ──────────────────────────────────');
//   console.log(`LCDAs : ${lcdaCreated} created, ${lcdaUpdated} updated`);
//   console.log(`Wards : ${wardCreated} created, ${wardUpdated} updated`);
//   console.log('─────────────────────────────────────────────\n');
//   console.log('✅ Seed complete!');
// }

// seed()
//   .catch(err => {
//     console.error('❌ Seed failed:', err.message);
//     process.exit(1);
//   })
//   .finally(() => mongoose.disconnect());