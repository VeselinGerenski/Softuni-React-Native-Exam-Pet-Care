// Mock data for design-first implementation.
// Replace with Firestore / API later.

export const mockPets = [
  {
    id: "1",
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    birthDate: "2020-03-15",
    neutered: true,
    notes: "Loves to play fetch and swim. Friendly with kids.",
    // Keep pet images deterministic (no random placeholders)
    photoUrl:
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop",
  },
  {
    id: "2",
    name: "Luna",
    species: "Cat",
    breed: "Persian",
    birthDate: "2019-07-22",
    neutered: true,
    notes: "Indoor cat. Prefers quiet spaces. Needs daily brushing.",
    photoUrl:
      "https://images.unsplash.com/photo-1573865526739-10c1d3a26f84?w=800&h=800&fit=crop",
  },
  {
    id: "3",
    name: "Whiskers",
    species: "Cat",
    breed: "Tabby",
    birthDate: "2018-05-10",
    neutered: true,
    notes: "Outdoor/indoor. Very independent.",
    photoUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop",
  },
  {
    id: "4",
    name: "Buddy",
    species: "Dog",
    breed: "Labrador",
    birthDate: "2022-01-20",
    neutered: false,
    notes: "Puppy in training. Very playful.",
    photoUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop",
  },
];

export const mockAppointments = [
  {
    id: "1",
    petId: "1",
    type: "Vaccine",
    dateTime: "2026-02-20T10:00:00",
    reminderEnabled: true,
    notes: "Annual rabies vaccine",
    isCompleted: false,
  },
  {
    id: "2",
    petId: "1",
    type: "Vet Visit",
    dateTime: "2026-03-15T14:30:00",
    reminderEnabled: true,
    notes: "Regular checkup",
    isCompleted: false,
  },
  {
    id: "3",
    petId: "2",
    type: "Grooming",
    dateTime: "2026-02-18T11:00:00",
    reminderEnabled: false,
    notes: "Full grooming session",
    isCompleted: false,
  },
  {
    id: "4",
    petId: "2",
    type: "Medication",
    dateTime: "2026-02-17T09:00:00",
    reminderEnabled: true,
    notes: "Flea treatment",
    isCompleted: true,
  },
  {
    id: "5",
    petId: "3",
    type: "Vet Visit",
    dateTime: "2026-02-25T15:00:00",
    reminderEnabled: false,
    notes: "Check for fleas",
    isCompleted: false,
  },
];

export const mockUserProfile = {
  memberSinceLabel: "February 2026",
};
