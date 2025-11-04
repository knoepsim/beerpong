"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";

type Props = React.ComponentPropsWithoutRef<typeof Button> & {
  href: string;
};

export default function RouterButton({ href, children, ...buttonProps }: Props) {
  const router = useRouter();
  return (
    <Button {...buttonProps} onClick={() => router.push(href)}>
      {children}
    </Button>
  );
}
