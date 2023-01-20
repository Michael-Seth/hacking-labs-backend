export const components: any = {
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              email: {
                type: "string",
                description: "Email address",
                example: "john@doe.com",
              },
              username: {
                type: "string",
                description: "Username",
                example: "john.doe",
              },
              firstname: {
                type: "string",
                description: "First name",
                example: "John",
              },
              lastname: {
                type: "string",
                description: "Last name",
                example: "Doe",
              },
              password: {
                type: "string",
                description: "Password",
                example: "********",
              },
            },
          },
        },
      },
      LoginUser: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              username: {
                type: "string",
                description: "Enter your username",
                example: "john.doe",
              },
              password: {
                type: "string",
                description: "Enter your password",
                example: "********",
              },
            },
          },
        },
      },
      LoggedInUser: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "Email address",
            example: "john@doe.com",
          },
          username: {
            type: "string",
            description: "Username",
            example: "john.doe",
          },
          firstname: {
            type: "string",
            description: "First name",
            example: "John",
          },
          lastname: {
            type: "string",
            description: "Last name",
            example: "Doe",
          },
          token: {
            type: "string",
            description: "JWT access token",
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1ZGVmaXNoIiwiaWF0IjoxNjUxNTI0MDE4LCJleHAiOjE2NTE2MTA0MTh9.GhKzpdFaefxxEKYjMWW0RXxR5P5L0rkFuYjzFgKpphM",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Error message",
            example: "Not found",
          },
          internal_code: {
            type: "string",
            description: "Internal error code",
            example: "Invalid parameters",
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      UnauthorizedError: {
        description: "Token is missing, invalid or expired.",
      },
    },
  },
};
