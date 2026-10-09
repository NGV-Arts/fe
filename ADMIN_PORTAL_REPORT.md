# NGV Arts admin portal implementation report

## Outcome

The existing NGV Arts portal now has an admin dashboard, student and teacher management, group management, a filtered lesson calendar, and shared student invoice management. It uses the existing PortalShell, typography, card styles, API client, FullCalendar implementation, and modal patterns. Primary actions are dark; active navigation, Close and destructive actions use red. No backend files or project dependencies were changed.

## 1. Files created

- `src/app/portal/admin/calendar/page.tsx`
- `src/app/portal/admin/groups/page.tsx`
- `src/app/portal/admin/layout.tsx`
- `src/app/portal/admin/students/[studentId]/invoices/page.tsx`
- `src/app/portal/admin/students/page.tsx`
- `src/app/portal/admin/teachers/[teacherId]/page.tsx`
- `src/app/portal/admin/teachers/page.tsx`
- `src/components/portal/ManagedUserModal.tsx`
- `src/components/portal/ManagementUI.tsx`
- `src/components/portal/StudentInvoices.tsx`
- `src/components/portal/UserFormFields.tsx`
- `src/components/portal/admin/AdminNav.tsx`
- `src/components/portal/admin/GroupsManager.tsx`
- `src/components/portal/admin/StudentsManager.tsx`
- `src/components/portal/admin/TeacherDetail.tsx`
- `src/components/portal/admin/TeachersManager.tsx`
- `src/lib/api/admin.ts`
- `src/lib/hooks/use-management.ts`
- `src/lib/utils/api-error.ts`
- `ADMIN_PORTAL_REPORT.md` (this report)

## 2. Files modified

- `src/app/portal/admin/page.tsx`
- `src/app/portal/student/page.tsx`
- `src/app/portal/students/[id]/invoices/page.tsx`
- `src/app/portal/students/new/page.tsx`
- `src/app/portal/students/page.tsx`
- `src/app/portal/teacher/page.tsx`
- `src/components/auth/PortalGuard.tsx`
- `src/components/portal/AddClassModal.tsx`
- `src/components/portal/AddGroupModal.tsx`
- `src/components/portal/AddStudentToGroupModal.tsx`
- `src/components/portal/ConfirmActionModal.tsx`
- `src/components/portal/EditGroupModal.tsx`
- `src/components/portal/EditStudentModal.tsx`
- `src/components/portal/LessonDetailsModal.tsx`
- `src/components/portal/PortalNav.tsx`
- `src/components/portal/RescheduleSeriesModal.tsx`
- `src/components/portal/RescheduleSingleModal.tsx`
- `src/components/portal/TeacherLessonActionsModal.tsx`
- `src/lib/api/groups.ts`
- `src/lib/api/invoices.ts`
- `src/lib/auth/session.ts`
- `src/lib/utils/datetime.ts`
- `src/types/group.ts`
- `src/types/user.ts`

The workspace already contained changes to `package.json`, `LessonsCalendar.tsx`, `lib/api/lessons.ts`, and `types/lesson.ts`; these were retained. Existing join-flow work was preserved, with temporary verbose console.log tracing removed. `LessonDetailsModal.tsx` received formatting only in this task. The calendar's height, view configuration, event title/status logic, and scrolling behavior remain intact.

## 3. Routes created or completed

| Route | Purpose |
| --- | --- |
| `/portal/admin` | Dashboard, replacing the placeholder |
| `/portal/admin/students` | All students, search, teacher filter and management |
| `/portal/admin/teachers` | Teachers, search, counts and management |
| `/portal/admin/teachers/[teacherId]` | Teacher profile with shared students/groups sections |
| `/portal/admin/groups` | Groups, search, teacher filter and membership management |
| `/portal/admin/calendar` | Lessons across teachers, with optional teacher/student/group filters |
| `/portal/admin/students/[studentId]/invoices` | Shared student invoice management |

An admin layout protects every nested route with the existing role guard. The guard now subscribes to session changes and redirects unauthorized roles to their portal. Anonymous visitors go to login. Admin navigation includes only Dashboard, Students, Teachers, Groups and Calendar; the existing profile/logout menu remains available. The legacy student-management routes are teacher-only, with the admin menu pointing to the new routes. Backend authorization remains authoritative.

## 4. Shared components reused or extracted

- Reused `PortalShell`, `PortalNav`, `PortalGuard`, `LessonsCalendar`, `ConfirmActionModal`, and `RescheduleSingleModal`.
- Extended `EditStudentModal` with optional teacher reassignment and a separate additive classes action. The existing teacher callback contract remains supported.
- Extended `AddGroupModal`, `EditGroupModal`, and `AddStudentToGroupModal` with optional admin teacher selection, immediate membership callbacks, errors and loading states. Existing teacher group editing still uses its save callback.
- Extracted `StudentInvoices` from the teacher invoice page; both route families now render the same implementation.
- Added reusable identity/billing fields, a searchable teacher selector, accessible form labels, modal framing, feedback and contained table styles using the existing portal controls.
- `StudentsManager` and `GroupsManager` are used by both their main admin pages and teacher-detail sections.
- Replaced effect-based form resets with mounted dialog state to fix lint and keep reopened forms fresh. Reschedule inputs now initialize date/time in the saved timezone, including local date rollover.

## 5. API helpers added or changed

All helpers use the existing `apiClient`; no additional `/api` prefix is inserted.

