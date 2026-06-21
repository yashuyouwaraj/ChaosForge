"use client";

function renderInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-black/40 px-1.5 py-0.5 text-cyan-300">$1</code>');
}

export function MarkdownMessage({ content }) {
  if (!content) {
    return null;
  }

  const blocks = content.split(/```/);

  return (
    <div className="space-y-4 text-sm leading-7 text-slate-200">
      {blocks.map((block, index) => {
        if (index % 2 === 1) {
          const [language, ...lines] = block.split("\n");
          const code = lines.join("\n").trim();

          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4"
            >
              {language.trim() && (
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {language.trim()}
                </p>
              )}
              <code>{code}</code>
            </pre>
          );
        }

        return block.split("\n").map((line, lineIndex) => {
          if (line.startsWith("|") && line.endsWith("|")) {
            const cells = line
              .slice(1, -1)
              .split("|")
              .map((cell) => cell.trim());

            if (cells.every((cell) => /^[-:]+$/.test(cell))) {
              return null;
            }

            return (
              <div key={`${index}-${lineIndex}`} className="grid grid-cols-3 gap-2 border-b border-white/5 py-2">
                {cells.map((cell, cellIndex) => (
                  <span
                    key={cellIndex}
                    dangerouslySetInnerHTML={{ __html: renderInline(cell) }}
                  />
                ))}
              </div>
            );
          }

          if (line.startsWith("- ")) {
            return (
              <p
                key={`${index}-${lineIndex}`}
                className="pl-4"
                dangerouslySetInnerHTML={{
                  __html: `• ${renderInline(line.slice(2))}`,
                }}
              />
            );
          }

          if (!line.trim()) {
            return <div key={`${index}-${lineIndex}`} className="h-2" />;
          }

          return (
            <p
              key={`${index}-${lineIndex}`}
              dangerouslySetInnerHTML={{ __html: renderInline(line) }}
            />
          );
        });
      })}
    </div>
  );
}
