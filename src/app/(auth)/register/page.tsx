import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { register } from "@/actions/auth";
import { FormButton } from "@/components/ui/form-button";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Project Header */}
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center'>
            <UserPlus className='h-8 w-8 text-white' />
          </div>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>
            Create Account
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Join the UKNF Communication System
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Information</CardTitle>
            <CardDescription>
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={register as any} className='space-y-4'>
              {/* Email */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='Enter your email address'
                  required
                />
              </div>

              {/* Name Fields */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    name='firstName'
                    placeholder='Enter first name'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    name='lastName'
                    placeholder='Enter last name'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                {/* PESEL */}
                <div className='space-y-2'>
                  <Label htmlFor='pesel'>PESEL</Label>
                  <Input
                    id='pesel'
                    name='pesel'
                    placeholder='Enter 11-digit PESEL number'
                    maxLength={11}
                    required
                  />
                </div>

                {/* Phone */}
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    name='phone'
                    type='tel'
                    placeholder='Enter phone number'
                    required
                  />
                </div>
              </div>

              {/* User Type */}
              <div className='space-y-2'>
                <Label htmlFor='userType'>User Type</Label>
                <Select
                  name='userType'
                  defaultValue='Supervised Entity Employee'
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select your user type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Supervised Entity Employee'>
                      Supervised Entity Employee
                    </SelectItem>
                    <SelectItem value='Supervised Entity Administrator'>
                      Supervised Entity Administrator
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormButton
                iconName='user-plus'
                loadingText='Creating Account...'
              >
                Create Account
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
            Already have an account?{" "}
            <Link
              href='/login'
              className='text-primary hover:underline font-medium'
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
