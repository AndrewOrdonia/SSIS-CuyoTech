const users = {
  student1:    { password: "pass", user: { id: 1, name: "Juan Dela Cruz", username: "student1",    role: "student" } },
  registrar1:  { password: "pass", user: { id: 2, name: "Maria Santos",   username: "registrar1",  role: "registrar" } },
  cashier1:    { password: "pass", user: { id: 3, name: "Pedro Reyes",    username: "cashier1",    role: "cashier" } },
  department1: { password: "pass", user: { id: 4, name: "Ana Lopez",      username: "department1", role: "department" } },
  admin:       { password: "pass", user: { id: 5, name: "Admin User",     username: "admin",       role: "admin" } },
};

export function mockLogin(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const entry = users[username];
      if (!entry || entry.password !== password) {
        reject({ response: { status: 422, data: { errors: { username: ["Invalid credentials"] } } } });
        return;
      }
      resolve({ data: { user: entry.user, token: "mock-token-" + username } });
    }, 400);
  });
}

export const mockGrades = [
  { id: 1, course: { code: "CS101", title: "Intro to Computing",   units: 3 }, grade: 1.5 },
  { id: 2, course: { code: "MATH101", title: "College Algebra",    units: 3 }, grade: 2.0 },
  { id: 3, course: { code: "ENG101", title: "English Communication", units: 3 }, grade: 1.75 },
];

export const mockSubjects = [
  { id: 1, code: "CS101",   title: "Intro to Computing",    units: 3, schedule: "MWF 9:00-10:00" },
  { id: 2, code: "CS102",   title: "Data Structures",       units: 3, schedule: "TTh 10:30-12:00" },
];

export const mockDocTypes = [
  { id: 1, name: "Transcript of Records (TOR)", fee: 150 },
  { id: 2, name: "Certificate of Registration (COR)", fee: 50 },
  { id: 3, name: "Certificate of Good Moral", fee: 75 },
];