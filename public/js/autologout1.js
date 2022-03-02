// This script runs on clientside

// https://stackoverflow.com/questions/23023916/how-to-implement-auto-logout-in-javascript

var timoutWarning = 840000; // Display warning in 14 Mins.
var timoutNow = 60000; // Warning has been shown, give the user 1 minute to interact
var logoutUrl = "http://192.168.2.170:3001/logout"; // URL to logout page.

var warningTimer;
var timeoutTimer;

// Start warning timer.
function StartWarningTimer() {
    warningTimer = setTimeout("IdleWarning()", timoutWarning);
}

// Reset timers.
function ResetTimeOutTimer() {
    clearTimeout(timeoutTimer);
    StartWarningTimer();
    $("#timeout").dialog('close');
}

// Show idle timeout warning dialog.
function IdleWarning() {
    clearTimeout(warningTimer);
    timeoutTimer = setTimeout("IdleTimeout()", timoutNow);
    $("#timeout").dialog({
        modal: true
    });
    // Add code in the #timeout element to call ResetTimeOutTimer() if
    // the "Stay Logged In" button is clicked
}

// Logout the user.
function IdleTimeout() {
    window.location = logoutUrl;
}