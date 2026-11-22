// horror.js — Sansi Horror Script Factory: deterministic bulk script generation,
// engagement scoring (kaunsi script chalegi) and trend verdict analysis (kaunsa trend chalega).
// Offline and dependency-free. Same honesty boundary as the rest of Sansi: trend "predictions"
// are structural hypotheses from supplied inputs, not verified live platform data.

/* ---------------------------------- RNG ---------------------------------- */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ------------------------------- Ingredients ------------------------------ */

export const SUBGENRES = [
  { id: 'psychological', label: 'Psychological dread' },
  { id: 'folk', label: 'Folk / daivik horror' },
  { id: 'paranormal', label: 'Haunted-place paranormal' },
  { id: 'tech', label: 'Tech horror' },
  { id: 'urban-legend', label: 'Urban legend / creepypasta' },
  { id: 'cosmic', label: 'Cosmic unknown' },
  { id: 'creature', label: 'Creature feature' },
  { id: 'possession', label: 'Possession' },
  { id: 'liminal', label: 'Liminal / uncanny' },
  { id: 'ritual', label: 'Ritual & curse' }
];

export const SETTINGS = [
  { id: 'last-train', label: 'Mumbai ki last local train', short: 'last local', name: 'Last Local', relatability: 0.97 },
  { id: 'chawl', label: 'Purani chawl ki teesri manzil', short: 'chawl', name: 'Chawl', relatability: 0.9 },
  { id: 'haveli', label: 'Rajasthan ki purani haveli', short: 'haveli', name: 'Haveli', relatability: 0.8 },
  { id: 'hospital', label: 'Hospital ki ICU waiting room', short: 'hospital', name: 'Hospital', relatability: 0.92 },
  { id: 'hostel', label: 'College hostel ka room 214', short: 'hostel room', name: 'Hostel Room', relatability: 0.93 },
  { id: 'office', label: 'IT park ki 11 PM wali floor', short: 'office floor', name: 'Office', relatability: 0.88 },
  { id: 'lift', label: '13th floor ki apartment aur purani lift', short: 'lift', name: 'Lift', relatability: 0.87 },
  { id: 'peepal', label: 'Gaon ka peepal ped aur kacchi sadak', short: 'peepal ped', name: 'Peepal Ped', relatability: 0.84 },
  { id: 'hotel', label: 'Hill station ka hotel room 302', short: 'hotel room', name: 'Hotel Room', relatability: 0.82 },
  { id: 'school', label: 'School ki computer lab, class ke baad', short: 'computer lab', name: 'School Lab', relatability: 0.86 },
  { id: 'library', label: 'Purane library ka basement', short: 'library basement', name: 'Library', relatability: 0.72 },
  { id: 'taxi', label: 'Raat ko highway par akeli taxi', short: 'taxi', name: 'Taxi', relatability: 0.85 },
  { id: 'platform', label: 'Railway platform, 2:17 AM', short: 'platform', name: 'Platform', relatability: 0.9 },
  { id: 'oyo', label: 'Saste hotel ka room, doosre shehar mein', short: 'hotel room', name: 'Hotel Room', relatability: 0.83 },
  { id: 'site', label: 'Construction site ki night duty', short: 'construction site', name: 'Construction Site', relatability: 0.7 },
  { id: 'atm', label: 'Raat ko akela ATM booth', short: 'ATM booth', name: 'ATM Booth', relatability: 0.81 },
  { id: 'pg', label: 'Shared PG ka kamra', short: 'PG room', name: 'PG Room', relatability: 0.89 },
  { id: 'wedding', label: 'Shaadi ki decoration, raat ke 3 baje', short: 'shaadi ka venue', name: 'Shaadi Venue', relatability: 0.78 },
  { id: 'shamshan', label: 'Shamshan ghar jaane wali sadak', short: 'shamshan road', name: 'Shamshan Road', relatability: 0.86 },
  { id: 'flight', label: 'Red-eye flight ki window seat', short: 'flight', name: 'Flight', relatability: 0.75 }
];

export const ENTITIES = [
  { id: 'chudail', label: 'chudail', labelEn: 'the chudail', flavor: {
    hn: 'Uske pair ulte the. Main aankhein band karke bhi woh dekh sakta tha.',
    en: 'Her feet were backwards. I could see her even with my eyes closed.' } },
  { id: 'djinn', label: 'djinn', labelEn: 'the djinn', flavor: {
    hn: 'Deewar ke us paar se kisi ne teen baar knock kiya. Har baar… mere naam ke ek letter kam.',
    en: 'Something knocked three times through the wall. Each time… one letter of my name was missing.' } },
  { id: 'brahmrakshas', label: 'brahmrakshas', labelEn: 'the brahmrakshas', flavor: {
    hn: 'Hawa mein woh purani aashtak ki bu aa rahi thi — jo maine sirf daadi ki kahaniyon mein suni thi.',
    en: 'The air smelled of old ritual ash — a smell I only knew from my grandmother’s stories.' } },
  { id: 'shadow', label: 'paraya saaya', labelEn: 'the shadow', flavor: {
    hn: 'Woh saaya mera nahi tha. Kyunki main us waqt bilkul hil nahi raha tha.',
    en: 'That shadow was not mine. Because I was standing completely still.' } },
  { id: 'mimic', label: 'nakli awaaz', labelEn: 'the mimic voice', flavor: {
    hn: 'Woh awaaz meri thi — par usme woh meri aadat thi jo maine kabhi kisi ko nahi batayi.',
    en: 'The voice was mine — but it used a habit I had never told anyone about.' } },
  { id: 'ai', label: 'purana voice assistant', labelEn: 'the old voice assistant', flavor: {
    hn: 'Usne apne aap trigger hoke kaha: "Main ab bhi sun raha hoon." Maine use 2019 mein uninstall kar diya tha.',
    en: 'It triggered itself and said: “I am still listening.” I had uninstalled it in 2019.' } },
  { id: 'child', label: 'bachche ki rooh', labelEn: 'the child spirit', flavor: {
    hn: 'Woh ginta ja raha tha. Ek, do, teen… aur har number ke baad darwaza ek inch aur khul jaata.',
    en: 'It kept counting. One, two, three… and with every number the door opened one more inch.' } },
  { id: 'vetala', label: 'vetala', labelEn: 'the vetala', flavor: {
    hn: 'Usne peepal ke neeche se awaaz di — meri dadi ki awaaz mein. Dadi guzar chuki thi.',
    en: 'It called from under the peepal tree — in my grandmother’s voice. My grandmother had passed away.' } },
  { id: 'mirror', label: 'aaine ki cheez', labelEn: 'the thing in the mirror', flavor: {
    hn: 'Aaine mein mera reflection tha… par aankhein band karke bhi woh mujhe dekh raha tha.',
    en: 'My reflection was in the mirror… but it was watching me even when I blinked.' } },
  { id: 'commuter', label: 'bina chehre wala passenger', labelEn: 'the faceless commuter', flavor: {
    hn: 'Uska chehra dhundhla tha jaise purani photo. Ticket examiner ne usse ticket tak nahi maanga.',
    en: 'Its face was blurred like an old photograph. The ticket checker did not even ask it for a ticket.' } },
  { id: 'doppelganger', label: 'humsaya', labelEn: 'the doppelgänger', flavor: {
    hn: 'Woh meri hi tarah baitha tha — meri hi shirt, meri hi watch. Par uski watch ulti chal rahi thi.',
    en: 'It sat exactly like me — my shirt, my watch. But its watch was running backwards.' } },
  { id: 'paralysis', label: 'jhunjhuni wali cheez', labelEn: 'the paralysis figure', flavor: {
    hn: 'Neend toot-te hi woh corner mein baitha tha. Har raat, bilkul usi jagah.',
    en: 'Every time sleep broke, it was sitting in the corner. Every night, the exact same spot.' } },
  { id: 'cursed-number', label: 'cursed number', labelEn: 'the cursed number', flavor: {
    hn: 'Woh number meri diary mein khud aa gaya tha. Meri handwriting thi… par maine likha nahi tha.',
    en: 'That number had written itself into my diary. It was my handwriting… but I never wrote it.' } },
  { id: 'radio', label: 'purana radio', labelEn: 'the old radio', flavor: {
    hn: 'Radio band tha, phir bhi usme se dhimi awaaz mein koi purana gaana aa raha tha — ulta baj raha tha.',
    en: 'The radio was off, yet it hummed an old song — playing in reverse.' } },
  { id: 'other-you', label: 'doosra tum', labelEn: 'the other you', flavor: {
    hn: 'Usne mujhse woh sawaal poochha jo main aaj tak khud se poochhne se darta tha.',
    en: 'It asked me the one question I have been afraid to ask myself.' } }
];

