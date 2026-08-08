import User from "../models/userModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import OrganizerProfile from "../models/organizerProfileModel.js";
import Event from "../models/eventModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import SystemSetting from "../models/systemSetting.js";
import Notification from "../models/notificationModel.js";
import AuditLog from "../models/auditLogModel.js";
import bcrypt from "bcryptjs";

export const seedDatabase = async () => {
  try {
    // Ensure default admin user exists
    const defaultAdminEmail = "admin@volunteerhub.com";
    const adminExists = await User.findOne({ where: { email: defaultAdminEmail } });
    if (!adminExists) {
      console.log(`Seeding default admin: ${defaultAdminEmail}`);
      const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);
      await User.create({
        name: "Default Admin",
        email: defaultAdminEmail,
        password: hashedAdminPassword,
        role: "admin",
        department: "Information Technology",
        phone: "+94771234567",
        status: "active",
      });
      console.log("Default admin seeded successfully.");
    }

    // Check if seeding is already done
    const userCount = await User.count();
    if (userCount > 1) {
      console.log("Database already has data. Skipping seed.");
      return;
    }

    console.log("Starting database seeding...");
    const hashedAdminPassword = await bcrypt.hash("123456", 10);
    const hashedStudentPassword = await bcrypt.hash("123456", 10);
    const hashedOrganizerPassword = await bcrypt.hash("123456", 10);

    // 1. Seed Users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedAdminPassword,
      role: "admin",
      department: "Information Technology",
      phone: "+94771234567",
      status: "active",
    });

    const students = [];
    const studentData = [];

    for (const data of studentData) {
      const u = await User.create({
        name: data.name,
        email: data.email,
        password: hashedStudentPassword,
        role: "student",
        department: data.faculty,
        phone: "+94770000000",
        status: "active",
      });
      await StudentProfile.create({
        userId: u.id,
        studentId: data.studentId,
        faculty: data.faculty,
        skills: ["Teamwork", "Communication", "Event Planning"],
      });
      students.push(u);
    }

    const organizers = [];
    const organizerData = [];

    for (const data of organizerData) {
      const u = await User.create({
        name: data.name,
        email: data.email,
        password: hashedOrganizerPassword,
        role: "organizer",
        department: "Student Center",
        phone: "+94771111111",
        status: "active",
      });
      await OrganizerProfile.create({
        userId: u.id,
        organizationName: data.orgName,
      });
      organizers.push(u);
    }

    // 2. Seed System Settings
    await SystemSetting.create({
      id: 1,
      siteName: "VolunteerHub",
      adminEmail: "admin@gmail.com",
      maxEventsPerClub: 10,
      eventApprovalRequired: true,
      notificationsEnabled: true,
      darkModeEnabled: false,
      registrationOpen: true,
      maintenanceMode: false,
    });

    // 3. Seed Events
    const events = [];
    const eventData = [
      {
        title: "Beach Cleanup Drive",
        description: "Join us in cleaning up Mount Lavinia beach to preserve marine life and protect the coastal ecosystem. Bags, gloves, and refreshments will be provided.",
        location: "Mount Lavinia Beach",
        eventDate: "2026-06-10",
        time: "07:30 AM",
        volunteerRequired: 50,
        reputationPoints: 20,
        approvalStatus: "Approved",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800",
        UserId: organizers[0].id,
      },
      {
        title: "Blood Donation Camp",
        description: "Donate blood and save a life. Organized in collaboration with the National Blood Transfusion Service.",
        location: "University Health Center",
        eventDate: "2026-06-15",
        time: "09:00 AM",
        volunteerRequired: 30,
        reputationPoints: 15,
        approvalStatus: "Approved",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800",
        UserId: organizers[1].id,
      },
      {
        title: "Tree Planting Marathon",
        description: "Help reforestation and create a green campus. Let's plant 500 saplings around the university premises.",
        location: "University Grounds",
        eventDate: "2026-06-20",
        time: "08:00 AM",
        volunteerRequired: 40,
        reputationPoints: 10,
        approvalStatus: "Approved",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
        UserId: organizers[0].id,
      },
      {
        title: "Web Development Bootcamp",
        description: "Volunteers needed to mentor school students in basic HTML, CSS, and JavaScript coding challenges.",
        location: "Computer Lab 03",
        eventDate: "2026-06-28",
        time: "10:00 AM",
        volunteerRequired: 15,
        reputationPoints: 25,
        approvalStatus: "Pending",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
        UserId: organizers[1].id,
      },
      {
        title: "Food Distribution Drive",
        description: "Help package and deliver surplus meals to low-income families in the local municipal area.",
        location: "Community Center Hall",
        eventDate: "2026-07-02",
        time: "04:00 PM",
        volunteerRequired: 25,
        reputationPoints: 15,
        approvalStatus: "Pending",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
        UserId: organizers[2].id,
      },
      {
        title: "First Aid & CPR Training",
        description: "A certified basic life support workshop. Volunteers will assist in registrations and demo practice sessions.",
        location: "Main Auditorium",
        eventDate: "2026-07-10",
        time: "08:30 AM",
        volunteerRequired: 20,
        reputationPoints: 10,
        approvalStatus: "Rejected",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
        UserId: organizers[2].id,
      },
    ];

    for (const data of eventData) {
      const e = await Event.create(data);
      events.push(e);
    }

    // 4. Seed Volunteer Registrations (Student-Event link)
    await VolunteerRegistration.create({ UserId: students[0].id, EventId: events[0].id });
    await VolunteerRegistration.create({ UserId: students[0].id, EventId: events[1].id });
    await VolunteerRegistration.create({ UserId: students[1].id, EventId: events[0].id });
    await VolunteerRegistration.create({ UserId: students[2].id, EventId: events[2].id });
    await VolunteerRegistration.create({ UserId: students[3].id, EventId: events[1].id });

    // 5. Seed Audit Logs
    await AuditLog.create({
      action: "System Initialization",
      performedBy: admin.id,
      details: "Completed standard database seeding, creating default student and organizer accounts.",
    });
    await AuditLog.create({
      action: "Default Admin Logged In",
      performedBy: admin.id,
      details: "Administrator session established from IP address 127.0.0.1.",
    });
    await AuditLog.create({
      action: "Settings Updated",
      performedBy: admin.id,
      details: "Site name updated to 'VolunteerHub' and registration limits verified.",
    });

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};
