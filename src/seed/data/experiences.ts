export interface SeedExperience {
  slug: string
  title: string
  company: string
  period: string
  description: string[]
  tech: string[]
  type: 'work' | 'activity'
  order: number
}

export const experiences: SeedExperience[] = [
  {
    slug: 'melda-founding-team-ai-engineering',
    title: 'Founding Team — AI Engineering',
    company: 'MELDA',
    period: '2026 – Present',
    description: [
      'Built and shipped the technical product for an AI teaching assistant: a four-package TypeScript monorepo with melda-shared as the single source of truth for domain models, insight aggregation, the AI interface and the design system.',
      'Deployed across a web app and Android builds, with a provider-swappable AI layer (DeepSeek or Anthropic) and a deterministic mock fallback so the app never fails in front of a class.',
    ],
    tech: ['TypeScript', 'React Native (Expo)', 'Express', 'Drizzle ORM', 'PostgreSQL'],
    type: 'work',
    order: 1,
  },
  {
    slug: 'cribpal-founding-team-integration-engineering',
    title: 'Founding Team — Integration Engineer',
    company: 'CribPal',
    period: '2026 – Present',
    description: [
      'Grafted the Catalyst multi-role platform — agent and investor dashboards, RBAC and the 3D/360° virtual-tour builder — onto CribPal’s verified student-housing marketplace as role-gated surfaces, kept demo-safe without a live database or payment provider.',
      'Redesigned the frontend around the project’s brand assets.',
    ],
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS 4', 'better-auth', 'MongoDB', 'three.js'],
    type: 'work',
    order: 2,
  },
  {
    slug: 'nithub-ai-ml-engineering-intern',
    title: 'AI/ML Engineering Intern',
    company: 'NITHUB',
    period: 'April 2026 – September 2026',
    description: [
      'Developing a causal inference and time-series forecasting pipeline to predict and explain food commodity prices in Nigeria.',
      'Building data ingestion pipelines to align and structure meteorological data, NGN/USD exchange rates and commodity price inputs using Python, Pandas and NumPy.',
      'Collaborating with fellow AI researchers to design a real-time Yoruba–English voice translation system, integrating Meta SeamlessM4T v2 and Silero VAD over low-latency WebSocket audio streams.',
    ],
    tech: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SeamlessM4T v2', 'WebSockets'],
    type: 'work',
    order: 3,
  },
  {
    slug: 'avzdax-computer-vision-engineer-intern',
    title: 'Computer Vision Engineer Intern',
    company: 'AVZDAX',
    period: 'April 2025 – Present',
    description: [
      'Developed prototype computer vision tracking pipelines for real-time security monitoring and spatial object association using YOLOv8 and YOLO11 nano models.',
      'Implemented geofencing algorithms and custom tracking heuristics in Python to track object proximity.',
      'Pinpointed and mitigated processing bottlenecks, decreasing edge latency by 110ms and increasing frame rates by 8 FPS.',
      'Collaborated on distributed systems integration using gRPC interfaces and PonyORM database schemas.',
      'Built the edge rewrite as a Raspberry Pi inference service for RTSP cameras, decoupling capture from inference through Redis and wiring six detectors behind per-stream database flags and polygon zones.',
    ],
    tech: ['Python', 'PyTorch', 'YOLOv8 / YOLO11', 'OpenCV', 'Redis', 'gRPC', 'PonyORM'],
    type: 'work',
    order: 4,
  },
  {
    slug: 'delta-state-farm-trainee-program-full-stack-developer',
    title: 'Full-Stack Developer',
    company: 'Delta State Government Farm Trainee Program',
    period: 'January 2025 – March 2025',
    description: [
      'Designed and built two trainee management web applications featuring role-based access control with a NestJS backend and React frontend.',
      'Managed trainee databases using PostgreSQL and MySQL to track roster registration and attendance logs.',
      'Planned database setups and mobile application layouts before the project was sunset, ahead of final deployment.',
    ],
    tech: ['NestJS', 'React', 'PostgreSQL', 'MySQL', 'Flutter'],
    type: 'work',
    order: 5,
  },
  {
    slug: 'freelance-client-engineering-full-stack-developer',
    title: 'Full-Stack Developer',
    company: 'Freelance & Client Engineering',
    period: 'September 2023 – Present',
    description: [
      'Managed end-to-end website and custom email solutions for small businesses, handling design, deployment and ongoing support.',
      'Delivered fully functional demos within one month, integrating payment gateways (Paystack and Flutterwave), breach-safe auth and custom database sync endpoints.',
      'Clients include Fordel Technologies (B2B agency and B2C publisher platforms, four-person team), Crete Accessories, TAAM 2026 / Maritime Forum, Rickbert Fashion, Amari Girls, Adeyemi Gbemileke, Catalyst, Kakka, Hairs by Solomon, Awofeso Aisha and the FUTA Sec student body election.',
    ],
    tech: ['NestJS', 'React', 'Strapi 5', 'PostgreSQL', 'Paystack', 'Flutterwave'],
    type: 'work',
    order: 6,
  },
  {
    slug: 'data-community-training-team-lead',
    title: 'Training Team Lead & AI/ML Track Lead',
    company: 'The Data Community, UNILAG',
    period: 'September 2025 – Present',
    description: [
      'Designed and launched a cohort-based “Flipped Classroom” study group model for four tracks (ML, DS, DE, DA), replacing ad-hoc sessions.',
      'Coordinated a volunteer training team of 10 tutors and mentors to manage syllabi, coursework and grading for 100+ students on Google Classroom.',
      'Gamified participation through a peer-based accountability partner system and leaderboard tracking.',
      'Previously Activities Manager (May 2024 – September 2025): ran monthly data science challenges for 200+ members, the Data Mastery Series with 100+ participants, and a reference drive of about 100 PDFs.',
    ],
    tech: ['Strapi 5', 'React Router 7', 'Supabase', 'Google Classroom'],
    type: 'activity',
    order: 1,
  },
  {
    slug: 'pyclub-unilag-lead-tutor',
    title: 'Lead Tutor',
    company: 'PyClub, UNILAG',
    period: 'August 2025 – Present',
    description: [
      'Organized programming workshops and hands-on coding tutorials for a community of almost 300 students, mentoring them in Python, data structures & algorithms and basic machine learning.',
      'Co-authored beginner, intermediate and advanced curriculum slides and programming guidelines.',
    ],
    tech: ['Python', 'NumPy', 'Pandas', 'Scikit-Learn'],
    type: 'activity',
    order: 2,
  },
  {
    slug: 'ases-deputy-lead-ai-ml-systems',
    title: 'Deputy Lead, AI/ML Systems Track',
    company: 'Association of Systems Engineering Students (ASES), UNILAG',
    period: 'November 2026 – Present',
    description: [
      'Deputises for the lead of the AI/ML Systems track, one of four co-curricular tracks ASES runs alongside the degree curriculum.',
      'Supports curriculum planning for the track — learning networks, data-driven models and decision logic for autonomous systems — sequenced into the track’s sessions.',
      'Runs the track’s virtual sessions, bootcamps and collaborative projects, adapting the sequence when members fall behind.',
      'Also Student Mentor & Academic Advisor (October 2025 – Present): authored course preparation guides, held study orientation for incoming 200-level students, and mentored on ANSYS, Python and VS Code setups.',
    ],
    tech: [],
    type: 'activity',
    order: 3,
  },
  {
    slug: 'ecx-ai-ml-tutor-facilitator',
    title: 'AI/ML Tutor & Facilitator',
    company: 'ECX 6.0 — Engineering Career Expo',
    period: 'April 2025 – September 2025',
    description: [
      'Volunteered to teach AI/ML for the ECX-Tensive Skills Training program organized by the Engineering Career Expo.',
      'Designed and delivered a hands-on introductory curriculum, teaching foundational machine learning concepts and practical Python implementation using NumPy, Pandas and Scikit-Learn.',
      'Guided student groups through building their first predictive models and data analysis projects.',
      'Authored the reference training solution for the community’s real-estate price prediction mini-project, comparing linear against polynomial regression.',
    ],
    tech: ['Python', 'NumPy', 'Pandas', 'Scikit-Learn'],
    type: 'activity',
    order: 4,
  },
  {
    slug: 'stempower-electronics-bootcamp-logistics',
    title: 'Logistics — Practical Electronics Bootcamp',
    company: 'STEMPower',
    period: 'Five-day bootcamp',
    description: [
      'Handled logistics for a five-day hands-on electronics bootcamp: venue and seating, media and projection, and component and multimeter supply for five groups of three students.',
      'Coordinated per-session staffing (one trainer, five co-trainers, a videographer) and the daily two-session timetable closing with a Saturday inter-group competition.',
    ],
    tech: [],
    type: 'activity',
    order: 5,
  },
  {
    slug: 'jcin-skills-and-development-team',
    title: 'Skills and Development Team',
    company: 'JCIN',
    period: 'Ongoing',
    description: [
      'Member of the team that plans and implements initiatives to enhance members’ skills and executes training and professional development programmes.',
      'Helped populate the organisation’s e-library.',
    ],
    tech: [],
    type: 'activity',
    order: 6,
  },
]
