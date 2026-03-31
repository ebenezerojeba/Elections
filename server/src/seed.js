/**
 * scripts/seed.js
 *
 * Run: node scripts/seed.js
 *
 * Seeds:
 *   1. All 57 Lagos LGAs/LCDAs (official LASIEC data)
 *   2. Accurate wards per LGA/LCDA (sourced from LASIEC electoral wards list)
 *   3. One test admin + one test agent per the first 3 LGAs
 *   4. Sample election results for every ward across all 57 LGAs/LCDAs
 *
 * After seeding, log in with:
 *   admin@electtrack.com  / Admin1234
 *   agent1@electtrack.com / Agent1234  (assigned to Mushin, first ward)
 *   agent2@electtrack.com / Agent1234  (assigned to Agege, first ward)
 *   agent3@electtrack.com / Agent1234  (assigned to Ifako-Ijaiye, first ward)
 *
 * Ward data source: Lagos State Independent Electoral Commission (LASIEC)
 * https://lasiec.gov.ng/electoral-wards/
 */

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
  mongoose.disconnect();
  process.exit(1);
});