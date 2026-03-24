"use client";

import { AppSidebar } from "@/components/exiftrack/app-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-60 border-r border-border h-screen sticky top-0">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:w-[calc(100%-15rem)]">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <AppSidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="font-semibold text-foreground">Agung Tools</div>
        </header>

        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-65px)] lg:h-screen w-full">
            <div className="p-4 lg:p-6 mx-auto w-full max-w-6xl">{children}</div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
