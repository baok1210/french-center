import Image from 'next/image';

const vowels = [
  { symbol: '/a/', desc: 'Open front unrounded — như "father" nhưng lưỡi đưa lên 25%', img: '/french-a-sound.png' },
  { symbol: '/e/', desc: 'Close-mid front unrounded — như "put" nhưng xa hơn "pit"', img: '/french-e-sound.png' },
  { symbol: '/o/', desc: 'Close-mid back rounded — như "no" nhưng bỏ /ʊ/ cuối', img: '/french-o-sound.png' },
  { symbol: '/y/', desc: 'Close front rounded — bắt đầu /i/, tròn môi', img: null },
  { symbol: '/ø/', desc: 'Close-mid front rounded — như "pit", tròn môi', img: null },
  { symbol: '/ɛ̃/', desc: 'Nasal: open-mid front unrounded nasal', img: null },
  { symbol: '/ã/', desc: 'Nasal: open front unrounded nasal', img: null },
  { symbol: '/ɔ̃/', desc: 'Nasal: open-mid back rounded nasal', img: null },
];

export default function PronunciationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-xl font-semibold tracking-tight">Phát âm tiếng Pháp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hướng dẫn phát âm dành cho người nói tiếng Anh — 3 phụ âm mới và 10 nguyên âm mới.
      </p>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng quan nguyên âm & phụ âm</h2>
        <Image
          src="/3-consonant-sounds-and-10-vowel-sounds.png"
          alt="3 phụ âm và 10 nguyên âm"
          width={600}
          height={400}
          className="mt-4 rounded-2xl border border-border/50"
        />
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">So sánh nguyên âm Pháp-Anh</h2>
        <Image
          src="/english-vs-french-vowels.png"
          alt="So sánh nguyên âm Pháp và Anh"
          width={600}
          height={400}
          className="mt-4 rounded-2xl border border-border/50"
        />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Các nguyên âm chính</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {vowels.map((v) => (
            <div key={v.symbol} className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
              <span className="text-lg font-bold text-primary">{v.symbol}</span>
              <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
              {v.img && (
                <Image
                  src={v.img}
                  alt={`Sơ đồ ${v.symbol}`}
                  width={240}
                  height={120}
                  className="mt-2 rounded"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phụ âm /l/ — Pháp vs Anh</h2>
        <Image
          src="/english-vs-french-l-sound.png"
          alt="So sánh âm L Pháp và Anh"
          width={600}
          height={300}
          className="mt-4 rounded-2xl border border-border/50"
        />
      </section>
    </div>
  );
}
