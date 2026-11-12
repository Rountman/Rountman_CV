// Veškerý obsah webu (EN + CS). Design a animace se mění v komponentách, texty jen tady.

export type Lang = 'en' | 'cs';
export const langs: Lang[] = ['en', 'cs'];
/** Cesta stránky dané jazykové verze (bez BASE_PATH). */
export const pathFor = (lang: Lang) => (lang === 'en' ? '/' : '/cs/');

// Společné údaje, které se nepřekládají
const shared = {
  name: 'Antonín Pecka',
  title: 'Bc.',
  email: 'entonypecka@gmail.com',
  github: 'https://github.com/Rountman',
  linkedin: 'https://www.linkedin.com/in/antonin-pecka',
  avatar: 'RountmanAvatar.jpg', // v public/, zatím jen og:image
};

export type Job = {
  role: string;
  company: string;
  from: string;
  to: string;
  year: number; // rok začátku, řídí velký letopočet
  text: string;
};

export type Project = {
  name: string;
  text: string;
  stack: string[];
  url?: string; // veřejný web nebo repo; bez URL je název jen text
};

const en = {
  person: {
    ...shared,
    role: 'Full-stack web developer',
    intro:
      'Full-stack web developer. I build web applications in React and TypeScript and connect them to backends and external services.',
    location: 'Pardubice region, Czech Republic',
    cv: 'Antonin_Pecka_CV_EN.pdf', // v public/
  },
  // lead = první věta (--fg), rest = zbytek (--muted)
  about: {
    lead: 'Five years of hands-on development.',
    rest: 'I started with C#, .NET and WPF, moved to JavaScript with a Discord bot for MADMONQ that I still maintain today, and now I build full-stack web apps. I am into innovative development.',
  },
  career: [
    { role: 'AR applications', company: 'Personal projects', from: '2020', to: '2023', year: 2020, text: 'Unity and C#, Blender modelling. AR demos published on GitHub.' },
    { role: 'Software engineer', company: 'MIKROKLIMA s.r.o.', from: '2021', to: '2023', year: 2021, text: 'Embedded Wizard interfaces, WPF modernisation and Modbus/TCP tooling.' },
    { role: 'Freelance developer', company: 'Self-employed', from: '2022', to: 'now', year: 2022, text: 'Shopify theme work and Discord automation for MADMONQ.' },
    { role: 'IT operations & data analyst intern', company: 'Philip Morris International', from: 'Feb 2025', to: 'Oct 2025', year: 2025, text: 'Power BI and SQL reporting on SAP data, bills of materials and Excel exports. Coordinated a company-wide IT systems upgrade in production.' },
    { role: 'Android developer', company: 'Blendlens', from: 'Oct 2025', to: 'Mar 2026', year: 2025, text: 'The Blendscan app in Kotlin and Jetpack Compose with an Azure backend.' },
    { role: 'Full-stack web developer', company: 'PekneWeby s.r.o.', from: 'Mar 2026', to: 'now', year: 2026, text: 'React and TypeScript applications connected to backends and external services, including the frontend of the Chalupuj accommodation portal. Working directly with clients, estimating and splitting work in a small team.' },
  ] as Job[],
  projects: [
    { name: 'Chalupuj', text: 'React frontend of the Chalupuj accommodation portal.', stack: ['React'], url: 'https://chalupuj.cz' },
    { name: 'MCDM', text: 'Educational platform for multi-criteria decision making.', stack: ['React', 'Python'], url: 'https://github.com/Rountman/mcdm-edu-platform' },
    { name: 'Blendscan', text: 'Android app for Blendlens.', stack: ['Kotlin', 'Jetpack Compose', 'Azure'] },
    { name: 'ARAdventure', text: 'AR mini-game built in Unity.', stack: ['Unity', 'C#'], url: 'https://github.com/Rountman/ARAdventure' },
    { name: 'UHK HelicopterAR', text: 'Shader and AR experiments with a helicopter model.', stack: ['Unity'], url: 'https://github.com/Rountman/UHK-HelicopterAR' },
  ] as Project[],
  skills: [
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'C#', 'Kotlin', 'Python'] },
    { group: 'Web', items: ['React', 'Tailwind CSS', 'Shopify', 'Node.js', '.NET'] },
    { group: 'Data', items: ['Power BI', 'Power Query', 'SQL', 'MSSQL', 'Excel', 'SAP data'] },
    { group: 'Mobile', items: ['Android Studio', 'Jetpack Compose'] },
    { group: 'Games & XR', items: ['Unity', 'Unreal Engine', 'AR', 'VR', 'Blender'] },
    { group: 'Desktop & embedded', items: ['WPF', 'Embedded Wizard', 'Modbus/TCP'] },
    { group: 'Workflow', items: ['Git', 'Azure', 'Enterprise Architect'] },
  ],
  studies: [
    { school: 'FIM UHK', what: 'Information Management, master’s', when: '2025 – now' },
    { school: 'FIM UHK', what: 'Information Management, bachelor’s. Thesis: a practical Unreal Engine project', when: '2022 – 2025' },
    { school: 'SPŠE a VOŠ Pardubice', what: 'Programming and hardware', when: '2018 – 2022' },
  ],
  ui: {
    navLabel: 'Main',
    nav: { work: 'Work', projects: 'Projects', contact: 'Contact' },
    switchTo: 'CZ', // odkaz na druhou jazykovou verzi
    switchLabel: 'Česká verze',
    about: 'About',
    workLead: 'Six roles, from machine control panels to client web apps.',
    tools: 'Tools',
    toolsLead: 'What I have shipped with, grouped by where it runs.',
    studies: 'Studies',
    studiesLead: 'Still studying, part time.',
    contactLead: 'Open to collaborations. Write to me:',
    downloadCv: 'Download CV (PDF)',
    backToTop: 'Back to top',
  },
};

