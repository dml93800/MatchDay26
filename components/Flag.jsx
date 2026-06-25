import { getFlagUrl } from '../lib/utils'

export default function Flag({ country, size = 'md', className = '' }) {
  const url = getFlagUrl(country)
  const sizes = {
    sm: { w: 24, h: 16 },
    md: { w: 40, h: 27 },
    lg: { w: 56, h: 37 },
  }
  const { w, h } = sizes[size] || sizes.md

  if (!url) return (
    <div style={{ width: w, height: h, background: '#1a1f2e', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size === 'sm' ? 14 : 20 }}>
      🏳️
    </div>
  )

  return (
    <img
      src={url}
      alt={country}
      width={w}
      height={h}
      style={{ borderRadius: 4, objectFit: 'cover' }}
      className={className}
      onError={(e) => { e.target.style.display = 'none' }}
    />
  )
}
