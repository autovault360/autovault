"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, MapPin, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormGrid } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectOptions,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/shared/modal-primitives";
import ProfilePhotoUpload from "@/components/profile/profile-photo-upload";
import { ProfileReadOnlyField, ProfileSection } from "@/components/profile/profile-section";
import {
  wholesaleDealerProfileUpdateSchema,
  type WholesaleDealerProfileUpdateValues,
} from "@/lib/profiles/actions/schemas";
import { updateWholesaleDealerProfile } from "@/lib/profiles/server/update-my-profile";
import { uploadMyProfileImage } from "@/lib/profiles/server/upload-profile-image";
import type { MyProfileData } from "@/lib/profiles/server/get-my-profile";
import { formatPhoneNumber, validateFile } from "@/lib/vehicles/actions/utils";
import { US_STATES } from "@/lib/vehicles/actions/add-vehicle/options";

type Props = {
  profile: Extract<MyProfileData, { role: "wholesale_dealer" }>;
};

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "WD"
  );
}

export default function WholesaleDealerProfileForm({ profile }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<WholesaleDealerProfileUpdateValues>({
    resolver: zodResolver(
      wholesaleDealerProfileUpdateSchema,
    ) as Resolver<WholesaleDealerProfileUpdateValues>,
    defaultValues: {
      contactPerson: profile.contactPerson,
      companyName: profile.companyName,
      businessPhone: profile.businessPhone,
      taxId: profile.taxId,
      licenseNumber: profile.licenseNumber,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
    },
    mode: "onBlur",
  });

  const handlePhoneChange = (value: string) => {
    form.setValue("businessPhone", formatPhoneNumber(value), {
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
      const result = await updateWholesaleDealerProfile(values);
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

  const displayName = profile.contactPerson || profile.companyName;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <ProfileSection
          title="Business Information"
          description="Your company details and primary contact information."
          icon={<Building2 className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-1">
                      <FieldLabel label="Company Name" required />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ABC Wholesale Motors"
                        theme="dark"
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Contact Person" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jane Smith"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessPhone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Business Phone" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          value={field.value}
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
              </FormGrid>
              <ProfileReadOnlyField label="Email" value={profile.email} />
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Tax ID / EIN" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="XX-XXXXXXX"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Dealer License Number" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="DL-123456"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </div>
            <ProfilePhotoUpload
              imageUrl={profile.imageUrl}
              initials={getInitials(displayName)}
              onFileSelect={handleImageChange}
            />
          </div>
        </ProfileSection>

        <ProfileSection
          title="Business Address"
          description="Your dealership's physical business address."
          icon={<MapPin className="h-4 w-4" />}
        >
          <FormField
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-1">
                  <FieldLabel label="Street Address" />
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="456 Commerce Blvd"
                    theme="dark"
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormGrid cols={3}>
            <FormField
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-1">
                    <FieldLabel label="City" />
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Dallas"
                      theme="dark"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-1">
                    <FieldLabel label="State" />
                    <FormMessage />
                  </div>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent theme="dark">
                      <SelectOptions options={US_STATES} label="State" theme="dark" />
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zip"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-1">
                    <FieldLabel label="ZIP" />
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="75201"
                      theme="dark"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormGrid>
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
