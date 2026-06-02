const SITE_URL = 'https://beyondclassroom.co.in'

export function buildMetadata({ title, description, path = '', keywords = [] }) {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    keywords: [...keywords, 'Beyond Classroom', 'Mathematics', 'French', 'online learning'],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Beyond Classroom',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: url },
  }
}

export { SITE_URL }
