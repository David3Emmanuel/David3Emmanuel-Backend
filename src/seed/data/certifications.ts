export interface SeedCertification {
  title: string
  issuer?: string
  dateLabel?: string
  kind: 'training' | 'award' | 'scholarship' | 'shortlist'
  url?: string
  order: number
}

export const certifications: SeedCertification[] = [
  {
    title: 'Foundation of Generative AI',
    issuer: 'Udacity Nanodegree',
    dateLabel: 'February 2025',
    kind: 'training',
    url: 'https://www.udacity.com/certificate/e/a8f4d702-b7bc-11ef-b50c-0b249a7a0c1f',
    order: 1,
  },
  {
    title: 'HatchDev Training — Data Structures, Algorithms & Full-Stack Development',
    issuer: 'NITHUB',
    dateLabel: 'December 2024',
    kind: 'training',
    order: 2,
  },
  {
    title: 'GameUp Africa — C#, Unity & 3D Modelling',
    issuer: 'Maliyo Games',
    dateLabel: '2024',
    kind: 'training',
    order: 3,
  },
  {
    title: 'Digital For All Challenge 2.0 — Software Development',
    issuer: 'Tech4Dev',
    dateLabel: '2024',
    kind: 'training',
    order: 4,
  },
  {
    title: 'PLP Academy — Web Development & Database Management',
    issuer: 'Power Learn Project',
    kind: 'training',
    order: 5,
  },
  {
    title: 'AI Research Foundations',
    issuer: 'FATE Foundation × Google DeepMind',
    dateLabel: '2026',
    kind: 'training',
    order: 6,
  },
  {
    title: 'Inclusive Education Innovation Challenge — Finalists Bootcamp',
    issuer: 'AFRETEC UNILAG',
    dateLabel: 'August 2026',
    kind: 'training',
    order: 7,
  },
  {
    title: 'AI Challenge, Phase 1 of 2',
    issuer: 'ATF AI School',
    dateLabel: 'October 2026',
    kind: 'training',
    order: 8,
  },
  {
    title: 'Stellar Member of the Training Team',
    issuer: 'ECX',
    dateLabel: 'July 2026',
    kind: 'training',
    order: 9,
  },
  {
    title: 'Think Out of the Bot Hackathon',
    issuer: 'Qdrant',
    dateLabel: 'September 2025',
    kind: 'training',
    order: 10,
  },
  {
    title: 'Volunteer Certificates — Machine Learning Track & Training Team',
    issuer: 'Data Community, UNILAG',
    dateLabel: '2026',
    kind: 'training',
    order: 11,
  },
  {
    title: 'Career Mentorship Attendance',
    issuer: 'Street2suit',
    dateLabel: 'November 2024',
    kind: 'training',
    order: 12,
  },
  {
    title: 'Science and Technology Scholarship',
    issuer: 'MTN Foundation',
    dateLabel: 'Awarded 2 November 2026',
    kind: 'award',
    order: 13,
  },
  {
    title: 'PICFI Scholarship',
    dateLabel: 'Awarded 25 September 2025',
    kind: 'award',
    order: 14,
  },
  {
    title: 'Sage Grey Scholarship',
    dateLabel: 'Awarded 23 April 2025',
    kind: 'award',
    order: 15,
  },
  {
    title: 'NNPC / SEPLAT Energy JV Scholarship',
    dateLabel: 'Shortlisted 2 November 2026',
    kind: 'shortlist',
    order: 16,
  },
]