const cs: typeof en = {
  person: {
    ...shared,
    role: 'Full-stack webový vývojář',
    intro:
      'Full-stack webový vývojář. Stavím webové aplikace v Reactu a TypeScriptu a napojuji je na backendy a externí služby.',
    location: 'Pardubický kraj, Česko',
    cv: 'Antonin_Pecka_CV.pdf', // v public/
  },
  about: {
    lead: 'Pět let praxe.',
    rest: 'Začínal jsem s C#, .NET a WPF, pak přešel na JavaScript s Discord botem pro MADMONQ, kterého udržuji dodnes, a dnes stavím full-stack webové aplikace. Baví mě inovativní vývoj.',
  },
  career: [
    { role: 'AR aplikace', company: 'Osobní projekty', from: '2020', to: '2023', year: 2020, text: 'Unity a C#, modelování v Blenderu. AR dema zveřejněná na GitHubu.' },
    { role: 'Softwarový inženýr', company: 'MIKROKLIMA s.r.o.', from: '2021', to: '2023', year: 2021, text: 'Rozhraní v Embedded Wizardu, modernizace WPF aplikací a nástroje pro Modbus/TCP.' },
    { role: 'Freelance vývojář', company: 'OSVČ', from: '2022', to: 'dosud', year: 2022, text: 'Úpravy Shopify šablony a automatizace Discordu pro MADMONQ.' },
    { role: 'Stážista v IT provozu a datové analýze', company: 'Philip Morris International', from: 'úno 2025', to: 'říj 2025', year: 2025, text: 'Reporting v Power BI a SQL nad daty ze SAPu, kusovníky a exporty do Excelu. Koordinace celofiremního upgradu IT systémů ve výrobě.' },
    { role: 'Android vývojář', company: 'Blendlens', from: 'říj 2025', to: 'bře 2026', year: 2025, text: 'Aplikace Blendscan v Kotlinu a Jetpack Compose s backendem na Azure.' },
    { role: 'Full-stack webový vývojář', company: 'PekneWeby s.r.o.', from: 'bře 2026', to: 'dosud', year: 2026, text: 'Aplikace v Reactu a TypeScriptu napojené na backendy a externí služby, mimo jiné frontend ubytovacího portálu Chalupuj. Přímá spolupráce s klienty, odhady a rozdělování práce v malém týmu.' },
  ],
  projects: [
    { name: 'Chalupuj', text: 'React frontend ubytovacího portálu Chalupuj.', stack: ['React'], url: 'https://chalupuj.cz' },
    { name: 'MCDM', text: 'Výuková platforma pro vícekriteriální rozhodování.', stack: ['React', 'Python'], url: 'https://github.com/Rountman/mcdm-edu-platform' },
    { name: 'Blendscan', text: 'Android aplikace pro Blendlens.', stack: ['Kotlin', 'Jetpack Compose', 'Azure'] },
    { name: 'ARAdventure', text: 'AR minihra postavená v Unity.', stack: ['Unity', 'C#'], url: 'https://github.com/Rountman/ARAdventure' },
    { name: 'UHK HelicopterAR', text: 'Experimenty se shadery a AR na modelu helikoptéry.', stack: ['Unity'], url: 'https://github.com/Rountman/UHK-HelicopterAR' },
  ],
  skills: [
    { group: 'Jazyky', items: ['TypeScript', 'JavaScript', 'C#', 'Kotlin', 'Python'] },
    { group: 'Web', items: ['React', 'Tailwind CSS', 'Shopify', 'Node.js', '.NET'] },
    { group: 'Data', items: ['Power BI', 'Power Query', 'SQL', 'MSSQL', 'Excel', 'Data ze SAPu'] },
    { group: 'Mobil', items: ['Android Studio', 'Jetpack Compose'] },
    { group: 'Hry a XR', items: ['Unity', 'Unreal Engine', 'AR', 'VR', 'Blender'] },
    { group: 'Desktop a embedded', items: ['WPF', 'Embedded Wizard', 'Modbus/TCP'] },
    { group: 'Nástroje', items: ['Git', 'Azure', 'Enterprise Architect'] },
  ],
  studies: [
    { school: 'FIM UHK', what: 'Informační management, navazující magisterské', when: '2025 – dosud' },
    { school: 'FIM UHK', what: 'Informační management, bakalářské. Práce: praktický projekt v Unreal Engine', when: '2022 – 2025' },
    { school: 'SPŠE a VOŠ Pardubice', what: 'Programování a hardware', when: '2018 – 2022' },
  ],
  ui: {
    navLabel: 'Hlavní',
    nav: { work: 'Práce', projects: 'Projekty', contact: 'Kontakt' },
    switchTo: 'EN',
    switchLabel: 'English version',
    about: 'O mně',
    workLead: 'Šest rolí, od ovládacích panelů strojů po webové aplikace pro klienty.',
    tools: 'Nástroje',
    toolsLead: 'S čím jsem dodával software, seskupené podle toho, kde běží.',
    studies: 'Studium',
    studiesLead: 'Pořád studuji, při práci.',
    contactLead: 'Jsem otevřený spolupráci. Napište mi:',
    downloadCv: 'Stáhnout CV (PDF)',
    backToTop: 'Zpět nahoru',
  },
};

export const content: Record<Lang, typeof en> = { en, cs };
