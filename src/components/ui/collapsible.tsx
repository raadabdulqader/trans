'use client';

import * as React from "react";

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

interface CollapsibleContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  disabled: boolean;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null);

export const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible");
  }
  return context;
};

/**
 * Shadcn-UI Standard Collapsible Component
 * https://ui.shadcn.com/docs/components/base/collapsible#basic
 */
export const Collapsible: React.FC<CollapsibleProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  className = "",
  ...props
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const toggle = React.useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
  }, [disabled, isOpen, setIsOpen]);

  return (
    <CollapsibleContext.Provider value={{ isOpen, setIsOpen, toggle, disabled }}>
      <div
        className={`w-full ${className}`.trim()}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  className = "",
  onClick,
  ...props
}) => {
  const { toggle, disabled, isOpen } = useCollapsible();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      data-state={isOpen ? "open" : "closed"}
      aria-expanded={isOpen}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  className = "",
  forceMount = false,
  ...props
}) => {
  const { isOpen } = useCollapsible();

  if (!isOpen && !forceMount) {
    return null;
  }

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className={`overflow-hidden transition-all duration-200 animate-in fade-in-50 zoom-in-98 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
