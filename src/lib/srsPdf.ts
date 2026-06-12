import type { ArchitectureData } from '@/lib/architecture'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const FOOTER_HEIGHT = 34

type FontKey = 'regular' | 'bold' | 'italic'

interface PageContent {
  ops: string[]
}

interface TocEntry {
  title: string
  page: number
}

interface TableRow {
  cells: string[]
  highlight?: boolean
}

interface RequirementItem {
  id: string
  priority: 'High' | 'Medium' | 'Low'
  description: string
  acceptanceCriteria: string[]
  inferred?: boolean
  relatedFRs?: string[]
}

interface RequirementGroup {
  label: string
  prefix: string
  items: RequirementItem[]
}

// ─── Domain FR Templates ──────────────────────────────────────────────────────

type FrSpec = { d: string; p: 'High' | 'Medium' | 'Low'; c: string[] }
type DomainFRMap = Record<string, FrSpec[]>

const DOMAIN_FRS: Record<string, DomainFRMap> = {
  ngo: {
    AUTH: [
      { d: 'Visitors shall access all public pages — campaigns, events, and blog posts — without requiring an account.', p: 'High', c: ['Public pages load without an authentication redirect.', 'Campaign and event details are fully readable by anonymous visitors.', 'Sign-in is only required when initiating a transaction or restricted action.'] },
      { d: 'Users shall register using email and password, or an OAuth provider, and verify their email address before accessing member features.', p: 'High', c: ['Registration form validates email format and password strength in real time.', 'A verification email is sent within 30 seconds of registration.', 'Duplicate email addresses are rejected with a clear, descriptive message.'] },
      { d: 'Authenticated users shall sign in, maintain a persistent session across page refreshes, and sign out with full session clearance.', p: 'High', c: ['Valid credentials produce a secure session token stored correctly.', 'Refresh tokens extend the session transparently without requiring re-authentication.', 'Sign-out clears all client-side session data and invalidates the server-side token.'] },
      { d: 'Users shall initiate a password reset via a time-limited, single-use email link.', p: 'Medium', c: ['A password reset email is dispatched within 60 seconds of the request.', 'The reset link expires after 60 minutes and cannot be reused.', 'Completing the reset invalidates all existing sessions for the account.'] },
    ],
    DON: [
      { d: "Visitors shall browse active fundraising campaigns, view each campaign's goal, progress, and description, without signing in.", p: 'High', c: ['Campaign listing loads and displays all active campaigns.', 'Progress bar reflects the current raised amount versus the goal.', 'Individual campaign detail pages are accessible to anonymous visitors.'] },
      { d: "Donors shall make a one-time contribution to a campaign by selecting or entering an amount and completing payment via the configured gateway.", p: 'High', c: ['Donation form validates that the entered amount meets minimum and maximum thresholds.', 'The payment form is rendered securely with no raw card data touching the application server.', "A successful payment updates the campaign's raised amount in real time."] },
      { d: 'The system shall generate and email a PDF donation receipt to the donor immediately after a successful payment.', p: 'High', c: ['A receipt PDF is generated within 5 seconds of payment confirmation.', "The email is delivered to the donor's address with the receipt attached.", 'The receipt includes donation amount, date, campaign name, and transaction reference.'] },
      { d: 'Administrators shall search, filter by date range or campaign, and export the full donation transaction history.', p: 'Medium', c: ['The donation table is paginated and supports free-text search.', 'Date range and campaign filters can be applied simultaneously.', 'Clicking Export produces a valid, correctly formatted CSV file.'] },
    ],
    VOL: [
      { d: 'Prospective volunteers shall submit a registration form capturing their skills, availability, and contact details.', p: 'High', c: ['All required fields are validated before the form can be submitted.', 'A duplicate registration using the same email address is rejected.', 'The administrator receives a notification of each new volunteer application.'] },
      { d: 'Administrators shall review volunteer applications and approve or reject them, with the outcome communicated to the applicant by email.', p: 'High', c: ['The admin dashboard lists all pending applications with applicant details.', 'An approval or rejection triggers an immediate email to the applicant.', 'Approved volunteers are granted the volunteer role and access to the volunteer portal.'] },
      { d: 'Approved volunteers shall view their event assignments and confirm or decline participation.', p: 'Medium', c: ['The volunteer portal lists events with the current assignment status.', 'A confirmation action updates the event roster visible to coordinators.', 'A declined assignment notifies the event coordinator by email.'] },
    ],
    EVT: [
      { d: 'Visitors shall browse upcoming events, view full event details, and register their attendance.', p: 'High', c: ['The event listing is sorted by date ascending with upcoming events first.', 'Event detail pages display date, location, capacity, and remaining spots.', "The registration form captures the attendee's name and email and sends a confirmation."] },
      { d: 'The system shall enforce event capacity limits and present a waitlist option when an event is fully booked.', p: 'High', c: ['The registration action is disabled when the event has reached full capacity.', 'A waitlist sign-up option is displayed and captured for fully booked events.', 'Cancellations automatically promote the next waitlisted registrant and notify them by email.'] },
      { d: 'Administrators shall create, edit, publish, and cancel events with full control over all event attributes.', p: 'High', c: ['The event creation form validates all required fields before saving.', 'Published events appear immediately on the public event listing.', 'A cancellation action removes the event from public view and notifies all registrants.'] },
    ],
    CMS: [
      { d: 'Authorized content editors shall create, edit, preview, and publish blog posts using a rich text editor with support for images and media.', p: 'Medium', c: ['The editor supports headings, bold, italic, lists, and inline image embedding.', 'Preview mode renders the post exactly as visitors will see it before publishing.', 'Published posts appear on the blog listing immediately after publication.'] },
      { d: 'The system shall auto-save drafts during editing so that content is preserved across sessions and browser closures.', p: 'Medium', c: ['The draft is automatically saved at least every 30 seconds during editing.', "Saved drafts are accessible from the editor's content dashboard.", 'Publishing a draft transitions it to published status and removes it from the drafts list.'] },
    ],
    ADMIN: [
      { d: 'Administrators shall manage user accounts, including viewing profile details, reassigning roles, and deactivating accounts.', p: 'High', c: ['The user list is searchable by name and email address.', 'A role change takes effect immediately without requiring a page reload.', 'Deactivated users are denied sign-in and receive an appropriate error message.'] },
      { d: 'Administrators shall access a real-time dashboard displaying total donations, active campaign count, volunteer headcount, and upcoming events.', p: 'High', c: ['The dashboard loads within 2 seconds under normal conditions.', 'All displayed metrics reflect data updated within the last 5 minutes.', 'Charts show trend data over a user-selectable time period.'] },
    ],
    RPT: [
      { d: 'Administrators shall generate donation summary reports filtered by campaign, date range, and payment method.', p: 'Medium', c: ['Report parameters are selectable from a form before generation.', 'The generated report displays aggregated totals per selected dimension.', 'Reports can be exported as a CSV or PDF file.'] },
      { d: 'The system shall display a campaign performance view showing raised amount versus goal, unique donor count, and average donation size.', p: 'Medium', c: ['Campaign metrics are accurate to the most recent completed transaction.', 'A percentage-to-goal figure is displayed both numerically and as a progress visual.', 'The performance view is accessible from the administration dashboard.'] },
    ],
  },

  ecommerce: {
    AUTH: [
      { d: 'Visitors shall browse the product catalog, view product details, and add items to a guest cart without creating an account.', p: 'High', c: ['Product pages load and display full details without an authentication prompt.', 'A guest cart persists through the same browser session.', 'Visitors can proceed to checkout and register or check out as a guest.'] },
      { d: 'Customers shall register with email and password and receive an account verification email before accessing order history.', p: 'High', c: ['Registration validates email format and enforces a minimum password strength.', 'A verification email is sent within 30 seconds of sign-up.', 'Verified accounts gain access to order history and saved addresses.'] },
      { d: 'Authenticated users shall sign in, maintain a persistent session, and sign out with full token clearance.', p: 'High', c: ['Valid credentials return a secure session token stored per browser security policy.', 'The session persists across tab refreshes for a configurable duration.', 'Sign-out clears all session data and redirects to the home page.'] },
    ],
    PROD: [
      { d: 'Visitors shall browse the product catalog with category navigation, keyword search, and price or attribute filtering.', p: 'High', c: ['The catalog is filterable by category, price range, and at least one product attribute.', 'Search returns relevant results within 500 milliseconds for typical queries.', 'An empty-state message is shown when no products match the applied filters.'] },
      { d: 'Each product page shall display full details including name, price, images, description, stock status, and customer reviews.', p: 'High', c: ['All product images load within the page without external errors.', 'Out-of-stock products display a clear status and disable the Add to Cart action.', 'Customer reviews are displayed with rating, author, and date.'] },
      { d: 'Administrators shall create, edit, and deactivate product listings including price, inventory, category, and images.', p: 'High', c: ['Product creation form validates all required fields before saving.', 'A price or stock update is reflected on the product page within 1 minute.', 'Deactivated products are hidden from the catalog but remain in order history.'] },
    ],
    CART: [
      { d: 'Customers shall add, update quantities of, and remove products from their cart with a real-time subtotal update.', p: 'High', c: ['Adding a product increments the cart item count in the header immediately.', 'Changing quantity recalculates the line total and cart subtotal without a page reload.', 'Removing an item updates the cart and subtotal with a clear confirmation message.'] },
      { d: "The cart shall persist across sessions for signed-in users and merge with a guest cart upon sign-in.", p: 'High', c: ["A signed-in user's cart is restored upon returning to the site after the session expires.", 'Items in a guest cart are merged with the existing account cart on sign-in.', 'No items are silently dropped during the merge process.'] },
      { d: 'Customers shall proceed from cart to a streamlined checkout flow covering address entry, shipping selection, and payment.', p: 'High', c: ['Checkout is completed in three steps or fewer.', 'Each step validates required fields before advancing.', 'The customer sees a full order summary including all costs before confirming payment.'] },
    ],
    ORD: [
      { d: 'Customers shall receive an order confirmation page and email immediately after a successful payment.', p: 'High', c: ['A confirmation page is displayed with order number and summary within 3 seconds of payment.', 'An order confirmation email is delivered within 2 minutes.', "The order appears in the customer's order history with the correct status."] },
      { d: 'Customers shall track the status of their orders from confirmation through to fulfillment.', p: 'High', c: ['Order status (Pending, Processing, Shipped, Delivered) is visible in the account dashboard.', 'A tracking number is displayed and linked to the carrier when the order ships.', 'Status changes trigger an email notification to the customer.'] },
      { d: 'Administrators shall view, filter, update the status of, and process refunds for orders.', p: 'High', c: ['The admin order list is filterable by status, date range, and customer.', 'A status update is reflected on the customer-facing order view within 1 minute.', 'A refund action initiates the refund through the payment gateway and updates the order record.'] },
    ],
    PAY: [
      { d: 'Customers shall complete payment using the configured payment gateway with support for at least one card payment method.', p: 'High', c: ['The payment form collects card details without sending raw data to the application server.', 'A successful payment returns a gateway reference and creates an order record.', 'A failed payment displays a clear reason message and allows the customer to retry.'] },
      { d: 'The system shall validate that sufficient stock exists before confirming a payment.', p: 'High', c: ['A pre-payment stock check is performed against the current inventory count.', 'If stock is insufficient, the customer is notified before payment is attempted.', 'Successful payment decrements the stock count atomically.'] },
      { d: 'Administrators shall issue full or partial refunds for completed orders through the admin panel.', p: 'Medium', c: ['The refund form validates that the amount does not exceed the original payment.', 'The refund is submitted to the gateway and confirmed before the order record is updated.', 'The customer receives a refund confirmation email with the expected credit timeline.'] },
    ],
    REV: [
      { d: 'Verified purchasers shall submit a star rating and written review for products they have received.', p: 'Medium', c: ['Only customers with a delivered order containing the product can submit a review.', 'A review requires a rating and a minimum character count for the written content.', 'Published reviews appear on the product page sorted by most recent.'] },
      { d: 'Administrators shall review, approve, or remove product reviews that violate content guidelines.', p: 'Medium', c: ['All submitted reviews are held for moderation before appearing on the product page.', 'An approval action publishes the review immediately.', 'A removed review is permanently deleted and the author is optionally notified.'] },
    ],
    ADMIN: [
      { d: 'Administrators shall access a dashboard displaying key metrics including total revenue, order volume, top products, and recent activity.', p: 'High', c: ['The dashboard loads within 2 seconds with current data.', 'Revenue and order charts show data over a selectable time period.', 'Top product rankings reflect actual sales volume.'] },
      { d: 'Administrators shall manage product categories, including creating, reordering, and deactivating category nodes.', p: 'Medium', c: ['Category creation validates for unique slugs.', 'Reordering updates the catalog navigation immediately.', 'Deactivating a category hides it from navigation without deleting associated products.'] },
    ],
  },

  lms: {
    AUTH: [
      { d: 'Visitors shall browse the course catalog and preview course details, curriculum, and instructor profiles without an account.', p: 'High', c: ['Course catalog loads without an authentication prompt.', 'Course detail pages display curriculum, instructor bio, and pricing.', 'Preview lesson content is accessible to anonymous visitors where defined.'] },
      { d: 'Learners shall register as students and instructors shall register as course creators through role-specific registration flows.', p: 'High', c: ['Student registration captures name, email, and password.', 'Instructor registration includes a bio and expertise fields.', 'Both flows send a verification email before granting full access.'] },
      { d: 'All users shall sign in, maintain a persistent session, and sign out with full token clearance.', p: 'High', c: ['Valid credentials return a secure session token.', 'Session persists across page navigations for a configurable duration.', 'Sign-out clears session data and redirects to the home page.'] },
    ],
    CRS: [
      { d: 'Instructors shall create, edit, and publish courses with a title, description, curriculum structure, pricing, and cover image.', p: 'High', c: ['Course creation form validates all required fields before saving.', 'A draft course is not visible to students until explicitly published.', 'Published courses appear in the catalog within 1 minute.'] },
      { d: 'Instructors shall add, reorder, and remove lessons within a course, assigning a content type (video, text, or file) to each.', p: 'High', c: ['Lessons are orderable via explicit ordering controls.', 'Each lesson accepts the appropriate content format for its assigned type.', 'Reordering updates the displayed curriculum immediately.'] },
      { d: 'Courses shall go through an admin review step before being published to the catalog.', p: 'Medium', c: ['A submitted course is queued for admin review and not visible to students.', 'An admin can approve or return the course with feedback.', 'Approval publishes the course; rejection sends feedback to the instructor by email.'] },
    ],
    ENR: [
      { d: 'Students shall enroll in a course by completing a purchase or free enrollment flow.', p: 'High', c: ['Paid enrollment requires a successful payment before access is granted.', 'Free enrollment grants immediate access to the course content.', "The enrollment is recorded with a timestamp and the student appears on the instructor's roster."] },
      { d: 'The system shall enforce content access based on enrollment status, blocking lesson content for unenrolled users.', p: 'High', c: ['Lesson content is locked for users who are not enrolled.', 'A locked lesson displays a clear enrollment call-to-action.', 'Enrollment status is checked server-side before serving any lesson content.'] },
      { d: 'Students shall view a list of all enrolled courses with current progress on their learning dashboard.', p: 'Medium', c: ['The dashboard displays each enrolled course with a progress percentage.', 'Courses are sorted by most recently accessed.', 'A "Continue" button links directly to the next incomplete lesson.'] },
    ],
    CDL: [
      { d: 'Students shall access and complete lessons in sequence, with the system marking each lesson complete when finished.', p: 'High', c: ['Lessons unlock in the defined curriculum order.', 'Viewing a lesson to its end marks it complete.', 'Progress percentage updates in real time on the enrollment record.'] },
      { d: 'Video lessons shall be delivered via an embedded player with playback controls and resume-from-last-position support.', p: 'High', c: ['The player renders correctly across desktop, tablet, and mobile browsers.', 'Playback position is saved so students can resume where they left off.', 'The lesson is only marked complete after the video is played past a defined threshold.'] },
      { d: 'Students shall download course materials and supplementary files attached to lessons.', p: 'Medium', c: ['Downloadable files are accessible only to enrolled students.', 'File names are descriptive and the download initiates without a page redirect.', 'Download access is revoked if enrollment is cancelled or refunded.'] },
    ],
    ASN: [
      { d: 'Students shall submit assignments before the deadline by uploading a file or entering text content.', p: 'High', c: ['The submission form enforces the deadline and rejects submissions after it passes.', 'File uploads validate type and size limits before saving.', 'A submission confirmation is displayed and an acknowledgment email is sent.'] },
      { d: 'Instructors shall review submissions and assign a grade with written feedback visible to the student.', p: 'High', c: ['The grading interface lists all submissions with submission date and student name.', 'Entering a grade and feedback saves and notifies the student by email.', 'Graded submissions display the grade and feedback in the student view.'] },
      { d: 'Students shall complete quizzes with a defined time limit, receiving an immediate scored result.', p: 'High', c: ['The quiz timer counts down and auto-submits when time expires.', 'Submitted answers are scored immediately and the result is displayed.', 'A passing score unlocks the next lesson; a failing score allows a retry after a defined interval.'] },
    ],
    PROG: [
      { d: "The system shall display each student's overall course completion percentage and per-lesson status on their dashboard.", p: 'Medium', c: ['Completion percentage is accurate to the last completed lesson.', 'Each lesson in the curriculum view is marked as complete, in progress, or not started.', 'The dashboard updates within 5 seconds of a lesson being marked complete.'] },
      { d: 'The system shall generate and deliver a completion certificate when a student finishes all required lessons and assessments.', p: 'Medium', c: ['The certificate is generated automatically when the final required lesson is marked complete.', "The certificate PDF is available for download from the student's dashboard.", 'An email with the certificate attached is sent to the student.'] },
    ],
    ADMIN: [
      { d: 'Administrators shall manage all users (students and instructors), including viewing profiles, changing roles, and deactivating accounts.', p: 'High', c: ['The user management list is searchable by name, email, and role.', 'Role changes take effect immediately.', 'Deactivated accounts lose all content access and cannot sign in.'] },
      { d: 'Administrators shall view platform-level analytics including total enrollments, revenue, completion rates, and top courses.', p: 'Medium', c: ['The analytics dashboard loads within 2 seconds.', 'Metrics are accurate to within the last 10 minutes.', 'Data can be filtered by date range.'] },
    ],
  },

  hospital: {
    AUTH: [
      { d: 'General information pages (departments, doctor profiles) shall be accessible without creating an account.', p: 'High', c: ['Public pages load without an authentication redirect.', 'Doctor profiles and department information are fully readable by anonymous visitors.', 'Appointment booking initiates the sign-in or registration flow.'] },
      { d: 'Patients, doctors, and staff shall register and sign in through role-specific flows with strong credential requirements.', p: 'High', c: ['Registration validates email and enforces strong password complexity.', 'Doctor and staff accounts are approved by an administrator before activation.', 'Role assignment determines which features and records are accessible after sign-in.'] },
      { d: 'All authenticated users shall maintain persistent sessions with activity-based expiry for security.', p: 'High', c: ['Sessions expire after a defined idle period (30-60 minutes for clinical users).', 'A session expiry warning is shown 5 minutes before automatic sign-out.', 'Re-authentication is required to continue after session expiry.'] },
    ],
    PAT: [
      { d: 'Patients shall register a profile capturing demographic details, contact information, and insurance data.', p: 'High', c: ['Registration form validates all required fields and formats (date of birth, phone).', 'Insurance fields are validated for expected format before saving.', 'A registered patient profile is created and linked to their user account.'] },
      { d: 'Authorized clinical staff shall search for, view, and update patient profiles.', p: 'High', c: ['Patient search returns results by name, ID, or date of birth.', 'Viewing a patient record is logged in the audit trail.', 'Only authorized roles can edit demographic or clinical data.'] },
      { d: "Patients shall view and update their own profile, contact details, and insurance information from the patient portal.", p: 'Medium', c: ['The patient portal displays current profile details after sign-in.', 'Updates to contact information are validated and saved immediately.', 'Changes to sensitive fields trigger a confirmation notification.'] },
    ],
    APT: [
      { d: 'Patients shall request appointments by selecting a doctor, specialty, available date, and preferred time slot.', p: 'High', c: ['The booking interface displays real-time slot availability for the selected doctor.', 'A selected slot is reserved for the patient to complete booking without timing out.', 'A confirmed appointment creates a record and sends a confirmation to the patient.'] },
      { d: 'The system shall enforce slot availability and prevent double-booking of the same doctor at the same time.', p: 'High', c: ['Slot selection uses a transactional lock to prevent concurrent booking of the same slot.', 'If a slot was taken during checkout, the patient is redirected to reselect.', 'Fully booked time slots are never shown as available.'] },
      { d: 'Patients shall cancel or reschedule confirmed appointments within the allowed cancellation window.', p: 'Medium', c: ['The cancellation option is available until the defined cut-off time before the appointment.', 'Cancellation frees the slot and notifies the doctor.', 'Rescheduling creates a new appointment and cancels the original in a single transaction.'] },
    ],
    MED: [
      { d: 'Doctors shall create medical records for each patient visit, capturing diagnosis, treatment notes, and attached documents.', p: 'High', c: ['Medical record creation is linked to a specific appointment and patient.', 'The doctor can attach files (scans, reports) up to a defined size limit.', "Saved records are immediately accessible from the patient's history."] },
      { d: "Authorized clinical staff shall view a patient's full medical history including all past records and attachments.", p: 'High', c: ['Medical history is displayed in reverse chronological order.', 'Each record shows the attending doctor, date, and diagnosis summary.', 'Access to medical records is logged in the audit trail with user and timestamp.'] },
      { d: 'Patient medical records shall be accessible only to authorized roles; unauthorized access attempts shall be blocked and logged.', p: 'High', c: ['Attempting to access a record without proper authorization returns an access denied response.', 'Unauthorized access attempts are logged with user identity, resource, and timestamp.', 'Record-level permission checks are enforced on every request, not just at the route level.'] },
    ],
    RX: [
      { d: 'Doctors shall issue prescriptions linked to a patient visit, specifying medication names, dosages, and validity duration.', p: 'High', c: ['Prescription creation is linked to a specific appointment and patient record.', 'Required fields (medication name, dosage, issue date) are validated before saving.', "The issued prescription is accessible from the patient's medical history."] },
      { d: "Patients shall view their active and historical prescriptions from the patient portal.", p: 'Medium', c: ['The prescription list shows active prescriptions sorted by issue date.', 'Each prescription displays medication name, dosage, and validity dates.', 'Expired prescriptions are marked clearly and moved to a historical view.'] },
    ],
    BILL: [
      { d: 'The system shall generate an invoice for each completed appointment, itemizing all services rendered.', p: 'High', c: ['Invoice generation is triggered automatically on appointment completion.', 'The invoice itemizes all services and displays the total amount due.', 'The invoice is accessible from both the patient portal and the admin billing view.'] },
      { d: 'Patients shall view outstanding and paid invoices and submit payment through the patient portal.', p: 'High', c: ['The billing section lists all invoices with status (outstanding, paid).', 'A payment action links to the configured payment gateway.', 'A successful payment updates the invoice status and sends a receipt to the patient.'] },
      { d: 'Administrators shall search billing records, apply insurance adjustments, and mark invoices as settled.', p: 'Medium', c: ['Billing records are searchable by patient name and date range.', 'Insurance adjustment fields allow partial offset of the billed amount.', 'Marking an invoice as settled updates the patient-facing status immediately.'] },
    ],
    ADMIN: [
      { d: 'Administrators shall manage all user accounts including patients, doctors, and staff, with the ability to activate, deactivate, and reassign roles.', p: 'High', c: ['User list is searchable by name, email, and role.', 'Deactivating an account immediately prevents sign-in.', 'Role changes take effect without requiring the user to re-authenticate.'] },
      { d: "Administrators shall view an operational dashboard showing today's appointments, pending approvals, outstanding invoices, and recent audit log entries.", p: 'High', c: ['The dashboard loads within 2 seconds with current data.', 'Appointment and invoice counts are accurate to the last completed transaction.', 'Recent audit log entries display actor, action, and timestamp.'] },
    ],
  },

  booking: {
    AUTH: [
      { d: 'Visitors shall browse the service catalog and provider profiles without creating an account.', p: 'High', c: ['Service catalog loads without an authentication prompt.', 'Provider profiles display bio, services offered, ratings, and availability overview.', 'Booking initiation prompts sign-in or guest booking if guest mode is enabled.'] },
      { d: 'Clients shall register with email and password to access booking history and saved preferences.', p: 'High', c: ['Registration form validates email format and password strength.', 'A verification email is sent within 30 seconds of registration.', 'Registered clients can view past bookings and prefill booking details.'] },
      { d: 'Providers shall register a provider account and complete their profile before being listed on the platform.', p: 'High', c: ['Provider registration captures name, bio, specializations, and contact details.', 'Profile completion is required before any services are published.', 'Provider accounts are reviewed and activated by an administrator.'] },
    ],
    SVC: [
      { d: 'Visitors shall browse services by category, duration, price range, and provider.', p: 'High', c: ['Service listings are filterable by category and price range.', 'Each service card shows name, duration, price, and provider rating.', 'Clicking a service shows full details and available booking slots.'] },
      { d: 'Providers shall create, edit, and deactivate their service offerings with name, description, duration, and price.', p: 'High', c: ['Service creation requires all mandatory fields before publishing.', 'An edited service is updated on the public listing within 1 minute.', 'Deactivated services are hidden from the catalog but retained in booking history.'] },
    ],
    BOOK: [
      { d: 'Clients shall select a service, choose an available slot, enter booking details, and confirm the appointment.', p: 'High', c: ["Available slots are displayed in the client's local timezone.", 'Selecting a slot reserves it temporarily during checkout to prevent double-booking.', 'A confirmed booking creates a record and sends confirmation to both client and provider.'] },
      { d: "Clients shall cancel or reschedule a booking within the platform's cancellation policy window.", p: 'High', c: ['The cancel option is available up to the defined cutoff period before the appointment.', 'A cancellation within policy triggers a refund per the configured rules.', 'A cancellation notification is sent to the provider immediately.'] },
    ],
    AVAIL: [
      { d: 'Providers shall define their weekly availability schedule and block out specific dates and times.', p: 'High', c: ['The availability editor supports recurring weekly hours for each day.', 'Individual date or time blocks can be added to override recurring availability.', 'Availability changes are reflected in the booking calendar within 1 minute.'] },
      { d: 'The system shall display only genuinely available slots to clients at the time of booking.', p: 'High', c: ['Confirmed bookings remove the associated slot from the available pool.', 'Blocked dates and times are not shown as available.', 'Availability is refreshed at the booking confirmation step to catch concurrent bookings.'] },
    ],
    PAY: [
      { d: 'Clients shall pay a deposit or full service fee at the time of booking using the configured payment gateway.', p: 'High', c: ['Payment is processed before the booking is confirmed.', 'A payment failure prevents the booking from being created and notifies the client.', 'A successful payment creates a payment record linked to the booking.'] },
      { d: 'The system shall process refunds according to the configured cancellation policy when a booking is cancelled.', p: 'High', c: ['A cancellation within the full-refund window triggers an automatic full refund.', 'A late cancellation processes a partial refund per the defined policy.', 'The refund is submitted to the gateway and the client receives a confirmation email.'] },
    ],
    NOTIF: [
      { d: 'The system shall send automated email notifications at all key booking lifecycle events.', p: 'High', c: ['Booking confirmation emails are sent to both client and provider within 2 minutes.', 'Cancellation notifications are sent immediately upon cancellation.', 'Reminder emails are sent at the configured intervals before the appointment.'] },
      { d: "Providers shall receive notifications for new bookings, cancellations, and reschedules in real time.", p: 'Medium', c: ["New booking notifications appear in the provider's dashboard immediately.", 'Email notifications are sent for every booking status change.', 'Providers can configure their notification preferences from their account settings.'] },
    ],
    ADMIN: [
      { d: 'Administrators shall manage all provider accounts including activation, deactivation, and profile review.', p: 'High', c: ['The admin panel lists all provider accounts with current status.', 'Activation grants the provider permission to publish services.', "Deactivation hides the provider's services from the catalog immediately."] },
      { d: 'Administrators shall view platform-level metrics including total bookings, revenue, top providers, and cancellation rates.', p: 'Medium', c: ['The metrics dashboard loads within 2 seconds.', 'All figures are accurate to the last completed booking.', 'Date range filtering is available for all metrics.'] },
    ],
  },

  crm: {
    AUTH: [
      { d: 'Sales representatives shall sign in securely and access only the records assigned to them or their team.', p: 'High', c: ['Sign-in requires email and password with a rate-limited authentication endpoint.', 'Team-based record visibility is enforced on every data query.', 'A failed login attempt after five tries triggers a temporary lockout.'] },
      { d: 'Administrators shall provision new user accounts and assign them to teams and pipelines.', p: 'High', c: ['User creation sends an invitation email with a set-password link.', 'Team assignment determines which records the user can access.', 'Deactivated users lose access immediately and their records remain in the system.'] },
    ],
    CONT: [
      { d: 'Users shall create, view, edit, and delete contact records with full demographic and professional details.', p: 'High', c: ['Contact creation validates required fields (name, email).', 'Duplicate email detection warns the user before saving.', 'All contact field updates are timestamped and attributed to the editing user.'] },
      { d: 'The system shall detect and flag duplicate contacts based on matching email address or full name.', p: 'High', c: ['Duplicate detection runs on contact creation and during CSV import.', 'Flagged duplicates are presented with a merge or dismiss option.', 'A merge combines all linked activities, deals, and notes onto the surviving record.'] },
      { d: 'Users shall associate contacts with companies and view all contacts belonging to a company from the company record.', p: 'Medium', c: ['Contact creation includes an optional company field with type-ahead search.', 'The company detail view lists all associated contacts.', 'Removing a contact from a company does not delete the contact record.'] },
    ],
    LEAD: [
      { d: 'Users shall capture leads from web forms or manual entry and assign them a source, status, and score.', p: 'High', c: ['Lead creation form validates required fields.', 'Source and status fields use predefined options configurable by admins.', 'Newly captured leads appear in the leads list immediately after saving.'] },
      { d: 'Qualified leads shall be converted to a contact and an associated deal in a single workflow action.', p: 'High', c: ['The convert action creates a new contact pre-filled with lead data.', 'A new deal is created and linked to the contact with the lead value.', "The original lead record is marked as converted and removed from the active leads list."] },
    ],
    DEAL: [
      { d: 'Users shall create deal records capturing title, value, close date, and probability, and assign them to a pipeline stage.', p: 'High', c: ['Deal creation validates title, value, and target close date.', 'The deal appears on the pipeline board in the selected stage immediately.', 'Probability auto-fills based on the selected stage but can be overridden.'] },
      { d: 'Users shall advance deals through pipeline stages using a drag-and-drop board or stage selector.', p: 'High', c: ['Dragging a deal card to a new column updates the stage immediately.', 'Stage transitions record a timestamp and the user who made the change.', 'Required fields for stage advancement are enforced before the move is committed.'] },
      { d: 'Deals shall be marked as Won or Lost with a closing reason, updating historical revenue totals accordingly.', p: 'High', c: ['Marking as Won or Lost requires selection of a defined reason.', 'The deal is removed from the active pipeline and appears in the closed deals view.', 'Revenue and conversion metrics update in the reporting dashboard.'] },
    ],
    PIPE: [
      { d: 'Administrators shall create and configure pipelines with custom stage names and required advancement conditions.', p: 'Medium', c: ['Pipeline creation requires at least two stages.', 'Each stage can have optional required fields enforced before advancement.', 'New pipelines are available for deal assignment immediately after creation.'] },
      { d: 'The system shall display a visual pipeline board grouped by stage with deal count and value summaries per column.', p: 'High', c: ['The pipeline board renders all stages and their deals in a kanban layout.', 'Each column header displays the deal count and total value for that stage.', 'The board is scrollable horizontally when the stage count exceeds the viewport.'] },
    ],
    ACT: [
      { d: 'Users shall log activities (calls, emails, meetings, and notes) against contact and deal records.', p: 'High', c: ['Activity creation requires type, date, and a notes field.', 'Logged activities appear on the contact and deal timeline in chronological order.', 'Each activity is attributed to the logging user with a timestamp.'] },
      { d: 'Users shall schedule future activities and receive in-app reminders at the scheduled time.', p: 'Medium', c: ["A scheduled activity appears in the user's upcoming activity list.", 'A reminder notification fires at the scheduled time.', 'Completing a scheduled activity marks it done and removes it from the upcoming list.'] },
    ],
    RPT: [
      { d: 'Sales managers shall access a pipeline report showing deal count and total value by stage, owner, and time period.', p: 'High', c: ['The report is filterable by pipeline, owner, and date range.', 'Stage-level totals are accurate to the most recent deal status change.', 'The report can be exported as a CSV file.'] },
      { d: 'The system shall display a revenue forecast based on active deal values weighted by their probability of closing.', p: 'Medium', c: ['Forecast calculation uses deal value multiplied by the assigned probability.', 'The forecast view shows expected revenue by month for the current quarter.', 'Forecast data updates within 5 minutes of any deal change.'] },
    ],
  },

  saas: {
    AUTH: [
      { d: 'Users shall sign in with email and password, and optionally with an OAuth or SAML provider configured by their organization.', p: 'High', c: ['Email and password sign-in is enforced for all organizations.', 'Organizations on qualifying plans can configure a SAML or OAuth identity provider.', "Sign-in routes the user to their organization's workspace after authentication."] },
      { d: 'New organizations shall complete a self-serve onboarding flow to create a workspace, invite team members, and select an initial plan.', p: 'High', c: ['Onboarding is completable in under 5 minutes.', 'Workspace slug uniqueness is validated in real time.', 'An invitation email is sent to any invited users immediately after workspace creation.'] },
    ],
    ORG: [
      { d: 'Organization administrators shall manage workspace settings including name, slug, billing email, and allowed SSO domains.', p: 'High', c: ['Settings changes are validated and saved immediately.', 'SSO domain changes require administrator re-authentication to confirm.', 'All settings changes are recorded in the audit log.'] },
      { d: 'Organization administrators shall view all members, their roles, and last-active timestamps from the members management page.', p: 'High', c: ['The members list is paginated and searchable by name and email.', 'Last-active timestamps are accurate to the most recent sign-in.', 'Role changes take effect immediately without requiring member re-authentication.'] },
    ],
    SUB: [
      { d: 'Organizations shall select a subscription plan and complete payment to activate full platform access.', p: 'High', c: ['Plan selection displays feature limits and pricing clearly.', 'Payment is processed through the configured billing gateway.', 'Activation grants immediate access to all plan-gated features.'] },
      { d: 'Administrators shall upgrade, downgrade, or cancel their subscription from the billing settings page.', p: 'High', c: ['Upgrades take effect immediately; downgrades take effect at the next billing cycle.', 'Cancellation sets the subscription to expire at the end of the current paid period.', 'All billing changes are confirmed by email to the billing contact.'] },
      { d: 'The system shall send automated billing lifecycle emails including payment receipts, failure notices, and renewal reminders.', p: 'High', c: ['Invoice receipts are sent within 5 minutes of a successful payment.', 'Payment failure triggers a retry notification email within 1 hour.', 'A renewal reminder is sent 7 days before the subscription renews.'] },
    ],
    FEAT: [
      { d: "Feature access shall be enforced at the API level based on the organization's active subscription plan.", p: 'High', c: ['API requests for gated features return a 403 with a clear upgrade prompt.', 'Plan changes are reflected in feature availability within 60 seconds.', 'Feature gate checks are unit-tested per plan tier to prevent regressions.'] },
      { d: 'The platform shall support feature flags that can be toggled per organization independently of the subscription plan.', p: 'Medium', c: ['Feature flags are manageable from the admin panel without a code deployment.', 'A flag change takes effect within 30 seconds for the affected organization.', 'Enabling a flag for an organization overrides the plan-level setting.'] },
    ],
    USR: [
      { d: 'Organization administrators shall invite new members by email and assign them a role within the workspace.', p: 'High', c: ['An invitation email is sent immediately with a role-specific set-password link.', 'Invitation links expire after 7 days.', 'Accepted invitations create a user account and add the member to the workspace.'] },
      { d: 'Administrators shall deactivate members, transferring their owned records to another user before deactivation.', p: 'High', c: ['Deactivation requires selecting a transfer recipient for owned records.', 'The deactivated member loses access immediately.', 'All previously owned records are attributed to the transfer recipient.'] },
    ],
    API: [
      { d: 'The platform shall expose a REST API with per-organization authentication tokens for third-party integrations.', p: 'Medium', c: ['API tokens are generated from organization settings and scoped to specific permissions.', 'All API requests are authenticated against the token and validated for organization scope.', 'Expired or revoked tokens return a 401 with a clear error message.'] },
      { d: 'The system shall enforce per-organization API rate limits and expose usage metrics in the developer dashboard.', p: 'Medium', c: ['Rate limits are defined per subscription plan.', 'A 429 response is returned with a Retry-After header when the limit is exceeded.', 'API usage graphs in the developer dashboard update within 5 minutes.'] },
    ],
    ADMIN: [
      { d: "Platform administrators shall view all organizations, their subscription status, member counts, and activity across the platform.", p: 'High', c: ['The platform admin dashboard is accessible only to users with the super-admin role.', 'Organization list is searchable and filterable by plan and status.', 'Clicking an organization opens its detailed view with subscription and member data.'] },
      { d: 'Platform administrators shall manage global feature flag states and roll out features to a percentage of organizations.', p: 'Medium', c: ['Feature flags can be toggled globally from the platform admin panel.', 'A rollout percentage field controls what proportion of organizations receive the flag.', "Global flag changes are logged in the audit trail with the admin's identity."] },
    ],
  },

  generic: {
    AUTH: [
      { d: 'Public pages shall be accessible without requiring user authentication.', p: 'High', c: ['Public routes load without an authentication redirect.', 'Restricted routes redirect unauthenticated users to the sign-in page.', 'The distinction between public and protected routes is enforced server-side.'] },
      { d: 'Users shall register with email and password and verify their email before accessing member features.', p: 'High', c: ['Registration validates email format and password strength.', 'A verification email is sent within 30 seconds of registration.', 'Duplicate email registration is rejected with a descriptive error.'] },
      { d: 'Authenticated users shall sign in, maintain persistent sessions, and sign out securely.', p: 'High', c: ['Valid credentials produce a session token stored securely.', 'Sessions persist across page refreshes for a configurable duration.', 'Sign-out clears all session data and tokens.'] },
    ],
    CORE: [
      { d: 'Users shall complete the primary platform workflow from initiation to submission without errors.', p: 'High', c: ['The workflow is completable end-to-end without errors under normal conditions.', 'Required fields are validated at each step before advancing.', 'A completion confirmation is displayed and optionally emailed.'] },
      { d: 'Users shall search and filter platform content by relevant attributes.', p: 'Medium', c: ['Search returns relevant results within an acceptable response time.', 'Filter combinations work correctly and can be cleared with a single action.', 'Empty states are shown with helpful prompts when no results match.'] },
      { d: 'The system shall present email or in-app notifications after key user actions.', p: 'Medium', c: ['Notifications are triggered within 60 seconds of the associated action.', 'In-app notifications display in the notification tray without a page reload.', 'Users can mark notifications as read individually or all at once.'] },
    ],
    CMS: [
      { d: 'Authorized users shall create, edit, preview, and publish content items.', p: 'Medium', c: ['Content creation form validates required fields.', 'Preview mode renders the content as it appears to end users.', 'Published content appears in the content listing immediately.'] },
      { d: 'The system shall auto-save drafts during content editing to prevent data loss.', p: 'Medium', c: ['Drafts are auto-saved at least every 30 seconds during editing.', "Saved drafts are accessible from the user's content dashboard.", 'Publishing a draft transitions it to the published state.'] },
    ],
    USR: [
      { d: 'Signed-in users shall view and update their profile, including name, email, and notification preferences.', p: 'Medium', c: ['Profile page displays all current user information.', 'Changes are validated and saved immediately.', 'An email change requires re-verification of the new address.'] },
      { d: 'Users shall reset their password via a time-limited email link.', p: 'Medium', c: ['A reset email is sent within 60 seconds of the request.', 'The reset link expires after 60 minutes.', 'Completing the reset invalidates all existing sessions.'] },
    ],
    ADMIN: [
      { d: 'Administrators shall manage user accounts, assign roles, and deactivate users as needed.', p: 'High', c: ['User management list is searchable and filterable by role and status.', 'Role changes take effect immediately.', 'Deactivated users cannot sign in and are excluded from active user counts.'] },
      { d: 'Administrators shall access a management dashboard with key platform metrics and recent activity.', p: 'High', c: ['Dashboard loads within 2 seconds with current data.', 'Metrics reflect data updated within the last 5 minutes.', 'Recent activity shows the latest user actions with timestamps.'] },
    ],
    RPT: [
      { d: 'Administrators shall generate usage and activity reports filtered by date range and user.', p: 'Medium', c: ['Report parameters are selectable before generation.', 'Reports display accurate aggregated data for the selected filters.', 'Reports can be exported as CSV.'] },
      { d: 'The system shall maintain an audit log of significant actions accessible to administrators.', p: 'Medium', c: ['The audit log captures the actor, action type, affected resource, and timestamp.', 'Audit records are immutable and cannot be deleted through the UI.', 'The log is searchable and filterable by user and date range.'] },
    ],
  },
}

