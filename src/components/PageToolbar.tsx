import { FC, ReactNode } from 'react';

interface PageToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

const PageToolbar: FC<PageToolbarProps> = ({ left, right, className }) => {
  const justifyContentClass =
    left && right
      ? 'justify-content-between'
      : right
        ? 'justify-content-end'
        : 'justify-content-start';

  return (
    <div
      className={['w-100', 'd-flex', 'align-items-center', 'mb-3', justifyContentClass, className]
        .filter(Boolean)
        .join(' ')}
    >
      {left ? <div>{left}</div> : null}
      {right ? <div>{right}</div> : null}
    </div>
  );
};

export default PageToolbar;
