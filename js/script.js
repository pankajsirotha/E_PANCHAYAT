// Simulated Firebase-like data storage (in real implementation, use Firebase)
class MockFirebase {
  constructor() {
    this.data = {
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      services: JSON.parse(localStorage.getItem("services") || "[]"),
      applications: JSON.parse(localStorage.getItem("applications") || "[]"),
    };
    this.currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    this.initializeDefaultData();
  }

  initializeDefaultData() {
    if (this.data.services.length === 0) {
      this.data.services = [
        {
          id: "svc_001",
          name: "Birth Certificate",
          description: "Apply for birth certificate",
          category: "certificates",
          processingTime: "7-10 days",
          createdBy: "admin",
          isActive: true,
        },
        {
          id: "svc_002",
          name: "Death Certificate",
          description: "Apply for death certificate",
          category: "certificates",
          processingTime: "5-7 days",
          createdBy: "admin",
          isActive: true,
        },
        {
          id: "svc_003",
          name: "Property Tax Certificate",
          description: "Property tax payment certificate",
          category: "certificates",
          processingTime: "3-5 days",
          createdBy: "admin",
          isActive: true,
        },
      ];
      this.saveData();
    }

    if (this.data.users.length === 0) {
      this.data.users = [
        {
          id: "admin_001",
          name: "Admin User",
          email: "admin@panchayat.gov.in",
          password: "admin123",
          type: "officer",
          phone: "9876543210",
          address: "Panchayat Office",
        },
        {
          id: "staff_001",
          name: "Staff Member",
          email: "staff@panchayat.gov.in",
          password: "staff123",
          type: "staff",
          phone: "9876543211",
          address: "Panchayat Office",
        },
        {
          id: "citizen_001",
          name: "Citizen",
          email: "citizen@example.com",
          password: "citizen123",
          type: "user",
          phone: "9876543212",
          address: "Ward 1, Village",
        },
      ];
      this.saveData();
    }
  }

  saveData() {
    localStorage.setItem("users", JSON.stringify(this.data.users));
    localStorage.setItem("services", JSON.stringify(this.data.services));
    localStorage.setItem(
      "applications",
      JSON.stringify(this.data.applications)
    );
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
  }