// ─── PDF Utilities ────────────────────────────────────────────────────────────

function ascii(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[•]/g, '-')
    .replace(/[→]/g, '->')
    .replace(/[←]/g, '<-')
    .replace(/\u00a0/g, ' ')
    .split('')
    .map((ch) => (ch.charCodeAt(0) > 126 ? '' : ch))
    .join('')
}

function escapePdfText(text: string): string {
  return ascii(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function textWidth(text: string, fontSize: number, bold = false): number {
  const factor = bold ? 0.58 : 0.52
  return Math.max(1, ascii(text).length) * fontSize * factor
}

function wrapText(text: string, maxWidth: number, fontSize: number, bold = false): string[] {
  const cleaned = ascii(text).replace(/\s+/g, ' ').trim()
  if (!cleaned) return ['']
  const words = cleaned.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (textWidth(next, fontSize, bold) <= maxWidth) {
      current = next
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : [cleaned]
}

// ─── Layout Class ─────────────────────────────────────────────────────────────

class SrsLayout {
  pages: PageContent[] = []
  tocEntries: TocEntry[] = []
  private currentPage: PageContent | null = null
  private cursorY = PAGE_HEIGHT - MARGIN
  private readonly pageOffset: number

  constructor(pageOffset = 0) {
    this.pageOffset = pageOffset
  }

  newPage() {
    this.currentPage = { ops: [] }
    this.pages.push(this.currentPage)
    this.cursorY = PAGE_HEIGHT - MARGIN
    this.drawHorizontalRule(PAGE_HEIGHT - MARGIN + 8)
    return this.currentPage
  }

  startSection(sectionNumber: number, title: string) {
    this.newPage()
    this.tocEntries.push({
      title: `${sectionNumber}. ${ascii(title)}`,
      page: this.pages.length + this.pageOffset,
    })
    this.addSectionHeading(sectionNumber, title)
  }

  private ensurePage(requiredHeight: number) {
    if (!this.currentPage || this.cursorY - requiredHeight < MARGIN + FOOTER_HEIGHT) {
      this.newPage()
    }
  }

  private push(op: string) {
    if (!this.currentPage) this.newPage()
    this.currentPage?.ops.push(op)
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options: { size?: number; font?: FontKey; align?: 'left' | 'center' | 'right'; color?: [number, number, number] } = {},
  ) {
    const size = options.size ?? 11
    const font = options.font ?? 'regular'
    const [r, g, b] = options.color ?? [0, 0, 0]
    const family = font === 'bold' ? 'F2' : font === 'italic' ? 'F3' : 'F1'
    const safe = escapePdfText(text)
    const width = textWidth(text, size, font === 'bold')
    const actualX =
      options.align === 'center'
        ? x - width / 2
        : options.align === 'right'
          ? x - width
          : x
    this.push(`BT /${family} ${size} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg 1 0 0 1 ${actualX.toFixed(2)} ${y.toFixed(2)} Tm (${safe}) Tj ET`)
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, width = 0.6, color: [number, number, number] = [0.75, 0.75, 0.78]) {
    const [r, g, b] = color
    this.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${width.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`)
  }

  drawRect(x: number, y: number, w: number, h: number, fill = false, stroke = true, color: [number, number, number] = [1, 1, 1]) {
    const [r, g, b] = color
    const parts = [`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} ${fill ? 'rg' : 'RG'}`]
    if (fill) parts.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`)
    if (stroke) parts.push(`0 0 0 RG 0.6 w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`)
    this.push(parts.join(' '))
  }

  private drawHorizontalRule(y: number) {
    this.drawLine(MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.4, [0.82, 0.82, 0.84])
  }

  addCenteredTitle(text: string, y: number, size: number, bold = true, color: [number, number, number] = [0, 0, 0]) {
    this.drawText(text, PAGE_WIDTH / 2, y, { size, font: bold ? 'bold' : 'regular', align: 'center', color })
  }

  addParagraph(text: string, options: { size?: number; width?: number; leading?: number; color?: [number, number, number] } = {}) {
    const size = options.size ?? 11
    const width = options.width ?? PAGE_WIDTH - MARGIN * 2
    const leading = options.leading ?? Math.round(size * 1.45)
    const color = options.color ?? [0.12, 0.12, 0.13]
    const paragraphs = ascii(text).split(/\n{2,}/)
    for (const paragraph of paragraphs) {
      const lines = wrapText(paragraph, width, size)
      this.ensurePage(lines.length * leading + 4)
      for (const line of lines) {
        this.drawText(line, MARGIN, this.cursorY, { size, color })
        this.cursorY -= leading
      }
      this.cursorY -= leading * 0.3
    }
  }

  addBullets(items: string[], options: { size?: number; indent?: number } = {}) {
    const size = options.size ?? 11
    const indent = options.indent ?? 16
    const width = PAGE_WIDTH - MARGIN * 2 - indent
    const leading = Math.round(size * 1.45)
    for (const item of items) {
      const lines = wrapText(item, width, size)
      this.ensurePage(lines.length * leading + 4)
      this.drawText('-', MARGIN, this.cursorY, { size, color: [0.12, 0.12, 0.13] })
      lines.forEach((line, index) => {
        this.drawText(line, MARGIN + indent, this.cursorY, { size, color: [0.12, 0.12, 0.13] })
        if (index < lines.length - 1) this.cursorY -= leading
      })
      this.cursorY -= leading
    }
  }

  addNumberedList(items: string[], prefix: string, options: { size?: number } = {}) {
    const size = options.size ?? 11
    const leading = Math.round(size * 1.45)
    const indent = 36
    const width = PAGE_WIDTH - MARGIN * 2 - indent
    items.forEach((item, index) => {
      const label = `${prefix}-${String(index + 1).padStart(3, '0')}`
      const lines = wrapText(item, width, size)
      this.ensurePage(lines.length * leading + 6)
      this.drawText(label, MARGIN, this.cursorY, { size, font: 'bold', color: [0.18, 0.18, 0.2] })
      lines.forEach((line, lineIndex) => {
        this.drawText(line, MARGIN + indent, this.cursorY, { size, color: [0.12, 0.12, 0.13] })
        if (lineIndex < lines.length - 1) this.cursorY -= leading
      })
      this.cursorY -= leading
    })
  }

  addSectionHeading(sectionNumber: number, title: string) {
    this.cursorY -= 8
    this.ensurePage(54)
    this.drawText(`${sectionNumber}. ${ascii(title)}`, MARGIN, this.cursorY, { size: 18, font: 'bold', color: [0.08, 0.08, 0.09] })
    this.cursorY -= 20
    this.drawLine(MARGIN, this.cursorY, PAGE_WIDTH - MARGIN, this.cursorY, 0.8, [0.82, 0.82, 0.84])
    this.cursorY -= 20
  }

  addSubheading(text: string, color: [number, number, number] = [0.12, 0.12, 0.13]) {
    this.ensurePage(22)
    this.drawText(text, MARGIN, this.cursorY, { size: 12, font: 'bold', color })
    this.cursorY -= 16
  }

  addSmallLabel(text: string, color: [number, number, number] = [0.35, 0.35, 0.38]) {
    this.ensurePage(14)
    this.drawText(text, MARGIN, this.cursorY, { size: 9, font: 'italic', color })
    this.cursorY -= 13
  }

  addKeyValueList(rows: Array<[string, string]>) {
    const labelWidth = 120
    const valueWidth = PAGE_WIDTH - MARGIN * 2 - labelWidth - 12
    const leading = 14
    for (const [label, value] of rows) {
      const valueLines = wrapText(value, valueWidth, 11)
      this.ensurePage(valueLines.length * leading + 6)
      this.drawText(label, MARGIN, this.cursorY, { size: 11, font: 'bold', color: [0.18, 0.18, 0.2] })
      valueLines.forEach((line, index) => {
        this.drawText(line, MARGIN + labelWidth, this.cursorY, { size: 11, color: [0.12, 0.12, 0.13] })
        if (index < valueLines.length - 1) this.cursorY -= leading
      })
      this.cursorY -= leading
    }
  }

  addTable(headers: string[], rows: TableRow[], columnWidths: number[]) {
    const rowPadding = 7
    const headerHeight = 20
    const borderColor: [number, number, number] = [0.76, 0.76, 0.8]
    const headerFill: [number, number, number] = [0.95, 0.95, 0.97]
    const totalWidth = columnWidths.reduce((a, b) => a + b, 0)

    const renderHeader = (y: number) => {
      this.drawRect(MARGIN, y - headerHeight, totalWidth, headerHeight, true, true, headerFill)
      let x = MARGIN
      headers.forEach((header, index) => {
        this.drawText(header, x + 6, y - 13, { size: 10, font: 'bold', color: [0.15, 0.15, 0.17] })
        x += columnWidths[index]
      })
    }

    const renderRow = (row: TableRow, y: number, height: number) => {
      const fill: [number, number, number] = row.highlight ? [0.98, 0.99, 1] : [1, 1, 1]
      this.drawRect(MARGIN, y - height, totalWidth, height, true, true, fill)
      let x = MARGIN
      row.cells.forEach((cell, index) => {
        const lines = wrapText(cell, columnWidths[index] - 12, 10)
        const baseY = y - 12
        lines.forEach((line, lineIndex) => {
          this.drawText(line, x + 6, baseY - lineIndex * 12, { size: 10, color: [0.12, 0.12, 0.13] })
        })
        this.drawLine(x, y, x, y - height, 0.5, borderColor)
        x += columnWidths[index]
      })
      this.drawLine(x, y, x, y - height, 0.5, borderColor)
      this.drawLine(MARGIN, y, MARGIN + totalWidth, y, 0.5, borderColor)
      this.drawLine(MARGIN, y - height, MARGIN + totalWidth, y - height, 0.5, borderColor)
    }

    this.ensurePage(40)
    renderHeader(this.cursorY)
    this.cursorY -= headerHeight

    for (const row of rows) {
      const rowHeights = row.cells.map((cell, index) => {
        const lines = wrapText(cell, columnWidths[index] - 12, 10)
        return lines.length * 12 + rowPadding * 2
      })
      const rowHeight = Math.max(26, ...rowHeights)
      if (this.cursorY - rowHeight < MARGIN + FOOTER_HEIGHT) {
        this.newPage()
        renderHeader(this.cursorY)
        this.cursorY -= headerHeight
      }
      renderRow(row, this.cursorY, rowHeight)
      this.cursorY -= rowHeight
    }
    this.cursorY -= 8
  }

  addTwoColumnCards(leftTitle: string, leftBody: string, rightTitle: string, rightBody: string) {
    const cardWidth = (PAGE_WIDTH - MARGIN * 2 - 12) / 2
    const cardPadding = 10
    const lineHeight = 14
    const leftLines = wrapText(leftBody, cardWidth - cardPadding * 2, 10)
    const rightLines = wrapText(rightBody, cardWidth - cardPadding * 2, 10)
    const cardHeight = Math.max(leftLines.length, rightLines.length) * lineHeight + 36
    this.ensurePage(cardHeight + 8)

    const drawCard = (x: number, title: string, lines: string[]) => {
      this.drawRect(x, this.cursorY - cardHeight, cardWidth, cardHeight, true, true, [0.99, 0.99, 1])
      this.drawText(title, x + cardPadding, this.cursorY - 16, { size: 10, font: 'bold', color: [0.12, 0.12, 0.13] })
      lines.forEach((line, index) => {
        this.drawText(line, x + cardPadding, this.cursorY - 34 - index * lineHeight, { size: 10, color: [0.12, 0.12, 0.13] })
      })
    }

    drawCard(MARGIN, leftTitle, leftLines)
    drawCard(MARGIN + cardWidth + 12, rightTitle, rightLines)
    this.cursorY -= cardHeight + 14
  }

  addDiagram(nodes: Array<{ label: string; detail: string }>) {
    const boxWidth = PAGE_WIDTH - MARGIN * 2
    const boxHeight = 52
    const lineGap = 18
    nodes.forEach((node, index) => {
      const detailLines = wrapText(node.detail, boxWidth - 26, 10)
      const nodeHeight = Math.max(boxHeight, detailLines.length * 12 + 28)
      this.ensurePage(nodeHeight + (index < nodes.length - 1 ? lineGap : 0))
      this.drawRect(MARGIN, this.cursorY - nodeHeight, boxWidth, nodeHeight, true, true, [0.98, 0.98, 0.99])
      this.drawText(node.label, MARGIN + 12, this.cursorY - 18, { size: 12, font: 'bold', color: [0.1, 0.1, 0.12] })
      detailLines.forEach((line, lineIndex) => {
        this.drawText(line, MARGIN + 12, this.cursorY - 34 - lineIndex * 12, { size: 10, color: [0.15, 0.15, 0.17] })
      })
      this.cursorY -= nodeHeight
      if (index < nodes.length - 1) {
        this.drawText('v', PAGE_WIDTH / 2, this.cursorY - 10, { size: 12, font: 'bold', align: 'center', color: [0.5, 0.5, 0.55] })
        this.cursorY -= lineGap
      }
    })
    this.cursorY -= 6
  }

  addRequirementCard(item: RequirementItem) {
    const cardWidth = PAGE_WIDTH - MARGIN * 2
    const innerX = MARGIN + 12
    const innerWidth = cardWidth - 24
    const title = `${item.id}  |  Priority: ${item.priority}${item.inferred ? '  |  AI Assumption' : ''}`
    const titleLines = wrapText(title, innerWidth, 10, true)
    const descriptionLines = wrapText(item.description, innerWidth, 10)
    const criteriaLines = item.acceptanceCriteria.map((criterion) => wrapText(criterion, innerWidth - 14, 9))
    const criteriaHeight = criteriaLines.reduce((sum, lines) => sum + lines.length * 11 + 4, 0)
    const relatedHeight = item.relatedFRs?.length ? 14 : 0
    const cardHeight = 26 + titleLines.length * 12 + descriptionLines.length * 12 + 20 + criteriaHeight + relatedHeight

    this.ensurePage(cardHeight + 12)
    this.drawRect(MARGIN, this.cursorY - cardHeight, cardWidth, cardHeight, true, true, [0.99, 0.99, 1])

    let y = this.cursorY - 16
    titleLines.forEach((line) => {
      this.drawText(line, innerX, y, { size: 10, font: 'bold', color: [0.12, 0.12, 0.14] })
      y -= 12
    })

    y -= 2
    descriptionLines.forEach((line) => {
      this.drawText(line, innerX, y, { size: 10, color: [0.14, 0.14, 0.16] })
      y -= 12
    })

    y -= 2
    this.drawText('Acceptance Criteria', innerX, y, { size: 9, font: 'bold', color: [0.18, 0.18, 0.2] })
    y -= 12

    criteriaLines.forEach((lines, index) => {
      this.drawText('-', innerX, y, { size: 9, color: [0.14, 0.14, 0.16] })
      lines.forEach((line, lineIndex) => {
        this.drawText(line, innerX + 12, y, { size: 9, color: [0.14, 0.14, 0.16] })
        if (lineIndex < lines.length - 1) y -= 11
      })
      y -= 11
      if (index < criteriaLines.length - 1) y -= 1
    })

    if (item.relatedFRs?.length) {
      y -= 4
      this.drawText(`Related: ${item.relatedFRs.join(', ')}`, innerX, y, { size: 8, font: 'italic', color: [0.35, 0.35, 0.4] })
    }

    this.cursorY -= cardHeight + 10
  }

  addAssumptionTiers(classified: ArchitectureData['classifiedAssumptions']) {
    const confirmed = classified.filter((a) => a.confidence === 'confirmed')
    const high = classified.filter((a) => a.confidence === 'high')
    const low = classified.filter((a) => a.confidence === 'low')

    if (confirmed.length > 0) {
      this.addSubheading('Confirmed', [0.1, 0.5, 0.1])
      this.addSmallLabel('These items are explicitly referenced in the session or requirements text.')
      this.addBullets(confirmed.map((a) => `[confirmed] ${a.label}`), { size: 10 })
    }
    if (high.length > 0) {
      this.addSubheading('High Confidence (AI Inference)', [0.55, 0.38, 0.0])
      this.addSmallLabel('These items are strongly implied by the project type and domain context. (avg. 85% confidence)')
      this.addBullets(high.map((a) => `[~${a.confidencePercent}%] ${a.label}`), { size: 10 })
    }
    if (low.length > 0) {
      this.addSubheading('Low Confidence (Suggestion)', [0.4, 0.4, 0.45])
      this.addSmallLabel('These are speculative suggestions — confirm or discard before implementation.')
      this.addBullets(low.map((a) => `[~${a.confidencePercent}%] ${a.label}`), { size: 10 })
    }
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function titleCase(value: string): string {
  return ascii(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.toLowerCase().replace(/[^\w]/g, '')
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

function uniqueList(values: string[]): string[] {
  return dedupe(values.map((value) => ascii(value).trim()).filter(Boolean))
}

// ─── Domain-Aware Requirement Builder ────────────────────────────────────────

function buildDomainFunctionalRequirements(data: ArchitectureData): RequirementGroup[] {
  const { domainProfile } = data
  const frMap = DOMAIN_FRS[domainProfile.domainType] ?? DOMAIN_FRS['generic']

  // Scale: how many FRs per category to include
  const maxPerCategory = data.projectScale === 'Large' ? 99 : data.projectScale === 'Medium' ? 3 : 2

  return domainProfile.frCategories
    .map(({ label, prefix }) => {
      const specs = (frMap[prefix] ?? []).slice(0, maxPerCategory)
      const items: RequirementItem[] = specs.map((spec, i) => ({
        id: `FR-${prefix}-${String(i + 1).padStart(3, '0')}`,
        priority: spec.p,
        description: spec.d,
        acceptanceCriteria: spec.c,
      }))
      return { label, prefix, items }
    })
    .filter((g) => g.items.length > 0)
}

// ─── Domain-Aware Database Entities ──────────────────────────────────────────

function buildDomainDatabaseEntities(data: ArchitectureData): TableRow[] {
  const { domainProfile } = data
  return domainProfile.coreEntities.map((entity) => ({
    cells: [
      entity.name,
      entity.purpose,
      entity.relationships,
      entity.primaryKey,
      entity.keyFields.join(', '),
    ],
  }))
}

// ─── 5-Column Risk Table ──────────────────────────────────────────────────────

function buildStructuredRiskRows(data: ArchitectureData): TableRow[] {
  return data.structuredRisks.map((risk) => ({
    cells: [risk.title, risk.impact, risk.likelihood, risk.mitigation, risk.owner],
    highlight: risk.impact === 'High',
  }))
}

// ─── User Stories with FR Traceability ───────────────────────────────────────

interface UserStoryData {
  actor: string
  want: string
  benefit: string
  relatedFRs: string[]
}

function buildUserStories(data: ArchitectureData, frGroups: RequirementGroup[]): UserStoryData[] {
  const { domainProfile } = data
  const corpus = [data.projectName, data.summary, ...data.features, ...data.integrations, ...data.roles].join(' ').toLowerCase()

  const firstGroup = frGroups[0]
  const secondGroup = frGroups[1]
  const adminGroup = frGroups.find((g) => g.prefix === 'ADMIN') ?? frGroups[frGroups.length - 1]
  const firstFR = firstGroup?.items[0]?.id ?? ''
  const firstFR2 = firstGroup?.items[1]?.id ?? ''
  const secondFR1 = secondGroup?.items[0]?.id ?? ''
  const secondFR2 = secondGroup?.items[1]?.id ?? ''
  const adminFR = adminGroup?.items[0]?.id ?? ''

  const primaryRole = data.roles[0] ? titleCase(data.roles[0]) : domainProfile.primaryWorkflows[0].split(' ')[0]
  const adminRole = 'Administrator'

  const stories: UserStoryData[] = [
    {
      actor: 'Visitor',
      want: `explore the ${domainProfile.industryLabel.toLowerCase()} platform and understand its offerings`,
      benefit: 'I can decide whether to register or engage before committing.',
      relatedFRs: [firstFR].filter(Boolean),
    },
    {
      actor: primaryRole,
      want: `complete the primary ${domainProfile.primaryWorkflows[0].toLowerCase()} without assistance`,
      benefit: 'I can accomplish my core goal independently.',
      relatedFRs: [firstFR, firstFR2].filter(Boolean),
    },
    {
      actor: primaryRole,
      want: `receive confirmation and track the outcome of my submission`,
      benefit: 'I know my action was received and can follow up if needed.',
      relatedFRs: [secondFR1, secondFR2].filter(Boolean),
    },
    {
      actor: adminRole,
      want: `manage all platform records and user accounts from the administration panel`,
      benefit: 'I can keep the system accurate, secure, and up to date.',
      relatedFRs: [adminFR].filter(Boolean),
    },
  ]

  if (/search|filter|find/i.test(corpus)) {
    const rptGroup = frGroups.find((g) => g.prefix === 'RPT')
    stories.push({
      actor: primaryRole,
      want: `search and filter content to find what I need quickly`,
      benefit: 'I spend less time browsing and find relevant results immediately.',
      relatedFRs: rptGroup?.items.map((i) => i.id).slice(0, 2) ?? [],
    })
  }

  if (/payment|donat|checkout|order/i.test(corpus)) {
    const payGroup = frGroups.find((g) => g.prefix === 'PAY' || g.prefix === 'DON')
    stories.push({
      actor: primaryRole,
      want: `submit a secure payment or donation`,
      benefit: 'I can contribute or purchase with confidence that my information is protected.',
      relatedFRs: payGroup?.items.map((i) => i.id).slice(0, 2) ?? [],
    })
  }

  const maxStories = data.projectScale === 'Large' ? 7 : data.projectScale === 'Medium' ? 6 : 5
  return stories.slice(0, maxStories)
}

// ─── Non-Functional Requirements ─────────────────────────────────────────────

interface NfrGroup {
  category: string
  items: string[]
}

function buildNonFunctionalGroups(data: ArchitectureData): NfrGroup[] {
  const groups: NfrGroup[] = [
    {
      category: 'Performance',
      items: [
        'Common pages shall load within 2 seconds under normal network conditions.',
        'Search and dashboard queries shall return results without perceptible delay for typical dataset sizes.',
      ],
    },
    {
      category: 'Security',
      items: [
        'Authentication and authorization shall protect all restricted workflows.',
        'Sensitive data shall be validated on the server, transmitted over HTTPS, and stored with appropriate encryption.',
      ],
    },
    {
      category: 'Scalability',
      items: [
        'The solution shall scale to accommodate expected user growth without architectural redesign.',
      ],
    },
    {
      category: 'Maintainability',
      items: [
        'Features shall be separated into clear modules and reusable components to support independent updates.',
      ],
    },
    {
      category: 'Accessibility',
      items: [
        'The interface shall support keyboard navigation and maintain readable color contrast ratios.',
      ],
    },
    {
      category: 'Availability',
      items: [
        'Core workflows shall recover gracefully from partial service interruptions with clear user messaging.',
      ],
    },
  ]

  if (data.metadata.complexity === 'High') {
    groups[0].items.push('Operational monitoring shall alert on degraded performance for critical workflows.')
  }

  return groups
}

function buildSuccessCriteria(data: ArchitectureData): string[] {
  const { domainProfile } = data
  return uniqueList([
    `Users can complete the primary ${domainProfile.primaryWorkflows[0].toLowerCase()} flow end to end.`,
    `Administrators can manage ${domainProfile.industryLabel.toLowerCase()} content and user permissions.`,
    `Forms, confirmations, and navigation behave consistently across all supported device sizes.`,
    `The platform passes accessibility and responsive layout review before launch.`,
    `All open questions in this document are resolved before implementation begins.`,
  ]).slice(0, 5)
}

// ─── Tech & AI Rows ───────────────────────────────────────────────────────────

function buildTechnologyRows(data: ArchitectureData): TableRow[] {
  return data.architectureRecommendations.map((item) => ({
    cells: [
      item.area,
      item.recommended,
      item.reason,
      `${item.alternative} - ${item.alternativeReason}`,
    ],
    highlight: item.recommended.toLowerCase().includes('react') || item.recommended.toLowerCase().includes('postgres'),
  }))
}

function buildAiRecommendationRows(data: ArchitectureData): TableRow[] {
  return data.aiRecommendations.map((tool) => ({
    cells: [tool.tool, tool.bestUseCase, tool.why, tool.limitations.join('; ')],
    highlight: tool.recommended,
  }))
}

function buildCompatibilityRows(data: ArchitectureData): TableRow[] {
  return data.generatorCompatibility.map((item) => ({
    cells: [
      item.status === 'supported' ? 'Supported' : item.status === 'warning' ? 'Partial' : 'Unsupported',
      item.label,
      item.reason,
    ],
    highlight: item.status === 'supported',
  }))
}

// ─── Roadmap Bullets ──────────────────────────────────────────────────────────

function buildRoadmapBullets(data: ArchitectureData): { phase: string; description: string; milestones: string }[] {
  if (data.roadmap.length > 0) {
    return data.roadmap.map((phase) => ({
      phase: phase.phase,
      description: phase.description,
      milestones: phase.milestones.join(', '),
    }))
  }
  return []
}

// ─── Conclusion ───────────────────────────────────────────────────────────────

function buildConclusion(data: ArchitectureData): string {
  const topRisk = data.structuredRisks[0]?.title ?? 'scope drift and third-party dependency timing'
  const openQ = data.openQuestions[0] ?? 'deployment target and external service choices'
  return ascii(
    `${data.projectName} is ready for implementation planning, with the requirements and architecture defined at the level of detail needed to begin development.

Key risk to track: ${topRisk}.

Priority open question to resolve: ${openQ}.

Next step: confirm the open questions listed in this document, align on any outstanding design decisions, and proceed with the recommended development roadmap.`,
  )
}

// ─── Body Pages ───────────────────────────────────────────────────────────────

function buildBodyPages(data: ArchitectureData): { pages: PageContent[]; tocEntries: TocEntry[] } {
  const frGroups = buildDomainFunctionalRequirements(data)
  const userStories = buildUserStories(data, frGroups)
  const nfrGroups = buildNonFunctionalGroups(data)
  const successCriteria = buildSuccessCriteria(data)
  const roadmapItems = buildRoadmapBullets(data)

  const body = new SrsLayout(2)

  // ── Section 1: Executive Summary ──
  body.startSection(1, 'Executive Summary')
  body.addParagraph(
    `Purpose: ${data.projectName} is a ${data.projectScale.toLowerCase()}-scale ${data.domainProfile.industryLabel} platform.\n\nBusiness objective: convert the project vision into a client-ready requirements baseline that can be reviewed, approved, and implemented with confidence.\n\nTarget users: ${data.roles.length > 0 ? data.roles.map((r) => titleCase(r)).join(', ') : data.domainProfile.frCategories.map((c) => c.label).slice(0, 3).join(', ')}.\n\nThis document defines what should be built, the primary constraints, and the decisions that still need confirmation before implementation begins.`,
  )

  // ── Section 2: Project Scope ──
  body.startSection(2, 'Project Scope')

  const corpus = [data.projectName, data.summary, ...data.features, ...data.integrations].join(' ').toLowerCase()
  const inScope = uniqueList([
    ...data.domainProfile.primaryWorkflows.slice(0, 4),
    ...data.integrations.slice(0, 2).map((i) => titleCase(i) + ' integration'),
  ]).slice(0, 6)

  const outScopeCandidates = uniqueList([
    ...data.conflicts.slice(0, 3),
    ...(!corpus.includes('mobile') ? ['Native mobile application'] : []),
    ...(!corpus.includes('erp') ? ['ERP integration'] : []),
    ...(!corpus.includes('accounting') ? ['Accounting software integration'] : []),
    ...(!corpus.includes('kubernetes') ? ['Kubernetes automation'] : []),
  ]).slice(0, 5)

  body.addSubheading('In Scope')
  body.addBullets(inScope.length > 0 ? inScope : ['Core platform workflows', 'Administration panel', 'Reporting and data export'])
  body.addSubheading('Out of Scope')
  body.addBullets(outScopeCandidates.length > 0 ? outScopeCandidates : ['Native mobile application', 'ERP integration', 'Kubernetes automation'])

  // ── Section 3: Stakeholders & User Roles ──
  body.startSection(3, 'Stakeholders & User Roles')
  body.addParagraph(`Industry: ${data.domainProfile.industryLabel}. Domain: ${data.domainProfile.domainType === 'generic' ? 'General web application' : data.domainProfile.industryLabel}.`)

  if (data.roles.length > 0) {
    body.addSubheading('Confirmed Roles')
    body.addBullets(data.roles.map((r) => titleCase(r)))
  }

  body.addSubheading('Inferred Roles (AI Inference)')
  const inferredRoles = data.domainProfile.frCategories
    .map((c) => c.label)
    .filter((label) => !data.roles.some((r) => titleCase(r).toLowerCase().includes(label.toLowerCase())))
    .slice(0, 4)
  body.addBullets(inferredRoles.length > 0 ? inferredRoles.map((r) => `${r} users`) : [`${data.domainProfile.industryLabel} end users`, 'Platform administrators'])

  // ── Section 4: User Stories ──
  body.startSection(4, 'User Stories')
  body.addParagraph('Each user story is linked to the functional requirements that support it.')
  const storyTexts = userStories.map((story) => {
    const base = `As a ${story.actor}, I want to ${story.want}, so that ${story.benefit}`
    const refs = story.relatedFRs.length > 0 ? `  (Related: ${story.relatedFRs.join(', ')})` : ''
    return base + refs
  })
  body.addNumberedList(storyTexts, 'US')

  // ── Section 5: Functional Requirements ──
  body.startSection(5, 'Functional Requirements')
  body.addParagraph(`Requirements are grouped by functional area and identified with category-prefixed IDs. All requirements are specific to the ${data.domainProfile.industryLabel} domain.`)

  frGroups.forEach((group) => {
    body.addSubheading(group.label)
    group.items.forEach((req) => body.addRequirementCard(req))
  })

  // ── Section 6: Non-Functional Requirements ──
  body.startSection(6, 'Non-Functional Requirements')
  nfrGroups.forEach((group) => {
    body.addSubheading(group.category)
    body.addBullets(group.items)
  })

  // ── Section 7: Assumptions ──
  body.startSection(7, 'Assumptions')
  body.addParagraph('Assumptions are classified by confidence level. Confirmed items are explicitly referenced in the session. High confidence items are strongly implied by the project domain. Low confidence items are speculative and should be validated.')
  body.addAssumptionTiers(data.classifiedAssumptions)

  // ── Section 8: Open Questions (NEW) ──
  body.startSection(8, 'Open Questions')
  body.addParagraph(`The following questions must be answered before implementation begins. They are specific to the ${data.domainProfile.industryLabel} domain and directly impact architecture, data model, and feature scope.`)
  body.addBullets(data.openQuestions)

  // ── Section 9: Missing Information ──
  body.startSection(9, 'Missing Information')
  body.addBullets(
    data.missingInformation.length > 0
      ? data.missingInformation
      : ['Authentication method has not been confirmed.', 'Hosting platform and deployment target are not specified.', 'External service integrations are not finalized.'],
  )

  // ── Section 10: Risk Assessment ──
  body.startSection(10, 'Risk Assessment')
  body.addParagraph(`Risks are specific to the ${data.domainProfile.industryLabel} domain and ranked by business impact. All mitigations should be confirmed before the affected phase begins.`)
  body.addTable(
    ['Risk', 'Impact', 'Likelihood', 'Mitigation', 'Owner'],
    buildStructuredRiskRows(data),
    [140, 44, 55, 196, 64],
  )

  // ── Section 11: Success Criteria ──
  body.startSection(11, 'Success Criteria')
  body.addBullets(successCriteria)

  // ── Section 12: Recommended Technology Stack ──
  body.startSection(12, 'Recommended Technology Stack')
  body.addTable(
    ['Category', 'Recommended', 'Reason', 'Alternative (Reason)'],
    buildTechnologyRows(data),
    [76, 110, 180, 133],
  )

  // ── Section 13: High-Level Architecture ──
  body.startSection(13, 'High-Level Architecture')
  body.addParagraph(
    `Architecture pattern: ${data.pattern}. The recommended architecture separates the user interface, application logic, data layer, and external services to keep the system understandable, testable, and evolvable.`,
  )
  body.addDiagram([
    { label: 'User', detail: 'Primary actor using the product.' },
    { label: 'Frontend', detail: data.frontendStack },
    { label: 'Backend', detail: data.backendStack },
    { label: 'Database', detail: data.database },
    { label: 'Storage', detail: data.storage },
    { label: 'External Services', detail: data.integrations.length ? data.integrations.join(', ') : 'No external services confirmed yet.' },
  ])

  // ── Section 14: Database Overview ──
  body.startSection(14, 'Database Overview')
  body.addParagraph(
    `Database type: ${data.databaseSummary.type}. Domain: ${data.domainProfile.industryLabel}. The entities below are derived from the detected project domain and represent the core data model.`,
  )
  body.addTable(
    ['Entity', 'Purpose', 'Relationships', 'Primary Key', 'Key Fields'],
    buildDomainDatabaseEntities(data),
    [88, 128, 119, 72, 92],
  )

  if (data.databaseSummary.relationships.length > 0) {
    body.addSubheading('Key Relationships')
    body.addBullets(data.databaseSummary.relationships)
  }

  // ── Section 15: Security Recommendations ──
  body.startSection(15, 'Security Recommendations')
  body.addParagraph('Security controls are categorized by domain. Only applicable controls are listed based on detected project characteristics.')
  data.securityCategories.forEach((cat) => {
    body.addSubheading(cat.category)
    body.addBullets(cat.recommendations, { size: 10 })
  })

  // ── Section 16: Development Roadmap ──
  body.startSection(16, 'Development Roadmap')
  body.addParagraph(`The following roadmap is tailored to the ${data.domainProfile.industryLabel} domain and ${data.projectScale.toLowerCase()} project scale.`)

  if (roadmapItems.length > 0) {
    roadmapItems.forEach((item) => {
      body.addSubheading(item.phase)
      body.addSmallLabel(item.description)
      body.addBullets(item.milestones.split(', '))
    })
  } else {
    data.domainProfile.primaryWorkflows.forEach((workflow) => body.addBullets([workflow]))
  }

  // ── Section 17: Project Estimates ──
  body.startSection(17, 'Project Estimates')
  body.addTable(
    ['Metric', 'Estimate'],
    [
      ['Estimated files', `${data.metrics.estimatedFiles}+`],
      ['Components', `${data.metrics.estimatedComponents}+`],
      ['API endpoints', `${data.metrics.estimatedApis}+`],
      ['Database tables', `${data.metrics.estimatedDbTables}+`],
      ['Services', `${data.metrics.estimatedServices}+`],
      ['Timeline', data.metrics.estimatedDevTime],
      ['Complexity', data.metadata.complexity],
    ].map(([metric, estimate]) => ({ cells: [metric, estimate] })),
    [240, 236],
  )

  body.addSubheading('AI Inference Confidence')
  body.addTable(
    ['Section', 'Confidence'],
    Object.entries(data.inferenceConfidence).map(([section, pct]) => ({
      cells: [section, `${pct}%`],
      highlight: pct >= 85,
    })),
    [300, 176],
  )

  // ── Section 18: AI Tool Recommendation ──
  body.startSection(18, 'AI Tool Recommendation')
  const bestTool = data.aiRecommendations.find((tool) => tool.recommended) ?? data.aiRecommendations[0]
  body.addParagraph(
    `Recommended tool for this ${data.domainProfile.industryLabel} project: ${bestTool.tool}.\n\nReason: ${bestTool.why}\n\nBest use case: ${bestTool.bestUseCase}`,
  )
  body.addTable(
    ['Tool', 'Best Use Case', 'Reason', 'Limitations'],
    buildAiRecommendationRows(data),
    [80, 128, 150, 141],
  )

  // ── Section 19: Generator Compatibility (CONDITIONAL) ──
  let sectionNum = 19
  if (data.showGeneratorCompatibility) {
    body.startSection(sectionNum, 'Generator Compatibility')
    body.addParagraph('This section is included because the session references FoundryForge code generation. The table below shows which aspects of this architecture are supported by the current generator version.')
    body.addTable(['Status', 'Capability', 'Notes'], buildCompatibilityRows(data), [88, 110, 302])
    sectionNum++
  }

  // ── Section 19 or 20: Conclusion ──
  body.startSection(sectionNum, 'Conclusion')
  body.addParagraph(buildConclusion(data))

  return { pages: body.pages, tocEntries: body.tocEntries }
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

function buildCoverPage(data: ArchitectureData): PageContent {
  const page = new SrsLayout()
  page.newPage()
  const titleY = PAGE_HEIGHT - 170
  page.addCenteredTitle('SOFTWARE REQUIREMENTS SPECIFICATION', titleY + 76, 16, true, [0.35, 0.35, 0.38])
  page.addCenteredTitle(data.projectName, titleY + 24, 28, true, [0.08, 0.08, 0.09])
  page.addCenteredTitle(ascii(data.summary), titleY - 14, 12, false, [0.22, 0.22, 0.24])
  page.addCenteredTitle(data.domainProfile.industryLabel, titleY - 34, 11, false, [0.38, 0.38, 0.42])

  const metaTop = titleY - 96
  page.drawRect(MARGIN, metaTop - 80, PAGE_WIDTH - MARGIN * 2, 120, true, true, [0.98, 0.98, 0.99])
  page.drawText('Version', MARGIN + 18, metaTop, { size: 10, font: 'bold', color: [0.2, 0.2, 0.22] })
  page.drawText('v1.0', MARGIN + 110, metaTop, { size: 10, color: [0.12, 0.12, 0.13] })
  page.drawText('Generation Date', MARGIN + 18, metaTop - 20, { size: 10, font: 'bold', color: [0.2, 0.2, 0.22] })
  page.drawText(data.metadata.generatedAt, MARGIN + 110, metaTop - 20, { size: 10, color: [0.12, 0.12, 0.13] })
  page.drawText('Generated By', MARGIN + 18, metaTop - 40, { size: 10, font: 'bold', color: [0.2, 0.2, 0.22] })
  page.drawText('FoundryForge', MARGIN + 110, metaTop - 40, { size: 10, color: [0.12, 0.12, 0.13] })
  page.drawText('Document Type', MARGIN + 18, metaTop - 60, { size: 10, font: 'bold', color: [0.2, 0.2, 0.22] })
  page.drawText('Software Requirements Specification', MARGIN + 110, metaTop - 60, { size: 10, color: [0.12, 0.12, 0.13] })

  page.addCenteredTitle('Prepared for architecture review, client handoff, and implementation planning.', 135, 10, false, [0.35, 0.35, 0.38])
  return page.pages[0]
}

// ─── TOC Page ─────────────────────────────────────────────────────────────────

function buildTocPage(entries: TocEntry[]): PageContent {
  const page = new SrsLayout()
  page.newPage()
  page.addCenteredTitle('TABLE OF CONTENTS', PAGE_HEIGHT - 96, 18, true, [0.08, 0.08, 0.09])
  page.drawLine(MARGIN, PAGE_HEIGHT - 110, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 110, 0.8, [0.8, 0.8, 0.82])

  let y = PAGE_HEIGHT - 144
  entries.forEach((entry) => {
    const left = entry.title
    const right = String(entry.page)
    const leftLines = wrapText(left, PAGE_WIDTH - MARGIN * 2 - 60, 11, true)
    page.drawText(leftLines[0], MARGIN, y, { size: 11, font: 'bold', color: [0.12, 0.12, 0.14] })
    page.drawText(right, PAGE_WIDTH - MARGIN, y, { size: 11, align: 'right', color: [0.12, 0.12, 0.14] })
    page.drawLine(MARGIN, y - 4, PAGE_WIDTH - MARGIN - 28, y - 4, 0.25, [0.8, 0.8, 0.82])
    y -= 22
  })

  return page.pages[0]
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function buildFooter(pageNumber: number, totalPages: number, generatedAt: string): string {
  const text = `Generated by FoundryForge | ${ascii(generatedAt)} | Page ${pageNumber} of ${totalPages}`
  const width = textWidth(text, 8, false)
  const x = (PAGE_WIDTH - width) / 2
  return `BT /F1 8 Tf 0.35 0.35 0.38 rg 1 0 0 1 ${x.toFixed(2)} 26 Tm (${escapePdfText(text)}) Tj ET`
}

// ─── PDF Compiler ─────────────────────────────────────────────────────────────

function compilePdf(pages: PageContent[], generatedAt: string): Uint8Array {
  const objects: string[] = []
  const offsets: number[] = [0]
  let output = '%PDF-1.4\n'

  const addObject = (body: string) => {
    offsets.push(output.length)
    output += `${objects.length + 1} 0 obj\n${body}\nendobj\n`
    objects.push(body)
  }

  const fontObjects = [
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>',
  ]

  fontObjects.forEach((font) => addObject(font))

  const contentObjectNumbers: number[] = []
  const pageObjectNumbers: number[] = []
  const firstContentNumber = objects.length + 1

  pages.forEach((page, index) => {
    const pageNumber = index + 1
    const pageOps = [...page.ops, buildFooter(pageNumber, pages.length, generatedAt)].join('\n')
    const bytes = new TextEncoder().encode(pageOps)
    const contentNumber = firstContentNumber + index
    contentObjectNumbers.push(contentNumber)
    addObject(`<< /Length ${bytes.length} >>\nstream\n${pageOps}\nendstream`)
  })

  const firstPageNumber = objects.length + 1
  const pagesTreeNumber = firstPageNumber + pages.length
  const catalogNumber = pagesTreeNumber + 1

  pages.forEach((_, index) => {
    const contentRef = contentObjectNumbers[index]
    const pageObj = `<< /Type /Page /Parent ${pagesTreeNumber} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 1 0 R /F2 2 0 R /F3 3 0 R >> >> /Contents ${contentRef} 0 R >>`
    pageObjectNumbers.push(firstPageNumber + index)
    addObject(pageObj)
  })

  addObject(`<< /Type /Pages /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(' ')}] /Count ${pages.length} >>`)
  addObject(`<< /Type /Catalog /Pages ${pagesTreeNumber} 0 R >>`)

  const xrefStart = output.length
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i < offsets.length; i++) {
    output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogNumber} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new TextEncoder().encode(output)
}

// ─── Public Entry Point ───────────────────────────────────────────────────────

export function buildSrsPdf(data: ArchitectureData): Uint8Array {
  const { pages: bodyPages, tocEntries } = buildBodyPages(data)
  const cover = buildCoverPage(data)
  const toc = buildTocPage(tocEntries)
  return compilePdf([cover, toc, ...bodyPages], data.metadata.generatedAt)
}