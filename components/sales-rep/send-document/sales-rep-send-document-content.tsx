"use client";

import SendDocumentAdditionalOptions from "./send-document-additional-options";
import SendDocumentDeliveryMethod from "./send-document-delivery-method";
import SendDocumentFooterActions from "./send-document-footer-actions";
import SendDocumentMessageSection from "./send-document-message-section";
import SendDocumentPageHeader from "./send-document-page-header";
import SendDocumentPreviewPanel from "./send-document-preview-panel";
import SendDocumentRecipientSection from "./send-document-recipient-section";
import SendDocumentUploadSection from "./send-document-upload-section";
import { useSendDocumentForm } from "./use-send-document-form";

export default function SalesRepSendDocumentContent() {
  const form = useSendDocumentForm();

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <SendDocumentPageHeader />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          <SendDocumentRecipientSection
            recipientType={form.recipientType}
            emailAddresses={form.emailAddresses}
            salesRepId={form.salesRepId}
            salesReps={form.salesReps}
            recipientError={form.recipientError}
            onRecipientTypeChange={form.handleRecipientTypeChange}
            onEmailChange={form.setEmailAddresses}
            onSalesRepChange={form.setSalesRepId}
            onRecipientBlur={() => form.setRecipientTouched(true)}
          />

          <SendDocumentUploadSection
            files={form.files}
            onAddFiles={form.addFiles}
            onRemoveFile={form.removeFile}
          />

          <SendDocumentMessageSection
            message={form.message}
            messageError={form.messageError}
            onMessageChange={form.setMessage}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <SendDocumentPreviewPanel files={form.files} />
          <SendDocumentDeliveryMethod
            value={form.deliveryMethod}
            onChange={form.setDeliveryMethod}
          />
          <SendDocumentAdditionalOptions
            requireConfirmation={form.requireConfirmation}
            notifyOnView={form.notifyOnView}
            onRequireConfirmationChange={form.setRequireConfirmation}
            onNotifyOnViewChange={form.setNotifyOnView}
          />
        </div>
      </div>

      <SendDocumentFooterActions
        canSend={form.canSend}
        sending={form.sending}
        sendStatus={form.sendStatus}
        onCancel={form.resetForm}
        onSend={form.handleSend}
      />
    </div>
  );
}
