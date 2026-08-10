import { Store, Truck, Layers } from "lucide-react";
import { money } from "@/features/pos/lib/money";
import { ChannelTotal } from "../types";
import "./ReportCards.css";

export function ChannelBreakdownCard({ title, subtitle, walkIn, cloudKitchen, combined }: {
  title: string;
  subtitle: string;
  walkIn: ChannelTotal;
  cloudKitchen: ChannelTotal;
  combined: ChannelTotal;
}) {
  return (
    <div className="report-card">
      <div className="report-card-head">
        <div>
          <div className="eyebrow">{subtitle}</div>
          <div className="report-card-title">{title}</div>
        </div>
        <div className="report-card-total">
          <div className="text-xs text-faint">Total sales</div>
          <div className="amount" style={{ fontSize: 22 }}>{money(combined.grand_total)}</div>
        </div>
      </div>
      <div className="report-card-rows">
        <ChannelRow icon={<Store size={14} />} label="Walk-in" data={walkIn} />
        <ChannelRow icon={<Truck size={14} />} label="Cloud kitchen" data={cloudKitchen} />
        <ChannelRow icon={<Layers size={14} />} label="Combined" data={combined} strong />
      </div>
    </div>
  );
}

function ChannelRow({ icon, label, data, strong }: { icon: React.ReactNode; label: string; data: ChannelTotal; strong?: boolean }) {
  return (
    <div className={`channel-row ${strong ? "channel-row-strong" : ""}`}>
      <span className="channel-row-label">{icon} {label}</span>
      <span className="channel-row-count text-faint text-xs">{data.invoice_count} bill{data.invoice_count === 1 ? "" : "s"}</span>
      <span className="channel-row-amount amount">{money(data.grand_total)}</span>
    </div>
  );
}
