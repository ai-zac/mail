document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document
    .querySelector("#compose-submit")
    .addEventListener("click", send_mail);

  // By default, load the inbox
  load_mailbox("inbox");
});

function load_mailbox(mailbox) {
  document.querySelector("#email-preview").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox and hide other views
  let emailsView = document.querySelector("#emails-view");
  emailsView.style.display = "block";

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get and show all mailbox's emails
  fetch("/emails/" + mailbox)
    .then((response) => response.json())
    .then((emails) => {
      // if sucess
      emails.forEach((email) => {
        emailsView.innerHTML += `
          <div class="mails">
            <div class="mail-title mail-left">
              <b>${email.sender}</b>
              <p>${email.subject}</p>
            </div>
            <div class="mail-timestamp mail-right">
              <i>${email.timestamp}</i>
            </div>
            <input type="number" value=${email.id} class="mail-id" hidden>
          </div>`;
      });

      // Then add to each email a link to preview
      let emailsList = document.querySelectorAll(".mails");
      emailsList.forEach((email) => {
        let id = email.querySelector(".mail-id").value;
        email.querySelector(".mail-title").addEventListener("click", () => show_email(id));

        // ARCHIVE FEATURE
        // Set all arhive buttons to "unarchive"
        // if the current mailbox is not "archive"
        let archiveState = mailbox === "archive" ? "unarchive" : "archive";
        // Don't show archive button in Sent mailbox
        if (mailbox !== "sent") {
          email.querySelector(".mail-right").innerHTML +=
            `<button class="mail-archive btn btn-sm btn-outline-primary">${archiveState}</button>`;
        }

        email.querySelector(".mail-archive").addEventListener("click", () => {
          // Set the mail to "unarchive" when the mailbox is in "archive"
          // and "archive" when not
          let archived = mailbox === "archive" ? false : true;
          fetch("/emails/" + id, {
            method: "PUT",
            body: JSON.stringify({
              archived: archived,
            }),
          });

          // Then load user's inbox 
          location.reload()
        });
      });
    });
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-preview").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function send_mail() {
  let r = document.querySelector("#compose-recipients").value;
  let s = document.querySelector("#compose-subject").value;
  let b = document.querySelector("#compose-body").value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: r,
      subject: s,
      body: b,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Show result
      alert(JSON.stringify(result));
    });
}

function show_email(id) {
  // Hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  // Show email preview
  let emailPreview = document.querySelector("#email-preview");
  emailPreview.style.display = "block";
  emailPreview.innerHTML = " ";

  fetch("/emails/" + id)
    .then((response) => response.json())
    .then((email) => {
      // Show email's information
      emailPreview.innerHTML += `
        <ul class="email-header">
          <li><b>From: </b>${email.sender}</li>
          <li><b>To: </b>${email.recipients[0]}</li>
          <li><b>Subject: </b>${email.subject}</li>
          <li><b>Timestamp: </b>${email.timestamp}</li>
        </ul>
        <button class="email-reply btn btn-sm btn-outline-primary">Reply</button>
        <hr>
        ${email.body}
        `;
    });
}
