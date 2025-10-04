"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

// Step 1 validation schema
const step1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type Step1Data = z.infer<typeof step1Schema>;

// Step 2 validation schema
const step2Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  pesel: z
    .string()
    .length(11, "PESEL must be exactly 11 digits")
    .regex(/^\d{11}$/, "PESEL must contain only digits"),
  phone: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
  userType: z.enum([
    "Supervised Entity Administrator",
    "Supervised Entity Employee",
  ] as const),
});

type Step2Data = z.infer<typeof step2Schema>;

// Combined form data type
type RegistrationData = Step1Data & Step2Data;

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  // Step 1 Form
  const step1Form = useForm({
    defaultValues: {
      email: "",
    } as Step1Data,
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
      setStep1Data(value);
      setCurrentStep(2);
    },
  });

  // Step 2 Form
  const step2Form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      pesel: "",
      phone: "",
      userType: "Supervised Entity Employee" as const,
    } as Step2Data,
    validators: {
      onChange: step2Schema,
    },
    onSubmit: async ({ value }) => {
      if (step1Data) {
        const completeData: RegistrationData = {
          ...step1Data,
          ...value,
        };
        console.log("Complete registration data:", completeData);
        // Here you would submit to your server action
        alert("Registration completed! (Check console for data)");
      }
    },
  });

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Project Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the UKNF Communication System
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <div
            className={`w-16 h-1 ${
              currentStep >= 2 ? "bg-primary" : "bg-gray-200"
            }`}
          />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
        </div>

        {/* Step 1: Email */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Enter your email address to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  step1Form.handleSubmit();
                }}
                className="space-y-4"
              >
                <step1Form.Field
                  name="email"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor="email">Email Address</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your email address"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Organization Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Enter your personal details and user type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  step2Form.handleSubmit();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <step2Form.Field
                    name="firstName"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                          id="firstName"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter first name"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  <step2Form.Field
                    name="lastName"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input
                          id="lastName"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter last name"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>

                <step2Form.Field
                  name="pesel"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor="pesel">PESEL</FieldLabel>
                      <Input
                        id="pesel"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter 11-digit PESEL number"
                        maxLength={11}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <step2Form.Field
                  name="phone"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter phone number"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <step2Form.Field
                  name="userType"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor="userType">User Type</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as
                              | "Supervised Entity Administrator"
                              | "Supervised Entity Employee"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Supervised Entity Employee">
                            Supervised Entity Employee
                          </SelectItem>
                          <SelectItem value="Supervised Entity Administrator">
                            Supervised Entity Administrator
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToStep1}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Complete Registration
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            This system enables structured, auditable communication between
            client organizations and the UKNF institution.
          </p>
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
