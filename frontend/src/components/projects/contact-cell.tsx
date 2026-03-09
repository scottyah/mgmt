import { useState } from "react";
import { Mail, Phone, Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ContactCellProps {
  name: string | null;
  email: string | null;
  phone: string | null;
}

function CopyableRow({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs text-background transition-colors hover:bg-background/20"
    >
      <Icon className="size-3 shrink-0 opacity-70" />
      <span className="flex-1 truncate">{value}</span>
      {copied ? (
        <Check className="size-3 shrink-0 text-emerald-400" />
      ) : (
        <Copy className="size-3 shrink-0 opacity-50" />
      )}
    </button>
  );
}

export function ContactCell({ name, email, phone }: ContactCellProps) {
  if (!name) {
    return <span className="text-muted-foreground">--</span>;
  }

  const hasContact = email || phone;

  if (!hasContact) {
    return <span className="text-sm">{name}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-pointer text-sm underline decoration-dotted underline-offset-4">
        {name}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-1.5" side="bottom">
        <div className="space-y-0.5">
          {email && <CopyableRow icon={Mail} value={email} />}
          {phone && <CopyableRow icon={Phone} value={phone} />}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
