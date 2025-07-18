// Mock authentication service for development/testing
export interface MockUser {
  id: string;
  email: string;
  username: string;
  profile?: {
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

class MockAuthService {
  private users: Map<
    string,
    { email: string; password: string; user: MockUser }
  > = new Map();
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // Create a default test user
    this.createUser('test@studyquest.com', 'TestPass123!', 'testuser');
    this.createUser('demo@example.com', 'Demo123!', 'demouser');

    // Load from localStorage if available
    const savedUser = localStorage.getItem('mockAuth_currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        console.warn('Failed to load saved user');
      }
    }
  }

  private createUser(email: string, password: string, username: string) {
    const user: MockUser = {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      username,
      profile: {
        username,
        firstName: username.charAt(0).toUpperCase() + username.slice(1),
        lastName: 'User',
      },
    };

    this.users.set(email, { email, password, user });
    return user;
  }

  async signIn(email: string, password: string): Promise<MockUser> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const userRecord = this.users.get(email);
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password');
    }

    this.currentUser = userRecord.user;
    localStorage.setItem(
      'mockAuth_currentUser',
      JSON.stringify(this.currentUser)
    );

    // Notify listeners
    this.listeners.forEach(listener => listener(this.currentUser));

    return this.currentUser;
  }

  async signUp(
    email: string,
    password: string,
    username: string
  ): Promise<MockUser> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const user = this.createUser(email, password, username);
    this.currentUser = user;
    localStorage.setItem(
      'mockAuth_currentUser',
      JSON.stringify(this.currentUser)
    );

    // Notify listeners
    this.listeners.forEach(listener => listener(this.currentUser));

    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('mockAuth_currentUser');

    // Notify listeners
    this.listeners.forEach(listener => listener(null));
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);

    // Call immediately with current state
    callback(this.currentUser);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          },
        },
      },
    };
  }

  async getSession() {
    return {
      user: this.currentUser,
      access_token: this.currentUser ? 'mock_token' : null,
    };
  }
}

export const mockAuthService = new MockAuthService();
