import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
};

/** Centered placeholder for empty, no-result and error states. */
export const EmptyState = ({ icon, title, message, action }: Props) => (
  <div className="mb-8 flex flex-col items-center px-6 py-14 text-center">
    <div className="mb-3 text-(--ms-app-text-secondary)/70">{icon}</div>
    <p className="text-[20px] font-semibold">{title}</p>
    {message && (
      <p className="mt-1 max-w-80 text-[15px] leading-5 text-(--ms-app-text-secondary)">{message}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
