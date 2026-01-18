import { FC, SVGProps } from 'react';
import { ICON_PATHS } from './icon.paths';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const baseSvgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: false,
} as const;

const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: 2,
} as const;

export const DeleteIcon: FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg width={size} height={size} className={className} {...baseSvgProps} {...props}>
    <path d={ICON_PATHS.delete[0]} {...strokeProps} strokeLinecap="round" />
    <path d={ICON_PATHS.delete[1]} {...strokeProps} strokeLinejoin="round" />
    <path d={ICON_PATHS.delete[2]} {...strokeProps} strokeLinecap="round" />
    <path d={ICON_PATHS.delete[3]} {...strokeProps} strokeLinejoin="round" />
    <path d={ICON_PATHS.delete[4]} {...strokeProps} strokeLinecap="round" />
    <path d={ICON_PATHS.delete[5]} {...strokeProps} strokeLinecap="round" />
  </svg>
);

export const EditIcon: FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg width={size} height={size} className={className} {...baseSvgProps} {...props}>
    <path d={ICON_PATHS.edit[0]} {...strokeProps} strokeLinejoin="round" />
    <path d={ICON_PATHS.edit[1]} {...strokeProps} strokeLinecap="round" />
    <path d={ICON_PATHS.edit[2]} {...strokeProps} strokeLinecap="round" />
  </svg>
);

export const CreateIcon: FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg width={size} height={size} className={className} {...baseSvgProps} {...props}>
    <path d={ICON_PATHS.create[0]} {...strokeProps} strokeLinecap="round" />
    <path d={ICON_PATHS.create[1]} {...strokeProps} strokeLinecap="round" />
  </svg>
);
