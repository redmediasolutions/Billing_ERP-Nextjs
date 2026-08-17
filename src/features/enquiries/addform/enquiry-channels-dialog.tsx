"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  useCreateEnquiryChannel,
  useEnquiryChannels,
  useUpdateEnquiryChannel,
} from "../hooks/use-enquiries";

export function EnquiryChannelsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: channels = [], isLoading } = useEnquiryChannels();
  const createChannel = useCreateEnquiryChannel();
  const updateChannel = useUpdateEnquiryChannel();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const channel_name = name.trim();
    if (!channel_name) {
      setError("Enter a channel name.");
      return;
    }

    try {
      setError("");
      await createChannel.mutateAsync({ channel_name });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add channel.");
    }
  }

  async function toggleActive(id: number, isActive: boolean, channelName: string) {
    try {
      setError("");
      await updateChannel.mutateAsync({
        id,
        input: { channel_name: channelName, is_active: !isActive },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update channel.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enquiry channels</DialogTitle>
          <DialogDescription>
            Defaults (Phone, WhatsApp, Walk-in…) are created per company. Add
            your own without leaving Enquiries.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New channel name"
          />
          <Button type="submit" disabled={createChannel.isPending}>
            {createChannel.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Add
          </Button>
        </form>

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading channels...
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {channels.map((channel) => (
              <li
                key={channel.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <p className="text-sm font-medium">{channel.channel_name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={channel.is_active ? "secondary" : "outline"}>
                    {channel.is_active ? "Active" : "Hidden"}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      toggleActive(
                        channel.id,
                        channel.is_active,
                        channel.channel_name
                      )
                    }
                  >
                    {channel.is_active ? "Hide" : "Show"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
