import { FC, KeyboardEvent, useMemo, useRef } from 'react';

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineCount = useMemo<number>(() => Math.max(1, value.split('\n').length), [value]);

  const handleScroll = (nextScrollTop: number): void => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = nextScrollTop;
    }
  };

  // Make sure Tab adds 2 spaces instead of exiting focus
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key !== 'Tab') {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const indent = '  '; // 2 spaces
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const nextValue = `${value.slice(0, selectionStart)}${indent}${value.slice(selectionEnd)}`;
    const nextCursorPosition = selectionStart + indent.length;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      if (!textareaRef.current) {
        return;
      }

      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(nextCursorPosition, nextCursorPosition);
      handleScroll(textareaRef.current.scrollTop);
    });
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
        ref={textareaRef}
        id={id}
        className="transpiled-editor-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={(event) => handleScroll(event.currentTarget.scrollTop)}
        spellCheck={false}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default CodeEditorWithLineNumbers;
