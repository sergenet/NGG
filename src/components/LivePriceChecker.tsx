import { BadgeInfo } from 'lucide-react';

export function LivePriceChecker({ slug }: { slug: string }) {
  void slug;
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <BadgeInfo className="mt-0.5 h-5 w-5 shrink-0" />
      <p><strong>Price note:</strong> Listed prices are catalog snapshots, not live quotes. Confirm price, stock, shipping, and return terms on the retailer’s site before purchasing.</p>
    </div>
  );
}
