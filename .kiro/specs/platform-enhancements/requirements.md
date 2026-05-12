# Requirements Document

## Introduction

This document covers a set of platform enhancements for **Beyond Classroom**, a math learning platform (beyondclassroom.netlify.app) built with Next.js (App Router) on the frontend and Node.js/Express with lowdb on the backend. The enhancements span seven areas: quiz management improvements, course/PDF upload across modules, student content downloads, analytics dashboard improvements, a 5-star student feedback system, homepage featured/recent course sections, and a restructured grade-wise course hierarchy.

---

## Glossary

- **Admin**: A user with role `admin` or `super_admin` who manages platform content.
- **Student**: A user with role `user` or `student` who consumes course content.
- **Quiz**: An assessment entity linked to a module, containing questions and metadata.
- **Module**: A unit of content within a course (currently the top-level grouping below a course).
- **Topic**: A named grouping within a Grade, replacing the current module-name display in analytics.
- **Sub-topic**: A named grouping within a Topic, containing individual content items.
- **Grade**: A school-year level (e.g., 5th Std, 6th Std, … 12th Std) used as the top-level course category.
- **Content_Item**: A leaf-level learning resource (video, PDF, image, text) within a Sub-topic.
- **Featured_Course**: A course explicitly marked by an Admin as featured for homepage display.
- **Recent_Course**: A course ordered by creation date, shown in a dedicated homepage section.
- **Feedback**: A 1–5 star rating submitted by a Student for a course, tied to their progress record.
- **Analytics_Dashboard**: The admin page at `/admin/analytics` showing platform performance charts.
- **File_Upload_Service**: The backend service responsible for accepting and storing uploaded files.
- **Download_Service**: The backend service that generates secure, time-limited download URLs for content files.

---

## Requirements

---

### Requirement 1: Quiz — Image Upload

**User Story:** As an Admin, I want to attach an image to a quiz question, so that students can answer questions that reference diagrams or figures.

#### Acceptance Criteria

1. WHEN an Admin opens the quiz creation or edit form, THE Quiz_Form SHALL display an image upload control for each question.
2. WHEN an Admin uploads an image file for a question, THE File_Upload_Service SHALL accept files of type JPEG, PNG, GIF, or WebP with a maximum size of 5 MB.
3. IF an uploaded image file exceeds 5 MB or is not an accepted type, THEN THE File_Upload_Service SHALL return a descriptive error message without saving the file.
4. WHEN an image is successfully uploaded, THE Quiz_Form SHALL display a preview of the image within the question editor.
5. WHEN a Student views a quiz question that has an attached image, THE Quiz_Renderer SHALL display the image above the question text.

---

### Requirement 2: Quiz — PDF Upload

**User Story:** As an Admin, I want to attach a PDF to a quiz, so that students can reference a document while answering questions.

#### Acceptance Criteria

1. WHEN an Admin opens the quiz creation or edit form, THE Quiz_Form SHALL display a PDF upload control at the quiz level.
2. WHEN an Admin uploads a PDF file, THE File_Upload_Service SHALL accept files of type PDF with a maximum size of 20 MB.
3. IF an uploaded PDF file exceeds 20 MB or is not a PDF, THEN THE File_Upload_Service SHALL return a descriptive error message without saving the file.
4. WHEN a PDF is successfully uploaded, THE Quiz_Form SHALL display the file name and a remove button.
5. WHEN a Student opens a quiz that has an attached PDF, THE Quiz_Renderer SHALL display a link to open the PDF in a new browser tab.

---

### Requirement 3: Quiz — Excel Upload for Bulk Question Import

**User Story:** As an Admin, I want to upload an Excel file to bulk-import quiz questions, so that I can create large question sets efficiently.

#### Acceptance Criteria