  generateId(prefix) {
    return (
      prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  async login(email, password, type) {
    const user = this.data.users.find(
      (u) => u.email === email && u.password === password && u.type === type
    );
    if (user) {
      this.currentUser = user;
      this.saveData();
      this.log("LOGIN", `User ${email} logged in successfully`);
      return { success: true, user };
    }
    this.log("LOGIN_FAILED", `Failed login attempt for ${email}`);
    return { success: false, message: "Invalid credentials" };
  }

  async register(userData) {
    const existingUser = this.data.users.find(
      (u) => u.email === userData.email
    );
    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    const newUser = {
      id: this.generateId("user"),
      ...userData,
      type: "user",
    };

    this.data.users.push(newUser);
    this.saveData();
    this.log("REGISTER", `New user registered: ${userData.email}`);
    return { success: true, user: newUser };
  }

  async createService(serviceData) {
    const newService = {
      id: this.generateId("svc"),
      ...serviceData,
      createdBy: this.currentUser.id,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.data.services.push(newService);
    this.saveData();
    this.log("CREATE_SERVICE", `Service created: ${serviceData.name}`);
    return { success: true, service: newService };
  }

  async applyForService(applicationData) {
    const application = {
      id: this.generateId("app"),
      ...applicationData,
      userId: this.currentUser.id,
      status: "pending",
      appliedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    this.data.applications.push(application);
    this.saveData();
    this.log(
      "APPLY_SERVICE",
      `Application submitted for service: ${applicationData.serviceId}`
    );
    return { success: true, application };
  }

  async updateApplicationStatus(applicationId, status, remarks = "") {
    const application = this.data.applications.find(
      (a) => a.id === applicationId
    );
    if (application) {
      application.status = status;
      application.remarks = remarks;
      application.lastUpdated = new Date().toISOString();
      application.updatedBy = this.currentUser.id;
      this.saveData();
      this.log(
        "UPDATE_STATUS",
        `Application ${applicationId} status updated to ${status}`
      );
      return { success: true };
    }
    return { success: false, message: "Application not found" };
  }

  getServices() {
    return this.data.services.filter((s) => s.isActive);
  }

  getUserApplications() {
    return this.data.applications.filter(
      (a) => a.userId === this.currentUser?.id
    );
  }

  getAllApplications() {
    return this.data.applications;
  }

  updateUserProfile(profileData) {
    if (this.currentUser) {
      Object.assign(this.currentUser, profileData);
      const userIndex = this.data.users.findIndex(
        (u) => u.id === this.currentUser.id
      );
      if (userIndex !== -1) {
        this.data.users[userIndex] = this.currentUser;
        this.saveData();
        this.log(
          "UPDATE_PROFILE",
          `Profile updated for user: ${this.currentUser.email}`
        );
        return { success: true };
      }
    }
    return { success: false };
  }

  logout() {
    this.log("LOGOUT", `User ${this.currentUser?.email} logged out`);
    this.currentUser = null;
    this.saveData();
  }

  log(action, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      message,
      user: this.currentUser?.email || "anonymous",
    };
    console.log("LOG:", logEntry);

    // Store logs in localStorage for demonstration
    const logs = JSON.parse(localStorage.getItem("systemLogs") || "[]");
    logs.push(logEntry);
    if (logs.length > 1000) logs.shift(); // Keep only last 1000 logs
    localStorage.setItem("systemLogs", JSON.stringify(logs));
  }
}

// Initialize Firebase mock
const firebase = new MockFirebase();

// UI Functions
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 100);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

function showDashboard(userType) {
  document.getElementById("heroSection").style.display = "none";
  document.getElementById("userDashboard").style.display =
    userType === "user" ? "block" : "none";
  document.getElementById("officerDashboard").style.display =
    userType === "officer" ? "block" : "none";
  document.getElementById("staffDashboard").style.display =
    userType === "staff" ? "block" : "none";

  // Update navigation
  document.getElementById("navButtons").innerHTML = `
                <span style="color: white; margin-right: 1rem;">Welcome, ${firebase.currentUser.name}</span>
                <button class="btn btn-secondary" onclick="logout()">Logout</button>
            `;
}

function logout() {
  firebase.logout();
  location.reload();
}

function loadServices() {
  const services = firebase.getServices();

  // User services list
  const servicesList = document.getElementById("servicesList");
  if (servicesList) {
    servicesList.innerHTML = services
      .map(
        (service) => `
                    <div class="service-item">
                        <h4>${service.name}</h4>
                        <p>${service.description}</p>
                        <small>Processing Time: ${service.processingTime}</small>
                    </div>
                `
      )
      .join("");
  }

  // Service select dropdown
  const serviceSelect = document.getElementById("serviceSelect");
  if (serviceSelect) {
    serviceSelect.innerHTML =
      '<option value="">Select a service</option>' +
      services
        .map(
          (service) => `<option value="${service.id}">${service.name}</option>`
        )
        .join("");
  }

  // Admin services list
  const adminServicesList = document.getElementById("adminServicesList");
  if (adminServicesList) {
    adminServicesList.innerHTML = services
      .map(
        (service) => `
                    <div class="service-item">
                        <h4>${service.name}</h4>
                        <p>${service.description}</p>
                        <p><strong>Category:</strong> ${service.category}</p>
                        <p><strong>Processing Time:</strong> ${service.processingTime}</p>
                        <div class="service-actions">
                            <button class="btn btn-secondary btn-small" onclick="editService('${service.id}')">Edit</button>
                            <button class="btn btn-secondary btn-small" onclick="deleteService('${service.id}')">Delete</button>
                        </div>
                    </div>
                `
      )
      .join("");
  }

  // Staff services list
  const staffServicesList = document.getElementById("staffServicesList");
  if (staffServicesList) {
    staffServicesList.innerHTML = services
      .map(
        (service) => `
                    <div class="service-item">
                        <h4>${service.name}</h4>
                        <p>${service.description}</p>
                        <small>Processing Time: ${service.processingTime}</small>
                    </div>
                `
      )
      .join("");
  }
}

function loadApplications() {
  if (firebase.currentUser?.type === "user") {
    const applications = firebase.getUserApplications();
    const myApplications = document.getElementById("myApplications");
    if (myApplications) {
      myApplications.innerHTML = applications.length
        ? applications
            .map((app) => {
              const service = firebase
                .getServices()
                .find((s) => s.id === app.serviceId);
              return `
                            <div class="service-item">
                                <h4>${service?.name || "Unknown Service"}</h4>
                                <p><strong>Status:</strong> <span class="status-${
                                  app.status
                                }">${app.status.toUpperCase()}</span></p>
                                <p><strong>Applied:</strong> ${new Date(
                                  app.appliedAt
                                ).toLocaleDateString()}</p>
                                <p><strong>Reason:</strong> ${app.reason}</p>
                                ${
                                  app.remarks
                                    ? `<p><strong>Remarks:</strong> ${app.remarks}</p>`
                                    : ""
                                }
                            </div>
                        `;
            })
            .join("")
        : "<p>No applications found.</p>";
    }
  } else if (
    firebase.currentUser?.type === "officer" ||
    firebase.currentUser?.type === "staff"
  ) {
    const applications = firebase.getAllApplications();
    const container =
      firebase.currentUser.type === "officer"
        ? document.getElementById("allApplications")
        : document.getElementById("staffApplications");

    if (container) {
      container.innerHTML = applications.length
        ? applications
            .map((app) => {
              const service = firebase
                .getServices()
                .find((s) => s.id === app.serviceId);
              const user = firebase.data.users.find((u) => u.id === app.userId);
              return `
                            <div class="service-item">
                                <h4>${service?.name || "Unknown Service"}</h4>
                                <p><strong>Applicant:</strong> ${
                                  user?.name || "Unknown User"
                                }</p>
                                <p><strong>Status:</strong> <span class="status-${
                                  app.status
                                }">${app.status.toUpperCase()}</span></p>
                                <p><strong>Applied:</strong> ${new Date(
                                  app.appliedAt
                                ).toLocaleDateString()}</p>
                                <p><strong>Reason:</strong> ${app.reason}</p>
                                <p><strong>Priority:</strong> ${app.urgency}</p>
                                ${
                                  app.remarks
                                    ? `<p><strong>Remarks:</strong> ${app.remarks}</p>`
                                    : ""
                                }
                                <div class="service-actions">
                                    <button class="btn btn-primary btn-small" onclick="updateStatus('${
                                      app.id
                                    }', 'approved')">Approve</button>
                                    <button class="btn btn-secondary btn-small" onclick="updateStatus('${
                                      app.id
                                    }', 'rejected')">Reject</button>
                                    <button class="btn btn-secondary btn-small" onclick="addRemarks('${
                                      app.id
                                    }')">Add Remarks</button>
                                </div>
                            </div>
                        `;
            })
            .join("")
        : "<p>No applications found.</p>";
    }
  }
}

function loadUserProfile() {
  if (firebase.currentUser) {
    const userProfile = document.getElementById("userProfile");
    if (userProfile) {
      userProfile.innerHTML = `
                        <p><strong>Name:</strong> ${firebase.currentUser.name}</p>
                        <p><strong>Email:</strong> ${firebase.currentUser.email}</p>
                        <p><strong>Phone:</strong> ${firebase.currentUser.phone}</p>
                        <p><strong>Address:</strong> ${firebase.currentUser.address}</p>
                    `;
    }
  }
}

function updateStatus(applicationId, status) {
  const remarks =
    status === "rejected"
      ? prompt("Please provide reason for rejection:")
      : prompt("Add any remarks (optional):") || "";

  firebase
    .updateApplicationStatus(applicationId, status, remarks)
    .then((result) => {
      if (result.success) {
        showNotification(`Application ${status} successfully`);
        loadApplications();
      } else {
        showNotification(result.message, "error");
      }
    });
}

function addRemarks(applicationId) {
  const remarks = prompt("Add remarks:");
  if (remarks) {
    firebase
      .updateApplicationStatus(applicationId, "pending", remarks)
      .then((result) => {
        if (result.success) {
          showNotification("Remarks added successfully");
          loadApplications();
        } else {
          showNotification(result.message, "error");
        }
      });
  }
}

function editService(serviceId) {
  const service = firebase.getServices().find((s) => s.id === serviceId);
  if (!service) return;

  // Open the createServiceModal for editing
  openModal("createServiceModal");
  document.getElementById("serviceName").value = service.name;
  document.getElementById("serviceDescription").value = service.description;
  document.getElementById("serviceCategory").value = service.category;
  document.getElementById("processingTime").value = service.processingTime;

  // Store editing state
  document
    .getElementById("createServiceForm")
    .setAttribute("data-editing", serviceId);

  // Change button text to "Update Service"
  document.querySelector(
    '#createServiceForm button[type="submit"]'
  ).textContent = "Update Service";
}
// Update createServiceForm submit handler to handle edit
document
  .getElementById("createServiceForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("serviceName").value.trim();
    const description = document
      .getElementById("serviceDescription")
      .value.trim();
    const category = document.getElementById("serviceCategory").value;
    const processingTime = document
      .getElementById("processingTime")
      .value.trim();
    const fileInput = document.getElementById("serviceFiles");
    let files = [];
    if (fileInput && fileInput.files.length > 0) {
      files = Array.from(fileInput.files).map((f) => f.name); // Just storing file names for mock
    }

    const editingId = document
      .getElementById("createServiceForm")
      .getAttribute("data-editing");

    if (editingId) {
      // Edit existing service
      const service = firebase.getServices().find((s) => s.id === editingId);
      if (service) {
        service.name = name;
        service.description = description;
        service.category = category;
        service.processingTime = processingTime;
        service.files = files;
        firebase.saveData();
        showNotification("Service updated successfully!");
      }
      document
        .getElementById("createServiceForm")
        .removeAttribute("data-editing");
      document.querySelector(
        '#createServiceForm button[type="submit"]'
      ).textContent = "Create Service";
    } else {
      // Create new service
      await firebase.createService({
        name,
        description,
        category,
        processingTime,
        files,
      });
      showNotification("Service created successfully!");
    }

    closeModal("createServiceModal");
    document.getElementById("createServiceForm").reset();
    loadServices();
  });

function deleteService(serviceId) {
  if (confirm("Are you sure you want to delete this service?")) {
    const serviceIndex = firebase.data.services.findIndex(
      (s) => s.id === serviceId
    );
    if (serviceIndex !== -1) {
      firebase.data.services[serviceIndex].isActive = false;
      firebase.saveData();
      firebase.log("DELETE_SERVICE", `Service deleted: ${serviceId}`);
      showNotification("Service deleted successfully");
      loadServices();
    }
  }
}

// Event Listeners
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const userType = document.getElementById("userType").value;

