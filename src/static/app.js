document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <div class="participants-section">
            <h3>Current Participants</h3>
            ${details.participants.length > 0 
                ? `<ul class="participants-list">
                    ${details.participants.map(p => `<li>${p}</li>`).join('')}
                   </ul>`
                : '<p>No participants yet</p>'
            }
            <div class="spots-remaining">
              ${spotsLeft} spots remaining
              (${details.participants.length}/${details.max_participants} filled)
            </div>
          </div>`;
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      if (response.ok) {
        messageDiv.textContent = `Successfully signed up for ${activity}!`;
        messageDiv.className = "message success";
        // Reload activities to show updated participants
        fetchActivities();
        // Reset form
        event.target.reset();
      } else {
        const error = await response.json();
        messageDiv.textContent = error.detail || "Failed to sign up for activity";
        messageDiv.className = "message error";
      }
    } catch (error) {
      messageDiv.textContent = "An error occurred while signing up";
      messageDiv.className = "message error";
      console.error("Error:", error);
    }

    messageDiv.classList.remove("hidden");
    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  });

  // Initialize app
  fetchActivities();
});