export const HOOK_STYLES = [
  { id: 'confession', label: 'Confession (raaz)', strength: 0.86 },
  { id: 'warning', label: 'Warning (mat dekho)', strength: 0.9 },
  { id: 'question', label: 'Question hook', strength: 0.8 },
  { id: 'cold-open', label: 'Cold-open incident', strength: 0.84 },
  { id: 'found-footage', label: 'Found-footage framing', strength: 0.88 },
  { id: 'timestamp', label: 'Timestamp frame', strength: 0.83 },
  { id: 'rules', label: 'Rules / instructions', strength: 0.91 },
  { id: 'disbelief', label: 'Disbelief turn', strength: 0.82 },
  { id: 'recorded-call', label: 'Recorded call', strength: 0.87 },
  { id: 'listicle', label: '3-cheezein list', strength: 0.78 }
];

export const TWISTS = [
  { id: 'mimic-voice', label: 'Awaaz tumhari thi', strength: 0.9 },
  { id: 'own-phone', label: 'Call khud se thi', strength: 0.91 },
  { id: 'repeat-tonight', label: 'Aaj raat phir hoga (4th-wall)', strength: 0.88 },
  { id: 'friend-never', label: 'Dost kabhi aaya hi nahi', strength: 0.86 },
  { id: 'rule-protection', label: 'Rule tumhe bacha rahe the', strength: 0.89 },
  { id: 'narrator-entity', label: 'Kahani sunane wala khud…', strength: 0.92 },
  { id: 'listener-next', label: 'Ab tumhari baari (2nd person)', strength: 0.9 },
  { id: 'mirror-lag', label: 'Reflection late tha', strength: 0.84 },
  { id: 'recording-continued', label: 'Recording chalti rahi', strength: 0.87 },
  { id: 'imaginary-friend', label: 'Woh imaginary nahi tha', strength: 0.85 },
  { id: 'other-you', label: 'Photo mein tum the', strength: 0.88 },
  { id: 'sleep-figure', label: 'Woh abhi bhi wahin hai', strength: 0.83 }
];

export const PLATFORMS = [
  { id: 'Instagram Reels', ideal: [15, 90] },
  { id: 'YouTube Shorts', ideal: [15, 90] },
  { id: 'TikTok', ideal: [15, 90] },
  { id: 'Facebook Reels', ideal: [15, 90] },
  { id: 'YouTube long-form', ideal: [180, 900] },
  { id: 'Podcast audio', ideal: [120, 900] }
];

export const DURATIONS = [
  { id: '30 seconds', seconds: 30 }, { id: '45 seconds', seconds: 45 },
  { id: '60 seconds', seconds: 60 }, { id: '90 seconds', seconds: 90 },
  { id: '3 minutes', seconds: 180 }, { id: '8 minutes', seconds: 480 }
];

export const VOICES = [
  { id: 'first-past', label: 'First person (past tense)' },
  { id: 'first-present', label: 'First person (present tense)' },
  { id: 'second-person', label: 'Second person (tum/you)' },
  { id: 'transcript', label: 'Found transcript / recording' }
];

/* ------------------------- Language fragment banks ------------------------ */
// Slots are noun phrases only, so any combination stays grammatical.

const TIMES = ['1:47 AM', '2:17 AM', '3:03 AM', '12:15 AM', '3:33 AM', '4:04 AM', '11:58 PM', '2:40 AM', '3:15 AM', '1:01 AM'];

const SOUNDS = {
  hn: ['kisi ke chalne ki awaaz', 'kheenchne ki awaaz', 'ek lambi siski', 'dhimi awaaz mein koi purana gaana', 'darwaze par kharonkhana', 'bachche ki hasi', 'lift ki ghanti', 'paani tapakne ki awaaz', 'koi dheere se mera naam le raha tha', 'apni hi awaaz mein koi bol raha tha'],
  en: ['footsteps', 'a dragging sound', 'one long sigh', 'an old song, humming low', 'knocking on the door', 'a child laughing', 'the lift bell', 'water dripping', 'someone whispering my name', 'my own voice, speaking']
};

const OBJECTS = {
  hn: ['purana radio', 'deewar ghadi', 'TV', 'lift ka button', 'mobile phone', 'purani diary', 'aaina', 'khidki', 'doorbell', 'school bag', 'headphones', 'computer screen'],
  en: ['old radio', 'wall clock', 'TV', 'lift button', 'mobile phone', 'old diary', 'mirror', 'window', 'doorbell', 'school bag', 'headphones', 'computer screen']
};

