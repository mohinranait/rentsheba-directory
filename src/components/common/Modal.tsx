"use client";
import { cn } from "cn";
import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title: string;
  subTitle?: string;
  className?: string;
  bodyCss?: string;
};



function Modal({
  children,
  open,
  onOpenChange,
  title,
  subTitle,
  className = '',
  bodyCss
}: Props) {


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className={cn("sm:max-w-xl p-0 gap-0", className)}>
        <DialogHeader className="p-4">
          <DialogTitle>
            {title}
          </DialogTitle>

          {
            subTitle &&
            <DialogDescription>
              {subTitle}
            </DialogDescription>
          }
        </DialogHeader>
        <div className={cn("p-4 max-h-[70vh] overflow-y-auto", bodyCss)}>
          {children}
        </div>
      </DialogPopup>
    </Dialog>
  );
}

export default Modal;
