import React, { useState } from 'react';
import { QuranQuote } from '../types';
import { getDailyDynamicQuote, QURAN_QUOTES } from '../data/quranQuotes';
import { Sparkles, RefreshCw, Copy, Check, Share2, BookOpen } from 'lucide-react';
import bannerImg from '../assets/images/quran_card_banner_1790147163971.jpg';

interface DailyMotivationCardProps {
  currentDate?: string;
  onQuoteSelect?: (quote: QuranQuote) => void;
  compact?: boolean;
}

export const DailyMotivationCard: React.FC<DailyMotivationCardProps> = ({
  currentDate,
  onQuoteSelect,
  compact = false
}) => {
  const [quoteIndex, setQuoteIndex] = useState<number>(() => {
    const daily = getDailyDynamicQuote(currentDate);
    return QURAN_QUOTES.findIndex(q => q.id === daily.id) || 0;
  });
  const [copied, setCopied] = useState<boolean>(false);

  const currentQuote = QURAN_QUOTES[quoteIndex] || QURAN_QUOTES[0];

  const handleNextQuote = () => {
    const nextIdx = (quoteIndex + 1) % QURAN_QUOTES.length;
    setQuoteIndex(nextIdx);
    if (onQuoteSelect) {
      onQuoteSelect(QURAN_QUOTES[nextIdx]);
    }
  };

  const handleCopyQuote = () => {
    const text = `✨ *Kata-Kata Motivasi Qur'ani Hari Ini*\n📖 *${currentQuote.surah} : ${currentQuote.ayah}*\n\n"${currentQuote.arabic}"\n\n*Artinya:*\n"${currentQuote.translation}"\n\n💡 *Tadabbur:* ${currentQuote.reflection}\n\n— Halaqoh App`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-950 text-white shadow-xl border border-emerald-800/40">
      {/* Background Banner with measured scrim */}
      <div className="absolute inset-0 opacity-25 mix-blend-luminosity">
        <img
          src={bannerImg}
          alt="Quran Banner Pattern"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/80 to-emerald-900/60" />

      {/* Decorative Islamic Geometric Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative p-4 sm:p-5">
        {/* Header zone */}
        <div className="flex items-center justify-between gap-2 border-b border-emerald-700/50 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-amber-300">
                Motivasi Qur'ani Harian
              </h4>
              <p className="text-[11px] text-emerald-200/80 font-medium">
                {currentQuote.theme}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleNextQuote}
              type="button"
              className="p-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200 active:scale-95 transition-all text-xs flex items-center gap-1 border border-emerald-600/30"
              title="Ganti motivasi Qur'ani"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden xs:inline">Ganti</span>
            </button>
            <button
              onClick={handleCopyQuote}
              type="button"
              className="p-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200 active:scale-95 transition-all text-xs flex items-center gap-1 border border-emerald-600/30"
              title="Salin motivasi"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden xs:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Surah & Ayah badge */}
        <div className="flex items-center gap-1.5 text-xs text-amber-200 font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentQuote.surah} : {currentQuote.ayah}</span>
        </div>

        {/* Arabic Text */}
        <div className="my-3 text-right" dir="rtl">
          <p className="font-arabic text-xl sm:text-2xl leading-loose tracking-wide text-emerald-50 text-wrap balance font-normal">
            {currentQuote.arabic}
          </p>
        </div>

        {/* Indonesian Translation */}
        <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-700/30 my-2">
          <p className="text-xs sm:text-sm text-stone-200 italic leading-relaxed">
            "{currentQuote.translation}"
          </p>
        </div>

        {/* Reflection */}
        {!compact && (
          <div className="mt-3 flex items-start gap-2 text-xs text-emerald-200/90 bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-800/40">
            <span className="text-amber-400 font-bold shrink-0">💡 Nasehat:</span>
            <span className="leading-snug">{currentQuote.reflection}</span>
          </div>
        )}
      </div>
    </div>
  );
};