const FRAGMENT = {
  hn: {
    hooks: {
      confession: (c) => `Main yeh baat aaj tak kisi ko nahi batayi… ${c.settingShort} mein jo hua, uske baad maine raat ko akele sona chhod diya.`,
      warning: (c) => `Yeh video mat dekho — khaas kar ${c.time} ke baad. Agar dekh hi rahe ho, to kam se kam akela mat dekhna.`,
      question: (c) => `Kya tumne kabhi ${c.settingShort} mein aisa mehsoos kiya hai jaise koi ghoor raha ho… par mud kar dekhne ki himmat na ho?`,
      'cold-open': (c) => `Raat ke ${c.time} the. ${c.settingLabel} bilkul khaali tha. Aur tabhi… ${c.object} ki taraf se ek awaaz aayi — jab wahan koi tha hi nahi.`,
      'found-footage': (c) => `Jo ab tum dekh rahe ho, yeh footage police ko kabhi nahi mili. Mere laptop mein 6 din tak padi rahi… jab tak maine use khud nahi dekha.`,
      timestamp: (c) => `Is timestamp ko save karo: ${c.time}. Kyunki jo main aaj bataunga, woh ussi raat ${c.settingShort} mein shuru hua.`,
      rules: (c) => `Agar kabhi ${c.settingShort} mein ${c.time} ke baad phanse, to teen rules yaad rakhna. Teesra rule maine toda tha.`,
      disbelief: (c) => `Mujhe bhoot-pret par vishwas bilkul nahi tha. Phir ek raat maine khud ko… apne saamne khada dekha.`,
      'recorded-call': (c) => `Yeh recording maine delete kar di thi. Par kal raat woh meri gallery mein dobara mil gayi. Awaaz meri hai… par us raat main wahan tha hi nahi.`,
      listicle: (c) => `${c.settingShort} mein 3 cheezein kabhi mat karna. Teesri cheez maine ki thi… aur ab main yeh video bana raha hoon.`
    },
    setup: (c) => [
      `Raat ke ${c.time} baj rahe the. Main ${c.settingLc} mein ${c.companion} tha.`,
      `Bahar andhera tha, aur ${c.settingShort} mein sirf ${c.sound}.`
    ],
    wrongness: (c) => [
      `Pehle kuch samajh nahi aaya. Phir ${c.object} mein harkat hone lagi — jab wahan koi tha hi nahi.`,
      `Phir temperature ekdum gir gayi. Ab ${c.sound} — bilkul ${c.settingShort} ke andar se.`,
      `Meri aankh ${c.object} par gayi. Uspar kuch likha aa raha tha… woh message maine type hi nahi kiya tha.`
    ],
    escalation: (c) => [
      `Maine ${c.object} check kiya. Jo mila… woh hona hi nahi chahiye tha.`,
      `Har step ke saath ${c.sound} — tez, aur bilkul mere peeche. Ab woh ${c.settingShort} ke bahar nahi tha.`,
      `Maine peeche mudne ki koshish ki. Par mujhe pata tha — mudte hi yeh kahani wahin khatam ho jaayegi.`,
      `Mobile ki torch bujh gayi. Aur andhere mein ${c.sound} — ab bilkul regular, ek rhythm mein.`
    ],
    lockin: (c) => [
      `Darwaza band ho gaya. Bahar se. Lock ki awaaz itni saaf thi jaise koi mujhe suna raha ho.`,
      `Maine bhaagne ki koshish ki. Raste the… par har rasta wapas ${c.settingShort} mein hi kheench laata.`,
      `Tabhi ${c.sound} — bilkul band. Sannata… aur sannate se zyada darawna kuch nahi hota.`
    ],
    twistLead: (c) => [
      'Aur phir samajh aaya ki galti kahan hui thi…',
      'Tabhi ek cheez clear hui jo maine raat bhar notice nahi ki thi…',
      'Mujhe laga kahani yahin khatam hai. Phir…'
    ],
    residue: (c) => [
      `Main ab bhi ${c.settingShort} jaata hoon. Par ${c.time} ke baad kabhi nahi.`,
      `Agar kabhi ${c.settingShort} mein jao, to ek kaam zaroor karna — mud kar mat dekhna.`,
      `Yeh video maine delete kar di thi. Tumne abhi dekhi. Socho… kyun?`,
      `Woh cheez abhi bhi wahin hai. Sirf intezaar kar rahi hai ki koi phir se akele aaye.`,
      `Aur haan — jis jagah se tum yeh sun rahe ho… wahan bhi andhera hai na?`
    ],
    ctas: [
      'Comment mein sirf itna likho: “main akela nahi hoon.” Aur share karo… par akela mat dekhna.',
      'Save karo isse — kyunki agla part isse bhi darawna hai. Aur comment mein apna timestamp batao.',
      'Follow karo. Aur agar himmat hai to aaj raat 3:03 baje apni khidki se bahar dekho… phir comment karna.',
      'Agar yeh kahani pasand aayi to like karo. Agar sach lagi… to bhagwan hi tumhari madad kare.'
    ],
    soundDesign: (c) => `Room tone + low drone (40–60 Hz). ${c.objectCap} ke paas close-mic rakho. Twist se pehle 1.5 second ka silence zaroori hai. Stinger sirf climax par.`,
    payoffLead: 'Payoff:'
  },
  en: {
    hooks: {
      confession: (c) => `I have never told anyone this… whatever happened in that ${c.settingShort}, after that I stopped sleeping alone.`,
      warning: (c) => `Do not watch this — especially after ${c.time}. If you are already watching, at least do not watch it alone.`,
      question: (c) => `Have you ever felt, in a ${c.settingShort}, like something was staring at you… but did not dare to turn around?`,
      'cold-open': (c) => `It was ${c.time}. The ${c.settingLabel} was completely empty. And then… the ${c.object} moved, completely on its own.`,
      'found-footage': (c) => `What you are about to see never reached the police. It sat on my laptop for six days… until I watched it myself.`,
      timestamp: (c) => `Save this timestamp: ${c.time}. Because what I am about to tell you began that night in the ${c.settingShort}.`,
      rules: (c) => `If you ever get stuck in a ${c.settingShort} after ${c.time}, remember three rules. I broke the third one.`,
      disbelief: (c) => `I did not believe in ghosts at all. Then one night I saw myself… standing right in front of me.`,
      'recorded-call': (c) => `I deleted this recording. Last night it was back in my gallery. The voice is mine… but I was never there that night.`,
      listicle: (c) => `Three things you never do in a ${c.settingShort}. I did the third one… and now I am making this video.`
    },
    setup: (c) => [
      `It was ${c.time}. I was in the ${c.settingLabel}, ${c.companion}.`,
      `Outside it was pitch dark, and the only sound in the ${c.settingShort} was ${c.sound}.`
    ],
    wrongness: (c) => [
      `At first I did not understand. Then the ${c.object} started moving — completely on its own.`,
      `Then the temperature dropped. ${c.soundCap} started up — from inside the ${c.settingShort} itself.`,
      `My eyes fell on the ${c.object}. Something was written on it… a message I never typed.`
    ],
    escalation: (c) => [
      `I checked the ${c.object}. What I found… should not have been possible.`,
      `With every step, ${c.sound} grew louder. Now it was not outside the ${c.settingShort} — it was right behind me.`,
      `I tried to turn around. But I knew — the moment I did, this story would end right there.`,
      `My phone light died. And in the dark, ${c.sound} had formed a pattern.`
    ],
    lockin: (c) => [
      `The door shut. From the outside. The lock clicked so clearly it felt like someone was teaching me a lesson.`,
      `I tried to run. There were paths… but every path pulled me back into the ${c.settingShort}.`,
      `Then ${c.sound} stopped completely. Silence… and nothing is more terrifying than silence.`
    ],
    twistLead: (c) => [
      'And then I understood where I had gone wrong…',
      'One detail finally clicked, something I had not noticed all night…',
      'I thought the story ended there. Then…'
    ],
    residue: (c) => [
      `I still go back to the ${c.settingShort}. But never after ${c.time}.`,
      `If you ever enter a ${c.settingShort}, do one thing — do not look back.`,
      `I deleted this video. You just watched it. Think about that… why?`,
      `That thing is still there. Just waiting for someone to come alone again.`,
      `And by the way — wherever you are listening to this… it is dark there too, right?`
    ],
    ctas: [
      'Comment just this: “I am not alone.” And share it… but do not watch it alone.',
      'Save this — the next part is even worse. And comment with your timestamp.',
      'Follow. And if you dare, at 3:03 AM tonight look out of your window… then comment.',
      'If you liked this story, like it. If it felt real… may God help you.'
    ],
    soundDesign: (c) => `Room tone + low drone (40–60 Hz). Record the ${c.object} sound close-mic. Keep 1.5 s of silence before the twist. One single stinger at the climax.`,
    payoffLead: 'Payoff:'
  }
};

