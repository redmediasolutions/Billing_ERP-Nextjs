export const phoneDisplay = "+91 95915 91783";
export const phoneWa = "919591591783";
export const waHref = `https://wa.me/${phoneWa}?text=${encodeURIComponent(
  "Hello, I want to know more about Billing ERP."
)}`;

export type ModuleSection = {
  heading: string;
  body: string;
};

export type Module = {
  slug: string;
  index: string;
  title: string;
  group: "Home" | "Sales" | "Catalog" | "Operations" | "People";
  kicker: string;
  summary: string;
  lead: string;
  screens: string[];
  points: string[];
  sections: ModuleSection[];
};

export const modules: Module[] = [
  {
    slug: "dashboard",
    index: "01",
    title: "Dashboard",
    group: "Home",
    kicker: "The morning desk",
    summary: "A home screen you compose from the work that actually matters today.",
    lead: "The dashboard is the first surface after sign-in. It is a working board, not a wallpaper of charts. You choose which blocks stay on the desk — sales, customers, catalog, inventory, expenses, and the follow-ups that are due — and the rest stays out of the way.",
    screens: ["Overview", "Customise layout"],
    points: [
      "Blocks for sales, customers, catalog, inventory, and expenses",
      "Follow-up blocks for enquiries, bookings, warranty, renewals, and memberships",
      "Layout stored per person, so each desk can look different",
      "Reset back to the full set when a new hire starts",
    ],
    sections: [
      {
        heading: "A board you edit",
        body: "Open Customise and tick the modules that belong on this business’s home. A clinic may keep bookings and renewals. A parts counter may keep sales, low stock, and expenses. The choice is saved in the browser for that login, so the next morning opens on the same arrangement.",
      },
      {
        heading: "Numbers with a place to go",
        body: "Each block is a doorway. Revenue and today’s POS sales sit next to recent invoices. Customer and estimate counts sit next to the people they belong to. Stock alerts point at the catalog. Nothing on the board is decorative: if a figure is shown, there is a list behind it.",
      },
      {
        heading: "Follow-ups in one glance",
        body: "Enquiries due today, bookings in the building, warranties about to lapse, service and payment renewals, and memberships nearing expiry share the same home. The day starts with what will go stale if nobody calls.",
      },
      {
        heading: "Quiet when the shop is quiet",
        body: "If every block is turned off, the home says so and offers the picker again. There is no empty-state illustration pretending the business has activity it does not have.",
      },
    ],
  },
  {
    slug: "pos",
    index: "02",
    title: "POS billing",
    group: "Sales",
    kicker: "The counter",
    summary: "Walk-in billing with a cart, channel prices, and a bill that can be reprinted.",
    lead: "POS is the counter. Search an item, drop it in the cart, take the money, and print or share the bill. Prices follow the sales channel — walk-in or cloud kitchen — so the same item can carry two rates without a second catalog.",
    screens: ["Billing", "POS items", "POS invoices", "Reports"],
    points: [
      "Cart built for a busy counter, including a mobile cart bar",
      "Walk-in and cloud kitchen price channels",
      "Item grid for fast picking, plus search",
      "Issued bills kept as POS invoices, ready to reopen",
    ],
    sections: [
      {
        heading: "Two prices, one item",
        body: "A plate sold at the counter and the same plate sent out for a cloud-kitchen order do not have to share a rate. The channel toggle switches the sell price the cart uses. Cost, tax, and HSN stay on the item; only the selling rate moves.",
      },
      {
        heading: "Built for the hand that is holding the phone",
        body: "On a narrow screen the cart collapses into a bar so the item grid keeps the full width. The person at the counter can add, change quantity, and take payment without hunting for a sidebar that no longer fits.",
      },
      {
        heading: "Bills that remain bills",
        body: "A completed sale is a POS invoice, not a row that disappears into a daily total. Open it later for a reprint, a correction, or a customer who comes back with the bill number. The invoice list is its own desk, separate from the live cart.",
      },
      {
        heading: "The counter’s own catalog",
        body: "POS items are the sellable list the counter actually uses — names, codes, images, units, and the two channel prices. Reports then read that same stream: what moved today, on which channel, for how much.",
      },
    ],
  },
  {
    slug: "invoices",
    index: "03",
    title: "Invoices",
    group: "Sales",
    kicker: "The tax document",
    summary: "GST invoices with HSN lines, drafts, overdue, and stock that returns if a bill is archived.",
    lead: "Invoices are the formal bills: line items with unit and HSN, tax on the line, a customer, and a life cycle from draft to finalized. Overdue sits in its own filter. Archive a finalized bill and any stock it consumed is put back.",
    screens: ["All invoices", "New invoice", "Drafts", "Finalized", "Overdue"],
    points: [
      "Line items with unit, HSN, quantity, rate, and tax",
      "Drafts you can keep editing before the number is treated as final",
      "Filters for finalized and overdue",
      "Archiving a finalized invoice restores stock",
    ],
    sections: [
      {
        heading: "A bill a GST officer can read",
        body: "Each line carries the unit and the HSN. Tax is calculated on the line, in rupees, with the customer’s GST details pulled from the customer master when they are a registered buyer. The document is the same shape the rest of the product already prints — business name, address, and an authorised signatory.",
      },
      {
        heading: "Draft until it is real",
        body: "A draft is a working bill. Change lines, change the customer, leave it overnight. Finalized bills are the ones that count in the books and in stock. Overdue is a view, not a separate product: the same list, filtered to what has not been collected.",
      },
      {
        heading: "Stock follows the bill",
        body: "Finalizing can consume tracked stock. If the bill was raised in error, archiving it is not a silent delete — available units come back. The person correcting the mistake does not have to re-key serials by hand.",
      },
      {
        heading: "Close to the counter, distinct from it",
        body: "POS invoices and these invoices live as siblings. The counter is fast. This desk is the one you use when the buyer wants a proper tax invoice, a revision, or a statement of what is still open.",
      },
    ],
  },
  {
    slug: "estimates",
    index: "04",
    title: "Estimates",
    group: "Sales",
    kicker: "Before the bill",
    summary: "Quotations you can hand over, revise, and later turn into the work you actually bill.",
    lead: "An estimate is the conversation before the invoice. Build it from the same items, with the same units and descriptions, and send it while the price is still a proposal. The list keeps every open quote in one place, and a new estimate starts from a blank document rather than a copy of yesterday’s bill.",
    screens: ["All estimates", "New estimate"],
    points: [
      "Item lines shared with the invoicing language of the product",
      "A document you can open, revise, and hand to the customer",
      "A list of every estimate, separate from finalized invoices",
      "Sits next to customers, so the quote has a person attached",
    ],
    sections: [
      {
        heading: "Price as a proposal",
        body: "Service shops and fit-out counters rarely bill the first number they say out loud. The estimate holds that number — labour, parts, tax — until the customer agrees. The invoice, when it comes, is a different document with its own number.",
      },
      {
        heading: "The same catalog",
        body: "Lines are picked from items you already maintain: name, unit, HSN, description. You are not retyping a price list into a Word file that will drift from the counter.",
      },
      {
        heading: "A paper trail of maybes",
        body: "Won work should not erase the quotes that did not convert. The estimate list is the history of what was offered. Search it when a customer calls six weeks later and says they had a rate.",
      },
      {
        heading: "Tied to the person",
        body: "Estimates belong with customers. GST buyers, walk-ins, and repeat accounts all sit in the same master, so the quote, the later invoice, and the warranty registration can point at one record.",
      },
    ],
  },
  {
    slug: "customers",
    index: "05",
    title: "Customers",
    group: "Sales",
    kicker: "The people you bill",
    summary: "A customer master with GST buyers called out, ready for invoices, estimates, and memberships.",
    lead: "Customers are the master the rest of sales hangs from. Name, phone, email, and GST details live once. Invoices, estimates, enquiries, bookings, warranties, and memberships all point back here instead of inventing a new contact each time.",
    screens: ["All customers", "Add customer", "GST customers"],
    points: [
      "One record reused across billing, follow-up, and memberships",
      "A GST filter for registered buyers",
      "Create from the list, or while raising an enquiry",
      "Search that follows you into the list you are already on",
    ],
    sections: [
      {
        heading: "Registered and unregistered",
        body: "Not every buyer has a GSTIN. The GST filter isolates the ones who do, so tax invoices and B2B follow-ups are a view, not a spreadsheet you keep beside the software.",
      },
      {
        heading: "Created where the work starts",
        body: "Add a customer from the master, or let an enquiry create the record when a new caller is worth keeping. Either way the later invoice does not start from a blank name field.",
      },
      {
        heading: "The thread through the product",
        body: "A membership enrolment, a warranty registration, a booking, and a renewal can all name the same customer. When they call, you are looking at one person, not four lists that happen to share a phone number.",
      },
      {
        heading: "Plain records",
        body: "The master is a list you can scan: who they are, how to reach them, whether they are a GST buyer. Reports sit next to it when you need totals. The list itself stays a list.",
      },
    ],
  },
  {
    slug: "enquiries",
    index: "06",
    title: "Enquiries",
    group: "Sales",
    kicker: "The pipeline",
    summary: "Leads from first call to won or lost, with follow-up dates and a written trail.",
    lead: "Enquiries hold the work that is not a bill yet. A lead moves from new, to contacted, to qualified, to proposal, and then to won or lost. Each one carries a channel, a priority, an estimated value, an owner, and a follow-up you can filter to today or overdue.",
    screens: ["All enquiries", "Due today", "Overdue", "New", "Won"],
    points: [
      "Statuses: new, contacted, qualified, proposal, won, lost",
      "Priority, source channel, and estimated value",
      "Follow-up date and note, with a log of updates",
      "Lost reason kept on the record, and an option to create the customer",
    ],
    sections: [
      {
        heading: "A status that matches how shops actually talk",
        body: "The stages are the ones a front desk already uses. New is untouched. Contacted means someone spoke. Qualified and proposal are the middle, where a price is in play. Won and lost close the card. Nothing is hidden behind a custom pipeline you have to design before the first call.",
      },
      {
        heading: "Today, and what you missed",
        body: "Due today and overdue are first-class filters, and they also surface on the home dashboard. A follow-up without a date is a hope. A follow-up with a date is a list you can clear before lunch.",
      },
      {
        heading: "The conversation stays on the card",
        body: "Notes, status changes, and follow-up edits are written as updates, with a time and an author. When a colleague picks up the phone, they are not reconstructing the last call from memory.",
      },
      {
        heading: "Where the lead came from",
        body: "Channels are a list you maintain — walk-in, phone, a portal, a reference. Source detail and the estimated value sit beside the channel, so a monthly look at what converted is a filter, not a fresh export.",
      },
    ],
  },
  {
    slug: "bookings",
    index: "07",
    title: "Bookings",
    group: "Sales",
    kicker: "Time on the books",
    summary: "Appointments, overnight stays, and events, scheduled against real resources.",
    lead: "Bookings cover three kinds of time: a timed appointment, an overnight stay, and an all-day event. Each booking sits on a resource — a room, a bay, a person — with its own capacity, buffers, and calendar. Status runs from draft and held through confirmed, in progress, completed, no-show, and cancelled.",
    screens: ["All bookings", "Calendar", "Today", "In progress", "Resources"],
    points: [
      "Appointments, stays, and events",
      "Resources with capacity, colour, and buffer before and after",
      "Staff can be attached when the resource type allows it",
      "Lines on a booking can carry items, HSN, and an employee",
    ],
    sections: [
      {
        heading: "Three clocks",
        body: "A salon slot, a room night, and a hall booked for a day are not the same object with a checkbox. The resource type declares its time model — timed, overnight, or all day — and a default duration. The calendar then respects that, instead of forcing every business into hourly boxes.",
      },
      {
        heading: "Resources before reservations",
        body: "You name the things that can be booked: a code, a capacity, an optional link to an item or an employee, minutes of buffer so two appointments do not touch. Inactive resources leave the picker. Archived ones leave the floor without deleting history.",
      },
      {
        heading: "The day, and the ones underway",
        body: "Today and in progress are the operational views. The calendar is the planning view. A held booking is a soft claim. Confirmed is a promise. No-show and cancelled stay on the record so the day can be reconciled.",
      },
      {
        heading: "A booking that can become a bill",
        body: "Lines on the booking already speak the invoice language — item, unit, HSN, description, and the staff member doing the work. The stay or the appointment is not a note in a different system from the one that raises the bill.",
      },
    ],
  },
  {
    slug: "warranty",
    index: "08",
    title: "Warranty",
    group: "Sales",
    kicker: "After the sale",
    summary: "Registrations, coverage, expiry, and claims, tied to the customer and the unit.",
    lead: "Warranty starts when the product leaves with a promise. Register the unit, set the coverage and the end date, and watch the ones about to lapse. When something fails, a claim sits on that registration — open, in progress, or closed — instead of a WhatsApp thread nobody can find.",
    screens: ["Registrations", "Claims", "Active", "Expiring", "Open claims"],
    points: [
      "Registrations with coverage type and an end date",
      "Claims against a registration, with open claims filtered out",
      "Active and expiring views for the desk that calls customers first",
      "Policies you can keep beside the registrations",
    ],
    sections: [
      {
        heading: "The unit, not just the invoice",
        body: "A registration is the warranty itself: who bought it, what was covered, when it ends. The invoice may have ten lines. The warranty cares about the line that still has months left.",
      },
      {
        heading: "Expiry before the customer notices",
        body: "Active and expiring filters, plus the home-dashboard block, exist so a renewal or a paid extension can be offered while the coverage is still a fact. Waiting for the complaint is the expensive version of the same conversation.",
      },
      {
        heading: "Claims with a status",
        body: "An open claim is work. The claims view, and the open-claims filter, keep that work off the registration list so the two jobs — what is covered, and what is broken — do not share one crowded table.",
      },
      {
        heading: "Policies in the same place",
        body: "Coverage rules live next to the registrations they govern. The person taking a claim does not have to open a PDF from a shared drive to know whether labour is included.",
      },
    ],
  },
  {
    slug: "renewals",
    index: "09",
    title: "Renewals",
    group: "Sales",
    kicker: "What comes around",
    summary: "Service visits, payment chases, and contract renewals, with a date and a recurrence.",
    lead: "Renewals are the reminders that keep a sold relationship alive: a service visit, a payment, a contract, a warranty, a booking, or a general follow-up. Each one has a due date, a priority, a recurrence, and a status from scheduled through due, overdue, snoozed, completed, or cancelled.",
    screens: ["All renewals", "Due today", "Overdue", "Service", "Payments", "Contracts"],
    points: [
      "Types: service, payment, renewal, warranty, booking, general",
      "Recurrence from daily through yearly, or a custom gap",
      "Snooze, complete, and a log of what changed",
      "Can be raised by hand, from an invoice, an item’s service interval, a booking, or a warranty",
    ],
    sections: [
      {
        heading: "The date the work returns",
        body: "An AC that wants a visit every 180 days should not depend on someone remembering. Items can carry a service interval and a suggested reminder title. Raising the renewal from that item puts the next visit on the board with the right name.",
      },
      {
        heading: "Money, visits, and contracts are different lists",
        body: "The filters split the pile: due today, overdue, service, payments, contracts. A collections call and a technician’s route are not the same morning. They share a mechanism and keep separate views.",
      },
      {
        heading: "Snooze is a decision",
        body: "Snoozed is a status, not a hidden row. Completed and cancelled close the loop. The log records created, updated, completed, and snoozed, so a disputed ‘we were never reminded’ has an answer.",
      },
      {
        heading: "Born from the work, not only typed in",
        body: "A reminder can be manual, synced from an invoice, taken from an item default, or attached to a booking or a warranty. The renewal desk collects them. It does not ask you to re-enter a date the invoice already knew.",
      },
    ],
  },
  {
    slug: "memberships",
    index: "10",
    title: "Memberships",
    group: "Sales",
    kicker: "People who come back",
    summary: "Plans, enrolments, visit limits, and a check-in that knows who is still allowed in.",
    lead: "Memberships are for gyms, studios, clubs, and any counter that sells access over time. You define plans with a price, a billing cycle, and a visit rule. You enrol a customer. Check-in then answers a simple question: is this person allowed in today, and how many visits remain.",
    screens: ["Members", "Plans", "Active", "Expiring", "Expired"],
    points: [
      "Plans with pricing, billing cycle, and visit rules",
      "Unlimited visits, or a cap per period",
      "Check-in that respects the remaining visits",
      "Active, expiring, and expired views, plus today’s check-ins on the home board",
    ],
    sections: [
      {
        heading: "The plan is the product",
        body: "A plan names the offer: what it costs, how often it bills, and whether visits are unlimited or counted. Change the plan and future enrolments follow. People already on a plan keep the terms they joined on.",
      },
      {
        heading: "Enrolment is a dated promise",
        body: "An enrolment ties a customer to a plan, with a start, an end, visits used, and visits left. Expiring and expired filters are how you sell the next term before the access quietly stops.",
      },
      {
        heading: "The door",
        body: "Check-in is an action on the enrolment. If the plan is exhausted or lapsed, the record says they cannot check in. The desk is not doing mental arithmetic on a card that lives in a drawer.",
      },
      {
        heading: "Visible on the home screen",
        body: "Active members, plans about to end, and check-ins today can sit on the dashboard. The membership desk and the morning board stay in agreement.",
      },
    ],
  },
  {
    slug: "items",
    index: "11",
    title: "Items",
    group: "Catalog",
    kicker: "What you sell",
    summary: "The sellable catalog: codes, HSN, tax, units, two channel prices, and stock flags.",
    lead: "Items are what the counter and the invoice both sell. Each one has a name, a code, an optional HSN, a cost, a tax rate, and a unit — pieces, box, kilogram, litre, square foot, or a plain service. Walk-in price and cloud-kitchen price live on the same record. So does the choice to track stock, including batches.",
    screens: ["All items", "Add item"],
    points: [
      "Units from pieces and kilograms through square feet and service",
      "Separate walk-in and cloud-kitchen sell prices",
      "Tax rate, HSN, cost, category, image, and description",
      "Inventory tracking, batch tracking, and a service interval for renewals",
    ],
    sections: [
      {
        heading: "One card for the thing you sell",
        body: "The item is the source for POS and for invoices. Change the tax rate here and the next bill picks it up. You are not maintaining a billing list and a counter list that drift apart by Friday.",
      },
      {
        heading: "Rates for how it is sold",
        body: "Walk-in and cloud kitchen are explicit prices, not a discount field someone has to remember. A missing channel price is visible. It does not silently fall back to a number from another counter.",
      },
      {
        heading: "Goods and work",
        body: "A service line is a unit, not a workaround. Labour, visits, and AMC can sit beside boxed goods. When the work repeats, the item can carry a service interval in days and a suggested reminder title, which renewals know how to read.",
      },
      {
        heading: "Stock is a decision on the item",
        body: "Track inventory when units matter. Mark a batch-tracked item when lots matter. Leave both off for a pure service. The catalog does not force a warehouse onto a business that does not have one.",
      },
    ],
  },
  {
    slug: "inventory",
    index: "12",
    title: "Inventory",
    group: "Catalog",
    kicker: "What is on the shelf",
    summary: "Products, brands, and serial-tracked units with cost, barcode, and a vendor.",
    lead: "Inventory is the warehouse view of the catalog. Products are the masters. Brands group them. Serial stock is the individual unit — a barcode, a serial, a cost, a vendor, and a status of available or sold. The overview prices the available stock and points at products that have nothing left.",
    screens: ["Overview", "Products", "Brands", "Serial stock"],
    points: [
      "Product masters before individual serialised units",
      "Brands as a way to group the catalog",
      "Serial, barcode, vendor, and cost on each unit",
      "Available value, sold units, and products sitting at zero",
    ],
    sections: [
      {
        heading: "Master, then unit",
        body: "Create the product before you receive a serialised piece. The product carries the brand and the aggregate count. The serial is the thing you can point at, sell, and later warranty. Selling from serial stock is its own action, not a quantity typed into a box.",
      },
      {
        heading: "Brands as structure",
        body: "Brands exist so a counter with many makes does not flatten into one alphabetical pile. The overview ranks brands by how many products sit under them, which is a buying conversation as much as a labelling one.",
      },
      {
        heading: "What the shelf is worth",
        body: "Available serial units are counted, and their cost is summed. Sold units stay visible so a ‘where did it go’ question has a status, not a missing row. Products with zero available stock are called out on the overview.",
      },
      {
        heading: "Beside items, not instead of them",
        body: "Items are what you bill. Inventory is how you account for the physical piece when the piece has an identity. A business can use items alone. A business that receives serialised goods uses both, and the overview says so.",
      },
    ],
  },
  {
    slug: "vendors",
    index: "13",
    title: "Vendors",
    group: "Operations",
    kicker: "Who you buy from",
    summary: "The supplier master that expenses and serial stock already know how to name.",
    lead: "Vendors are the other side of customers. A supplier lives once, and expenses can point at them, and a serial unit can record who it was bought from. The desk is deliberately small: a list, a form, and a name that stays consistent everywhere else.",
    screens: ["All vendors"],
    points: [
      "A single supplier record reused by expenses and stock",
      "Names that stay stable when bills and units refer back",
      "The operational pair to the customer master",
      "No second copy of a phone number in a notes field",
    ],
    sections: [
      {
        heading: "Buyers and sellers, kept apart",
        body: "A business you buy from is not filed under customers to save a screen. Vendors have their own list so a payment you owe is never mixed with a payment owed to you.",
      },
      {
        heading: "Named on the expense",
        body: "An expense can store the vendor. Parts purchases, parcel charges, and ordinary bills then roll up to a supplier instead of a free-text scribble that has three spellings by March.",
      },
      {
        heading: "Named on the unit",
        body: "Serial stock can record the vendor the piece came from. When a batch fails, you are filtering units, not guessing which distributor’s carton it was.",
      },
      {
        heading: "Short on purpose",
        body: "The module does not pretend to be a procurement suite. It is the master those suites usually forget to build first. Purchase orders can come later. A clean supplier name cannot.",
      },
    ],
  },
  {
    slug: "expenses",
    index: "14",
    title: "Expenses",
    group: "Operations",
    kicker: "Money going out",
    summary: "Bills you pay: tax, vendors, parts, parcels, recurrence, and what is still unpaid.",
    lead: "Expenses record what the business spends. Each entry has a date, an amount, a tax rate that can be inclusive, a category, and optional links to a vendor and an employee. Mark it paid or unpaid. Flag parts purchases, parcel charges, and costs that should be reimbursed. Recurring bills carry an interval and a next due date.",
    screens: ["All expenses", "This month", "Unpaid", "Parts", "Parcel"],
    points: [
      "Tax rate with inclusive or exclusive treatment",
      "Categories you maintain, including system ones",
      "Parts, parcel, and reimbursable flags",
      "Weekly, monthly, or yearly recurrence with a next due date",
      "Bill number, payment mode, and a receipt",
    ],
    sections: [
      {
        heading: "This month, and what is still open",
        body: "The list filters to the current month and to unpaid without exporting anything. The home dashboard can show spending for the month beside sales, so margin is a glance and not a month-end surprise.",
      },
      {
        heading: "Tax on the way out",
        body: "Input tax is a field, not a note. Inclusive and exclusive are explicit, and the stored total is the figure you reconcile. A category describes the spend; the tax fields describe the bill.",
      },
      {
        heading: "Parts and parcels",
        body: "Workshops and delivery counters have two expenses that wreck a generic ‘miscellaneous’ bucket: parts bought for a job, and parcel charges. Both are flags and filters. Reimbursable marks what an employee should get back.",
      },
      {
        heading: "Bills that return",
        body: "Rent, software, a retainer — mark it recurring, pick weekly, monthly, or yearly, and keep the next due date on the row. The expense does not recreate itself in secret. It tells you when to enter the next one.",
      },
    ],
  },
  {
    slug: "employees",
    index: "15",
    title: "Employees",
    group: "People",
    kicker: "Who works here",
    summary: "People, departments, and the record payroll and expenses already refer to.",
    lead: "Employees are the people master. A person has a name, a staff id, contact details, a gender and nationality if you keep them, an onboarding date, and a department. Payroll reads this list. An expense can name the employee it belongs to. Bookings can attach a staff member when the resource allows it.",
    screens: ["Employees", "Payroll", "Reports"],
    points: [
      "Staff id, contact, and onboarding date",
      "Departments as their own list",
      "Referenced by payroll, expenses, and bookings",
      "The people side of the same tenant as the catalog and the bills",
    ],
    sections: [
      {
        heading: "A person, then a payslip",
        body: "Payroll does not invent employees. It reads this master. Hire someone, put them in a department, and the remuneration screen has someone to attach a basic pay to.",
      },
      {
        heading: "Departments",
        body: "Departments are a short list you name yourself. They exist so a filter and a report have a stable word for ‘workshop’ or ‘front desk’, not whatever was typed on the day.",
      },
      {
        heading: "Present where work is assigned",
        body: "A booking line can name the employee doing the job. An expense can name the employee who incurred it. The staff record is the join, which is why it stays small and strict.",
      },
      {
        heading: "Onboarding as a date",
        body: "The onboarding date is on the record. Tenure, a confirmation, a first payroll month — they all start from a date you entered once, not from the day somebody remembered to add them to a sheet.",
      },
    ],
  },
  {
    slug: "payroll",
    index: "16",
    title: "Payroll",
    group: "People",
    kicker: "What they are paid",
    summary: "Salary structure, loans, deductions, and what is still outstanding.",
    lead: "Payroll is the money side of the employee record. Remuneration holds basic pay, HRA, bonus, overtime, provident fund, professional tax, ESI, loss of pay, and advance. Beside that, loans and deductions are their own entries, with dates and reasons, and the dashboard shows what has been lent, what has been recovered, and what remains.",
    screens: ["Payroll", "Employees", "Reports"],
    points: [
      "Basic, HRA, bonus, overtime",
      "PF, professional tax, ESI, LOP, and advance",
      "Loans with amount, date, and reason",
      "Deductions with source and notes",
      "A row per person: lent, recovered, remaining, active or cleared",
    ],
    sections: [
      {
        heading: "The salary is a structure",
        body: "Remuneration is stored as components, the way Indian payroll is actually discussed. Basic and HRA are not a single ‘salary’ number you reverse-engineer in March. PF, ESI, and professional tax sit next to them as deductions with their own fields.",
      },
      {
        heading: "Loans that stay visible",
        body: "A loan is an amount, a date, and a reason, against an employee. The dashboard totals loans and deductions and shows the remainder. Cleared means the balance is gone. Active means it is not. Nobody is keeping a side register for ‘he still owes the festival advance’.",
      },
      {
        heading: "Deductions with a source",
        body: "A deduction names where it came from and carries a note. Loss of pay and recoveries are entries you can open, not a cell someone overwrote. The detail view for an employee lists loans and deductions under the summary.",
      },
      {
        heading: "Employees remain the master",
        body: "Payroll links back to the people list on purpose. You do not maintain a second staff directory inside the salary screen. Reports sit alongside, with the rest of the business numbers.",
      },
    ],
  },
  {
    slug: "reports",
    index: "17",
    title: "Reports",
    group: "Operations",
    kicker: "What the books say",
    summary: "Sales reports read from the same POS bills the counter already issued.",
    lead: "Reports sit on the POS stream: what was sold, on which channel, across the invoices the counter produced. They are not a second data entry. The charts and cards read the bills. When a figure looks wrong, you open the invoice, not a spreadsheet that was typed beside it.",
    screens: ["POS reports", "POS invoices", "Billing"],
    points: [
      "Sales read from issued POS invoices",
      "Channel-aware, because walk-in and cloud kitchen are different rates",
      "A path back to the bill, not only a total",
      "Reached from the counter, from invoices, and from the people modules",
    ],
    sections: [
      {
        heading: "The bill is the source",
        body: "A report that does not tie to a document will be argued with. These reports start from POS invoices. The total on the card and the rows in the invoice list are the same events.",
      },
      {
        heading: "Channels stay visible",
        body: "Because items carry a walk-in price and a cloud-kitchen price, a blended daily total hides the question owners actually ask. The report keeps the channel in view so a busy delivery evening is not mistaken for a busy dining room.",
      },
      {
        heading: "Close enough to act",
        body: "Reports, the invoice list, and the live billing screen are three stops on one menu. You notice a number, you find the bill, you are back on the counter. There is no export step required to trust the figure.",
      },
      {
        heading: "The rest of the business has its own lists",
        body: "Expenses, renewals, warranty expiries, and memberships are reported as filtered lists where that is the honest shape of the data. The reports module is the sales picture. It does not pretend every module is a chart.",
      },
    ],
  },
];

