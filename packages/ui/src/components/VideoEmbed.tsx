'use client';

export interface VideoEmbedProps {
  src: string;
  title: string;
  start?: number;
}

export function VideoEmbed({ src, title, start }: VideoEmbedProps) {
  const url = start ? `${src}?t=${start}` : src;
  return (
    <div className="my-6 rounded-[var(--radius-card)] overflow-hidden border border-gray-200">
      <div className="bg-gray-900 px-4 py-2 text-xs text-gray-300 flex items-center gap-2">
        <span>▶</span>
        <span className="truncate">{title}</span>
      </div>
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