const GENRE_FLAVOR = {
  psychological: {
    hn: 'Sabse darawna yeh nahi tha ki woh mujhe dekh raha tha… darawna yeh tha ki mujhe is sab se koi hairani nahi ho rahi thi.',
    en: 'The terrifying part was not that it was watching me… it was that none of this surprised me anymore.' },
  folk: {
    hn: 'Daadi hamesha kehti thi — peepal ke neeche rukna nahi, aur pichhe se aawaz aaye to palatna nahi.',
    en: 'My grandmother always said — never stop under the peepal tree, and if a voice calls from behind, never turn.' },
  paranormal: {
    hn: 'Ghar ki har cheez waisi hi thi — sirf ek cheez alag thi. Woh cheez 21 saal purani thi.',
    en: 'Everything in the house was exactly as before — only one thing was different. That thing was 21 years old.' },
  tech: {
    hn: 'Phone ki settings mein ek option tha jo maine kabhi nahi dekha tha. Naam tha: “Do not disturb — it.”',
    en: 'There was a setting in my phone I had never seen. It was called: “Do not disturb — it.”' },
  'urban-legend': {
    hn: 'Yeh kahani sunane wale pichle teen log ab is shehar mein nahi hain. Do ne shehar chhod diya. Teesre ne…',
    en: 'The last three people who told this story are no longer in this city. Two left. The third…' },
  cosmic: {
    hn: 'Aasman mein woh raat ek tarah ka khaali pan tha — jaise upar kuch hai, aur woh neeche dekh raha hai.',
    en: 'That night the sky felt like a kind of emptiness — as if something above was looking down.' },
  creature: {
    hn: 'Zameen par nishaan the. Chaar pair the… par chaar pair insaan ke nahi the.',
    en: 'There were marks on the ground. Four legs… but none of them human.' },
  possession: {
    hn: 'Mujhe pata tha ki main control kho raha hoon. Par sabse darawna yeh tha ki mujhe control pasand aa raha tha.',
    en: 'I knew I was losing control. The worst part? I was starting to like it.' },
  liminal: {
    hn: 'Woh jagah jaani-pehchani thi. Par har baar jab main mudta tha… kuch ek inch alag hota tha.',
    en: 'The place felt familiar. But every time I turned… something was one inch different.' },
  ritual: {
    hn: 'Diwaar par woh chaupai abhi bhi thi. Aur mitti abhi bhi garam thi.',
    en: 'The verse was still written on the wall. And the soil was still warm.' }
};

const TWIST_LINES = {
  hn: {
    'mimic-voice': 'Aur phir samajh aaya — woh awaaz meri thi. Par main us waqt kuch bol hi nahi raha tha.',
    'own-phone': 'Call abhi bhi connected thi. Timer chal raha tha — 47 minutes. Woh call maine khud ko ki thi.',
    'repeat-tonight': 'Yeh sab aaj raat phir hone wala hai. Kyunki ab main yeh kahani suna raha hoon… aur woh sun raha hai.',
    'friend-never': 'Maine dost ko dekha. Phir phone uthaya — uske purane messages. Woh raat ko kabhi aaya hi nahi tha.',
    'rule-protection': 'Rules teen nahi the. Chaar the. Teesra rule isliye tha taaki tum uski taraf dekho hi na… kyunki dekhte hi woh jaan jaata hai ki tum ghar kaise jaoge.',
    'narrator-entity': 'Yeh sun kar lagta hai ki main insaan hoon? Phir socho — maine yeh kis waqt likhi… jab mujhe likhna aata hi nahi tha.',
    'listener-next': 'Aur haan — jis headphone se tum yeh sun rahe ho, usme abhi bhi woh background noise hai. Dhyan se suno… woh noise tumhare kamre ki hai.',
    'mirror-lag': 'Maine aaina saaf kiya. Mera reflection… do second late tha. Aur abhi bhi woh do second late hai.',
    'recording-continued': 'Recording chaar second aur chali. Usme meri awaaz aayi — “woh abhi bhi peeche khada hai.” Maine yeh recording aaj tak kisi ko nahi dikhayi.',
    'imaginary-friend': 'Meri maa ne kaha, “bachpan mein tera ek dost tha na?” Maine kaha haan. Woh boli — “par humne tujhe akela paida kiya tha.”',
    'other-you': 'Phone par ek photo aayi. Woh main tha — ${settingShort} mein. Par us raat main wahan tha hi nahi… toh photo kisne kheenchi?',
    'sleep-figure': 'Neend tooti to woh abhi bhi corner mein baitha tha. Usne sirf itna kaha — “ab tu jaag gaya… ab hum shuru karte hain.”'
  },
  en: {
    'mimic-voice': 'And then it hit me — the voice was mine. But I was not speaking at all.',
    'own-phone': 'The call was still connected. The timer read 47 minutes. I had called myself.',
    'repeat-tonight': 'All of this is going to happen again tonight. Because now I am telling this story… and it is listening.',
    'friend-never': 'I saw my friend. Then I checked my phone — old messages. He never came that night at all.',
    'rule-protection': 'There were not three rules. There were four. The third one existed so you would never look at it… because once you look, it learns the way you go home.',
    'narrator-entity': 'You think I am human, hearing this? Then ask yourself — at what time did I write this… when I never learned to write.',
    'listener-next': 'And by the way — those headphones you are wearing, the background noise is still in them. Listen closely… that noise is from your room.',
    'mirror-lag': 'I cleaned the mirror. My reflection… was two seconds late. It still is.',
    'recording-continued': 'The recording kept going for four more seconds. My voice said — “it is still standing behind me.” I have never shown anyone this recording.',
    'imaginary-friend': 'My mother said, “you had a friend as a child, right?” I said yes. She said — “but we had you as an only child.”',
    'other-you': 'A photo arrived on my phone. It was me — in the ${settingShort}. But I was never there that night… so who took the photo?',
    'sleep-figure': 'When sleep broke, it was still sitting in the corner. It said just one thing — “now you are awake… now we can begin.”'
  }
};

/* ------------------------------ Generation -------------------------------- */

function beatPlan(seconds) {
  if (seconds <= 30) return ['hook', 'setup', 'wrongness', 'escalation', 'twist', 'residue'];
  if (seconds <= 90) return ['hook', 'setup', 'wrongness', 'wrongness', 'escalation', 'lockin', 'twist', 'residue'];
  return ['hook', 'setup', 'wrongness', 'escalation', 'wrongness', 'escalation', 'lockin', 'twist', 'residue', 'residue'];
}

function beatLabels(b) {
  return { hook: 'Hook', setup: 'Setup', wrongness: 'First wrongness', escalation: 'Escalation', lockin: 'Point of no return', twist: 'Twist / payoff', residue: 'Residue + CTA' }[b];
}

function beatWeights(plan) {
  const w = { hook: 0.09, setup: 0.16, wrongness: 0.19, escalation: 0.2, lockin: 0.12, twist: 0.16, residue: 0.08 };
  const total = plan.reduce((s, b) => s + w[b], 0);
  return plan.map(b => w[b] / total);
}