| Helper(s) | Verified backend contract |
| --- | --- |
| `getStudents`, `getTeachers`, `getAllUsers` | `GET /users/students`, `GET /users/teachers`; all paginated records are loaded for local search and selectors |
| `createAdminStudent`, `updateAdminStudent`, `deleteAdminStudent` | `POST /users/students`, `PATCH/DELETE /users/students/:id` |
| `addStudentClasses` | `POST /users/students/:id/add-classes` with `{ classesToAdd }` |
| `createTeacher`, `updateTeacher`, `getTeacher`, `deleteTeacher` | `/users/teachers` and `/users/teachers/:id` |
| `sendPasswordReset` | `POST /users/:id/send-password-reset` |
| `getGroups`, `getGroup` | `GET /groups`, `GET /groups/:id` |
| Existing `createGroup`, `updateGroup`, `deleteGroup` | Extended payload types to support `primaryTeacherId`; reuse existing endpoints |
| `addStudentsToGroup`, `removeStudentFromGroup` | `POST /groups/:id/students` with deduplicated `studentIds`; `DELETE /groups/:groupId/students/:studentId` |
| `getAdminLessons` | `GET /lessons` with start/end and optional teacher/student/group IDs |
| Existing invoice helpers | Fetch now uses the existing normalizer; PATCH sends only `{ paid }`; resend uses the stored invoice endpoint |

`useResource` ignores obsolete fetch results. `useMutation` locks concurrent submissions. Directory search is debounced by 300 ms and filters loaded data without making requests per keystroke. Lists include all API pages rather than silently stopping at the default first 20 users.

## 6. Student management

Implemented all-student listing, full names/email, primary teacher, rate, currency, class cycle, classes left, attended count, search, teacher filter, create, edit, reassign, password-reset confirmation, invoice navigation and deletion confirmation. Create sends no password or initial balance. Student edits send only identity/teacher/billing fields; they do not send `class.left`. Add Classes is a separate POST and refetches the balance. Create/update/delete refetch the directory.

## 7. Teacher management

Implemented listing, search, student/group counts, create without password, edit, password-reset confirmation, detail links and deletion. The backend's 409 deletion message remains visible in the confirmation dialog. Teacher details use the shared filtered student/group managers.

## 8. Group management

Implemented names with student-first-name fallback, teacher/member/count columns, search, teacher filtering, create, edit, reassignment, separate add-member modal, membership-only removal and confirmed deletion. Students already in another group remain eligible. Current members are excluded from the add-member dialog. Membership requests deduplicate IDs and refetch the group/list. Deleting a group does not delete student accounts.

## 9. Invoice integration

Both portals reuse the same invoice page. Raw `_id`, `invoiceDate`, `paid` and stored URL are normalized centrally. Paid status is green and unpaid is red. Status changes and resend require confirmation. Paid invoices hide resend. Status updates refetch invoices and send only `{ paid: true/false }`. Stored invoice links open directly; the frontend never regenerates an invoice.

## 10. Calendar integration

Admin uses the existing FullCalendar with its day/week/month views, `height={720}`, `contentHeight={650}`, local timezone display and scrolling behavior. Teacher, student and group filters are passed to the backend. The shared lesson modal displays returned meeting status, identity, date/time, timezone and available Teams link. Past lessons load attendance and teacher-joined details; reschedule/delete are hidden. Future lessons support single-lesson rescheduling and confirmed deletion through existing endpoints. Admin opening Teams does not call a teacher/student attendance endpoint.

## 11. Backend/frontend differences discovered

- User management lists return `{ items, total, page, limit }`, not arrays. Group and lesson management endpoints return arrays.
- Students can have a populated `primaryTeacher` object; groups store their teacher in `teacher`. Shared types and displays support those actual fields.
- Admin student create/update uses flat `rate`, `currency`, `classCycle` and `primaryTeacherId` fields. Class balance changes use the separate additive endpoint.
- Group endpoints accept the existing `students` payload as well as `studentIds`; existing create/update helpers were reused instead of introducing competing payload shapes.
- Invoice fetch previously skipped its normalizer. Normalization also omitted the required `invoiceDate`, causing the initial build failure. Both are fixed.
- Invoice status PATCH previously sent an unsupported `status` field. It now sends only the DTO's `paid` boolean.
- The stored invoice schema has no currency field. When absent, the table displays the numeric amount without guessing a historical currency.
- The shared reschedule forms previously combined UTC clock values with a saved local timezone. They now initialize in that saved timezone.

## 12. Validation

- `npm run build`: passed, including TypeScript and generation of all admin routes.
- `npm run lint`: passed with no warnings or errors.
- `git diff --check`: passed.
- 27 browser checks passed using Chromium against the existing localhost development server, with API requests intercepted by fixtures. No real accounts, balances, memberships, invoices or emails were changed by those tests.
- Browser checks cover paginated directory loading, searches/teacher filters, student billing and reassignment without overwriting balance, additive 2 + 4 = 6, password resets, invoice normalization/toggles/resend, create/edit/delete workflows, visible teacher deletion 409, group membership across groups, calendar filters/status/attendance/reschedule/delete, saved timezone initialization, 720 px height, tablet containment, backend message arrays, role redirects and anonymous access.
- Desktop calendar, group modal and tablet table screenshots were visually reviewed. Names stay on one line while tables scroll inside their card.

Temporary verification files are in `/tmp/ngv-admin-check/`: `admin-browser.cjs`, `additional-checks.cjs`, `results.json`, `calendar-desktop.png`, and `students-tablet.png`. Browser/testing dependencies were installed only under `/tmp`, without changing project dependencies.

### Live verification still required

Browser tests used fixtures, not an authenticated live backend session. Verify email delivery, deployed endpoint availability/permissions, real persisted CRUD/balances/invoice status, and an actual Teams link with authorized test accounts. No claim is made that those external effects were exercised. The frontend and backend source contracts were compared read-only.
