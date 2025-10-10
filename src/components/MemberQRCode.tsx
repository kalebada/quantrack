import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MemberQRCodeProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

export const MemberQRCode = ({ isOpen, onClose, memberId, memberName }: MemberQRCodeProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/90 backdrop-blur-xl border-primary/30 shadow-glass max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            My Attendance Code
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary blur-2xl opacity-30 animate-pulse" />
            <div className="relative p-6 bg-background rounded-2xl shadow-2xl border-2 border-primary/20">
              <QRCodeSVG
                value={memberId}
                size={256}
                level="H"
                includeMargin={false}
                fgColor="hsl(var(--primary))"
                bgColor="hsl(var(--background))"
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">{memberName}</p>
            <p className="text-sm text-muted-foreground">Show this code to track attendance</p>
            <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded-md">
              ID: {memberId.slice(0, 8)}...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