function timestamps(seconds, plan) {
  const weights = beatWeights(plan);
  const fmt = (s) => {
    const r = Math.round(s);
    return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`;
  };
  let cursor = 0;
  return plan.map((b, i) => {
    const start = cursor;
    cursor += weights[i] * seconds;
    return `${fmt(start)}–${fmt(cursor)}`;
  });
}

function titleOptions(rng, c, lang) {
  const bank = lang === 'hn' ? [
    `${c.settingName} Mein ${c.time} Ke Baad Kabhi Akele Mat Jana`,
    `Main Akela Nahi Tha — ${c.settingName} Ki Sacchai`,
    `Woh ${c.time} Ki Raat — ${c.settingName} Ka Raaz`,
    `${c.settingName}: Jo Police Ko Kabhi Nahi Mili Kahani`,
    `Save Kar Lo: ${c.time} Ki Woh Galti`,
    `${c.settingName} Ka Woh Aakhri Din`,
    `Agar Yeh Video Tak Pahunch Gayi… To Der Ho Chuki Hai`,
    `${c.objectCap} Khud Bola — “Peeche Dekho”`
  ] : [
    `Never Go Into the ${c.settingName} After ${c.time}`,
    `I Was Not Alone — the Truth About the ${c.settingName}`,
    `That ${c.time} Night — the Secret of the ${c.settingName}`,
    `The ${c.settingName}: the Story the Police Never Found`,
    `Save This: the Mistake I Made at ${c.time}`,
    `My Last Day in the ${c.settingName}`,
    `If This Video Reached You… It Is Already Too Late`,
    `My ${c.objectCap} Spoke by Itself — “Look Behind You”`
  ];
  const options = new Set();
  while (options.size < 3) options.add(pick(rng, bank));
  return [...options];
}

function makeContext(rng, lang, settings, entities) {
  const setting = pick(rng, settings);
  const entity = pick(rng, entities);
  const object = pick(rng, OBJECTS[lang]);
  const sound = pick(rng, SOUNDS[lang]);
  return {
    setting, entity, object, sound,
    time: pick(rng, TIMES),
    settingLabel: setting.label,
    settingLc: setting.label[0].toLowerCase() + setting.label.slice(1),
    settingShort: setting.short,
    settingName: setting.name,
    objectCap: object[0].toUpperCase() + object.slice(1),
    soundCap: sound[0].toUpperCase() + sound.slice(1),
    companion: lang === 'hn'
      ? pick(rng, ['bilkul akela', 'bas ek dost ke saath', 'night-shift staff ke saath', 'bas security guard ke saath'])
      : pick(rng, ['completely alone', 'with just one friend', 'with the night-shift staff', 'with only the security guard'])
  };
}

const pickDistinct = (rng, arr, used) => {
  for (let i = 0; i < 12; i++) {
    const v = pick(rng, arr);
    if (!used.has(v)) { used.add(v); return v; }
  }
  return pick(rng, arr);
};

export function generateScript(rng, index, opts) {
  const lang = opts.language === 'mixed' ? pick(rng, ['hn', 'en']) : (opts.language === 'english' ? 'en' : 'hn');
  const f = FRAGMENT[lang];
  const c = makeContext(rng, lang, opts.settings, opts.entities);
  const hookStyle = pick(rng, opts.hookStyles);
  const twist = pick(rng, opts.twists);
  const subgenre = pick(rng, opts.subgenres);
  const voice = pick(rng, VOICES);
  const platform = opts.platform ? PLATFORMS.find(p => p.id === opts.platform) : pick(rng, PLATFORMS);
  const duration = opts.duration ? DURATIONS.find(d => d.id === opts.duration) : pick(rng, DURATIONS);
  const plan = beatPlan(duration.seconds);
  const stamps = timestamps(duration.seconds, plan);

  const usedLines = {};
  const lineFor = (beat) => {
    const used = usedLines[beat] ??= new Set();
    switch (beat) {
      case 'hook': return f.hooks[hookStyle.id](c);
      case 'setup': return pickDistinct(rng, f.setup(c), used);
      case 'wrongness': return pickDistinct(rng, f.wrongness(c), used);
      case 'escalation': return pickDistinct(rng, f.escalation(c), used);
      case 'lockin': return pickDistinct(rng, f.lockin(c), used);
      case 'twist': {
        const lead = pick(rng, f.twistLead(c));
        return `${lead} ${TWIST_LINES[lang][twist.id].replace('${settingShort}', c.settingShort)}`;
      }
      case 'residue': return pickDistinct(rng, f.residue(c), used);
    }
  };

  const beats = plan.map((beat, i) => ({ t: stamps[i], beat: beatLabels(beat), kind: beat, line: lineFor(beat) }));
  // Entity flavor ko second wrongness beat mein jodo (ya middle escalation mein).
  const wrongIdx = beats.map((b, i) => b.kind === 'wrongness' ? i : -1).filter(i => i >= 0);
  const target = wrongIdx.length > 1 ? wrongIdx[1] : Math.floor(beats.length / 2);
  beats[target].line += ` ${c.entity.flavor[lang]}`;
  // Genre flavor ko pehle escalation beat mein jodo (alag jagah).
  const escIdx = beats.map((b, i) => b.kind === 'escalation' ? i : -1).filter(i => i >= 0 && i !== target);
  if (escIdx.length) beats[escIdx[0]].line += ` ${GENRE_FLAVOR[subgenre.id][lang]}`;
  const hooks = [f.hooks[hookStyle.id](c), pick(rng, f.wrongness(c)), pick(rng, f.residue(c))];
  const cta = pick(rng, f.ctas);

  return {
    id: `H-${String(index + 1).padStart(4, '0')}`,
    signature: [subgenre.id, c.setting.id, c.entity.id, hookStyle.id, twist.id, voice.id, platform.id, duration.id].join('|'),
    language: lang === 'hn' ? 'Hinglish' : 'English',
    platform: platform.id,
    duration: duration.id,
    seconds: duration.seconds,
    genre: subgenre.label,
    setting: c.setting.label,
    entity: c.entity.label,
    hookStyle: hookStyle.label,
    twist: twist.label,
    voice: voice.label,
    titleOptions: titleOptions(rng, c, lang),
    hooks,
    script: beats,
    twistLine: TWIST_LINES[lang][twist.id].replace('${settingShort}', c.settingShort),
    entityFlavor: c.entity.flavor[lang],
    cta,
    soundDesign: f.soundDesign(c),
    tags: (lang === 'hn'
      ? ['#HorrorStory', '#HindiHorror', `#${c.setting.short.replace(/[^a-zA-Z]/g, '') || 'ScaryStory'}`, '#RaatKiKahani', '#TrueHorror']
      : ['#HorrorStory', '#ScaryStory', '#Creepypasta', '#HorrorTok', '#Nightmare']).filter(t => t.length > 1),
    _meta: {
      ids: { subgenre: subgenre.id, setting: c.setting.id, entity: c.entity.id, hook: hookStyle.id, twist: twist.id, voice: voice.id, platform: platform.id, duration: duration.id },
      hookStrengthBase: hookStyle.strength,
      twistStrengthBase: twist.strength,
      relatability: c.setting.relatability
    }
  };
}

export function generateScripts({ count = 2000, seed = 42, language = 'mixed', platform = null, duration = null } = {}) {
  if (!Number.isInteger(count) || count < 1 || count > 5000) throw new Error('count must be an integer between 1 and 5000.');
  const opts = {
    language, platform, duration,
    subgenres: SUBGENRES, settings: SETTINGS, entities: ENTITIES,
    hookStyles: HOOK_STYLES, twists: TWISTS
  };
  const rng = mulberry32(seed);
  const scripts = [];
  const seen = new Set();
  let index = 0;
  let attempts = 0;
  while (scripts.length < count) {
    if (attempts++ > count * 50) throw new Error('Not enough unique combinations for this filter set.');
    const s = generateScript(rng, index, opts);
    if (seen.has(s.signature)) continue;
    seen.add(s.signature);
    scripts.push(s);
    index++;
  }
  return scripts;
}

