import { useState } from 'react';

const ExpandingChart = ({ baseHeight, expandedHeight, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="transition-[height] duration-300"
      style={{ height: hovered ? expandedHeight : baseHeight }}
    >
      {children}
    </div>
  );
};

export default ExpandingChart;