  const result = await firebase.login(email, password, userType);

  if (result.success) {
    showNotification("Login successful!");
    closeModal("loginModal");
    showDashboard(userType);
    loadServices();
    loadApplications();
    loadUserProfile();
  } else {
    showNotification(result.message, "error");
  }
});

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const userData = {
      name: document.getElementById("registerName").value,
      email: document.getElementById("registerEmail").value,
      password: document.getElementById("registerPassword").value,
      phone: document.getElementById("registerPhone").value,
      address: document.getElementById("registerAddress").value,
    };

    const result = await firebase.register(userData);

    if (result.success) {
      showNotification("Registration successful! Please login.");
      closeModal("registerModal");
      document.getElementById("registerForm").reset();
    } else {
      showNotification(result.message, "error");
    }
  });

// document
//   .getElementById("createServiceForm")
//   .addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const serviceData = {
//       name: document.getElementById("serviceName").value,
//       description: document.getElementById("serviceDescription").value,
//       category: document.getElementById("serviceCategory").value,
//       processingTime: document.getElementById("processingTime").value,
//     };

//     const result = await firebase.createService(serviceData);

//     if (result.success) {
//       showNotification("Service created successfully!");
//       closeModal("createServiceModal");
//       document.getElementById("createServiceForm").reset();
//       loadServices();
//     } else {
//       showNotification("Failed to create service", "error");
//     }
//   });

