import React, { useState, useMemo } from 'react'
import { INDIAN_COLLEGES } from '@/data/indianAcademicData'

interface CollegeLogoProps {
  name: string
  domain?: string
  className?: string
}

interface CollegeTheme {
  monogram: string
  bg: string
  border: string
  text: string
  accent?: string
  domain?: string
}

export const getCollegeTheme = (name: string, explicitDomain?: string): CollegeTheme => {
  const norm = name.toLowerCase()

  // Match domain from dataset if available
  const match = INDIAN_COLLEGES.find((c) => c.value === name || c.label === name || norm.includes(c.label.toLowerCase()))
  const domain = explicitDomain || match?.domain

  // IITs
  if (norm.includes('iit bombay') || (norm.includes('iit') && norm.includes('bombay'))) {
    return { monogram: 'IITB', bg: '#0A192F', border: '#1E3A8A', text: '#FBBF24', accent: '#3B82F6', domain: domain || 'iitb.ac.in' }
  }
  if (norm.includes('iit delhi') || (norm.includes('iit') && norm.includes('delhi'))) {
    return { monogram: 'IITD', bg: '#0F172A', border: '#DC2626', text: '#FFFFFF', accent: '#DC2626', domain: domain || 'iitd.ac.in' }
  }
  if (norm.includes('iit madras') || (norm.includes('iit') && norm.includes('madras'))) {
    return { monogram: 'IITM', bg: '#172554', border: '#D97706', text: '#FEF08A', accent: '#F59E0B', domain: domain || 'iitm.ac.in' }
  }
  if (norm.includes('iit kanpur') || (norm.includes('iit') && norm.includes('kanpur'))) {
    return { monogram: 'IITK', bg: '#1E293B', border: '#0284C7', text: '#38BDF8', accent: '#0EA5E9', domain: domain || 'iitk.ac.in' }
  }
  if (norm.includes('iit kharagpur') || (norm.includes('iit') && norm.includes('kharagpur'))) {
    return { monogram: 'KGP', bg: '#1C1917', border: '#EA580C', text: '#FDBA74', accent: '#F97316', domain: domain || 'iitkgp.ac.in' }
  }
  if (norm.includes('iit roorkee') || (norm.includes('iit') && norm.includes('roorkee'))) {
    return { monogram: 'IITR', bg: '#0C4A6E', border: '#38BDF8', text: '#BAE6FD', accent: '#0284C7', domain: domain || 'iitr.ac.in' }
  }
  if (norm.includes('iit guwahati') || (norm.includes('iit') && norm.includes('guwahati'))) {
    return { monogram: 'IITG', bg: '#14532D', border: '#22C55E', text: '#BBF7D0', accent: '#16A34A', domain: domain || 'iitg.ac.in' }
  }
  if (norm.includes('iit hyderabad') || (norm.includes('iit') && norm.includes('hyderabad'))) {
    return { monogram: 'IITH', bg: '#1E1B4B', border: '#6366F1', text: '#C7D2FE', accent: '#4F46E5', domain: domain || 'iith.ac.in' }
  }
  if (norm.includes('bhu') || (norm.includes('iit') && norm.includes('varanasi'))) {
    return { monogram: 'BHU', bg: '#4C0519', border: '#E11D48', text: '#FECDD3', accent: '#BE123C', domain: domain || 'iitbhu.ac.in' }
  }
  if (norm.includes('iit') || norm.includes('indian institute of technology')) {
    return { monogram: 'IIT', bg: '#0A192F', border: '#2563EB', text: '#FDE047', accent: '#1D4ED8', domain }
  }

  // BITS Pilani Campuses
  if (norm.includes('bits') || norm.includes('birla institute of technology and science')) {
    return { monogram: 'BITS', bg: '#4A044E', border: '#C026D3', text: '#F5D0FE', accent: '#A21CAF', domain: domain || 'bits-pilani.ac.in' }
  }

  // NITs
  if (norm.includes('trichy') || norm.includes('tiruchirappalli')) {
    return { monogram: 'NITT', bg: '#7F1D1D', border: '#EF4444', text: '#FEE2E2', accent: '#DC2626', domain: domain || 'nitt.edu' }
  }
  if (norm.includes('surathkal') || norm.includes('nitk')) {
    return { monogram: 'NITK', bg: '#831843', border: '#F43F5E', text: '#FFE4E6', accent: '#E11D48', domain: domain || 'nitk.ac.in' }
  }
  if (norm.includes('vnit') || (norm.includes('visvesvaraya') && norm.includes('nagpur'))) {
    return { monogram: 'VNIT', bg: '#701A75', border: '#D946EF', text: '#FAE8FF', accent: '#C026D3', domain: domain || 'vnit.ac.in' }
  }
  if (norm.includes('warangal')) {
    return { monogram: 'NITW', bg: '#881337', border: '#F43F5E', text: '#FFF1F2', accent: '#BE123C', domain: domain || 'nitw.ac.in' }
  }
  if (norm.includes('rourkela')) {
    return { monogram: 'NITR', bg: '#7C2D12', border: '#F97316', text: '#FFEDD5', accent: '#EA580C', domain: domain || 'nitrkl.ac.in' }
  }
  if (norm.includes('calicut')) {
    return { monogram: 'NITC', bg: '#78350F', border: '#F59E0B', text: '#FEF3C7', accent: '#D97706', domain: domain || 'nitc.ac.in' }
  }
  if (norm.includes('mnit') || (norm.includes('malaviya') && norm.includes('jaipur'))) {
    return { monogram: 'MNIT', bg: '#1E293B', border: '#EF4444', text: '#FCA5A5', accent: '#DC2626', domain: domain || 'mnit.ac.in' }
  }
  if (norm.includes('nit') || norm.includes('national institute of technology')) {
    return { monogram: 'NIT', bg: '#7F1D1D', border: '#EF4444', text: '#FEE2E2', accent: '#B91C1C', domain }
  }

  // IIITs
  if (norm.includes('iiit hyderabad')) {
    return { monogram: 'IIITH', bg: '#042F2E', border: '#14B8A6', text: '#CCFBF1', accent: '#0D9488', domain: domain || 'iiit.ac.in' }
  }
  if (norm.includes('iiit bangalore')) {
    return { monogram: 'IIITB', bg: '#082F49', border: '#0284C7', text: '#E0F2FE', accent: '#0369A1', domain: domain || 'iiitb.ac.in' }
  }
  if (norm.includes('iiit delhi')) {
    return { monogram: 'IIITD', bg: '#14532D', border: '#10B981', text: '#D1FAE5', accent: '#059669', domain: domain || 'iiitd.ac.in' }
  }
  if (norm.includes('iiit')) {
    return { monogram: 'IIIT', bg: '#064E3B', border: '#10B981', text: '#A7F3D0', accent: '#047857', domain }
  }

  // Maharashtra & Pune Hub
  if (norm.includes('mit-wpu') || norm.includes('world peace')) {
    return { monogram: 'MIT', bg: '#002855', border: '#EAB308', text: '#FEF08A', accent: '#F59E0B', domain: domain || 'mitwpu.edu.in' }
  }
  if (norm.includes('coep')) {
    return { monogram: 'COEP', bg: '#0F2A4A', border: '#3B82F6', text: '#93C5FD', accent: '#1D4ED8', domain: domain || 'coep.org.in' }
  }
  if (norm.includes('pict') || norm.includes('pune institute of computer technology')) {
    return { monogram: 'PICT', bg: '#1E1B4B', border: '#06B6D4', text: '#67E8F9', accent: '#0891B2', domain: domain || 'pict.edu' }
  }
  if (norm.includes('vjti') || norm.includes('veermata jijabai')) {
    return { monogram: 'VJTI', bg: '#450A0A', border: '#F59E0B', text: '#FDE68A', accent: '#B45309', domain: domain || 'vjti.ac.in' }
  }
  if (norm.includes('vit') || norm.includes('vishwakarma') || norm.includes('vellore institute')) {
    return { monogram: 'VIT', bg: '#1E3A8A', border: '#60A5FA', text: '#DBEAFE', accent: '#2563EB', domain: domain || 'vit.edu' }
  }
  if (norm.includes('spit') || norm.includes('sardar patel')) {
    return { monogram: 'SPIT', bg: '#78350F', border: '#38BDF8', text: '#BAE6FD', accent: '#D97706', domain: domain || 'spit.ac.in' }
  }
  if (norm.includes('pccoe') || norm.includes('pimpri chinchwad')) {
    return { monogram: 'PCCOE', bg: '#1E293B', border: '#FB923C', text: '#FED7AA', accent: '#F97316', domain: domain || 'pccoepune.com' }
  }
  if (norm.includes('cummins') || norm.includes('mksss')) {
    return { monogram: 'MKSSS', bg: '#581C87', border: '#EC4899', text: '#FBCFE8', accent: '#DB2777', domain: domain || 'cumminscollege.org' }
  }
  if (norm.includes('walchand')) {
    return { monogram: 'WCE', bg: '#172554', border: '#FACC15', text: '#FEF08A', accent: '#2563EB', domain: domain || 'walchandsangli.ac.in' }
  }

  // Karnataka & Bengaluru Hub
  if (norm.includes('rvce') || norm.includes('r. v. college')) {
    return { monogram: 'RVCE', bg: '#064E3B', border: '#FBBF24', text: '#FEF08A', accent: '#059669', domain: domain || 'rvce.edu.in' }
  }
  if (norm.includes('bms')) {
    return { monogram: 'BMS', bg: '#1E3A8A', border: '#E2E8F0', text: '#FFFFFF', accent: '#3B82F6', domain: domain || 'bmsce.ac.in' }
  }
  if (norm.includes('pes university') || norm.includes('pes')) {
    return { monogram: 'PES', bg: '#881337', border: '#3B82F6', text: '#BFDBFE', accent: '#E11D48', domain: domain || 'pes.edu' }
  }
  if (norm.includes('ramaiah') || norm.includes('msrit')) {
    return { monogram: 'MSRIT', bg: '#042F2E', border: '#F59E0B', text: '#FDE68A', accent: '#0D9488', domain: domain || 'msrit.edu' }
  }
  if (norm.includes('manipal') || norm.includes('mahe')) {
    return { monogram: 'MIT', bg: '#7C2D12', border: '#FB923C', text: '#FFEDD5', accent: '#EA580C', domain: domain || 'manipal.edu' }
  }

  // Delhi NCR
  if (norm.includes('dtu') || norm.includes('delhi technological')) {
    return { monogram: 'DTU', bg: '#3B0764', border: '#F59E0B', text: '#FEF08A', accent: '#9333EA', domain: domain || 'dtu.ac.in' }
  }
  if (norm.includes('nsut') || norm.includes('netaji subhas')) {
    return { monogram: 'NSUT', bg: '#1E3A8A', border: '#EF4444', text: '#FCA5A5', accent: '#2563EB', domain: domain || 'nsut.ac.in' }
  }
  if (norm.includes('igdtuw')) {
    return { monogram: 'IGD', bg: '#701A75', border: '#F472B6', text: '#FCE7F3', accent: '#DB2777', domain: domain || 'igdtuw.ac.in' }
  }

  // Tamil Nadu
  if (norm.includes('srm')) {
    return { monogram: 'SRM', bg: '#1E3A8A', border: '#F59E0B', text: '#FEF08A', accent: '#2563EB', domain: domain || 'srmist.edu.in' }
  }
  if (norm.includes('anna university') || norm.includes('ceg')) {
    return { monogram: 'AU', bg: '#0F172A', border: '#38BDF8', text: '#E0F2FE', accent: '#0284C7', domain: domain || 'ceg.annauniv.edu' }
  }
  if (norm.includes('psg')) {
    return { monogram: 'PSG', bg: '#14532D', border: '#FBBF24', text: '#FEF08A', accent: '#16A34A', domain: domain || 'psgtech.edu' }
  }
  if (norm.includes('ssn')) {
    return { monogram: 'SSN', bg: '#0F2A4A', border: '#60A5FA', text: '#DBEAFE', accent: '#2563EB', domain: domain || 'ssn.edu.in' }
  }

  // Other Premier Institutions
  if (norm.includes('thapar') || norm.includes('tiet')) {
    return { monogram: 'TIET', bg: '#7F1D1D', border: '#E2E8F0', text: '#FFFFFF', accent: '#DC2626', domain: domain || 'thapar.edu' }
  }
  if (norm.includes('jadavpur')) {
    return { monogram: 'JU', bg: '#1E1B4B', border: '#FACC15', text: '#FEF08A', accent: '#4F46E5', domain: domain || 'jaduniv.edu.in' }
  }
  if (norm.includes('kiit')) {
    return { monogram: 'KIIT', bg: '#14532D', border: '#4ADE80', text: '#DCFCE7', accent: '#16A34A', domain: domain || 'kiit.ac.in' }
  }
  if (norm.includes('da-iict') || norm.includes('dhirubhai')) {
    return { monogram: 'DA', bg: '#0F766E', border: '#F97316', text: '#FFEDD5', accent: '#0D9488', domain: domain || 'daiict.ac.in' }
  }
  if (norm.includes('chandigarh')) {
    return { monogram: 'CU', bg: '#881337', border: '#F59E0B', text: '#FEF08A', accent: '#BE123C', domain: domain || 'cuchd.in' }
  }
  if (norm.includes('lpu') || norm.includes('lovely')) {
    return { monogram: 'LPU', bg: '#78350F', border: '#FB923C', text: '#FFEDD5', accent: '#EA580C', domain: domain || 'lpu.in' }
  }

  // Custom / Fallback
  return { monogram: 'UNIV', bg: '#18181B', border: 'rgba(255,255,255,0.15)', text: '#94A3B8', accent: '#64748B', domain }
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({ name, domain: explicitDomain, className = 'w-6 h-6' }) => {
  const theme = useMemo(() => getCollegeTheme(name, explicitDomain), [name, explicitDomain])
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const officialLogoUrl = theme.domain
    ? `https://unavatar.io/${theme.domain}?fallback=false`
    : null

  if (theme.monogram === 'UNIV' && !officialLogoUrl) {
    return (
      <div className={`${className} shrink-0 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center p-1 shadow-sm`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
          <path d="M12 4L3 8.5L12 13L21 8.5L12 4Z" fill="#94A3B8" />
          <path d="M6 10.5V16.5C6 17.5 12 20 12 20C12 20 18 17.5 18 16.5V10.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 8.5V15" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`${className} relative shrink-0 rounded-lg flex items-center justify-center overflow-hidden select-none transition-transform shadow-sm`}
      style={{
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
      }}
      title={name}
    >
      {/* Official College Web Identity Logo (Fetched Live with CORS CDN) */}
      {officialLogoUrl && !imgFailed && (
        <img
          src={officialLogoUrl}
          alt={name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
          className={`absolute inset-0 w-full h-full object-contain p-0.5 bg-white/90 backdrop-blur-sm transition-opacity duration-200 z-10 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* High-Fidelity Institutional Emblem / Monogram Fallback */}
      <span
        style={{
          color: theme.text,
          fontSize: theme.monogram.length > 4 ? '8px' : theme.monogram.length === 4 ? '9px' : '10.5px',
          fontWeight: 800,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
        className="z-0 uppercase"
      >
        {theme.monogram}
      </span>
    </div>
  )
}
