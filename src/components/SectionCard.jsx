import { useInView } from '../hooks/useInView';

const SectionCard = ({ title, icon: Icon, children, actions, delay = 0, className = '' }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition-all duration-700 ease-[cubic-bezier(0,0,0,1)] hover:shadow-md sm:p-7 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1B1B21]">
          {Icon ? <Icon size={19} className="text-[#375DFB]" /> : null}
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </div>
  );
};

export default SectionCard;
