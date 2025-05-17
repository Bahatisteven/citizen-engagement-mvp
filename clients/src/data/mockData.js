export const mockComplaints = [
  { id: 'C001', title: 'Road Pothole', description: 'Large pothole on Main Street', category: 'Infrastructure', status: 'Open', citizen: 'user1', assignedTo: 'public-works', createdAt: '2025-05-10', responses: [] },
  { id: 'C002', title: 'Street Light Not Working', description: 'Street light out at 123 Oak Ave', category: 'Infrastructure', status: 'In Progress', citizen: 'user1', assignedTo: 'public-works', createdAt: '2025-05-08', responses: [{text: 'Scheduled for repair next week', from: 'public-works', date: '2025-05-12'}] },
  { id: 'C003', title: 'Noise Complaint', description: 'Loud construction before allowed hours', category: 'Noise', status: 'Resolved', citizen: 'user2', assignedTo: 'police', createdAt: '2025-05-01', responses: [{text: 'Warning issued to construction company', from: 'police', date: '2025-05-02'}, {text: 'Follow-up confirmed compliance', from: 'police', date: '2025-05-03'}] },
  { id: 'C004', title: 'Medical Center Wait Times', description: 'Excessive wait times at City Hospital', category: 'Health', status: 'Open', citizen: 'user3', assignedTo: 'health', createdAt: '2025-05-15', responses: [] },
  { id: 'C005', title: 'Park Maintenance', description: 'Central Park playground equipment broken', category: 'Recreation', status: 'In Progress', citizen: 'user1', assignedTo: 'parks', createdAt: '2025-05-05', responses: [{text: 'Inspection scheduled', from: 'parks', date: '2025-05-09'}] },
];

export const mockUsers = [
  { id: 'user1', email: 'citizen@example.com', password: 'password', name: 'John Citizen', role: 'citizen' },
  { id: 'user2', email: 'citizen2@example.com', password: 'password', name: 'Mary Public', role: 'citizen' },
  { id: 'user3', email: 'citizen3@example.com', password: 'password', name: 'Bob Resident', role: 'citizen' },
  { id: 'public-works', email: 'public-works@gov.example', password: 'password', name: 'Public Works Dept', role: 'institution', category: 'Infrastructure' },
  { id: 'police', email: 'police@gov.example', password: 'password', name: 'Police Department', role: 'institution', category: 'Noise' },
  { id: 'health', email: 'health@gov.example', password: 'password', name: 'Health Department', role: 'institution', category: 'Health' },
  { id: 'parks', email: 'parks@gov.example', password: 'password', name: 'Parks & Recreation', role: 'institution', category: 'Recreation' },
  { id: 'admin', email: 'admin@gov.example', password: 'password', name: 'System Administrator', role: 'admin' },
];