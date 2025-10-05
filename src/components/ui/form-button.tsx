"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LogIn, UserPlus } from "lucide-react";

interface FormButtonProps {
  iconName: "log-in" | "user-plus";
  children: React.ReactNode;
  loadingText: string;
  className?: string;
}

export function FormButton({
  iconName,
  children,
  loadingText,
  className = "w-full",
}: FormButtonProps) {
  const { pending } = useFormStatus();

  const Icon = iconName === "log-in" ? LogIn : UserPlus;

  return (
    <Button type='submit' className={className} disabled={pending}>
      {pending ? (
        <>
          <Spinner className='mr-2 h-4 w-4' />
          {loadingText}
        </>
      ) : (
        <>
          <Icon className='mr-2 h-4 w-4' />
          {children}
        </>
      )}
    </Button>
  );
}
