// Veškerý obsah webu. Design a animace se mění v komponentách, texty jen tady.

export const person = {
  name: 'Antonín Pecka',
  title: 'Bc.',
  role: 'Software developer',
  intro:
    'I build web applications in React and TypeScript. Before the web I wrote software for machines, phones and AR headsets.',
  email: 'entonypecka@gmail.com',
  github: 'https://github.com/Rountman',
  linkedin: 'https://www.linkedin.com/in/antonin-pecka',
  location: 'Pardubice region, Czech Republic',
};

export const about =
  'Developer with five years of hands-on work since 2021. I started with desktop applications in C# and WPF, moved on to Android apps in Kotlin, and today I mostly build full-stack web applications in React and TypeScript. At Philip Morris International I worked on data and reporting in Power BI and SQL, including SAP bills of materials and exports to Excel. Alongside work I study Information Management at FIM UHK.';

export type Job = {
  role: string;
  company: string;
  from: string;
  to: string;
  year: number; // rok začátku, řídí velký letopočet
  text: string;
};

export const career: Job[] = [
  {
    role: 'AR applications',
    company: 'Personal projects',
    from: '2020',
    to: '2023',
    year: 2020,
    text: 'Unity and C#, Blender modelling. AR demos published on GitHub.',
  },
  {
    role: 'Software engineer',
    company: 'MIKROKLIMA s.r.o.',
    from: '2021',
    to: '2023',
    year: 2021,
    text: 'Embedded Wizard interfaces, WPF modernisation and Modbus/TCP tooling.',
  },
  {
    role: 'Freelance developer',
    company: 'Self-employed',
    from: '2022',
    to: 'now',
    year: 2022,
    text: 'Shopify theme work and Discord automation for MADMONQ, the React frontend of the Chalupuj accommodation portal, and the MCDM educational platform for UHK.',
  },
  {
    role: 'IT operations & data analyst intern',
    company: 'Philip Morris International',
    from: 'Feb 2025',
    to: 'Oct 2025',
    year: 2025,
    text: 'Power BI and SQL reporting on SAP data, bills of materials and Excel exports. Coordinated a company-wide IT systems upgrade in production.',
  },
  {
    role: 'Android developer',
    company: 'Blendlens',
    from: 'Oct 2025',
    to: 'Mar 2026',
    year: 2025,
    text: 'The Blendscan app in Kotlin and Jetpack Compose with an Azure backend.',
  },
  {
    role: 'Full-stack web developer',
    company: 'PekneWeby s.r.o.',
    from: 'Mar 2026',
    to: 'now',
    year: 2026,
    text: 'React and TypeScript applications connected to backends and external services. Working directly with clients, estimating and splitting work in a small team.',
  },
];

export type Project = {
  name: string;
  text: string;
  stack: string[];
  url?: string; // jen veřejné repo; bez URL se odkaz nezobrazí
};

export const projects: Project[] = [
  { name: 'MCDM', text: 'Educational platform for multi-criteria decision making.', stack: ['React', 'Python'], url: 'https://github.com/Rountman/mcdm-edu-platform' },
  { name: 'Blendscan', text: 'Android app for Blendlens.', stack: ['Kotlin', 'Jetpack Compose', 'Azure'] },
  { name: 'ARAdventure', text: 'AR mini-game built in Unity.', stack: ['Unity', 'C#'], url: 'https://github.com/Rountman/ARAdventure' },
  { name: 'Discord bot', text: 'Automation and server management.', stack: ['Node.js'] },
  { name: 'UHK HelicopterAR', text: 'Shader and AR experiments with a helicopter model.', stack: ['Unity'], url: 'https://github.com/Rountman/UHK-HelicopterAR' },
];

export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['TypeScript', 'JavaScript', 'C#', 'Kotlin', 'Python'] },
  { group: 'Web', items: ['React', 'Tailwind CSS', 'Shopify', 'Node.js', '.NET'] },
  { group: 'Data', items: ['Power BI', 'Power Query', 'SQL', 'MSSQL', 'Excel', 'SAP data'] },
  { group: 'Mobile', items: ['Android Studio', 'Jetpack Compose'] },
  { group: 'Games & XR', items: ['Unity', 'Unreal Engine', 'AR', 'VR', 'Blender'] },
  { group: 'Desktop & embedded', items: ['WPF', 'Embedded Wizard', 'Modbus/TCP'] },
  { group: 'Workflow', items: ['Git', 'Azure', 'Enterprise Architect'] },
];

export const studies = [
  { school: 'FIM UHK', what: 'Information Management, master’s', when: '2025 – now' },
  { school: 'FIM UHK', what: 'Information Management, bachelor’s. Thesis: a practical Unreal Engine project', when: '2022 – 2025' },
  { school: 'SPŠE a VOŠ Pardubice', what: 'Programming and hardware', when: '2018 – 2022' },
];
