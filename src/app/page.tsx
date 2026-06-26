"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="p-8">
      <Button onClick={() => toast.success("Toast works")}>Show toast</Button>
    </div>
  );
}