import React, { useState, useMemo } from 'react'
import { INDIAN_COLLEGES } from '@/data/indianAcademicData'

interface CollegeLogoProps {
  name: string
  domain?: string
  className?: string
}

// Compute clean abbreviation / monogram for any Indian university
export const getCollegeMonogram = (name: string): string => {
  const norm = name.toLowerCase()

  if (norm.includes('iit bombay')) return 'IITB'
  if (norm.includes('iit delhi')) return 'IITD'
  if (norm.includes('iit madras')) return 'IITM'
  if (norm.includes('iit kanpur')) return 'IITK'
  if (norm.includes('iit kharagpur')) return 'KGP'
  if (norm.includes('iit roorkee')) return 'IITR'
  if (norm.includes('iit guwahati')) return 'IITG'
  if (norm.includes('iit hyderabad')) return 'IITH'
  if (norm.includes('bhu') || (norm.includes('iit') && norm.includes('varanasi'))) return 'BHU'
  if (norm.includes('iit')) return 'IIT'

  if (norm.includes('bits')) return 'BITS'

  if (norm.includes('trichy') || norm.includes('tiruchirappalli')) return 'NITT'
  if (norm.includes('surathkal') || norm.includes('nitk')) return 'NITK'
  if (norm.includes('vnit') || norm.includes('nagpur')) return 'VNIT'
  if (norm.includes('warangal')) return 'NITW'
  if (norm.includes('rourkela')) return 'NITR'
  if (norm.includes('calicut')) return 'NITC'
  if (norm.includes('mnit') || norm.includes('jaipur')) return 'MNIT'
  if (norm.includes('nit')) return 'NIT'

  if (norm.includes('iiit hyderabad')) return 'IIITH'
  if (norm.includes('iiit bangalore')) return 'IIITB'
  if (norm.includes('iiit delhi')) return 'IIITD'
  if (norm.includes('iiit')) return 'IIIT'

  if (norm.includes('mit-wpu') || norm.includes('world peace')) return 'MIT'
  if (norm.includes('coep')) return 'COEP'
  if (norm.includes('pict')) return 'PICT'
  if (norm.includes('vjti')) return 'VJTI'
  if (norm.includes('vit')) return 'VIT'
  if (norm.includes('spit')) return 'SPIT'
  if (norm.includes('pccoe')) return 'PCCOE'
  if (norm.includes('cummins')) return 'MKSSS'
  if (norm.includes('walchand')) return 'WCE'

  if (norm.includes('rvce')) return 'RVCE'
  if (norm.includes('bms')) return 'BMS'
  if (norm.includes('pes')) return 'PES'
  if (norm.includes('ramaiah') || norm.includes('msrit')) return 'MSR'
  if (norm.includes('manipal')) return 'MIT'

  if (norm.includes('dtu')) return 'DTU'
  if (norm.includes('nsut')) return 'NSUT'
  if (norm.includes('srm')) return 'SRM'
  if (norm.includes('thapar')) return 'TIET'
  if (norm.includes('jadavpur')) return 'JU'
  if (norm.includes('kiit')) return 'KIIT'

  // Extract from initials if words available
  const match = INDIAN_COLLEGES.find((c) => c.value === name || c.label === name)
  if (match?.shortName) return match.shortName

  const cleaned = name.replace(/\([^)]*\)/g, '').trim()
  const words = cleaned.split(/[\s-]+/).filter((w) => w.length > 0 && !['of', 'and', '&', 'for', 'the', 'in'].includes(w.toLowerCase()))
  if (words.length >= 2) {
    return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase()
  }

  return cleaned.substring(0, 3).toUpperCase()
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({ name, domain: explicitDomain, className = 'w-6 h-6' }) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const match = useMemo(
    () => INDIAN_COLLEGES.find((c) => c.value === name || c.label === name || name.toLowerCase().includes(c.label.toLowerCase())),
    [name]
  )

  const domain = explicitDomain || match?.domain
  const monogram = useMemo(() => getCollegeMonogram(name), [name])

  const officialLogoUrl = domain ? `https://unavatar.io/${domain}?fallback=false` : null

  return (
    <div
      className={`${className} relative shrink-0 rounded-md bg-[#101012] border border-white/10 flex items-center justify-center overflow-hidden select-none shadow-sm`}
      title={name}
    >
      {/* Official College Web Identity Logo */}
      {officialLogoUrl && !imgFailed && (
        <img
          src={officialLogoUrl}
          alt={name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
          className={`absolute inset-0 w-full h-full object-contain p-0.5 bg-[#101012] transition-opacity duration-200 z-10 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Clean Minimalist Black & White Monogram Fallback */}
      <span
        className="font-mono font-semibold text-white/90 tracking-wider uppercase z-0 select-none"
        style={{
          fontSize: monogram.length > 4 ? '7.5px' : monogram.length === 4 ? '8.5px' : '9.5px',
          lineHeight: 1,
        }}
      >
        {monogram}
      </span>
    </div>
  )
}
