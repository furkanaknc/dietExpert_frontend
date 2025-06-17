import ReactMarkdown from 'react-markdown';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-gray-900 mb-2 mt-3 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-gray-900 mb-2 mt-3 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold text-gray-900 mb-1 mt-2 first:mt-0">
            {children}
          </h3>
        ),
        
        p: ({ children }) => (
          <p className="text-gray-800 text-sm leading-relaxed mb-2 last:mb-0">
            {children}
          </p>
        ),
        
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">
            {children}
          </strong>
        ),
        
        em: ({ children }) => (
          <em className="italic text-gray-800">
            {children}
          </em>
        ),
        
        ul: ({ children }) => (
          <ul className="list-none space-y-1 mb-3 ml-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">
            {children}
          </ol>
        ),
        li: ({ children, ordered }) => (
          <li className={`text-gray-800 text-sm leading-relaxed ${
            ordered ? '' : 'flex items-start'
          }`}>
            {!ordered && (
              <span className="text-green-600 mr-2 mt-0.5 flex-shrink-0">•</span>
            )}
            <span className={ordered ? '' : 'flex-1'}>
              {children}
            </span>
          </li>
        ),
        
        code: ({ children, inline }) => (
          inline ? (
            <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ) : (
            <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
              <code>{children}</code>
            </pre>
          )
        ),
        
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-green-500 pl-3 py-1 bg-green-50 text-gray-700 text-sm italic mb-2">
            {children}
          </blockquote>
        ),
        
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        
        hr: () => (
          <hr className="border-gray-300 my-3" />
        )
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
