import React from 'react';
import { Language } from '../data/translations';

interface FlagIconProps {
  language: Language;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
}

export const FlagIcon: React.FC<FlagIconProps> = ({
  language,
  className = '',
  size = 'md',
  rounded = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-5 h-3.5',
    lg: 'w-7 h-5',
    xl: 'w-10 h-7',
  };

  const isBrazil = language === 'pt';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-black/20 ${
        rounded ? 'rounded-sm sm:rounded' : ''
      } ${sizeClasses[size]} ${className}`}
      title={isBrazil ? 'Português (Brasil)' : 'English (USA)'}
      aria-label={isBrazil ? 'Bandeira do Brasil' : 'USA Flag'}
    >
      {isBrazil ? (
        // Bandeira do Brasil Oficial em Vetor SVG
        <svg
          viewBox="0 0 720 504"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fundo Verde */}
          <rect width="720" height="504" fill="#009c3b" />
          {/* Losango Amarelo */}
          <polygon points="360,54 666,252 360,450 54,252" fill="#ffdf00" />
          {/* Círculo Azul */}
          <circle cx="360" cy="252" r="126" fill="#002776" />
          {/* Faixa Branca */}
          <path
            d="M 234 252 A 136 136 0 0 0 486 252 A 126 126 0 0 1 234 252"
            fill="#ffffff"
          />
          {/* Estrelas */}
          <circle cx="360" cy="225" r="3.5" fill="#ffffff" />
          <circle cx="340" cy="275" r="3" fill="#ffffff" />
          <circle cx="375" cy="285" r="3" fill="#ffffff" />
          <circle cx="390" cy="270" r="3" fill="#ffffff" />
          <circle cx="355" cy="305" r="2.5" fill="#ffffff" />
        </svg>
      ) : (
        // Bandeira dos Estados Unidos (USA) Oficial em Vetor SVG
        <svg
          viewBox="0 0 741 390"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Listras Vermelhas e Brancas */}
          <rect width="741" height="390" fill="#b22234" />
          <path
            d="M0,30 H741 M0,90 H741 M0,150 H741 M0,210 H741 M0,270 H741 M0,330 H741"
            stroke="#ffffff"
            strokeWidth="30"
          />
          {/* Cantão Azul */}
          <rect width="296.4" height="210" fill="#3c3b6e" />
          {/* Estrelas no Cantão */}
          <g fill="#ffffff">
            <circle cx="28" cy="21" r="5" />
            <circle cx="75" cy="21" r="5" />
            <circle cx="122" cy="21" r="5" />
            <circle cx="169" cy="21" r="5" />
            <circle cx="216" cy="21" r="5" />
            <circle cx="263" cy="21" r="5" />

            <circle cx="51" cy="42" r="5" />
            <circle cx="98" cy="42" r="5" />
            <circle cx="145" cy="42" r="5" />
            <circle cx="192" cy="42" r="5" />
            <circle cx="239" cy="42" r="5" />

            <circle cx="28" cy="63" r="5" />
            <circle cx="75" cy="63" r="5" />
            <circle cx="122" cy="63" r="5" />
            <circle cx="169" cy="63" r="5" />
            <circle cx="216" cy="63" r="5" />
            <circle cx="263" cy="63" r="5" />

            <circle cx="51" cy="84" r="5" />
            <circle cx="98" cy="84" r="5" />
            <circle cx="145" cy="84" r="5" />
            <circle cx="192" cy="84" r="5" />
            <circle cx="239" cy="84" r="5" />

            <circle cx="28" cy="105" r="5" />
            <circle cx="75" cy="105" r="5" />
            <circle cx="122" cy="105" r="5" />
            <circle cx="169" cy="105" r="5" />
            <circle cx="216" cy="105" r="5" />
            <circle cx="263" cy="105" r="5" />

            <circle cx="51" cy="126" r="5" />
            <circle cx="98" cy="126" r="5" />
            <circle cx="145" cy="126" r="5" />
            <circle cx="192" cy="126" r="5" />
            <circle cx="239" cy="126" r="5" />

            <circle cx="28" cy="147" r="5" />
            <circle cx="75" cy="147" r="5" />
            <circle cx="122" cy="147" r="5" />
            <circle cx="169" cy="147" r="5" />
            <circle cx="216" cy="147" r="5" />
            <circle cx="263" cy="147" r="5" />

            <circle cx="51" cy="168" r="5" />
            <circle cx="98" cy="168" r="5" />
            <circle cx="145" cy="168" r="5" />
            <circle cx="192" cy="168" r="5" />
            <circle cx="239" cy="168" r="5" />

            <circle cx="28" cy="189" r="5" />
            <circle cx="75" cy="189" r="5" />
            <circle cx="122" cy="189" r="5" />
            <circle cx="169" cy="189" r="5" />
            <circle cx="216" cy="189" r="5" />
            <circle cx="263" cy="189" r="5" />
          </g>
        </svg>
      )}
    </span>
  );
};
