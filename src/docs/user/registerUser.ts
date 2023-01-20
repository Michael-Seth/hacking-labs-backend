export const registerUser = {
  post: {
    tags: ["User"],
    description: "Create new user",
    operationId: "CreateUser",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/User",
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
      },
      400: {
        description: "All fields are required",
      },
      500: {
        description: "Internal server error",
      },
    },
  },
};
