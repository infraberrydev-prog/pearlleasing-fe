# Figma → Angular build plan

Source: Figma file `Client-1 (Copy)` (`hqzl1IWxMg2znwUkLpTu0o`), page **"Pearl Place Leasing Corp.(JJSSI) ✅"** (`6:18`).
Inventory taken from `get_metadata` on 2026-10-17. Node IDs are given in `[brackets]`, so each one can be passed straight to `get_design_context` when building.

Device sizes on the page:

| Device  | Frame size            | Notes                                          |
| ------- | --------------------- | ---------------------------------------------- |
| Desktop | 1440 wide             | Sidebar plus top app bar, data **tables**      |
| Tablet  | 834 wide (iPad Pro 11") | Report lists show as **cards**, not tables   |
| Mobile  | 390 wide (iPhone 13)  | Bottom navigation, cards, filters in a bottom sheet |

---

## 1. Inventory by feature and device

The Figma names many frames generically ("Table", "Home", "iPad Pro 11\" - N"). The **State** column describes each frame from its contents.

### 1.1 Auth (Login + 2FA)

| Device  | Section                                   | Frame `[id]`                             | State                                                    |
| ------- | ----------------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| Desktop | Login and 2FA - Default States `[276:9528]` | Login Form `[276:8858]`                  | Login, empty                                             |
| Desktop | 〃                                         | 2FA `[276:9347]`                         | 6-digit code entry, "Resend Code" enabled                |
| Desktop | Login and 2FA - Ideal States `[276:8856]`  | Login Form `[13:157]`                    | Login, filled                                            |
| Desktop | 〃                                         | 2FA `[14:519]`                           | Code filled, "Resend in 59s" countdown                   |
| Desktop | Login and 2FA - Error States `[276:8857]`  | Login Form - Error `[274:7357]`          | "Incorrect username or password."                        |
| Desktop | 〃                                         | 2FA - Error `[276:8678]`                 | "The 6-digit code is incorrect or expired…" + Resend Code |
| Desktop | 〃                                         | 2FA - Error w/ Resend seconds `[276:8758]` | Error with countdown running                           |
| Tablet  | Tablet - Login and 2FA `[374:6651]`        | iPad Pro 11" - 2 `[353:5797]`            | Login                                                    |
| Tablet  | 〃                                         | iPad Pro 11" - 3 `[353:9080]`            | 2FA                                                      |
| Mobile  | Mobile - Login and 2FA `[376:11161]`       | Home `[361:9951]`                        | Login                                                    |
| Mobile  | 〃                                         | Home `[361:10625]`                       | 2FA                                                      |
| (email) | OTP Email `[419:11149]`                    | Verification Code (Email) `[419:10748]`  | OTP email shown inside a Gmail mockup. **Not an app screen.** It's the email template, a backend concern. |

### 1.2 App shell (layout, navigation, logout)

| Device  | Section                                | Frame `[id]`                         | State                                         |
| ------- | -------------------------------------- | ------------------------------------ | --------------------------------------------- |
| Desktop | Leasing Reports - UI Stack `[300:2916]` | Collapsed - Sidebar `[367:15213]`    | Sidebar collapsed                             |
| Desktop | 〃                                      | Uncollapsed - Sidebar `[367:15039]`  | Sidebar expanded                              |
| Desktop | Log Out `[385:24794]`                   | Log Out `[385:24639]`                | "Are you sure you want to log out?" modal     |
| Tablet  | Log out `[385:25134]`                   | iPad Pro 11" - 17 `[385:24795]`      | Log-out confirm modal                         |
| Mobile  | Log out `[385:24423]`                   | Home `[385:23942]`                   | "More" tab → Log out                          |
| Mobile  | 〃                                      | Home `[385:24309]`                   | Log-out confirm modal                         |

Shell components seen as instances: `_Sidebar button`, `Top app bar`, `layout-left` (collapse toggle), `Bottom navigation`, `Tab Bar`, `User Card Dropdown`, `StatusBar / iPhone 13` (device chrome, don't build it).

### 1.3 Leasing Reports

**Desktop**

| Section                                                | Frame `[id]`                                   | State                                                         |
| ------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------- |
| Leasing Reports - UI Stack `[300:2916]`                 | Empty State `[281:10562]`                      | List, no reports                                              |
| 〃                                                     | No Search Found `[284:11262]`                  | List, search with no matches                                  |
| 〃                                                     | Table `[315:6645]`                             | Create report, 1 empty row                                    |
| 〃                                                     | Table `[315:6937]`                             | Create, row 1 expanded (Lessee Info / Rental Payment / Utilities / Deductions) |
| 〃                                                     | Table `[322:4105]`                             | Create, 2 rows                                                |
| 〃                                                     | Discard Modal `[316:7921]`                     | "Are you sure you want to discard report?"                    |
| Create and View Reports `[315:6071]`                    | Table `[65:3364]`, `[361:12600]`               | Report list table (Report ID, Name, Expected Revenue, Created, Updated, Actions) |
| 〃                                                     | Table `[92:2170]`                              | Create, "Details" header, 1 row                               |
| 〃                                                     | Table `[308:3133]`                             | Create, 4 rows filled                                         |
| 〃                                                     | Action - View Table `[99:2494]`                | View-report modal: full row grid + attached-file preview (file name, page "/ 1", zoom "100%") |
| Report Update Flow → Unpaid to Paid `[315:6423]`        | Table `[312:5455]`, `[315:6072]`               | List (start of flow)                                          |
| 〃                                                     | View Report `[238:2740]`                       | Report detail, 10 rows/page, totals 55 / 120                  |
| 〃                                                     | Table `[346:9670]`                             | Detail with status filter open (Unpaid / Paid)                |
| 〃                                                     | Unpaid Status `[264:1255]`                     | Row expanded, status Unpaid                                   |
| 〃                                                     | Unpaid to Paid Status `[311:4004]`             | Row edited to Paid                                            |
| 〃                                                     | Discard Modal `[318:3801]`                     | "Are you sure you want to cancel edit?"                       |
| 〃 › Sort by Status `[346:9925]`                         | Actions - Default/Hovered/Pressed `[346:9947]` `[385:22245]` `[346:10082]` `[567:27993]` | Status filter button states |
| Filters - UI Stack `[346:7385]`                          | Table `[346:7386]`                             | List, filters closed                                          |
| 〃                                                     | Table `[346:5508]`                             | Filter panel (Date Created, Expected Revenue min–max)         |
| 〃                                                     | Table `[346:5956]`                             | Sort menu (Expected Revenue / Date Created / Last Updated, asc/desc) |
| Sort & Filter - Leasing Reports `[568:10950]` › Sort `[568:11074]` | Default/Hover/Pressed `[566:27059]` `[567:28284]` `[567:28358]` | Sort dropdown component states |
| 〃 › Filter `[568:11076]`                                | Revenue Range `[568:10951]`                    | Filter dropdown (Expected Revenue)                            |
| 〃                                                     | Revenue Range `[568:10970]`                    | Same panel labelled "Expenses Revenue". Looks like a stray Expenses variant |
| Action `[641:37035]`                                     | Default `[641:37260]`                          | Row action menu: View / Delete                                |
| Delete Report `[664:20037]`                              | Table `[664:19179]`, `[664:19583]`             | Action menu → "Are you sure you want to delete report?"       |
| Download Report `[920:14400]`                            | Table `[920:14401]`, `[920:14697]`             | Action menu → "Download report" modal                         |

**Tablet:** Tablet View - Leasing Reports `[357:13170]`, Download Report `[920:21761]`

| Frame `[id]`                           | State                                                  |
| -------------------------------------- | ------------------------------------------------------ |
| iPad Pro 11" - 4 `[374:6652]`          | Empty state                                            |
| iPad Pro 11" - 5 `[374:6736]`          | No search found                                        |
| iPad Pro 11" - 9 `[374:5831]`          | Report **card** list (RP25234, Expected Revenue, Created, Updated) |
| iPad Pro 11" - 6 `[357:11595]`         | Create, row expanded                                   |
| iPad Pro 11" - 7 `[357:12709]`         | View/detail, 10 rows                                   |
| iPad Pro 11" - 8 `[361:5252]`          | Cancel-edit modal                                      |
| iPad Pro 11" - 15 `[374:8873]`         | Discard-report modal                                   |
| iPad Pro 11" - 20 / 21 `[920:21284]` `[920:21502]` | Card list → Download report modal          |

**Mobile:** Mobile - Leasing Reports `[385:20755]`, Mobile - Filters - Leasing Report `[385:20754]`, Delete Report `[664:20497]`

| Frame `[id]`                       | State                                             |
| ---------------------------------- | ------------------------------------------------- |
| Home `[361:11515]`                 | Empty state                                       |
| Home `[361:13613]`                 | No search found                                   |
| Home `[361:13826]`                 | Report card list                                  |
| Home `[380:7552]`                  | Create, row expanded                              |
| Home `[381:8237]`                  | Create, 10 rows + discard modal                   |
| Home `[376:11755]`                 | View/detail, 10 rows                              |
| Home `[380:6960]`                  | Detail, row 1 expanded                            |
| Home `[384:7412]`                  | Detail + discard modal                            |
| Exp `[385:11175]`                  | Filter bottom sheet (Date Created, Expected Revenue min–max, Last Updated) |
| Date Range `[385:11371]`           | Date-range calendar sheet                         |
| Status `[385:21351]`               | Sort sheet on detail view                         |
| Home `[664:20038]` / `[664:20232]` | Card action menu → delete confirm                 |

### 1.4 Expenses Reports

**Desktop**

| Section                                  | Frame `[id]`                                    | State                                              |
| ---------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| Expenses - UI Stack `[315:7920]`          | Empty State `[315:7325]`                        | List, no reports                                   |
| 〃                                       | No Search Found `[315:7685]`                    | Search with no matches                             |
| Expenses Report `[322:5038]`              | Table `[94:4161]`, `[94:6215]`                  | Report list table (Report ID, Name, Total Expenses, Created, Updated, Actions) |
| 〃                                       | Table `[561:20578]`, `[561:20794]`, `[561:21257]` | Create/edit, "Expenses" grid, 2 rows, total ₱8,500 |
| 〃                                       | View Report `[385:23308]`                       | Detail, 3 rows                                     |
| 〃                                       | Table `[385:23782]`                             | Details / Compensation / Utilities groups + discard modal |
| 〃                                       | Action - View Table `[561:23611]`               | View modal (Electricity, Payroll, Water, Maintenance, Total) + file preview. The header still reads "Leasing Reports", a copy error |
| Sort & Filter - Leasing Reports `[569:11077]` | Sort Default/Hover/Pressed `[569:11079]` `[569:11146]` `[569:11213]` | **Misnamed:** these are the Expenses sort states (Total Expenses asc/desc…) |
| 〃                                       | Filter Revenue Range `[569:11281]` `[569:11300]` | Expenses filter (Date Created, min–max)            |

There's no desktop Delete or Download frame for Expenses. The Leasing ones are presumably meant to cover both.

**Tablet:** Tablet View - Expenses Reports `[374:7064]`

| Frame `[id]`                     | State                                       |
| -------------------------------- | ------------------------------------------- |
| iPad Pro 11" - 10 `[374:7065]`   | Empty state                                 |
| iPad Pro 11" - 11 `[374:7149]`   | No search found                             |
| iPad Pro 11" - 12 `[374:7245]`   | Report card list (EP25234, Total Expenses)  |
| iPad Pro 11" - 18 `[561:25802]`  | Create/edit, 3 rows                         |
| iPad Pro 11" - 19 `[561:26032]`  | Create/edit, 2 rows                         |
| iPad Pro 11" - 14 `[374:8737]`   | Discard modal                               |
| Scroll bar `[561:24762]`         | Component instance, not a screen            |

**Mobile:** Mobile - Expenses Report `[385:23307]`, Mobile - Filters - Expenses Report `[570:13396]`

| Frame `[id]`                         | State                                   |
| ------------------------------------ | --------------------------------------- |
| Home `[376:11162]`                   | Empty state                             |
| Home `[376:11226]`                   | No search found                         |
| Home `[373:5589]`                    | Report card list                        |
| Home `[571:15931]` / `[571:16186]`   | Create/edit                             |
| Home `[384:7660]`                    | Discard modal                           |
| Exp `[570:13397]`                    | Filter bottom sheet (Expenses min–max)  |
| Date Range `[570:13482]`             | Date-range calendar sheet               |
| Status `[570:13622]`                 | Sort sheet                              |

### 1.5 Notes and annotations

| Item                       | Content                                                              |
| -------------------------- | -------------------------------------------------------------------- |
| Sticky Note `[611:17405]`  | "Every 1st week of the month the encoding of pearl place" (a business rule: reports are encoded monthly) |

### 1.6 Coverage matrix

| Feature / flow               | Desktop | Tablet | Mobile |
| ---------------------------- | :-----: | :----: | :----: |
| Login                        | ✅ (default/ideal/error) | ✅ (default only) | ✅ (default only) |
| 2FA                          | ✅ (default/ideal/error/countdown) | ✅ (default only) | ✅ (default only) |
| Forgot password              | ❌ link only | ❌ | ❌ |
| Shell + sidebar / bottom nav | ✅      | ✅     | ✅     |
| Log out                      | ✅      | ✅     | ✅     |
| Leasing list (empty / no results / data) | ✅ | ✅ | ✅ |
| Leasing sort & filter        | ✅      | ❌     | ✅ (sheets) |
| Leasing create               | ✅      | ✅     | ✅     |
| Leasing view / detail        | ✅      | ✅     | ✅     |
| Leasing Unpaid → Paid        | ✅      | ⚠️ cancel-edit modal only | ⚠️ partial |
| Leasing delete               | ✅      | ❌     | ✅     |
| Leasing download             | ✅      | ✅     | ❌     |
| Expenses list (empty / no results / data) | ✅ | ✅ | ✅ |
| Expenses sort & filter       | ✅      | ❌     | ✅ (sheets) |
| Expenses create / view       | ✅      | ✅     | ✅     |
| Expenses delete / download   | ❌ (assume same as Leasing) | ❌ | ❌ |

---

## 2. Shared UI inventory (component instances on the page)

These became the `shared/ui` layer: Button, Button group, Input field, Checkbox, Radio button, Chips, Divider, Alert (named "Alert vuetify", so the kit appears to be Vuetify-based), Table cell, Pagination, Filter Button, Scroll bar, `_Month` / `_Calendar cell` (date-range picker), Top app bar, Sidebar button, Bottom navigation, Tab Bar, User Card Dropdown.
Icons: email, lock-02, eye-open / eye-closed, shield-check, layout-left, sort-updown-arrow, chevron-up / down / right / left, information-circle-contained, x-03, pencil-02, download-01, trash-03, dot-vertical-01, logout-02, search, close, arrow-up-sm, annotation-information, lightbulb-01, and a few others. The `-01`/`-02` suffixes match the Untitled UI icon set.
Brand: `app_icon` and `mediflexlogo-2025`. ⚠️ The second name looks like a leftover from another project, so confirm the logo asset with the designer.

---

## 3. Proposed Angular folder structure

This uses standalone components and the existing NgRx setup. Each **page is responsive**: one component per screen, with breakpoints switching table↔cards and dropdown↔bottom-sheet. Separate desktop, tablet and mobile components would triple the code for screens that share the same data and behaviour.

```
src/
├─ styles/
│  ├─ _tokens.scss          # colors, type, spacing, radii, shadows (from get_variable_defs)
│  ├─ _breakpoints.scss     # mobile <768, tablet 768–1199, desktop ≥1200
│  ├─ _mixins.scss
│  └─ _typography.scss
├─ assets/
│  ├─ icons/                # downloaded SVGs from Figma
│  └─ images/               # logo, auth illustration
└─ app/
   ├─ app.config.ts / app.routes.ts / app.ts
   ├─ core/
   │  ├─ auth/
   │  │  ├─ auth.service.ts
   │  │  ├─ auth.guard.ts            # blocks app routes until 2FA is done
   │  │  ├─ auth.interceptor.ts
   │  │  └─ store/                   # auth.actions / reducer / effects / selectors
   │  ├─ api/                        # base http config, error mapping
   │  └─ models/                     # User, ApiError, Paginated<T>
   ├─ layout/
   │  ├─ shell/                      # sidebar + top bar (desktop/tablet), bottom nav (mobile)
   │  ├─ sidebar/                    # collapsed / expanded
   │  ├─ top-app-bar/
   │  ├─ bottom-nav/
   │  ├─ user-menu/                  # User Card Dropdown
   │  └─ logout-dialog/
   ├─ shared/
   │  ├─ ui/
   │  │  ├─ button/  icon/  input-field/  password-field/  otp-input/
   │  │  ├─ checkbox/  radio/  chip/  divider/  alert/
   │  │  ├─ dialog/              # base modal + confirm-dialog (discard / cancel / delete / logout)
   │  │  ├─ bottom-sheet/        # mobile filter/sort container
   │  │  ├─ dropdown-menu/       # sort menu, row action menu
   │  │  ├─ date-range-picker/
   │  │  ├─ data-table/          # table + table-cell + sticky header
   │  │  ├─ pagination/
   │  │  ├─ search-field/
   │  │  ├─ empty-state/         # covers both "empty" and "no search found"
   │  │  └─ file-preview/        # attached-file viewer in the view-report modal
   │  ├─ pipes/                  # peso-currency, report-date
   │  └─ utils/
   └─ features/
      ├─ auth/
      │  ├─ login/
      │  ├─ two-factor/          # OTP + resend countdown
      │  ├─ auth-layout/         # split illustration/form layout
      │  └─ auth.routes.ts
      ├─ reports/                # code shared by Leasing and Expenses
      │  ├─ report-list/         # toolbar (search/sort/filter) + table|cards + pagination + states
      │  ├─ report-card/         # tablet/mobile list item
      │  ├─ report-sort/         # menu on desktop, sheet on mobile, driven by config
      │  ├─ report-filter/       # date created, amount min–max, last updated
      │  ├─ report-actions/      # View / Delete / Download menu
      │  ├─ report-view-dialog/  # read-only grid + file preview
      │  ├─ download-dialog/
      │  └─ models/              # ReportSummary, SortOption, FilterState
      ├─ leasing/
      │  ├─ pages/
      │  │  ├─ leasing-list/
      │  │  ├─ leasing-editor/   # create + edit (same form)
      │  │  └─ leasing-detail/   # view + Unpaid→Paid edit, status filter
      │  ├─ components/
      │  │  └─ lease-row-form/   # accordion row: Lessee Info, Rental Payment, Utilities, Deductions
      │  ├─ data/leasing.service.ts
      │  ├─ store/               # entity adapter: reports, rows, query state
      │  ├─ models/              # LeasingReport, LeaseRow, PaymentStatus
      │  └─ leasing.routes.ts
      └─ expenses/
         ├─ pages/  expenses-list/  expenses-editor/  expenses-detail/
         ├─ components/expense-row-form/   # Details / Compensation / Utilities
         ├─ data/  store/  models/
         └─ expenses.routes.ts
```

Routes (lazy loaded):

```
/login                    → features/auth (login)
/login/verify             → features/auth (two-factor)
/                         → layout/shell [authGuard]
  /leasing                → leasing-list
  /leasing/new            → leasing-editor
  /leasing/:id            → leasing-detail
  /leasing/:id/edit       → leasing-editor
  /expenses               → expenses-list
  /expenses/new | /:id | /:id/edit
  ''                      → redirect /leasing
```

Leasing row fields (from the view modal): Building Type, Vendor Name / Category, Stall, Lessee Name, Mobile No., TIN No., Monthly Rental, Payment Status (Unpaid/Paid), Payment Method, Reference No., Electricity, Water, Other Utilities, CUSA Fee, 10% Penalty → Total Amount.
Expense fields: Electricity, Payroll, Water, Maintenance Expenses → Total Expenses (grouped as Details / Compensation / Utilities).
Report IDs: `RP#####` (leasing), `EP#####` (expenses). Currency: ₱ (PHP).

---

## 4. Build order

Each step ships desktop, tablet and mobile together, so responsiveness isn't left to a final pass.

1. **Foundations.** Pull variables and styles with `get_variable_defs` and write them to `styles/_tokens.scss`. Add fonts, breakpoints, and download the icon and logo assets. Choose overlay primitives (recommendation: `@angular/cdk` for dialog, overlay and a11y, with no full component library).
2. **Core UI primitives.** Button, icon, input-field, password-field, checkbox, radio, chip, divider, alert, dialog + confirm-dialog. These are needed by auth.
3. **Auth.** Login (default/filled/error), 2FA (OTP input, 59s resend countdown, error), auth store slice, guard, interceptor. Use a mock API until the backend contract is known.
4. **App shell.** Sidebar (collapsed/expanded), top app bar, mobile bottom nav, user menu, log-out confirm. Wire the routes.
5. **List building blocks.** Data-table, pagination, search-field, empty-state, dropdown-menu, bottom-sheet, date-range-picker.
6. **Leasing list.** Empty, no-results and data states. Table on desktop, cards on tablet and mobile. Search, sort, filter, row actions, delete confirm, download dialog. Build it as the generic `features/reports/report-list`.
7. **Leasing create/edit.** `lease-row-form` accordion, add/remove rows, totals, discard dialog.
8. **Leasing detail and Unpaid → Paid flow.** View modal with file preview, paginated rows, status filter, inline status edit, cancel-edit dialog.
9. **Expenses.** Reuse the report-list, sort, filter and actions from steps 6–8 with Expenses config, then add `expense-row-form`. This step should mostly be configuration.
10. **Polish.** a11y pass (focus traps, keyboard nav for menus/OTP), loading and error states the design leaves out, visual QA against each frame's screenshot.

---

## Progress

**Steps 1–2 done (2026-10-17).** Changes from the plan:
- Static files live in `public/` (`public/icons`, `public/images`), the Angular 22 default, not `src/assets`.
- `password-field` was folded into `shared/ui/input-field` (`type="password"` adds the show/hide toggle).
- Radio is `app-radio-group` + `app-radio`.
- `@angular/cdk` 22.2.3 was added for dialogs. Use `ConfirmDialogService.confirm(...)`.
- `/dev/ui` is a temporary gallery of the primitives. Delete it once real screens exist.
- The `mediflexlogo-2025` instance is only inside the Gmail mockup in the OTP Email frame, not the app, so open question 6 is resolved.

**Not yet confirmed against Figma** (the Figma MCP Starter-plan call limit was hit):
- Inferred states: checked checkbox, selected radio, "Paid" chip, button hover/pressed/disabled, small button size, tablet/mobile dialog layout, modal backdrop color.
- Missing asset: `public/icons/eye-open.svg` (password "visible" state).
- Lato from Google Fonts has no 500/600 weights, so Medium renders as 400 and SemiBold as 700. Self-host Lato 2.0 if exact weights matter.

**Step 3 done (2026-10-17).** Login and 2FA on desktop, tablet and mobile.
- `core/auth/` holds the models, the `AuthApi` contract, `MockAuthApi`, session storage, the NgRx `auth` feature (actions/reducer/effects), guards (`authGuard`, `guestGuard`, `otpChallengeGuard`) and the bearer-token interceptor (a 401 signs the user out). `provideAuth()` wires it up.
- Mock credentials: any username, password `password`, code `123456`. The session is kept in `sessionStorage`, so it survives a reload.
- `shared/ui/otp-input` is the 6-box code input (auto-advance, Backspace, paste, one-time-code autofill).
- `features/auth/`: `login/`, `two-factor/`, `auth-layout/` (desktop intro panel or centred over the pattern), and `auth-illustration/`.
- The illustration is rebuilt from its 99 exported layers in `public/images/auth-illustration/` and matches the Figma render. A single SVG export from Figma can still replace it.
- `/` is guarded and shows the UI gallery (with a temporary Log out button) until the step 4 shell exists.

**Step 3 gaps:**
- "Forgot password?" is hidden: the error frame renders it at opacity 0 and there's no flow (open question 1).
- Copy without a Figma source: required-field errors ("Username is required."), the generic "Something went wrong" error, and the illustration's alt text.
- Tablet/mobile auth layout was built from frame geometry only, because design context couldn't be fetched. The tablet/mobile error states aren't drawn and reuse the desktop styling.
- `eye-open.svg` is still missing, so the "show password" state renders a broken icon.

**Step 4 done (2026-10-17).** App shell, built from frame geometry. Figma access was still blocked, so no colors or icons were fetched.
- Decision (with the user): follow Figma. The "Top app bar" and "User Card Dropdown" layers are hidden on every shell frame, so there is no top bar or user menu. Each page shows its title at the top of the content.
- The Figma frame names are swapped. "Uncollapsed - Sidebar" (367:15039) shows the 72px icon rail; "Collapsed - Sidebar" (367:15213) shows the 312px panel over the page with a backdrop. Built as drawn: the rail is the default, and the toggle (`layout-left`) opens the panel as an overlay. The panel closes on the toggle, the backdrop, Escape or navigating, and traps focus while open.
- Desktop and tablet use the rail; mobile uses a bottom nav (Leasing Reports, Expenses Reports, More). The mobile "More" page holds the Log out row (385:23942).
- Log out (the sidebar's bottom button, or More → Log out) opens the confirm dialog and then signs out to `/login`.
- `layout/`: `shell/`, `sidebar/`, `bottom-nav/`, `page-header/`, `more/`, `page-placeholder/`, `nav-items.ts`, `logout.service.ts`. The global `.app-page` class sets the title-to-content gap (32/24/16).
- Routes: `/login` and `/dev/ui` are outside the shell. `/` (guarded) holds the shell with `leasing`, `expenses` and `more`, and `/` redirects to `/leasing`. Leasing and Expenses are placeholder pages.
- `app-icon` now hides a missing SVG and shows its projected fallback. The rail shows `LR` / `ER` / `LO` / `☰` until the icons exist.

**Step 4 gaps:**
- Icons to export into `public/icons`: `layout-left.svg`, `logout-02.svg`, plus the nav icons saved as `nav-leasing-reports.svg`, `nav-expenses-reports.svg` and `nav-more.svg` (their Figma names are unknown, because they sit inside the `_Sidebar button` / `Bottom navigation` instances).
- Unconfirmed against Figma: sidebar and bottom-nav colors, active/hover states and the label type style; the page background (white is used); the bottom nav tab set and labels.
- The logout dialog body text is a placeholder ("Text") in Figma; I used "You will need to log in again to access your reports." Button styles (Cancel secondary, Log out primary) are inferred.

**Steps 3–4 re-checked against Figma (2026-10-17)**, once access returned. Fixed: input placeholders and their color, the countdown style, mobile auth layout and code boxes, the shield tile on mobile, sidebar/bottom-nav/More styling, the backdrops, the logout dialog's copy and danger style, and the stacked dialog on tablet/mobile. Icons were replaced with the exact Figma exports; navigation icons are tinted by state.
- Still open: the Figma Expenses nav icon differs between the rail and bottom nav (`bank-note-01`) and the expanded panel (`file-lock-02`); `bank-note-01` is used everywhere. The 2FA action spacing is 24px in two frames and 16px in one; 24px is used. Filled mobile code digits aren't drawn, so 28px is used. Tablet sort/filter is still undesigned.

**Step 5 done (2026-10-17).** Shared report-list building blocks in `shared/ui`, built from Figma 435:11353 (list card), 281:10591 (empty state), 568:10951 / 385:11240 (filter panel and sheet), 641:37260 (action menu) and 385:20536 (date picker sheet).
- `data-table`: columns plus `ng-template appCell` cells, optional row selection with select-all (indeterminate), 52/68px rows, Nunito text, horizontal scroll on narrow screens.
- `pagination`: Previous / 1 2 3 … 8 9 10 / Next; on mobile it shows "Page x of y".
- `filter-button` and `filter-button-group`: the joined Sort | Filter toolbar buttons. Search reuses `input-field` with the `search-01` icon.
- `empty-state`: illustration, title, optional text and projected actions ("No available reports yet.").
- `menu` / `menu-item`: the View/Delete action menu on CDK Menu (keyboard support built in).
- `option-list`: single-choice rows with the radio on the right, used for sort.
- `dropdown-panel` (anchored, desktop/tablet) and `BottomSheet` (mobile, docked 8px from the edges), plus `panel-section` and `panel-actions` (Clear | Apply side by side, stacked with Apply on top on mobile).
- `date-range-calendar`: month navigation, start–end fields, Monday-first grid, range band, today dot, arrow-key navigation; a form control holding `{ start, end }`.
- `size="sm"` buttons now use 8px corners (confirmed by pagination and panel footers).
- New icons and the empty-state illustration are in `public/icons` and `public/images/empty-reports.svg`. The `/dev/ui` gallery shows everything assembled like the Figma list.

**Step 5 gaps:**
- The sort menu's own design context wasn't fetched (call limit). It reuses the action-menu container and item styles, with hover in `colors/bg/hovered`; the selected radio is still the inferred style.
- The "No Search Found" state (284:11262) wasn't fetched: its illustration and copy are unknown. `empty-state` takes any illustration and title.
- Figma's weekday header says "Sat"; "Sa" is used to match the other two-letter labels.
- Disabled Previous/Next and the mobile pagination layout aren't drawn in Figma.
- Tablet/mobile report cards, the filter form fields and wiring the toolbar to data belong to step 6.

**Step 6 done (2026-10-17).** The Leasing Reports list is live at `/leasing`, on mock data (22 monthly reports).
- `features/reports/` (shared with Expenses in step 9):
  - `models/report.ts`: `ReportSummary`, `ReportQuery`, and `queryReports()` for search, filter, sort and paging.
  - `report-list/` (presentational): the empty, no-results and data states. The table is shown at 1200px and wider; tablet and mobile get cards. Sort and Filter open as dropdowns on desktop/tablet and as bottom sheets on mobile. Delete and Download ask for confirmation.
  - `report-card/`: the tablet card (eye + trash icons, dates side by side) and the mobile card (⋮ menu, dates stacked).
  - `report-sort/` and `report-filter/`: the panel contents. Date Created opens the range calendar inline; a reversed min–max is swapped.
- `features/leasing/`: `LeasingApi` + `MockLeasingApi` (list, delete, CSV export), an NgRx `leasing` feature (entity adapter, query, totals, loading) and effects (load on any query change, reload after delete, step back from an emptied page, save the CSV). These are provided on the leasing route.
- The list page drives everything through the store. Report ID / eye → `/leasing/:id` and Create Report → `/leasing/new`; both are placeholder pages until steps 7–8.
- `shared/pipes/format.pipes.ts` formats pesos ("₱ 100,500.00") and dates ("Jan 8, 2025 - 08:30:22"). The confirm dialog gained a `primary` tone with a custom icon (download).
- Row actions follow the newest Figma table (927:39623: eye + trash). The older delete/download frames (664:…, 920:…) used a menu.

**Step 6 gaps** (Figma call limit hit again; built from layer geometry):
- Card text styles (sizes and weights) and colors are inferred from the table styles.
- Missing asset: the `dot-vertical-01.svg` ⋮ icon (shown as a text ⋮ for now). The no-results illustration is in place (`public/images/no-results.svg`, from Figma 284:11262).
- The no-results and download dialogs have placeholder "Text" copy in Figma; mine is "No reports match your search." / "Download N selected reports as a CSV file." The download dialog's button labels (Cancel / Download) and its icon tint are also mine.
- The "Last Updated" filter options aren't in Figma; I used All / Updated / Not yet updated.
- Not in Figma: Create Report on tablet (its button group is hidden there), pagination on tablet, the dot marking an applied sort/filter, and the loading text.

**Step 7 done (2026-10-17).** Leasing create/edit form at `/leasing/new` and `/leasing/:id/edit`. Figma was rate-limited, so the form follows the user-provided screenshot of 315:6937 (`docs/screens/create-filled.png`).
- `features/leasing/models/leasing-report.ts`: `LeaseRow`, `LeasingReportDraft/Detail`, `rowTotal` = monthly rental + utilities (Electricity, Water, Other Utilities, CUSA Fee, Pylon Rental) − deductions (10% Penalty), and `reportTotal`.
- `components/lease-row-form/`:
  - The accordion row: the header "Row N - Building / Vendor / Lessee / Total Amount", plus edit, duplicate and delete buttons.
  - Four sections laid out like Figma (3 across / 2 across on desktop, 2 columns on tablet, 1 on mobile).
  - Required `*` and italic "(optional)" labels; Building Type, Vendor and Stall are search fields with suggestions.
  - Payment Status and Payment Method are dropdowns.
  - A live row total.
  - `lease-row.form.ts` has the typed form, validation (required, amounts like "1,500.00", mobile number) and form↔row conversion.
- `pages/leasing-editor/`:
  - A card with a back arrow and a centred title, Report Name, the rows and "+ Add Row".
  - A sticky footer with Discard and Submit Report; Submit is disabled until the form is valid.
  - Delete-row confirmation.
  - Discard asks with the Figma dialog (317:3155); a route guard asks the same when leaving with unsaved edits (the X/Escape keeps you on the page).
  - Edit mode loads the report and shows "Edit Report" / "Save Changes".
- Store: editor state, lookups and save effects. After a save the app returns to the list, which shows the Figma success toast (69:1655) "Report successfully submitted!" and closes it after 5s.
- Mock API now keeps full reports with rows. The list's Expected Revenue is the sum of row totals.
- Shared additions: `select-field`; `input-field` gained `required` (red *), `optional`, `list` (datalist) and `inputmode`; `ConfirmDialogService.ask()` tells cancel from dismiss; `unsavedChangesGuard`.

**Step 7 gaps:**
- To confirm with the client: the 10% Penalty sits under "Deductions" in Figma, so it is **subtracted**.
- Choices not in Figma: Payment Method options (Cash, Bank Transfer, GCash, Check) and the building/vendor/stall suggestions (sample data until an API exists).
- Edit/duplicate icons are in place (`pencil-02.svg`, `copy-01.svg`, exported by hand from 315:6984 / 315:6985). The pencil was exported cropped to 15×15, so it is drawn at 15px next to the 20px copy and trash icons.
- Not in Figma: the delete-row confirmation, validation messages, the "Edit Report" / "Save Changes" / "Report successfully updated!" wording, and the tablet/mobile layouts (built from the desktop design).
- Figma's footer spans the page outside the card; here it sits at the bottom of the card, sticky.

**Step 8 done (2026-10-17).** Leasing report detail and the Unpaid → Paid flow at `/leasing/:id`. Built from user-provided screenshots (`docs/screens/detail.png`, `unpaid-to-paid.png`, `status-filter.png`, `detail-mobile.png.png`) of 238:2740, 311:4004 and 346:9670 because Figma was rate-limited.
- The detail page is the step 7 form in "detail" mode (`LeasingEditor`, `isDetail`):
  - title "RP25201 - Report for Month of …"
  - rows with Unpaid / Paid chips and no edit/duplicate/delete buttons
  - "Search vendor or lessee name", and **Sort** (Unpaid / Paid first, Clear | Apply) as a dropdown on desktop/tablet and a sheet on mobile
  - ten rows per page with "Total rows: N"
  - "+ Add Row"
  - Cancel + **Update Report**, disabled until something changes
  - mobile: left-aligned title; footer stacked with Update Report on top
- Unpaid → Paid: expand a row, set Payment Status to Paid (its chip turns green right away), then Update Report → back to the list with "Report successfully updated!".
- While editing, rows keep their place. Search and sort re-apply only when they change or rows are added or removed, so a row doesn't jump away when switched to Paid.
- Cancel / back / leaving with edits asks "Are you sure you want to cancel edit?" (Figma 318:3801). The guard picks the create or edit wording.
- `/leasing/:id/edit` now redirects to `/leasing/:id`; the placeholder page is gone. Some mock reports have 23 rows so paging can be tried.

**Step 8 gaps:**
- Figma calls the status control "Sort" (section "Sort by Status"). It's built as a sort (the chosen status first). If the client meant a filter (show only that status), it's a small change.
- The cancel-edit dialog body is placeholder "Text" in Figma; the wording is mine.
- Not in Figma: "Report successfully updated!", the "No rows match your search." message, and the dot marking an active sort.
- Figma's "Total rows" figure (55) doesn't match its 10-page pagination; here it is the number of rows matching the search.
- The old view-report modal with a file preview (99:2494, "Name of file / 1 / 100%") looks superseded by the detail page and isn't built. Confirm whether file attachments are needed.

**Step 9 done (2026-10-17).** Expenses Reports at `/expenses`, `/expenses/new` and `/expenses/:id`. The form follows the user-provided screenshot of 561:20578 (`docs/screens/expenses.png`).
- List: the shared `features/reports` list with an Expenses config ("Total Expenses", EP IDs, `Expenses reports` caption). Search, sort, filter (with "Total Expenses (min-max)"), cards on tablet/mobile, delete, download, empty and no-results states all come from the shared components.
- Form (`pages/expenses-editor/`): Report Name, an **Expenses** section with four required amounts (Electricity, Payroll, Water, Maintenance Expenses) in a 2×2 grid (1 column on mobile), and Total Amount.
  - Create: Discard / Submit Report.
  - Detail `/expenses/:id` (385:23308): title "EP… - name", Cancel / Update Report (enabled once something changes).
  - The same discard / cancel-edit dialogs and leave-page guard as Leasing.
- Data and state: `ExpensesApi` + `MockExpensesApi` (14 monthly "Expenses for …" reports), and an NgRx `expenses` feature with effects mirroring Leasing (load, delete, CSV export, detail, save, return to the list with the success toast).
- Shared now: `report-editor.scss` (page chrome for both editors, moved from Leasing), `shared/ui/notice-toast` (success toast for both lists), and `shared/utils/amount.ts` (amount pattern and parsing).

**Step 9 gaps:**
- Expenses has no rows, so the detail page has no search, sort or paging. Figma's "Total rows: 02/03" footer text in these frames looks left over from the Leasing template and isn't shown.
- The expenses store mirrors the leasing store rather than sharing a generic factory. That's fine for two features; worth a refactor if more report types arrive.
- Tablet/mobile expenses frames (374:7064, 385:23307) weren't fetched; they follow the shared list and the 1-column form.

**Step 10 done (2026-10-17).** Accessibility pass and visual check at desktop (1440), tablet (834) and mobile (390), plus 320px.
- **Automated audit:** axe-core 4.10.3 (dev dependency), rules WCAG 2.0/2.1 A + AA plus best practices, run in headless Chrome on 32 page states: login (+ error), 2FA, Leasing and Expenses list/create/detail at all three sizes, More, the expanded sidebar, Sort and Filter panels (with calendar), the delete dialog, form validation errors, the mobile card menu and the filter sheet.
  - Fixed: placeholder and empty-field text contrast. Figma's `#a3a7ab` is 2.4:1; the new token `--color-text-placeholder` is `#71757a`, 4.64:1, the nearest grey that passes AA. Disabled text keeps `#a3a7ab`.
  - Fixed: the sidebar is now a labelled landmark ("Sidebar"); the calendar month title is no longer a stray `<h3>`.
  - Remaining (best practice, not WCAG): the CDK menu popup sits outside a landmark, because overlays are appended to `<body>`.
- **Keyboard:** 18/18 checks with real key presses: login and Enter to submit, the skip link, Sort panel and Escape with focus returned, delete dialog focus trap and focus return, sidebar drawer trap and Escape, accordion rows, calendar arrow keys and Enter, mobile ⋮ menu arrows and Escape with focus return.
  - Added: a "Skip to main content" link (first tab stop; visible on focus).
- **Reflow (WCAG 1.4.10)** at 320px: fixed the 2FA code boxes overflowing; every page now fits without sideways scrolling (the data table scrolls inside its own box by design).
- **Labels:** the search boxes and the filter's min/max amount boxes now have accessible names (`ariaLabel` on `input-field`), not just placeholders.
- **Visual check** against Figma and the exported screens: amount fields now show a fixed "₱" before the value ("₱ 5600.00", per `docs/screens/unpaid-to-paid.png`), not only in the placeholder. Other pages matched.

**Step 10 notes:**
- The placeholder colour change is a deliberate deviation from Figma for AA contrast; worth telling the designer.
- Not covered by automated checks: screen-reader announcements (spot-checked through roles and labels only) and real-device testing (iOS Safari, Android Chrome). Recommended before release.

**Empty-state check (2026-10-17).** `public/images/empty-reports.svg` is the valid Figma export (200×179.8, 25 paths) and renders at 200×180. The list now passes it explicitly. With the mock APIs, open **`/leasing?empty`** or **`/expenses?empty`** to start with no reports and see the empty state (`features/reports/models/mock-options.ts`; it lasts until reloaded without `?empty`, and real APIs ignore it).

## 5. Open questions for the designer or client

1. **Forgot password:** there's a link but no flow. Out of scope, or are screens still to come?
2. **Backend/API:** endpoints, auth token type, and whether 2FA is email OTP only (the OTP Email frame suggests it is).
3. **Expenses delete/download:** confirm they behave like the Leasing frames.
4. **Tablet sort/filter:** not designed. Use the desktop dropdowns or the mobile sheets?
5. **Copy errors:** the Expenses view modal and the mobile Expenses filter both say "Leasing Reports". Section `[569:11077]` is named "Leasing" but holds the Expenses sort/filter. Filter `[568:10970]` says "Expenses Revenue" inside the Leasing set.
6. **Logo:** the `mediflexlogo-2025` instance needs confirming as the correct Pearl Place asset.
7. **Placeholder data** ("Get a blood test", "Lose 15 lbs…") appears in the list tables and needs real report-name examples.
8. **Monthly encoding rule** (sticky note): should the UI enforce or nudge it, e.g. one report per month or a reminder banner?