document.getElementById("applyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const applicationData = {
    serviceId: document.getElementById("serviceSelect").value,
    reason: document.getElementById("applicationReason").value,
    urgency: document.getElementById("urgency").value,
  };

  const result = await firebase.applyForService(applicationData);

  if (result.success) {
    showNotification("Application submitted successfully!");
    closeModal("applyModal");
    document.getElementById("applyForm").reset();
    loadApplications();
  } else {
    showNotification("Failed to submit application", "error");
  }
});

document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const profileData = {
    name: document.getElementById("profileName").value,
    phone: document.getElementById("profilePhone").value,
    address: document.getElementById("profileAddress").value,
  };

  const result = firebase.updateUserProfile(profileData);

  if (result.success) {
    showNotification("Profile updated successfully!");
    closeModal("profileModal");
    loadUserProfile();
  } else {
    showNotification("Failed to update profile", "error");
  }
});

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

// Fill profile form when opened
function openProfileModal() {
  if (firebase.currentUser) {
    document.getElementById("profileName").value = firebase.currentUser.name;
    document.getElementById("profilePhone").value = firebase.currentUser.phone;
    document.getElementById("profileAddress").value =
      firebase.currentUser.address;
    openModal("profileModal");
  }
}

// Override the profile modal opening
document
  .querySelector("button[onclick=\"openModal('profileModal')\"]")
  ?.setAttribute("onclick", "openProfileModal()");

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  if (firebase.currentUser) {
    showDashboard(firebase.currentUser.type);
    loadServices();
    loadApplications();
    loadUserProfile();
  }
});