/* --------------------------------- Scoring -------------------------------- */

const HN_LEX = {
  fear: ['dar', 'khauf', 'haath kaanp', 'saans', 'dil', 'chilla', 'bhag', 'andhera', 'sannata', 'thand', 'bu', 'rooh', 'aatma', 'kaanp'],
  escalate: ['phir', 'tabhi', 'aur fir', 'har step', 'tez', 'band', 'bujh', 'rasta', 'peeche', 'lock', 'bhag'],
  openLoop: ['kyun', 'kaise', 'raaz', 'sawal', 'par ', 'lekin', 'kya', 'socho', 'phir kya', 'kabhi']
};
const EN_LEX = {
  fear: ['afraid', 'fear', 'trembling', 'breath', 'heart', 'scream', 'ran', 'dark', 'silence', 'cold', 'smell', 'spirit', 'ghost', 'shiver'],
  escalate: ['then', 'louder', 'stopped', 'died', 'behind', 'lock', 'every step', 'pattern', 'tried'],
  openLoop: ['why', 'how', 'secret', 'question', 'but', 'yet', 'what', 'think', 'never', 'until']
};

function sentences(text) { return text.split(/(?<=[.!?…])\s+/).filter(Boolean); }

function countHits(text, words) {
  const t = text.toLowerCase();
  return words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
}

export function scoreScript(script, corpus) {
  const lex = script.language === 'Hinglish' ? HN_LEX : EN_LEX;
  const body = script.script.map(b => b.line).join(' ');
  const hookText = script.hooks[0] + ' ' + (script.script[0]?.line || '');
  const all = body + ' ' + script.hooks.join(' ') + ' ' + script.cta;

  const hook = Math.min(1, script._meta.hookStrengthBase
    + (/\?/.test(hookText) ? 0.05 : 0)
    + (/\d/.test(hookText) ? 0.05 : 0)
    + (/mat dekho|do not watch|akela mat|do not look/i.test(hookText) ? 0.05 : 0));

  const curiosity = Math.min(1, 0.24 + 0.085 * countHits(body, lex.openLoop) + (script._meta.twistStrengthBase - 0.8) * 0.8);

  const mid = script.script.slice(1, -1).map(b => b.line).join(' ');
  const tension = Math.min(1, 0.18 + 0.07 * countHits(mid, lex.escalate) + (script.script.some(b => b.kind === 'lockin') ? 0.12 : 0));

  const payoff = Math.min(1, script._meta.twistStrengthBase
    + (/tum|you|your/i.test(script.twistLine) ? 0.05 : 0));

  const sents = sentences(all);
  const shortRatio = sents.filter(s => s.split(/\s+/).length <= 12).length / Math.max(1, sents.length);
  const pacing = Math.min(1, 0.32 + 0.42 * shortRatio + (script.script.length <= Math.ceil(script.seconds / 8) + 3 ? 0.12 : 0));

  const specificity = Math.max(0, Math.min(1, 0.18
    + (/\d/.test(body) ? 0.12 : 0)
    + 0.045 * countHits(body, lex.fear)
    + (script._meta.relatability - 0.75) * 0.9));

  const emotion = Math.min(1, 0.2 + 0.05 * countHits(all, lex.fear) + script._meta.relatability * 0.32);

  const key3 = `${script._meta.ids.hook}|${script._meta.ids.twist}|${script._meta.ids.setting}`;
  const freq = corpus?.key3?.get(key3) ?? 1;
  const novelty = Math.max(0.3, 1 - (freq - 1) / Math.max(4, (corpus?.n ?? 1) / 25));

  const ctaStrength = Math.min(1, 0.5
    + (/comment/i.test(script.cta) ? 0.15 : 0)
    + (/save|share|follow/i.test(script.cta) ? 0.15 : 0)
    + (/\?|himmat|dare/i.test(script.cta) ? 0.1 : 0));

  const ideal = PLATFORMS.find(p => p.id === script.platform)?.ideal ?? [15, 90];
  const platformFit = script.seconds >= ideal[0] && script.seconds <= ideal[1] ? 1 : 0.45;

  const factors = { hook, curiosity, tension, payoff, pacing, specificity, emotion, novelty, ctaStrength, platformFit };
  const weights = { hook: 0.18, curiosity: 0.12, tension: 0.16, payoff: 0.14, pacing: 0.1, specificity: 0.08, emotion: 0.08, novelty: 0.06, ctaStrength: 0.04, platformFit: 0.04 };
  const raw = Object.entries(weights).reduce((s, [k, w]) => s + factors[k] * w, 0) * 100;
  // Composite engagement index: weighted raw ko median ke around amplify karte hain
  // taaki verdict buckets (chalega/borderline/nahi chalega) comparison ke liye meaningful rahein.
  const total = Math.max(0, Math.min(100, 72 + (raw - 72) * 2));

  const flags = [];
  if (hook < 0.8) flags.push('hook thoda slow hai');
  if (payoff < 0.85) flags.push('payoff flat ho sakta hai');
  if (tension < 0.6) flags.push('tension curve kamzor');
  if (platformFit < 1) flags.push('duration-platform mismatch');

  return {
    total: Math.round(total * 10) / 10,
    verdict: total >= 75 ? 'chalega' : total >= 62 ? 'borderline' : 'nahi chalega',
    factors: Object.fromEntries(Object.entries(factors).map(([k, v]) => [k, Math.round(v * 100) / 100])),
    flags
  };
}

export function scoreScripts(scripts) {
  const key3 = new Map();
  for (const s of scripts) {
    const k = `${s._meta.ids.hook}|${s._meta.ids.twist}|${s._meta.ids.setting}`;
    key3.set(k, (key3.get(k) ?? 0) + 1);
  }
  const corpus = { key3, n: scripts.length };
  for (const s of scripts) s.score = scoreScript(s, corpus);
  return scripts;
}

/* ------------------------------- Analysis --------------------------------- */

function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return 0;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

function groupScores(scripts, keyFn) {
  const groups = new Map();
  for (const s of scripts) {
    const k = keyFn(s);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(s.score.total);
  }
  return [...groups.entries()]
    .map(([name, scores]) => ({ name, count: scores.length, avg: Math.round(mean(scores) * 10) / 10 }))
    .sort((a, b) => b.avg - a.avg);
}

