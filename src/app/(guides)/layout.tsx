import React from 'react';

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-24 min-h-screen bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  );
}
