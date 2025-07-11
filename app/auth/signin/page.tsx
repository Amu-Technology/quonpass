import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="https://amu-lab.com" className="flex items-center gap-2 self-center font-medium">
          Amu-Technology Inc.
        </a>
        <LoginForm />
      </div>
    </div>
  )
}