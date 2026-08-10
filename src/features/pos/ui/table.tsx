import { cn } from "@/features/pos/lib/utils";
import "./table.css";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="table-wrap">
      <table className={cn("table", className)} {...props} />
    </div>
  );
}
export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}
export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("t-row", className)} {...props} />;
}
export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("t-head-cell", className)} {...props} />;
}
export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("t-cell", className)} {...props} />;
}