1. WHEN an Admin opens the quiz creation or edit form, THE Quiz_Form SHALL display an Excel upload control for bulk question import.
2. WHEN an Admin uploads an Excel file, THE File_Upload_Service SHALL accept files of type `.xlsx` or `.xls` with a maximum size of 10 MB.
3. IF an uploaded Excel file exceeds 10 MB or is not an Excel format, THEN THE File_Upload_Service SHALL return a descriptive error message without saving the file.
4. WHEN a valid Excel file is uploaded, THE Quiz_Import_Parser SHALL parse each row into a question object with fields: question text, type, options (comma-separated for MCQ), and correct answer.
5. IF a row in the Excel file is missing required fields (question text or correct answer), THEN THE Quiz_Import_Parser SHALL skip that row and include it in a validation error summary returned to the Admin.
6. WHEN parsing completes, THE Quiz_Form SHALL display the imported questions in the question list for Admin review before saving.
7. FOR ALL valid Excel files, parsing then re-exporting the questions to Excel then parsing again SHALL produce an equivalent question set (round-trip property).

---

### Requirement 4: Quiz — "Created By" Field

**User Story:** As an Admin, I want each quiz to record who created it, so that I can track content ownership.

#### Acceptance Criteria

1. WHEN an Admin creates a quiz, THE Quiz_Service SHALL automatically record the authenticated Admin's user ID and display name as the `createdBy` field.
2. THE Quiz_List SHALL display the `createdBy` name alongside each quiz entry in the admin quiz management page.
3. WHEN an Admin edits an existing quiz, THE Quiz_Service SHALL preserve the original `createdBy` value and SHALL NOT overwrite it with the editing Admin's identity.

---

### Requirement 5: Course/PDF Upload in All Modules

**User Story:** As an Admin, I want to upload a PDF or course file directly within any module, so that students have reference material alongside lessons.

#### Acceptance Criteria

1. WHEN an Admin views any module's detail page in the admin panel, THE Module_Form SHALL display a file upload control accepting PDF files up to 20 MB.
2. WHEN a PDF is successfully uploaded to a module, THE File_Upload_Service SHALL store the file and associate its URL with the module record.
3. IF a file upload fails due to size or type violation, THEN THE File_Upload_Service SHALL return a descriptive error without modifying the module record.
4. WHEN a Student views a module that has an attached PDF, THE Module_Viewer SHALL display a "Download / View PDF" button linking to the stored file.
5. THE Module_Form SHALL allow an Admin to remove a previously uploaded PDF, after which THE Module_Viewer SHALL no longer display the PDF button for that module.

---

### Requirement 6: Student Content Download

**User Story:** As a Student, I want to download course content files (PDFs, images), so that I can study offline.

#### Acceptance Criteria

1. WHEN a Student views a Content_Item that has a downloadable file, THE Content_Viewer SHALL display a "Download" button.
2. WHEN a Student clicks the "Download" button, THE Download_Service SHALL initiate a file download to the Student's device.
3. WHILE a Student is not authenticated, THE Download_Service SHALL return a 401 error and SHALL NOT serve the file.
4. IF the requested file does not exist on the server, THEN THE Download_Service SHALL return a 404 error with a descriptive message.
5. THE Download_Service SHALL support download of PDF and image file types (JPEG, PNG, WebP).

---

### Requirement 7: Analytics Dashboard — Topic-Based Popularity

**User Story:** As an Admin, I want the analytics dashboard to show topic names instead of module names in the popularity chart, so that I can understand which topics attract the most student engagement.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display a bar chart titled "Topic-wise Popularity" showing enrollment counts grouped by Topic name.
2. WHEN the Analytics_Dashboard loads, THE Analytics_Service SHALL aggregate enrollment data by Topic name (not module name) and return the top 10 topics sorted by enrollment count descending.
3. THE Analytics_Dashboard SHALL replace the existing pie chart for "Course Popularity" with the new bar chart for "Topic-wise Popularity".
4. WHEN a Topic has zero enrollments, THE Analytics_Service SHALL include it in the response with an enrollment count of 0.
5. THE Analytics_Dashboard bar chart SHALL display topic names on the X-axis and enrollment counts on the Y-axis.

---

### Requirement 8: Progress Tracking — 5-Star Student Feedback

**User Story:** As a Student, I want to submit a star rating for a course I am enrolled in, so that I can share feedback on my learning experience.

