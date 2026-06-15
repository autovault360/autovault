"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, UserRound } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormGrid } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/shared/modal-primitives";
import ProfilePhotoUpload from "@/components/profile/profile-photo-upload";
import { ProfileReadOnlyField, ProfileSection } from "@/components/profile/profile-section";
import {
  cpaProfileUpdateSchema,
  type CpaProfileUpdateValues,
} from "@/lib/profiles/actions/schemas";
import { updateCpaProfile } from "@/lib/profiles/server/update-my-profile";
import { uploadMyProfileImage } from "@/lib/profiles/server/upload-profile-image";
import type { MyProfileData } from "@/lib/profiles/server/get-my-profile";
import { formatPhoneNumber, validateFile } from "@/lib/vehicles/actions/utils";

type Props = {
  profile: Extract<MyProfileData, { role: "cpa" }>;
};

function getInitials(firstName: string, lastName: string): string {
  const first = firstName[0] ?? "";
  const last = lastName[0] ?? "";
  return (first + last).toUpperCase() || "CP";
}

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function CpaProfileForm({ profile }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<CpaProfileUpdateValues>({
    resolver: zodResolver(cpaProfileUpdateSchema) as Resolver<CpaProfileUpdateValues>,
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    },
    mode: "onBlur",
  });

  const handlePhoneChange = (value: string) => {
    form.setValue("phone", formatPhoneNumber(value), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      return;
    }
    const error = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png"],
    });
    if (error) {
      toast.error(error);
      return;
    }
    setImageFile(file);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    NProgress.start();
    setIsSubmitting(true);
    try {
      const result = await updateCpaProfile(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (imageFile) {
        const uploadResult = await uploadMyProfileImage(imageFile);
        if (!uploadResult.success) {
          toast.error(`Profile saved but photo upload failed: ${uploadResult.error}`);
        }
      }

      toast.success("Profile updated successfully");
      setImageFile(null);
      router.refresh();
    } finally {
      setIsSubmitting(false);
      NProgress.done();
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <ProfileSection
          title="Personal Information"
          description="Your name and contact details for the CPA portal."
          icon={<UserRound className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="First Name" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jane"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Last Name" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Smith"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Phone" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          onBlur={field.onBlur}
                          placeholder="(555) 123-4567"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <ProfileReadOnlyField label="Email" value={profile.email} />
              </FormGrid>
              <ProfileReadOnlyField
                label="Account Status"
                value={formatStatus(profile.status)}
              />
            </div>
            <ProfilePhotoUpload
              imageUrl={profile.imageUrl}
              initials={getInitials(profile.firstName, profile.lastName)}
              onFileSelect={handleImageChange}
              variant="avatar"
            />
          </div>
        </ProfileSection>

        <div className="flex justify-end border-t border-slate-800/60 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 gap-2 bg-blue-600 px-5 text-[13px] hover:bg-blue-500"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
