"use client";
import { Store, Truck } from "lucide-react";
import { useCart } from "../hooks/useCart";
import "./ChannelToggle.css";

export function ChannelToggle() {
  const { channel, setChannel } = useCart();
  return (
    <div className="channel-toggle" role="tablist" aria-label="Sales channel">
      <button
        type="button"
        className={`channel-btn ${channel === "walk_in" ? "channel-btn-active" : ""}`}
        onClick={() => setChannel("walk_in")}
      >
        <Store size={15} /> Walk-in
      </button>
      <button
        type="button"
        className={`channel-btn ${channel === "cloud_kitchen" ? "channel-btn-active" : ""}`}
        onClick={() => setChannel("cloud_kitchen")}
      >
        <Truck size={15} /> Cloud kitchen
      </button>
    </div>
  );
}
