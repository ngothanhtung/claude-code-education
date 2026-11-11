import katex from 'katex';
import { Fragment } from 'react';

/**
 * Macro dùng chung:
 *  \blank – ô trống "?" (dùng class .blank)
 *  \chia  – dấu chia ":" của chương trình tiểu học, khoảng cách như phép toán hai ngôi
 */
const MACROS = {
  '\\blank': '\\htmlClass{blank}{?}',
  '\\chia': '\\mathbin{:}',
};

const cache = new Map<string, string>();

function render(src: string, display: boolean) {
  const key = (display ? 'D' : 'I') + src;
  let html = cache.get(key);
  if (html === undefined) {
    html = katex.renderToString(src, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'html',
      macros: { ...MACROS },
      trust: (ctx) => ctx.command === '\\htmlClass',
    });
    cache.set(key, html);
  }
  return html;
}

/** Công thức LaTeX (mặc định nằm trong dòng) */
export function Tex({ src, display = false }: { src: string; display?: boolean }) {
  return <span className="tex" dangerouslySetInnerHTML={{ __html: render(src, display) }} />;
}

/** Chữ có lẫn công thức: "Tổng vận tốc là $v_1 + v_2$" */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('$') && part.endsWith('$') && part.length > 1 ? (
          <Tex key={i} src={part.slice(1, -1)} />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
