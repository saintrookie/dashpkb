export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-navy-800/60 border border-surface-border dark:border-white/10 rounded-card shadow-card dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
