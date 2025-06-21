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
  "+992 (88) 888-88-88": {
    phoneNumber: "+992 (88) 888-88-88",
    isActive: true,
    userId: 17,
    fullName: "Ericson"
  },
  "+992 (22) 222-22-22": {
    phoneNumber: "+992 (22) 222-22-22",
    isActive: true,
    userId: 18,
    fullName: "Sony Vaio0"
  },
  "seller@autoauction.tj": {
    phoneNumber: "seller@autoauction.tj",
    isActive: true,
    userId: 2,
    fullName: "Продавец"
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