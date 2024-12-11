import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShadowProps {
  title?: string;
  buttonName?: string;
  buttonNeeded?: boolean;
  titleNeeded?: boolean;
  dialogTitle?: string;
  dialogDescription?: string;
  dialogContent?: React.ReactNode;
  children: React.ReactNode;
  isDialogOpen?: boolean;
  setIsDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export const ShadowContainer: React.FC<ShadowProps> = ({
  title,
  children,
  buttonName,
  buttonNeeded = true,
  titleNeeded = true,
  dialogTitle,
  dialogDescription,
  dialogContent,
  isDialogOpen,
  setIsDialogOpen,
  className,
}) => {
  const [isLocalDialogOpen, setIsLocalDialogOpen] = useState(false);

  const dialogOpen = isDialogOpen ?? isLocalDialogOpen;
  const setDialogOpen = setIsDialogOpen ?? setIsLocalDialogOpen;

  return (
    <div className={`w-full border rounded-md ${className || ''}`}>
      <div className={`flex px-4 justify-between w-full h-auto ${titleNeeded ? "border-b py-2" : ""}`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        {buttonNeeded && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="hover:text-primary duration-200 ease-in-out flex items-center gap-x-2 text-xs font-semibold">
              {buttonName}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </DialogHeader>
              {dialogContent}
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default ShadowContainer;