export function analyzeScripts(scripts) {
  const totals = scripts.map(s => s.score.total).sort((a, b) => a - b);
  const verdicts = { chalega: 0, borderline: 0, 'nahi chalega': 0 };
  for (const s of scripts) verdicts[s.score.verdict]++;

  const factorNames = Object.keys(scripts[0].score.factors);
  const factorAvg = {};
  const correlations = {};
  const totalsUnsorted = scripts.map(s => s.score.total);
  for (const f of factorNames) {
    const vals = scripts.map(s => s.score.factors[f]);
    factorAvg[f] = Math.round(mean(vals) * 100) / 100;
    correlations[f] = Math.round(pearson(vals, totalsUnsorted) * 100) / 100;
  }

  const byRank = [...scripts].sort((a, b) => b.score.total - a.score.total);

  return {
    count: scripts.length,
    meanScore: Math.round(mean(totals) * 10) / 10,
    medianScore: totals[Math.floor(totals.length / 2)],
    minScore: totals[0],
    maxScore: totals[totals.length - 1],
    verdicts,
    factorAvg,
    correlations,
    top: byRank.slice(0, 10).map(s => ({ id: s.id, title: s.titleOptions[0], score: s.score.total, verdict: s.score.verdict, genre: s.genre, hookStyle: s.hookStyle, twist: s.twist })),
    bottom: byRank.slice(-5).reverse().map(s => ({ id: s.id, title: s.titleOptions[0], score: s.score.total, verdict: s.score.verdict, genre: s.genre, hookStyle: s.hookStyle, twist: s.twist })),
    groups: {
      subgenre: groupScores(scripts, s => s.genre),
      hookStyle: groupScores(scripts, s => s.hookStyle),
      twist: groupScores(scripts, s => s.twist),
      setting: groupScores(scripts, s => s.setting),
      platform: groupScores(scripts, s => s.platform),
      duration: groupScores(scripts, s => s.duration),
      language: groupScores(scripts, s => s.language)
    },
    topScript: byRank[0]
  };
}

/* ----------------------------- Trend analysis ----------------------------- */
// Inputs are user-supplied scenario ratings (0–10) + evidence text. The verdict is a
// structural hypothesis — NOT verified live trend data. Same boundary as Trend Scout.

const TREND_WEIGHTS = {
  demandSignal: 0.22, hookPotential: 0.18, repeatability: 0.14,
  feasibility: 0.12, saturation: 0.14, longevity: 0.1, platformBreadth: 0.1
};

export function analyzeTrends(trends) {
  if (!Array.isArray(trends) || !trends.length) throw new Error('Provide a non-empty trends array.');
  const ranked = trends.map((t, i) => {
    for (const k of ['demandSignal', 'hookPotential', 'repeatability', 'productionDifficulty', 'saturation', 'longevityMonths', 'platformCount']) {
      if (typeof t[k] !== 'number' || t[k] < 0) throw new Error(`trend[${i}].${k} must be a number >= 0.`);
    }
    const feasibility = Math.max(0, 11 - t.productionDifficulty) / 10;
    const longevity = Math.min(1, t.longevityMonths / 12);
    const breadth = Math.min(1, t.platformCount / 5);
    const parts = {
      demandSignal: t.demandSignal / 10,
      hookPotential: t.hookPotential / 10,
      repeatability: t.repeatability / 10,
      feasibility,
      saturation: 1 - t.saturation / 10,
      longevity,
      platformBreadth: breadth
    };
    const score = Math.round(Object.entries(TREND_WEIGHTS).reduce((s, [k, w]) => s + parts[k] * w, 0) * 1000) / 10;

    const strengths = [];
    const risks = [];
    if (t.demandSignal >= 7) strengths.push(`Demand signal strong hai (${t.demandSignal}/10)`);
    if (t.hookPotential >= 8) strengths.push(`Hook potential bahut high hai (${t.hookPotential}/10) — first-3-seconds mein kaam banega`);
    if (t.repeatability >= 7) strengths.push(`Repeatable format hai (${t.repeatability}/10) — series bana sakte ho`);
    if (t.productionDifficulty <= 4) strengths.push(`Production easy hai (difficulty ${t.productionDifficulty}/10) — batch mein chalega`);
    if (t.longevityMonths >= 8) strengths.push(`Longevity achhi hai (~${t.longevityMonths} months)`);
    if (t.saturation >= 7) risks.push(`Saturation zyada hai (${t.saturation}/10) — alag angle zaroori`);
    if (t.demandSignal <= 4) risks.push(`Demand signal kamzor hai (${t.demandSignal}/10)`);
    if (t.hookPotential <= 5) risks.push(`Hook potential low hai (${t.hookPotential}/10) — scroll mein rukega nahi`);
    if (t.productionDifficulty >= 7) risks.push(`Production heavy hai (difficulty ${t.productionDifficulty}/10) — consistent rehna mushkil`);
    if (t.longevityMonths <= 4) risks.push(`Jaldi fade hoga (~${t.longevityMonths} months) — short campaign ke liye theek`);
    if (!strengths.length) strengths.push('Koi strong lever nahi — sab inputs middle-of-the-road hain');
    if (!risks.length) risks.push('Major red flags nahi — baseline ke saath chalo, differentiation khud laani hogi');

    return {
      name: t.name, category: t.category ?? '', score,
      verdict: score >= 70 ? 'chalega' : score >= 55 ? 'risky' : 'nahi chalega',
      strengths, risks,
      evidence: t.evidence ?? '',
      recommendation: t.recommendation ?? '',
      inputs: { ...t }
    };
  }).sort((a, b) => b.score - a.score);

  const spread = {
    chalega: ranked.filter(t => t.verdict === 'chalega').length,
    risky: ranked.filter(t => t.verdict === 'risky').length,
    'nahi chalega': ranked.filter(t => t.verdict === 'nahi chalega').length
  };

  return {
    ranked, spread,
    winner: ranked[0],
    loser: ranked[ranked.length - 1],
    caveat: 'Yeh verdicts structural hypothesis hain (aapke supplied evidence + scenario ratings se). Live platform trend data verify nahi kiya gaya — publish se pehle apni analytics aur recent observations se cross-check karo.'
  };
}

/* -------------------------------- Reports --------------------------------- */

const VERDICT_ICON = { chalega: '🔥', risky: '⚠️', 'nahi chalega': '❌', borderline: '⚠️' };

export function scriptsToCSV(scripts) {
  const cols = ['id', 'title', 'language', 'platform', 'duration', 'genre', 'setting', 'entity', 'hookStyle', 'twist', 'total', 'verdict'];
  const factors = Object.keys(scripts[0].score.factors);
  const header = [...cols, ...factors, 'flags'].join(',');
  const rows = scripts.map(s => {
    const cells = [
      s.id, `"${s.titleOptions[0].replace(/"/g, "'")}"`, s.language, s.platform, s.duration,
      `"${s.genre}"`, `"${s.setting}"`, `"${s.entity}"`, `"${s.hookStyle}"`, `"${s.twist}"`,
      s.score.total, s.score.verdict,
      ...factors.map(f => s.score.factors[f]),
      `"${s.score.flags.join('; ')}"`
    ];
    return cells.join(',');
  });
  return [header, ...rows].join('\n');
}

export function trendsToCSV(trendAnalysis) {
  const header = 'rank,name,category,score,verdict,strengths,risks';
  const rows = trendAnalysis.ranked.map((t, i) =>
    [i + 1, `"${t.name}"`, `"${t.category}"`, t.score, t.verdict, `"${t.strengths.join('; ')}"`, `"${t.risks.join('; ')}"`].join(','));
  return [header, ...rows].join('\n');
}

