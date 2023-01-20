export const loginUser = {
  post: {
    tags: ["User"],
    description: "Login user",
    operationId: "LoginUser",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/LoginUser",
          },
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoggedInUser",
            },
          },
        },
      },
      400: {
        description: "All fields are required",
      },
      401: {
        description: "Incorrect username or password",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  },
};
