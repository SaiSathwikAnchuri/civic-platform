import './LogoLoop.css';

export default function LogoLoop({
  logos = [],
  speed = 28,
  direction = 'left',
  gap = 18,
  fadeOut = false,
  fadeOutColor = '#f4f7fb',
  ariaLabel = 'Scrolling items',
}) {
  const marqueeStyle = {
    '--logo-loop-gap': `${gap}px`,
    '--logo-loop-duration': `${speed}s`,
  };

  return (
    <div
      className={`logo-loop ${fadeOut ? 'fade' : ''}`}
      style={{ '--logo-loop-fade': fadeOutColor }}
      aria-label={ariaLabel}
    >
      <div
        className={`logo-loop-track ${direction === 'right' ? 'reverse' : ''}`}
        style={marqueeStyle}
      >
        {[...logos, ...logos].map((logo, index) => {
          const ItemTag = logo.href ? 'a' : 'div';

          return (
            <ItemTag
              key={`${logo.title || logo.label || 'item'}-${index}`}
              className="logo-loop-item"
              href={logo.href}
              target={logo.href ? '_blank' : undefined}
              rel={logo.href ? 'noreferrer' : undefined}
            >
              <span className="logo-loop-icon">{logo.node || logo.icon || '•'}</span>
              <span className="logo-loop-text">{logo.title || logo.label}</span>
            </ItemTag>
          );
        })}
      </div>
    </div>
  );
}
