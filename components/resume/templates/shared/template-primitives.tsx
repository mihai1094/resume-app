import type { ComponentType, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TemplateSectionHeading({
  title,
  className,
  titleClassName,
  leading,
  trailing,
}: {
  title: ReactNode;
  className?: string;
  titleClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {leading}
      <h2 className={cn("text-xl font-bold text-gray-900", titleClassName)}>
        {title}
      </h2>
      {trailing}
    </div>
  );
}

export function TemplateContactLine({
  icon: Icon,
  children,
  className,
  iconClassName,
  iconStyle,
}: {
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  children: ReactNode;
  className?: string;
  iconClassName?: string;
  iconStyle?: CSSProperties;
}) {
  return (
    <div className={cn("flex items-start gap-3 min-w-0", className)}>
      <Icon
        className={cn("w-4 h-4 mt-0.5 flex-shrink-0", iconClassName)}
        style={iconStyle}
      />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

export function TemplateChipList({
  items,
  className,
  chipClassName,
  chipStyle,
}: {
  items: Array<{ key: string; label: ReactNode }>;
  className?: string;
  chipClassName?: string;
  chipStyle?: CSSProperties;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <span
          key={item.key}
          className={cn("px-2 py-1 text-xs rounded", chipClassName)}
          style={chipStyle}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function TemplateBulletList({
  items,
  className,
  itemClassName,
  renderBullet,
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  renderBullet: () => ReactNode;
}) {
  const filteredItems = items.filter((item) => item.trim());

  if (filteredItems.length === 0) return null;

  return (
    <ul className={cn("space-y-1.5", className)}>
      {filteredItems.map((item, index) => (
        <li key={`${item}-${index}`} className={cn("flex gap-2", itemClassName)}>
          {renderBullet()}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
