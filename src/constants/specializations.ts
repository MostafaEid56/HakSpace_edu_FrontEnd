export interface SpecializationHierarchy {
  [generalField: string]: string[]
}

export const SPECIALIZATION_HIERARCHY: SpecializationHierarchy = {
  Programming: [
    'Java',
    'Python',
    'JavaScript',
    'TypeScript',
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Mobile Development',
    'Web Development',
    'Software Engineering',
    'Other'
  ],
  'Graphic Design': [
    'UI/UX Design',
    'Photoshop',
    'Illustrator',
    'Branding',
    'Visual Identity',
    'Motion Graphics',
    'Social Media Design',
    'Other'
  ],
  Marketing: [
    'Digital Marketing',
    'Social Media Marketing',
    'SEO',
    'Content Marketing',
    'Performance Marketing',
    'Email Marketing',
    'Branding',
    'Other'
  ],
  Photography: [
    'Portrait Photography',
    'Product Photography',
    'Commercial Photography',
    'Event Photography',
    'Fashion Photography',
    'Food Photography',
    'Other'
  ],
  IT: [
    'Networking',
    'Cybersecurity',
    'Cloud Computing',
    'DevOps',
    'System Administration',
    'IT Support',
    'Database Administration',
    'Infrastructure',
    'Other'
  ]
}

export const GENERAL_FIELDS = Object.keys(SPECIALIZATION_HIERARCHY)
