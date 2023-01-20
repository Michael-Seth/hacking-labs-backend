export const getConfig: any = {
  get: {
    tags: ["User"],
    description: "Get OpenVPN configuration file",
    operationId: "GetConfig",
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      200: {
        description: "Success",
      },
      401: {
        description: "Authorization failed. Kindly login to continue.",
      },
      500: {
        description: "Internal Server Error",
      },
      503: {
        description: "Service Unavailable",
      },
    },
  },
};
