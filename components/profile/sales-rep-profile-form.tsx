"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, Save, UserRound } from "lucide-react";
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
  salesRepProfileUpdateSchema,
  type SalesRepProfileUpdateValues,
} from "@/lib/profiles/actions/schemas";
import { updateSalesRepProfile } from "@/lib/profiles/server/update-my-profile";
import { uploadMyProfileImage } from "@/lib/profiles/server/upload-profile-image";
import type { MyProfileData } from "@/lib/profiles/server/get-my-profile";
import { formatPhoneNumber, validateFile } from "@/lib/vehicles/actions/utils";
import { US_STATES } from "@/lib/vehicles/actions/add-vehicle/options";

type Props = {
  profile: Extract<MyProfileData, { role: "sales_rep" }>;
};

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default function SalesRepProfileForm({ profile }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<SalesRepProfileUpdateValues>({
    resolver: zodResolver(salesRepProfileUpdateSchema) as Resolver<SalesRepProfileUpdateValues>,
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone,
      address: profile.address,
      address2: profile.address2,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
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
      const result = await updateSalesRepProfile(values);
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
          title="Basic Information"
          description="Your name and contact details visible to your dealership team."
          icon={<UserRound className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-1">
                      <FieldLabel label="Full Name" required />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
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
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Phone" required />
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
                <ProfileReadOnlyField label="Email" value={profile.email} />
              </FormGrid>
            </div>
            <ProfilePhotoUpload
              imageUrl={profile.imageUrl}
              initials={getInitials(profile.fullName)}
              onFileSelect={handleImageChange}
            />
          </div>
        </ProfileSection>

        <ProfileSection
          title="Address"
          description="Your mailing address for dealership records."
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
                    placeholder="123 Main St"
                    theme="dark"
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address2"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-1">
                  <FieldLabel label="Address Line 2" />
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Apt, Suite, Floor, etc."
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
                      placeholder="New York"
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
                      placeholder="10001"
                      theme="dark"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormGrid>
        </ProfileSection>

        <ProfileSection
          title="Employment Details"
          description="These fields are managed by your dealership administrator."
        >
          <FormGrid cols={3}>
            <ProfileReadOnlyField
              label="Hire Date"
              value={
                profile.hireDate
                  ? new Date(profile.hireDate + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <ProfileReadOnlyField
              label="Commission Rate"
              value={`${profile.commissionRate.toFixed(1)}%`}
            />
            <ProfileReadOnlyField
              label="Monthly Goal"
              value={new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(profile.monthlyGoal)}
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
