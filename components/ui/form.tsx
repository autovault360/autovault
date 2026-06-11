"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { Slot } from "radix-ui";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-1.5", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        "animate-in fade-in slide-in-from-top-1 text-destructive text-[11px] duration-200 motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
}

export function FormGrid({
  cols = 4,
  children,
  className,
}: {
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid gap-x-4 gap-y-3.5 items-start", colClass, className)}>
      {children}
    </div>
  );
}

export function FormSection({
  title,
  theme = "light",
  headerRight,
  className,
  children,
}: {
  title: string;
  theme?: "light" | "dark";
  headerRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative rounded-lg border px-4 pb-4 pt-5",
        theme === "dark" ? "border-slate-700" : "border-[#E0E0E0]",
        className,
      )}
    >
      <div
        className={cn(
          "shrink-0 flex items-center gap-3 px-1.5",
          theme === "dark" ? "bg-card" : "bg-white",
        )}
      >
        <span
          className={cn(
            "shrink-0 inline-flex absolute -top-[10px] left-4 right-4 text-[11px] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded-sm",
            theme === "dark" ? "text-blue-400" : "text-[#2563eb]",
          )}
        >
          <span className={cn(
            "inline px-2",
            theme === "dark" ? "bg-card" : "bg-white",
          )}>
            {title}
          </span>
        </span>
        {headerRight && (
          <span className="ml-auto text-[10px] text-slate-400">{headerRight}</span>
        )}
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