export const plans = [
  {
    name: "Starter",
    price: "₹1,999",
    cadence: "per month",
    yearly: "₹19,990 a year",
    tagline: "POS and invoicing for a single outlet.",
    features: [
      "POS billing",
      "GST invoices",
      "Customer master",
      "One business location",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "₹3,999",
    cadence: "per month",
    yearly: "₹39,990 a year",
    tagline: "Inventory and estimates for a growing store.",
    featured: true,
    features: [
      "Everything in Starter",
      "Estimates and serial stock",
      "Expenses and vendors",
      "Inventory and brands",
      "Priority chat support",
    ],
  },
  {
    name: "Business",
    price: "₹6,999",
    cadence: "per month",
    yearly: "₹69,990 a year",
    tagline: "The full desk for a service and sales team.",
    features: [
      "Everything in Professional",
      "Bookings and enquiries",
      "Warranty and claims",
      "Employees and payroll",
      "Reports",
    ],
  },
  {
    name: "Enterprise",
    price: "Write to us",
    cadence: "",
    yearly: "Scoped to the rollout",
    tagline: "A custom rollout, with someone named on the account.",
    features: [
      "Everything in Business",
      "Custom modules and limits",
      "Dedicated onboarding",
      "Named account manager",
      "Support with an SLA",
    ],
  },
];

export function moduleBySlug(slug: string) {
  return modules.find((item) => item.slug === slug);
}

export const groups = ["Home", "Sales", "Catalog", "Operations", "People"] as const;