// Add search functionality
function searchServices() {
  const searchTerm = document
    .getElementById("serviceSearch")
    ?.value.toLowerCase();
  if (!searchTerm) {
    loadServices();
    return;
  }

  const services = firebase
    .getServices()
    .filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm)
    );

  const servicesList = document.getElementById("servicesList");
  if (servicesList) {
    servicesList.innerHTML = services
      .map(
        (service) => `
                    <div class="service-item">
                        <h4>${service.name}</h4>
                        <p>${service.description}</p>
                        <small>Processing Time: ${service.processingTime}</small>
                    </div>
                `
      )
      .join("");
  }
}

// Add export functionality for applications
function exportApplications() {
  const applications =
    firebase.currentUser.type === "user"
      ? firebase.getUserApplications()
      : firebase.getAllApplications();

  const csvContent =
    "data:text/csv;charset=utf-8," +
    "Application ID,Service,Applicant,Status,Applied Date,Priority\n" +
    applications
      .map((app) => {
        const service = firebase
          .getServices()
          .find((s) => s.id === app.serviceId);
        const user = firebase.data.users.find((u) => u.id === app.userId);
        return `${app.id},${service?.name || "Unknown"},${
          user?.name || "Unknown"
        },${app.status},${new Date(app.appliedAt).toLocaleDateString()},${
          app.urgency
        }`;
      })
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "applications.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Performance optimization: Debounce search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSearch = debounce(searchServices, 300);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    document.getElementById("serviceSearch")?.focus();
  }
  if (e.key === "Escape") {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => (modal.style.display = "none"));
  }
});

function updateUserStats() {
  if (firebase.currentUser?.type === "user") {
    const applications = firebase.getUserApplications();
    const total = applications.length;
    const pending = applications.filter(
      (app) => app.status === "pending"
    ).length;
    const approved = applications.filter(
      (app) => app.status === "approved"
    ).length;

    document.getElementById("userApplicationsCount").textContent = total;
    document.getElementById("pendingApplicationsCount").textContent = pending;
    document.getElementById("approvedApplicationsCount").textContent = approved;
  }
}

