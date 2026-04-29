"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function VerificationInfo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center align-middle ml-1 text-slate-500 hover:text-slate-300">
        <Info className="w-3.5 h-3.5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>What is verification?</DialogTitle>
            <DialogDescription className="text-slate-400 space-y-2 pt-1">
              <p>After you submit a task, we check that your comment or post is still live on Reddit.</p>
              <p>This check happens automatically. Once your submission passes, the credits move from <strong className="text-white">pending</strong> to <strong className="text-white">available</strong> and you can withdraw them.</p>
              <p>If the post is removed or deleted before the check completes, the credits are voided.</p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
