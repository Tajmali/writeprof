/**
 * WriteProf — Gmail Sample Auto-Uploader
 * ───────────────────────────────────────
 * Paste this entire file into Google Apps Script (script.google.com)
 * then follow the setup steps below.
 *
 * SETUP (one time only):
 * 1. Go to https://script.google.com → New Project
 * 2. Delete the empty function and paste this whole file
 * 3. Fill in WEBHOOK_SECRET below (must match your Vercel env var)
 * 4. Click Run → uploadSamplesBatch (approve Gmail permissions when prompted)
 * 5. Click Triggers (clock icon) → Add Trigger:
 *      Function: uploadSamplesBatch
 *      Event: Time-driven → Day timer → Midnight to 1am
 * 6. Done — 100 samples will upload every night automatically
 */

// ─── CONFIG — fill these in ──────────────────────────────────────────────────
var WEBHOOK_URL    = "https://writeprof.com/api/webhooks/sample-upload";
var WEBHOOK_SECRET = "PASTE_YOUR_SECRET_HERE"; // same as SAMPLE_UPLOAD_SECRET in Vercel
var BATCH_SIZE     = 100;
var DONE_LABEL     = "WriteProf-Uploaded";

// The 5 writer addresses to pull samples from
var WRITER_EMAILS  = [
  "perfecwriters@gmail.com",
  "andywprof44@gmail.com",
  "andyprof44@gmail.com",
  "daridonner84@gmail.com",
  "wicxavi84@gmail.com",
];
// ─────────────────────────────────────────────────────────────────────────────


function uploadSamplesBatch() {
  // Ensure the "done" label exists
  var label = GmailApp.getUserLabelByName(DONE_LABEL);
  if (!label) {
    label = GmailApp.createLabel(DONE_LABEL);
  }

  // Build Gmail search query for all 5 addresses, excluding already-uploaded
  var fromQuery = "from:(" + WRITER_EMAILS.join(" OR ") + ")";
  var query     = fromQuery + " -label:" + DONE_LABEL;

  var threads = GmailApp.search(query, 0, BATCH_SIZE);

  if (threads.length === 0) {
    Logger.log("✅ All samples have been uploaded! Nothing left to process.");
    return;
  }

  var uploaded = 0;
  var skipped  = 0;
  var failed   = 0;

  for (var i = 0; i < threads.length; i++) {
    var thread   = threads[i];
    var messages = thread.getMessages();

    // Use the first message in the thread (the original, not replies)
    var message  = messages[0];
    var subject  = message.getSubject() || "";
    var body     = message.getPlainBody() || "";

    // Skip emails with empty or very short bodies
    if (body.trim().length < 80) {
      thread.addLabel(label); // mark as done so we don't retry
      skipped++;
      continue;
    }

    // POST to WriteProf webhook
    try {
      var response = UrlFetchApp.fetch(WEBHOOK_URL, {
        method:          "post",
        contentType:     "application/json",
        headers:         { "x-webhook-secret": WEBHOOK_SECRET },
        payload:         JSON.stringify({
          secret:  WEBHOOK_SECRET,
          subject: subject,
          body:    body.slice(0, 12000), // cap at ~12k chars to keep tokens reasonable
        }),
        muteHttpExceptions: true,
      });

      var code   = response.getResponseCode();
      var result = JSON.parse(response.getContentText());

      if (code === 200 && result.success) {
        thread.addLabel(label);
        uploaded++;
        Logger.log("✅ [" + uploaded + "] " + (result.data && result.data.slug ? result.data.slug : subject.slice(0, 60)));
      } else {
        failed++;
        // Log full detail so we know exactly why it failed
        var reason = result.error || "unknown";
        var detail = result.detail ? " | " + result.detail.slice(0, 120) : "";
        Logger.log("❌ [" + code + "] " + subject.slice(0, 60) + " — " + reason + detail);
        // Still mark as done if content is just too short (nothing we can do)
        if (result.error === "too_short") {
          thread.addLabel(label);
          skipped++;
          failed--; // count as skipped, not failed
        }
      }
    } catch (e) {
      failed++;
      Logger.log("❌ Error: " + subject.slice(0, 60) + " — " + e.message);
    }

    // 300ms pause between calls — avoids hammering the server
    Utilities.sleep(300);
  }

  // ── Summary log ─────────────────────────────────────────────────────────────
  var remaining = GmailApp.search(query).length;
  Logger.log("─────────────────────────────────────────");
  Logger.log("Batch done: " + uploaded + " uploaded, " + skipped + " skipped (too short), " + failed + " failed");
  Logger.log("Remaining emails to process: " + remaining);
  Logger.log("Estimated days left at " + BATCH_SIZE + "/day: " + Math.ceil(remaining / BATCH_SIZE));
  Logger.log("─────────────────────────────────────────");
}


/**
 * Run this once to see how many emails match before starting the daily job.
 * Open the Logs (View → Logs) to see the count.
 */
function countPending() {
  var fromQuery = "from:(" + WRITER_EMAILS.join(" OR ") + ")";
  var query     = fromQuery + " -label:" + DONE_LABEL;
  var threads   = GmailApp.search(query);
  Logger.log("Total emails matching your 5 writer addresses: " + threads.length);
  Logger.log("At 100/day, this will take ~" + Math.ceil(threads.length / 100) + " days");
}
