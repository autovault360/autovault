"use client";

import { Tag } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { useUpdatePricingForm } from "@/hooks/vehicles/use-update-pricing-form";
import {
  PRICE_UPDATE_REASONS,
  PRICING_STRATEGIES,
} from "@/lib/vehicles/actions/options";
import { FormGrid, FormSection } from "@/components/ui/form";
import { Input, type InputTone } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectOptions,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CompareToMarket,
  FieldLabel,
  InfoBanner,
  MarketDataFooter,
  MarketStatCard,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VehicleActionDialog,
  VehicleSummaryBlock,
} from "@/components/shared/modal-primitives";

type Props = {
  vehicle: VehicleDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UpdatePricingModal({
  vehicle,
  open,
  onOpenChange,
}: Props) {
  const {
    form,
    onSubmit,
    isSubmitting,
    derived,
    shake,
    photoPreview,
    handlePhotoChange,
    formatMarketValue,
  } = useUpdatePricingForm(vehicle, open, () => onOpenChange(false));

  const changeTone: InputTone =
    derived.changeVariant === "negative"
      ? "negative"
      : derived.changeVariant === "positive"
        ? "positive"
        : "readonly";

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} size="lg">
      <ModalHeader
        icon={<Tag className="h-4 w-4 text-white" />}
        iconClassName="bg-[#2563eb]"
        title="Update Vehicle Pricing"
        subtitle="Update the asking price and related pricing details for this vehicle."
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody shake={shake}>
            <VehicleSummaryBlock
              vehicle={vehicle}
              photoPreview={photoPreview}
              onPhotoChange={handlePhotoChange}
            />

            <FormSection title="Pricing Information">
              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name="currentAskingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Asking Price (Current)" required />
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newAskingPrice"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="New Asking Price" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FieldLabel label="Price Change" />
                  <Input
                    mode="currency"
                    value={derived.priceChangeDisplay}
                    onValueChange={() => {}}
                    disabled
                    tone={changeTone}
                  />
                </FormItem>
                <FormItem>
                  <FieldLabel label="Change %" />
                  <Input
                    mode="percent"
                    value={derived.changePctDisplay}
                    tone={changeTone}
                    disabled
                  />
                </FormItem>
              </FormGrid>

              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name="wholesalePrice"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Wholesale Price" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retailPrice"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Retail Price" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minAcceptablePrice"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Min Acceptable Price" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetProfit"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Target Profit" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>

              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name="pricingStrategy"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Pricing Strategy" />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectOptions options={PRICING_STRATEGIES} />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Reason for Price Update" required />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectOptions options={PRICE_UPDATE_REASONS} />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Effective Date" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="date"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <CompareToMarket
                  text={derived.market.compareToMarketText}
                  isBelowMarket={derived.market.isBelowMarket}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Market Comparison">
              <FormGrid cols={4}>
                <MarketStatCard
                  label="Market Average"
                  value={formatMarketValue(derived.market.marketAverage)}
                />
                <MarketStatCard
                  label="Market Low"
                  value={formatMarketValue(derived.market.marketLow)}
                />
                <MarketStatCard
                  label="Market High"
                  value={formatMarketValue(derived.market.marketHigh)}
                />
                <MarketStatCard
                  label="Your Price vs Market Avg"
                  value={`${derived.market.yourPriceVsAvg < 0 ? "- " : ""}${formatMarketValue(Math.abs(derived.market.yourPriceVsAvg))} (${derived.market.yourPriceVsAvgPct.toFixed(2)}%)`}
                  valueClassName={
                    derived.market.isBelowMarket
                      ? "text-emerald-600"
                      : undefined
                  }
                />
              </FormGrid>
              <MarketDataFooter date={vehicle.lastUpdated} />
            </FormSection>

            <FormSection title="Additional Notes">
              <FormField
                control={form.control}
                name="notes"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="Internal Notes (Optional)" />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Textarea
                        showCount
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={500}
                        placeholder="Add notes about this pricing update..."
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <InfoBanner>
              Updating the price will be logged in the price history and visible
              to your team.
            </InfoBanner>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            submitLabel="Update Price"
            submitClassName="bg-[#2563eb] hover:bg-[#1d4ed8]"
            isSubmitting={isSubmitting}
            className="sticky bottom-0 bg-white"
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
