"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useLocale } from "@/lib/i18n";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const { t } = useLocale();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success(t("toast.welcomeBack"));
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">
        {t("auth.welcomeBack")}
      </h1>
      <p className="text-muted-foreground mb-10">
        {t("auth.signInDesc")}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <form.Field name="email">
          {(field) => (
            <div className="space-y-2.5">
              <Label htmlFor={field.name}>{t("auth.email")}</Label>
              <Input
                id={field.name}
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-12 rounded-xl px-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-2.5">
              <Label htmlFor={field.name}>{t("auth.password")}</Label>
              <Input
                id={field.name}
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-12 rounded-xl px-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              disabled={!state.canSubmit || state.isSubmitting}
              className="w-full h-12 rounded-xl text-base backdrop-blur-xl bg-primary/80 border border-white/15 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 transition-all duration-200 disabled:translate-y-0"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.12)' }}
            >
              {state.isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <button
          onClick={onSwitchToSignUp}
          className="text-primary font-medium hover:underline"
        >
          {t("auth.signUp")}
        </button>
      </p>
    </div>
  );
}