function loadApplications() {
  if (firebase.currentUser?.type === "user") {
    const applications = firebase.getUserApplications();
    const myApplications = document.getElementById("myApplications");
    if (myApplications) {
      myApplications.innerHTML = applications.length
        ? applications
            .map((app) => {
              const service = firebase
                .getServices()
                .find((s) => s.id === app.serviceId);
              // Show delete button if application is approved or rejected
              const showDelete =
                app.status === "approved" || app.status === "rejected";
              return `
                <div class="service-item">
                  <h4>${service?.name || "Unknown Service"}</h4>
                  <p><strong>Status:</strong> <span class="status-${
                    app.status
                  }">${app.status.toUpperCase()}</span></p>
                  <p><strong>Applied:</strong> ${new Date(
                    app.appliedAt
                  ).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> ${app.reason}</p>
                  ${
                    app.remarks
                      ? `<p><strong>Remarks:</strong> ${app.remarks}</p>`
                      : ""
                  }
                  ${
                    showDelete
                      ? `<button class="btn btn-danger btn-small" title="Delete" onclick="deleteApplication('${app.id}')">✖</button>`
                      : ""
                  }
                </div>
              `;
            })
            .join("")
        : "<p>No applications found.</p>";
    }
    updateUserStats();
  } else if (
    firebase.currentUser?.type === "officer" ||
    firebase.currentUser?.type === "staff"
  ) {
    const applications = firebase.getAllApplications();
    const container =
      firebase.currentUser.type === "officer"
        ? document.getElementById("allApplications")
        : document.getElementById("staffApplications");

    if (container) {
      container.innerHTML = applications.length
        ? applications
            .map((app) => {
              const service = firebase
                .getServices()
                .find((s) => s.id === app.serviceId);
              const user = firebase.data.users.find((u) => u.id === app.userId);
              const showActions = app.status === "pending";
              // Show delete button if application is approved or rejected
              const showDelete =
                app.status === "approved" || app.status === "rejected";
              return `
                <div class="service-item">
                  <h4>${service?.name || "Unknown Service"}</h4>
                  <p><strong>Applicant:</strong> ${
                    user?.name || "Unknown User"
                  }</p>
                  <p><strong>Status:</strong> <span class="status-${
                    app.status
                  }">${app.status.toUpperCase()}</span></p>
                  <p><strong>Applied:</strong> ${new Date(
                    app.appliedAt
                  ).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> ${app.reason}</p>
                  <p><strong>Priority:</strong> ${app.urgency}</p>
                  ${
                    app.remarks
                      ? `<p><strong>Remarks:</strong> ${app.remarks}</p>`
                      : ""
                  }
                  ${
                    showActions
                      ? `<div class="service-actions">
                          <button class="btn btn-primary btn-small" onclick="updateStatus('${app.id}', 'approved')">Approve</button>
                          <button class="btn btn-secondary btn-small" onclick="updateStatus('${app.id}', 'rejected')">Reject</button>
                          <button class="btn btn-secondary btn-small" onclick="addRemarks('${app.id}')">Add Remarks</button>
                        </div>`
                      : ""
                  }
                  ${
                    showDelete
                      ? `<button class="btn btn-danger btn-small" title="Delete" onclick="deleteApplication('${app.id}')">✖</button>`
                      : ""
                  }
                </div>
              `;
            })
            .join("")
        : "<p>No applications found.</p>";
    }
    updateOfficerStaffStats();
  }
}

// Add this function to handle deleting an application
function deleteApplication(appId) {
  if (confirm("Are you sure you want to delete this application?")) {
    // Remove from data
    firebase.data.applications = firebase.data.applications.filter(
      (a) => a.id !== appId
    );
    firebase.saveData();
    showNotification("Application deleted successfully!");
    loadApplications();
  }
}

// Update stats for officer and staff dashboards
function updateOfficerStaffStats() {
  // Officer Dashboard
  if (firebase.currentUser?.type === "officer") {
    const totalServices = firebase.getServices().length;
    const totalApplications = firebase.getAllApplications().length;
    const pendingReview = firebase
      .getAllApplications()
      .filter((a) => a.status === "pending").length;

    document.getElementById("totalServicesCount").textContent = totalServices;
    document.getElementById("totalApplicationsCount").textContent =
      totalApplications;
    document.getElementById("pendingReviewCount").textContent = pendingReview;
  }
  // Staff Dashboard
  if (firebase.currentUser?.type === "staff") {
    const staffServices = firebase.getServices().length;
    const staffApplications = firebase.getAllApplications().length;
    document.getElementById("staffServicesCount").textContent = staffServices;
    document.getElementById("staffApplicationsCount").textContent =
      staffApplications;
  }
}
showNotification("Check console for Demo Credentials");

console.log("Digital E Gram Panchayat System Initialized");
console.log("Demo Credentials:");
console.log("Officer: admin@panchayat.gov.in / admin123");
console.log("Staff: staff@panchayat.gov.in / staff123");
console.log("Citizen: citizen@example.com / citizen123");
