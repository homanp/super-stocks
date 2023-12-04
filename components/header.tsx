import { RxExternalLink } from "react-icons/rx";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Header() {
  return (
    <div className="flex px-6 py-4 justify-between absolute left-0 right-0 z-[100]">
      <div className="flex space-x-2">
        <p className="font-bold font-mono">NO-7B</p>
        <p className="text-muted-foreground font-mono">v0.1</p>
      </div>
      <div className="flex space-x-4">
        <a
          href="https://github.com/homanp/nagato-online-7b"
          className="font-mono flex space-x-2 items-center cursor-pointer hover:opacity-30 transition-all"
        >
          <span>API</span>
          <RxExternalLink />
        </a>
        <Dialog>
          <DialogTrigger>
            <p className="font-mono cursor-pointer hover:opacity-30">ABOUT</p>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-mono">NAGATO-ONLINE-7B</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              <span className="text-white font-mono">NO-7B</span> is an open
              source LLM designed to surpass the knowledge cut-off date by
              leveraging the internet to output real-time and factual responses.
            </p>
            <p className="text-muted-foreground">
              You can access <span className="font-mono">NO-7B</span> via a REST
              API interface. The API is offered for free, this is subject to
              change.
            </p>
            <p className="text-muted-foreground">
              The API is licensed under MIT and offered as is. The API is
              currently rate-limited to 20s/min.
            </p>
            <p className="text-muted-foreground">
              Visit the{" "}
              <a
                href="https://github.com/homanp/nagato-online-7b"
                className="text-white underline"
              >
                Github repo
              </a>{" "}
              to learn more.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
