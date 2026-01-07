interface TextBlockProps {
  title?: string;
  body: string | string[];
}

export function TextBlock({ title, body }: TextBlockProps) {
  const paragraphs = Array.isArray(body) ? body : [body];

  return (
    <section className="border-b-4 border-foreground p-5">
      {title && (
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-tight">
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="font-body text-sm leading-relaxed text-muted-foreground">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
