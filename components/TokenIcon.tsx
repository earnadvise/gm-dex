"use client";

import { useState } from "react";

interface TokenIconProps {
  symbol: string;
  image?: string;
  className?: string;
}

export function TokenIcon({ symbol, image, className = "w-8 h-8 rounded-full" }: TokenIconProps) {
  const [imageError, setImageError] = useState(false);

  if (!image || imageError) {
    return (
      <div className={`${className} bg-gradient-to-tr from-[#01C38E]/30 to-[#0A786A]/40 text-[#01C38E] border border-[#01C38E]/40 font-black text-xs flex items-center justify-center shrink-0 uppercase tracking-tighter`}>
        {symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={symbol}
      className={`${className} object-cover shrink-0`}
      onError={() => setImageError(true)}
    />
  );
}
