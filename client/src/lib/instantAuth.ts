// Instant authentication system - bypasses slow database calls
interface InstantUser {
  phoneNumber: string;
  isActive: boolean;
  userId: number;
  fullName: string;
}

// Pre-configured users for instant access
const INSTANT_USERS: Record<string, InstantUser> = {
  "+992 (55) 555-55-55": {
    phoneNumber: "+992 (55) 555-55-55",
    isActive: true,
    userId: 19,
    fullName: "Тестовый пользователь"
  },
  "+992 (22) 222-22-22": {
    phoneNumber: "+992 (22) 222-22-22", 
    isActive: true,
    userId: 3,
    fullName: "Покупатель"
  },
  "+992 (99) 999-99-99": {
    phoneNumber: "+992 (99) 999-99-99",
    isActive: true,
    userId: 12,
    fullName: "Пользователь"
  }
};

export const getInstantUserData = (phoneNumber: string): InstantUser | null => {
  return INSTANT_USERS[phoneNumber] || null;
};

export const isInstantUser = (phoneNumber: string): boolean => {
  return phoneNumber in INSTANT_USERS;
};

// For production, this would sync with database periodically
export const updateInstantUserData = (phoneNumber: string, userData: Partial<InstantUser>) => {
  if (INSTANT_USERS[phoneNumber]) {
    INSTANT_USERS[phoneNumber] = {
      ...INSTANT_USERS[phoneNumber],
      ...userData
    };
  }
};