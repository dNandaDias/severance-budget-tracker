import { useInView } from '../hooks/useInView';
import { STAT_TONES } from '../lib/chartTheme';

const StatCard = ({ icon: Icon, label, value, tone = 'primary', sub, delay = 0 }) => {
  const [ref, inView] = useInView();
  const t = STAT_TONES[tone];
  const labelMatch = label.match(/^(.*?)\s*(\([^)]*\))$/);
  const mainLabel = labelMatch ? labelMatch[1] : label;
  const labelSuffix = labelMatch ? labelMatch[2] : '';
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group flex flex-col overflow-hidden rounded-[28px] border border-black/5 shadow-sm transition-all duration-500 ease-[cubic-bezier(0,0,0,1)] hover:-translate-y-1 hover:shadow-xl ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div
        className="flex flex-col justify-center gap-1.5 px-6 py-3"
        style={{ background: t.fill }}
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className="shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ color: t.text }} />
          <p
            className="text-[24px] font-normal leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: t.text }}
          >
            {mainLabel}
            {labelSuffix ? <span className="ml-1 text-sm font-normal" style={{ color: t.text }}>{labelSuffix}</span> : null}
          </p>
        </div>
        {sub ? <p className="text-xs leading-snug" style={{ color: t.text }}>{sub}</p> : null}
      </div>
      <div
        className="flex items-center justify-end pl-3 pr-7 pt-3 pb-8 text-right"
        style={{ background: t.fill }}
      >
        <p
          className="text-[46px] font-semibold leading-tight tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", color: t.text }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
