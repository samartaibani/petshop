# Post-Payment Adoption Workflow & Next Steps

This document outlines the workflow that should occur *after* the user successfully pays the adoption fee online and the data is stored in the `AdoptionFee` database table.

## The Workflow

### 1. User Payment & System Update
- **Action**: User completes the payment (via Card or UPI mock) on the "My Adoptions" page.
- **System**: The system creates a record in the `AdoptionFee` table and updates the status of the `AdoptionRequest` to `"Paid"`.

### 2. User Notification & Instructions
- **Action**: As soon as the status becomes `"Paid"`, the frontend updates to show a success message.
- **Next Step for User**: The system displays a clear instruction to the user:
  > *"Payment Successful! Please visit our shelter within the next 3 days to pick up your new pet. Bring a valid ID for verification."*
- **Optional**: Send an automated email/SMS to the user with the pickup instructions and the payment receipt.

### 3. Admin Notification & Verification
- **Action**: Admin needs to know that a payment has been made so they can prepare the pet for handover.
- **System**: In the Admin Dashboard, under "Adoptions", there should be a distinct section or filter for `"Paid"` or `"Ready for Pickup"` requests.
- **Verification**: When the user arrives at the shelter, the admin can look up their name/request ID in the dashboard and verify their identity.

### 4. Pet Handover & Final Completion (To Be Implemented)
- **Action**: The user collects the pet.
- **System**: The admin clicks a button on their dashboard (e.g., **"Mark as Handed Over"** or **"Complete Adoption"**).
- **Final Update**: 
  - The `AdoptionRequest` status changes from `"Paid"` to `"Completed"` (or `"Adopted"`).
  - The Pet's global status changes from `"Available"` to `"Adopted"`, permanently removing it from the public listings (or marking it as "Found a home").

---

## Tasks to Complete This Workflow

To make this workflow a reality, we need to complete the following tasks:

### Currently Requested Tasks (To Do Now)
1. **Database**: Create `AdoptionFee` schema (`userId`, `adoptionRequestId`, `amount`, `paymentMethod`, `transactionStatus`).
2. **Backend**: Create API route `POST /api/adoptions/pay-fee` that:
   - Verifies the adoption request.
   - Saves the payment info to the `AdoptionFee` table.
   - Changes the adoption request status to `"Paid"`.
3. **Frontend**: Build a neat modal for selecting "Card" or "UPI" on the `MyAdoptions` page. Submit the mock details to the backend.

### Future Tasks (Next Phase)
1. **Admin View Update**: Update the Admin panel to easily filter requests by `"Paid"` status.
2. **Handover Action**: Add an API and Admin button to mark a `"Paid"` request as `"Completed"`.
3. **Pickup Instructions**: Enhance the frontend success banner to include the shelter address and pickup deadline.
