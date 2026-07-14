import type { MDXComponents } from 'mdx/types';

// Required by @next/mdx for the App Router. Applies house styling to MDX blog
// content (rendered inside a `prose` container by the blog layout).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-10 text-2xl font-bold text-navy-900" {...props} />,
    h3: (props) => <h3 className="mt-8 text-xl font-semibold text-navy-900" {...props} />,
    p: (props) => <p className="mt-4 leading-7 text-slate-700" {...props} />,
    ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700" {...props} />,
    ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    a: (props) => (
      <a className="font-medium text-navy-700 underline-offset-4 hover:underline" {...props} />
    ),
    strong: (props) => <strong className="font-semibold text-navy-900" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="mt-6 border-l-4 border-navy-200 bg-slate-50 py-2 pl-4 italic text-slate-600"
        {...props}
      />
    ),
    code: (props) => (
      <code
        className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-navy-800"
        {...props}
      />
    ),
    ...components,
  };
}
