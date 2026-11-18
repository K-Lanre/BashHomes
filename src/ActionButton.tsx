import type { ComponentPropsWithoutRef } from 'react';

type ActionButtonProps =
  | (ComponentPropsWithoutRef<'a'> & { href: string })
  | ComponentPropsWithoutRef<'button'>;

export function ActionButton(props: ActionButtonProps) {
  const className = props.className ? 'action-button ' + props.className : 'action-button';
  if ('href' in props) return <a {...props} className={className} />;
  return <button type="button" {...props} className={className} />;
}
