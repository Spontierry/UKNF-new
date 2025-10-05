import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Shield } from "lucide-react";
import { login } from "@/actions/auth";
import Link from "next/link";
import { FormButton } from "@/components/ui/form-button";

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Project Header */}
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center'>
            <Shield className='h-8 w-8 text-white' />
          </div>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>
            UKNF Communication System
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Secure communication platform for Polish financial supervisory
            authority
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login as any} className='space-y-4'>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='email'>Email Address</FieldLabel>
                  <FieldContent>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='Enter your email address'
                      required
                    />
                    <FieldDescription>
                      Enter the email address associated with your account
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor='password'>Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      placeholder='Enter your password'
                      required
                    />
                    <FieldDescription>
                      Enter your secure password
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>

              <FormButton iconName='log-in' loadingText='Signing In...'>
                Sign In
              </FormButton>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className='text-center space-y-2'>
          <p className='text-xs text-gray-500'>
            This system enables structured, auditable communication between
            client organizations and the UKNF institution.
          </p>
          <p className='text-sm text-gray-600'>
            Don't have an account?{" "}
            <Link
              href='/register'
              className='text-primary hover:underline font-medium'
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
