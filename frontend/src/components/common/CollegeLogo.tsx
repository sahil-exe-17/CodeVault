import React from 'react'

interface CollegeLogoProps {
  name: string
  className?: string
}

interface CollegeTheme {
  monogram: string
  bg: string
  border: string
  text: string
  subText?: string
  accent?: string
}

export const getCollegeTheme = (name: string): CollegeTheme => {
  const norm = name.toLowerCase()

  // IITs
  if (norm.includes('iit bombay') || (norm.includes('iit') && norm.includes('bombay'))) {
    return { monogram: 'IITB', bg: '#0A192F', border: '#1E3A8A', text: '#FBBF24', accent: '#3B82F6' }
  }
  if (norm.includes('iit delhi') || (norm.includes('iit') && norm.includes('delhi'))) {
    return { monogram: 'IITD', bg: '#0F172A', border: '#DC2626', text: '#FFFFFF', accent: '#DC2626' }
  }
  if (norm.includes('iit madras') || (norm.includes('iit') && norm.includes('madras'))) {
    return { monogram: 'IITM', bg: '#172554', border: '#D97706', text: '#FEF08A', accent: '#F59E0B' }
  }
  if (norm.includes('iit kanpur') || (norm.includes('iit') && norm.includes('kanpur'))) {
    return { monogram: 'IITK', bg: '#1E293B', border: '#0284C7', text: '#38BDF8', accent: '#0EA5E9' }
  }
  if (norm.includes('iit kharagpur') || (norm.includes('iit') && norm.includes('kharagpur'))) {
    return { monogram: 'KGP', bg: '#1C1917', border: '#EA580C', text: '#FDBA74', accent: '#F97316' }
  }
  if (norm.includes('iit roorkee') || (norm.includes('iit') && norm.includes('roorkee'))) {
    return { monogram: 'IITR', bg: '#0C4A6E', border: '#38BDF8', text: '#BAE6FD', accent: '#0284C7' }
  }
  if (norm.includes('iit guwahati') || (norm.includes('iit') && norm.includes('guwahati'))) {
    return { monogram: 'IITG', bg: '#14532D', border: '#22C55E', text: '#BBF7D0', accent: '#16A34A' }
  }
  if (norm.includes('iit hyderabad') || (norm.includes('iit') && norm.includes('hyderabad'))) {
    return { monogram: 'IITH', bg: '#1E1B4B', border: '#6366F1', text: '#C7D2FE', accent: '#4F46E5' }
  }
  if (norm.includes('bhu') || (norm.includes('iit') && norm.includes('varanasi'))) {
    return { monogram: 'BHU', bg: '#4C0519', border: '#E11D48', text: '#FECDD3', accent: '#BE123C' }
  }
  if (norm.includes('iit') || norm.includes('indian institute of technology')) {
    return { monogram: 'IIT', bg: '#0A192F', border: '#2563EB', text: '#FDE047', accent: '#1D4ED8' }
  }

  // BITS Pilani Campuses
  if (norm.includes('bits') || norm.includes('birla institute of technology')) {
    return { monogram: 'BITS', bg: '#4A044E', border: '#C026D3', text: '#F5D0FE', accent: '#A21CAF' }
  }

  // NITs
  if (norm.includes('trichy') || norm.includes('tiruchirappalli')) {
    return { monogram: 'NITT', bg: '#7F1D1D', border: '#EF4444', text: '#FEE2E2', accent: '#DC2626' }
  }
  if (norm.includes('surathkal') || norm.includes('nitk')) {
    return { monogram: 'NITK', bg: '#831843', border: '#F43F5E', text: '#FFE4E6', accent: '#E11D48' }
  }
  if (norm.includes('vnit') || (norm.includes('visvesvaraya') && norm.includes('nagpur'))) {
    return { monogram: 'VNIT', bg: '#701A75', border: '#D946EF', text: '#FAE8FF', accent: '#C026D3' }
  }
  if (norm.includes('warangal')) {
    return { monogram: 'NITW', bg: '#881337', border: '#F43F5E', text: '#FFF1F2', accent: '#BE123C' }
  }
  if (norm.includes('rourkela')) {
    return { monogram: 'NITR', bg: '#7C2D12', border: '#F97316', text: '#FFEDD5', accent: '#EA580C' }
  }
  if (norm.includes('calicut')) {
    return { monogram: 'NITC', bg: '#78350F', border: '#F59E0B', text: '#FEF3C7', accent: '#D97706' }
  }
  if (norm.includes('mnit') || (norm.includes('malaviya') && norm.includes('jaipur'))) {
    return { monogram: 'MNIT', bg: '#1E293B', border: '#EF4444', text: '#FCA5A5', accent: '#DC2626' }
  }
  if (norm.includes('nit') || norm.includes('national institute of technology')) {
    return { monogram: 'NIT', bg: '#7F1D1D', border: '#EF4444', text: '#FEE2E2', accent: '#B91C1C' }
  }

  // IIITs
  if (norm.includes('iiit hyderabad')) {
    return { monogram: 'IIITH', bg: '#042F2E', border: '#14B8A6', text: '#CCFBF1', accent: '#0D9488' }
  }
  if (norm.includes('iiit bangalore')) {
    return { monogram: 'IIITB', bg: '#082F49', border: '#0284C7', text: '#E0F2FE', accent: '#0369A1' }
  }
  if (norm.includes('iiit delhi')) {
    return { monogram: 'IIITD', bg: '#14532D', border: '#10B981', text: '#D1FAE5', accent: '#059669' }
  }
  if (norm.includes('iiit')) {
    return { monogram: 'IIIT', bg: '#064E3B', border: '#10B981', text: '#A7F3D0', accent: '#047857' }
  }

  // Maharashtra & Pune Hub
  if (norm.includes('mit-wpu') || norm.includes('world peace')) {
    return { monogram: 'MIT', bg: '#002855', border: '#EAB308', text: '#FEF08A', accent: '#F59E0B' }
  }
  if (norm.includes('coep')) {
    return { monogram: 'COEP', bg: '#0F2A4A', border: '#3B82F6', text: '#93C5FD', accent: '#1D4ED8' }
  }
  if (norm.includes('pict') || norm.includes('pune institute of computer technology')) {
    return { monogram: 'PICT', bg: '#1E1B4B', border: '#06B6D4', text: '#67E8F9', accent: '#0891B2' }
  }
  if (norm.includes('vjti') || norm.includes('veermata jijabai')) {
    return { monogram: 'VJTI', bg: '#450A0A', border: '#F59E0B', text: '#FDE68A', accent: '#B45309' }
  }
  if (norm.includes('vit') || norm.includes('vishwakarma') || norm.includes('vellore institute')) {
    return { monogram: 'VIT', bg: '#1E3A8A', border: '#60A5FA', text: '#DBEAFE', accent: '#2563EB' }
  }
  if (norm.includes('spit') || norm.includes('sardar patel')) {
    return { monogram: 'SPIT', bg: '#78350F', border: '#38BDF8', text: '#BAE6FD', accent: '#D97706' }
  }
  if (norm.includes('pccoe') || norm.includes('pimpri chinchwad')) {
    return { monogram: 'PCCOE', bg: '#1E293B', border: '#FB923C', text: '#FED7AA', accent: '#F97316' }
  }
  if (norm.includes('cummins') || norm.includes('mksss')) {
    return { monogram: 'MKSSS', bg: '#581C87', border: '#EC4899', text: '#FBCFE8', accent: '#DB2777' }
  }
  if (norm.includes('walchand')) {
    return { monogram: 'WCE', bg: '#172554', border: '#FACC15', text: '#FEF08A', accent: '#2563EB' }
  }

  // Karnataka & Bengaluru Hub
  if (norm.includes('rvce') || norm.includes('r. v. college')) {
    return { monogram: 'RVCE', bg: '#064E3B', border: '#FBBF24', text: '#FEF08A', accent: '#059669' }
  }
  if (norm.includes('bms')) {
    return { monogram: 'BMS', bg: '#1E3A8A', border: '#E2E8F0', text: '#FFFFFF', accent: '#3B82F6' }
  }
  if (norm.includes('pes university') || norm.includes('pes')) {
    return { monogram: 'PES', bg: '#881337', border: '#3B82F6', text: '#BFDBFE', accent: '#E11D48' }
  }
  if (norm.includes('ramaiah') || norm.includes('msrit')) {
    return { monogram: 'MSRIT', bg: '#042F2E', border: '#F59E0B', text: '#FDE68A', accent: '#0D9488' }
  }
  if (norm.includes('manipal') || norm.includes('mahe')) {
    return { monogram: 'MIT', bg: '#7C2D12', border: '#FB923C', text: '#FFEDD5', accent: '#EA580C' }
  }

  // Delhi NCR
  if (norm.includes('dtu') || norm.includes('delhi technological')) {
    return { monogram: 'DTU', bg: '#3B0764', border: '#F59E0B', text: '#FEF08A', accent: '#9333EA' }
  }
  if (norm.includes('nsut') || norm.includes('netaji subhas')) {
    return { monogram: 'NSUT', bg: '#1E3A8A', border: '#EF4444', text: '#FCA5A5', accent: '#2563EB' }
  }
  if (norm.includes('igdtuw')) {
    return { monogram: 'IGD', bg: '#701A75', border: '#F472B6', text: '#FCE7F3', accent: '#DB2777' }
  }

  // Tamil Nadu
  if (norm.includes('srm')) {
    return { monogram: 'SRM', bg: '#1E3A8A', border: '#F59E0B', text: '#FEF08A', accent: '#2563EB' }
  }
  if (norm.includes('anna university') || norm.includes('ceg')) {
    return { monogram: 'AU', bg: '#0F172A', border: '#38BDF8', text: '#E0F2FE', accent: '#0284C7' }
  }
  if (norm.includes('psg')) {
    return { monogram: 'PSG', bg: '#14532D', border: '#FBBF24', text: '#FEF08A', accent: '#16A34A' }
  }
  if (norm.includes('ssn')) {
    return { monogram: 'SSN', bg: '#0F2A4A', border: '#60A5FA', text: '#DBEAFE', accent: '#2563EB' }
  }
  if (norm.includes('amrita')) {
    return { monogram: 'AVV', bg: '#78350F', border: '#FBBF24', text: '#FEF08A', accent: '#D97706' }
  }

  // Other Premier Institutions
  if (norm.includes('thapar') || norm.includes('tiet')) {
    return { monogram: 'TIET', bg: '#7F1D1D', border: '#E2E8F0', text: '#FFFFFF', accent: '#DC2626' }
  }
  if (norm.includes('jadavpur')) {
    return { monogram: 'JU', bg: '#1E1B4B', border: '#FACC15', text: '#FEF08A', accent: '#4F46E5' }
  }
  if (norm.includes('kiit')) {
    return { monogram: 'KIIT', bg: '#14532D', border: '#4ADE80', text: '#DCFCE7', accent: '#16A34A' }
  }
  if (norm.includes('da-iict') || norm.includes('dhirubhai')) {
    return { monogram: 'DA', bg: '#0F766E', border: '#F97316', text: '#FFEDD5', accent: '#0D9488' }
  }
  if (norm.includes('pec')) {
    return { monogram: 'PEC', bg: '#1E293B', border: '#38BDF8', text: '#E0F2FE', accent: '#0284C7' }
  }
  if (norm.includes('chandigarh')) {
    return { monogram: 'CU', bg: '#881337', border: '#F59E0B', text: '#FEF08A', accent: '#BE123C' }
  }
  if (norm.includes('lpu') || norm.includes('lovely')) {
    return { monogram: 'LPU', bg: '#78350F', border: '#FB923C', text: '#FFEDD5', accent: '#EA580C' }
  }

  // Custom / Fallback
  return { monogram: 'UNIV', bg: '#1E293B', border: '#475569', text: '#94A3B8', accent: '#64748B' }
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({ name, className = 'w-5 h-5' }) => {
  const theme = getCollegeTheme(name)

  if (theme.monogram === 'UNIV') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="6" fill="#18181B" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d="M12 4L3 8.5L12 13L21 8.5L12 4Z" fill="#94A3B8" />
        <path d="M6 10.5V16.5C6 17.5 12 20 12 20C12 20 18 17.5 18 16.5V10.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 8.5V15" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <div
      className={`${className} shrink-0 rounded-md flex items-center justify-center font-bold tracking-tight select-none shadow-sm transition-transform`}
      style={{
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
      }}
      title={name}
    >
      <span
        style={{
          fontSize: theme.monogram.length > 4 ? '7.5px' : theme.monogram.length === 4 ? '8.5px' : '9.5px',
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        {theme.monogram}
      </span>
    </div>
  )
}
