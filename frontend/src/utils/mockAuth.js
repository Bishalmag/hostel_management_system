export const mockAuthService = {
  login: async (email, password) => {
    if (email && password) {
      return {
        success: true,
        user: {
          id: 1,
          name: "Bishal Gharti",
          email: "ghartimagarbishal87@gmail.com",
        },
      };
    }

    return { success: false, message: "Invalid credentials" };
  },

  signup: async (name, email, password) => {
    if (name && email && password) {
      return {
        success: true,
        user: {
          id: Date.now(),
          name,
          email,
        },
      };
    }

    return { success: false, message: "Missing fields" };
  },
};