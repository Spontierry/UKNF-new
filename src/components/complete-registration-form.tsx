"use client";

import { completeRegistration } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

interface CompleteRegistrationFormProps {
  requestId: string;
}

export function CompleteRegistrationForm({
  requestId,
}: CompleteRegistrationFormProps) {
  const { execute } = useAction(completeRegistration);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Project Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been created. Please set a secure password to
            complete your registration.
          </p>
        </div>

        {/* Password Setup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Registration</CardTitle>
            <CardDescription>
              Enter a secure password to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={execute} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      required
                    />
                    <FieldDescription>
                      Choose a strong password with at least 8 characters
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>

              <input type="hidden" name="requestId" value={requestId} />

              <Button type="submit" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Complete Registration
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            After setting your password, you'll be able to access the UKNF
            Communication System.
          </p>
        </div>
      </div>
    </div>
  );
}