export function renderFlagship(script) {
  const lines = script.script.map(b => `**${b.t} · ${b.beat}**\n\n> ${b.line}`).join('\n\n');
  return `# 🔥 Flagship Horror Script — ${script.titleOptions[0]}

> Batch ka #1 ranked script (score **${script.score.total}/100** — ${VERDICT_ICON[script.score.verdict]} ${script.score.verdict}).
> Genre: ${script.genre} · Setting: ${script.setting} · Entity: ${script.entity}
> Hook style: ${script.hookStyle} · Twist: ${script.twist} · ${script.language} · ${script.platform} · ${script.duration}

## Alternate titles

${script.titleOptions.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## Alternate hooks (A/B test)

${script.hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}

## Spoken script

${lines}

## Twist line

> ${script.twistLine}

Entity flavor beat (kahani mein kahin insert karo):

> ${script.entityFlavor}

## CTA

${script.cta}

## Sound design

${script.soundDesign}

## Tags

${script.tags.join(' ')}

## Score breakdown

${Object.entries(script.score.factors).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
- **Total: ${script.score.total}/100 → ${VERDICT_ICON[script.score.verdict]} ${script.score.verdict}**
${script.score.flags.length ? `\nFlags: ${script.score.flags.join(', ')}` : ''}

---
Generated by Sansi Horror Script Factory. Structural engagement score hai, guaranteed reach nahi — apni analytics se validate karo.
`;
}

export function renderReport({ scripts, analysis, trendAnalysis, meta }) {
  const V = VERDICT_ICON;
  const trendSection = trendAnalysis ? `
## 📈 Trend verdict — kaun sa trend chalega, kaunsa nahi?

${trendAnalysis.caveat}

| # | Trend | Score | Verdict | Kyun (strengths) | Risks |
|---|-------|-------|---------|------------------|-------|
${trendAnalysis.ranked.map((t, i) => `| ${i + 1} | **${t.name}** | ${t.score} | ${V[t.verdict]} **${t.verdict}** | ${t.strengths.join(' · ') || '—'} | ${t.risks.join(' · ') || '—'} |`).join('\n')}

**Summary:** ${trendAnalysis.spread.chalega} trend chalenge · ${trendAnalysis.spread.risky} risky · ${trendAnalysis.spread['nahi chalega']} nahi chalenge.

**Winner:** ${trendAnalysis.winner.name} (${trendAnalysis.winner.score}) — ${trendAnalysis.winner.recommendation || 'best overall structural fit'}
**Avoid / rethink:** ${trendAnalysis.loser.name} (${trendAnalysis.loser.score})
` : '';

  return `# Horror Script Factory — Batch Report

Batch: **${meta.count} scripts** · seed ${meta.seed} · language ${meta.language} · generated ${meta.generatedAt}

> ${V.chalega} chalega (≥75) · ${V.borderline} borderline (62–74) · ${V['nahi chalega']} nahi chalega (<62)
> Scores structural engagement signals hain (hook, tension, payoff…), guaranteed reach nahi.

## 🎯 Top 10 scripts (leaderboard)

| # | ID | Title | Score | Verdict | Genre | Hook | Twist |
|---|----|-------|-------|---------|-------|------|-------|
${analysis.top.map((s, i) => `| ${i + 1} | ${s.id} | ${s.title} | **${s.score}** | ${V[s.verdict]} ${s.verdict} | ${s.genre} | ${s.hookStyle} | ${s.twist} |`).join('\n')}

## 📉 Bottom 5 (inka pattern avoid karo)

${analysis.bottom.map(s => `- **${s.id}** (${s.score}) — ${s.title} · ${s.hookStyle} · ${s.twist}`).join('\n')}

## 📊 Distribution

- Mean score: **${analysis.meanScore}** · Median: **${analysis.medianScore}** · Range: ${analysis.minScore}–${analysis.maxScore}
- Verdicts: ${V.chalega} chalega **${analysis.verdicts.chalega}** (${Math.round(analysis.verdicts.chalega / analysis.count * 100)}%) · ${V.borderline} borderline **${analysis.verdicts.borderline}** · ${V['nahi chalega']} nahi chalega **${analysis.verdicts['nahi chalega']}**

## 🧠 Kya cheez engagement badhati hai? (factor analysis)

| Factor | Avg (0–1) | Score se correlation |
|--------|-----------|----------------------|
${Object.entries(analysis.correlations).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${analysis.factorAvg[k]} | ${v >= 0 ? '+' : ''}${v} |`).join('\n')}

> Correlation jitna high, utna zyada impact — in factors par dhyan do.

## ⚖️ Group comparison — kis type ki scripts sabse zyada chalti hain

### By subgenre
${analysis.groups.subgenre.map(g => `- **${g.name}** — avg ${g.avg} (n=${g.count})`).join('\n')}

### By hook style
${analysis.groups.hookStyle.map(g => `- **${g.name}** — avg ${g.avg} (n=${g.count})`).join('\n')}

### By twist
${analysis.groups.twist.slice(0, 6).map(g => `- **${g.name}** — avg ${g.avg} (n=${g.count})`).join('\n')}

### By setting (top 6)
${analysis.groups.setting.slice(0, 6).map(g => `- **${g.name}** — avg ${g.avg} (n=${g.count})`).join('\n')}

### By platform
${analysis.groups.platform.map(g => `- **${g.name}** — avg ${g.avg} (n=${g.count})`).join('\n')}

### By duration
${analysis.groups.duration.map(g => `- **${g.name}** — avg ${g.avg} (n=${g.count})`).join('\n')}

### By language
${analysis.groups.language.map(g => `- **${g.name}** — avg ${g.avg} (n=${g.count})`).join('\n')}

## ✅ Key takeaways (auto-generated)

1. **Winning hook style:** ${analysis.groups.hookStyle[0].name} (avg ${analysis.groups.hookStyle[0].avg}) — sabse kamzor: ${analysis.groups.hookStyle.at(-1).name} (${analysis.groups.hookStyle.at(-1).avg}).
2. **Winning twist:** ${analysis.groups.twist[0].name} (avg ${analysis.groups.twist[0].avg}) — is pattern ko repeat karo.
3. **Strongest engagement drivers:** ${Object.entries(analysis.correlations).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} (${v >= 0 ? '+' : ''}${v})`).join(', ')} — in factors par sabse zyada dhyan do.
4. **Best setting for horror:** ${analysis.groups.setting[0].name} (avg ${analysis.groups.setting[0].avg}).
5. **Platform & length:** Best platform: ${analysis.groups.platform[0].name} (avg ${analysis.groups.platform[0].avg}) · Best length: ${analysis.groups.duration[0].name} (avg ${analysis.groups.duration[0].avg}); weakest length: ${analysis.groups.duration.at(-1).name} (${analysis.groups.duration.at(-1).avg}) — bahut chhote formats mein engagement signals fit karna sabse mushkil hai.
${trendAnalysis ? `6. **Trend bet:** ${trendAnalysis.winner.name} (${trendAnalysis.winner.score}/100, ${trendAnalysis.winner.verdict}) — ${trendAnalysis.winner.recommendation || 'best structural fit'}\n7. **Avoid / rethink:** ${trendAnalysis.loser.name} (${trendAnalysis.loser.score}/100, ${trendAnalysis.loser.verdict})` : ''}
${trendSection}
---

## Files

- \`scripts.ndjson\` — har script ka full JSON (one per line)
- \`scripts.csv\` — leaderboard sheet (Google Sheets mein import karo)
- \`flagship.md\` — #1 script, readable format
${trendAnalysis ? '- `trends.csv` — trend comparison sheet' : ''}
- \`analysis.json\` — machine-readable stats

---
Sansi Horror Script Factory · deterministic (seed=${meta.seed}) · offline generation. Live trend verification included nahi hai.
`;
}
