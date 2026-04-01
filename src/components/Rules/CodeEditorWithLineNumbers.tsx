import { FC, useMemo, useRef } from 'react';

interface CodeEditorWithLineNumbersProps {
  id: string;
  value: string;
  ariaLabel: string;
  onChange: (nextValue: string) => void;
}

const CodeEditorWithLineNumbers: FC<CodeEditorWithLineNumbersProps> = ({
  id,
  value,
  ariaLabel,
  onChange,
}) => {
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const lineCount = useMemo<number>(() => Math.max(1, value.split('\n').length), [value]);

  const handleScroll = (nextScrollTop: number): void => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = nextScrollTop;
    }
  };

  return (
    <div className="transpiled-editor-codeframe">
      <div className="transpiled-editor-gutter" aria-hidden="true" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={`line-${index + 1}`} className="transpiled-editor-gutter-line">
            {index + 1}
          </div>
        ))}
      </div>
      <textarea
        id={id}
        className="transpiled-editor-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => handleScroll(event.currentTarget.scrollTop)}
        spellCheck={false}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default CodeEditorWithLineNumbers;