#### Acceptance Criteria

1. WHEN a Student has at least 1% completion on a course, THE Progress_Viewer SHALL display a 5-star rating widget for that course.
2. WHEN a Student selects a star rating (1–5) and submits, THE Feedback_Service SHALL store the rating linked to the Student's user ID and the course ID.
3. IF a Student has already submitted a rating for a course, THEN THE Feedback_Service SHALL update the existing rating rather than create a duplicate.
4. WHILE a Student has not yet submitted a rating, THE Progress_Viewer SHALL display the rating widget in an empty/unselected state.
5. WHEN a rating is submitted, THE Progress_Viewer SHALL display the selected star count in a filled/highlighted state.
6. THE Admin_Progress_Page SHALL display the average star rating per course, calculated from all Student submissions for that course.
7. IF no ratings have been submitted for a course, THEN THE Admin_Progress_Page SHALL display "No ratings yet" for that course.

---

### Requirement 9: Homepage — Featured Courses Section

**User Story:** As a Student visiting the homepage, I want to see a dedicated "Featured Courses" section, so that I can quickly discover courses the platform recommends.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Featured Courses" section showing only courses where the `isFeatured` flag is `true`.
2. WHEN no courses are marked as featured, THE Homepage SHALL display a message "No featured courses available" in the Featured Courses section.
3. THE Featured_Courses_Section SHALL display a maximum of 6 course cards.
4. WHEN an Admin sets a course's `isFeatured` flag to `true` via the admin courses page, THE Homepage SHALL reflect the change on the next page load.

---

### Requirement 10: Homepage — Recent Courses Section

**User Story:** As a Student visiting the homepage, I want to see a "Recent Courses" section showing newly added courses, so that I can discover the latest content.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Recent Courses" section below the Featured Courses section.
2. THE Recent_Courses_Section SHALL show the 6 most recently created courses, ordered by `createdAt` descending.
3. WHEN the Homepage loads, THE Course_Service SHALL return courses sorted by `createdAt` descending for the Recent Courses section.
4. THE Recent_Courses_Section SHALL display new courses by default without requiring any filter interaction from the Student.

---

### Requirement 11: Homepage — New Courses Shown by Default

**User Story:** As a Student visiting the homepage, I want new courses to appear prominently by default, so that I do not miss recently added content.

#### Acceptance Criteria

1. WHEN the Homepage loads, THE Course_Service SHALL return the full course list sorted by `createdAt` descending as the default ordering.
2. THE Homepage course grid (outside of Featured and Recent sections) SHALL display courses in newest-first order unless the Student applies a different sort.

---

### Requirement 12: Course Structure — Grade-wise Hierarchy

**User Story:** As an Admin, I want to organise courses by Grade → Topic → Sub-topic → Content, so that students can navigate math content by their school year.

#### Acceptance Criteria

1. THE Course_Service SHALL support a `grade` field on each course with values: "5th Std", "6th Std", "7th Std", "8th Std", "9th Std", "10th Std", "11th Std", "12th Std".
2. WHEN an Admin creates or edits a course, THE Course_Form SHALL display a "Grade" dropdown with the values defined in AC1.
3. THE Admin_Courses_Page SHALL allow filtering courses by Grade.
4. THE Student_Courses_Page SHALL display a Grade filter allowing Students to browse courses by grade level.
5. WHEN a Student selects a Grade, THE Course_Service SHALL return only courses matching that grade, ordered by Topic name ascending.
6. THE Module_Service SHALL support a `topicName` field on each module, representing the Topic within a Grade.
7. THE Lesson_Service SHALL support a `subTopicName` field on each lesson, representing the Sub-topic within a Topic.
8. WHEN a Student navigates into a course, THE Course_Viewer SHALL display the hierarchy: Grade label → list of Topics (modules) → list of Sub-topics (lessons) → Content items.
9. THE Admin_Modules_Page SHALL display the `topicName` field and allow Admins to set or edit it.
10. THE Admin_Lessons_Page SHALL display the `subTopicName` field and allow Admins to set or edit it.
