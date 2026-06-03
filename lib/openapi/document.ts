/**
 * OpenAPI 3 document for Capstone inspection API routes.
 * Served at GET /api/openapi and rendered at /api-docs.
 */
export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Capstone — Building Accessibility Inspection API",
    version: "1.0.0",
    description:
      "REST API for the Capstone (มยผ. 6301) inspection app. Most routes require a NextAuth session cookie. " +
      "Auth registration/OTP routes and this spec are public. Uploads use UploadThing at `/api/uploadthing`. " +
      "Sign-in/session: NextAuth handlers under `/api/auth/*` (see README).",
  },
  servers: [{ url: "/", description: "Current host" }],
  tags: [
    { name: "Auth", description: "Registration, OTP, password reset (public)" },
    { name: "Users", description: "Profile" },
    { name: "Projects", description: "Project CRUD and list" },
    { name: "Inspection", description: "Scores, sections, criteria groups" },
    { name: "Collaboration", description: "Share, invite, join" },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "authjs.session-token",
        description:
          "Paste the cookie VALUE after logging in via /login (DevTools → Application → Cookies). " +
          "Local dev: cookie name authjs.session-token. " +
          "HTTPS production: __Secure-authjs.session-token (same value field in Authorize). " +
          "If you are logged in on this host, Try it out may work without Authorize (credentials: include).",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
      Project: {
        type: "object",
        description: "Serialized project (shape from serializeProjectForUser)",
      },
    },
  },
  security: [{ sessionCookie: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Register account and send email OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["firstName", "lastName", "email", "password"],
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User created; OTP sent" },
          "400": { description: "Validation error" },
          "409": { description: "Email already in use" },
        },
      },
    },
    "/api/auth/check-email": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Check if email exists and verification status",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "{ exists: boolean, isEmailVerified?: boolean }",
          },
        },
      },
    },
    "/api/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Verify registration OTP",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code"],
                properties: {
                  email: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Email verified" },
          "400": { description: "Invalid or expired OTP" },
        },
      },
    },
    "/api/auth/verify-otp/resend": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Resend registration OTP",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "OTP resent" } },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Send password-reset OTP",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "OTP sent if user exists" } },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Reset password with OTP",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code", "password"],
                properties: {
                  email: { type: "string" },
                  code: { type: "string" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Password updated" } },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get own profile",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "{ user: User }" },
          "401": { description: "Unauthorized" },
          "403": { description: "Can only read own id" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update profile fields",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  profileImg: { type: "string" },
                  phone: { type: "string" },
                  address: { type: "string" },
                  jobTitle: { type: "string" },
                  organization: { type: "string" },
                  department: { type: "string" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "{ user: User }" },
          "400": { description: "Validation / no fields" },
        },
      },
    },
    "/api/project": {
      get: {
        tags: ["Projects"],
        summary: "List owned + shared projects",
        responses: {
          "200": {
            description: "Array of serialized projects",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Project" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create project (profile must be complete)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["projectName", "location", "criteriaGroupIds"],
                properties: {
                  projectName: { type: "string" },
                  location: { type: "string" },
                  description: { type: "string" },
                  criteriaGroupIds: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created project document" },
          "403": { description: "Incomplete profile (missingFields)" },
        },
      },
    },
    "/api/project/{projectId}": {
      get: {
        tags: ["Projects"],
        summary: "Get one project",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Serialized project" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Update project metadata or mark completed",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  projectName: { type: "string" },
                  description: { type: "string" },
                  coverImg: { type: "string" },
                  status: { type: "string", enum: ["draft", "completed"] },
                  buildingType: { type: "string" },
                  institution: {
                    type: "object",
                    properties: { address: { type: "string" } },
                  },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Updated project" } },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete project (owner only)",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "{ message: 'Deleted' }" } },
      },
    },
    "/api/project/{projectId}/critiria/{critiriaId}": {
      patch: {
        tags: ["Inspection"],
        summary: "Score / note / images for one criterion (note spelling critiria)",
        parameters: [
          { name: "projectId", in: "path", required: true, schema: { type: "string" } },
          { name: "critiriaId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  score: { type: "integer", enum: [0, 1, 2] },
                  note: { type: "string" },
                  img: { type: "string" },
                  imgs: { type: "array", items: { type: "string" } },
                  expectedUpdatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated criterion (includes updatedAt)" },
          "409": { description: "Concurrent edit conflict" },
        },
      },
    },
    "/api/project/{projectId}/add-groups": {
      post: {
        tags: ["Inspection"],
        summary: "Add criteria groups to existing project",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["criteriaGroupIds"],
                properties: {
                  criteriaGroupIds: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: { "200": { description: "{ success: true }" } },
      },
    },
    "/api/project/{projectId}/section": {
      post: {
        tags: ["Inspection"],
        summary: "Add a standards section by code",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: { code: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "{ success: true }" } },
      },
    },
    "/api/project/{projectId}/section/{sectionCode}": {
      delete: {
        tags: ["Inspection"],
        summary: "Remove a section from project",
        parameters: [
          { name: "projectId", in: "path", required: true, schema: { type: "string" } },
          { name: "sectionCode", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "{ success: true }" } },
      },
    },
    "/api/project/{projectId}/collaboration": {
      post: {
        tags: ["Collaboration"],
        summary: "Enable / disable collaboration or rotate invite",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action"],
                properties: {
                  action: {
                    type: "string",
                    enum: ["enable", "disable", "rotate_invite"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "{ collaborationEnabled, inviteUrl? }",
          },
        },
      },
    },
    "/api/project/{projectId}/invite": {
      get: {
        tags: ["Collaboration"],
        summary: "Get invite URL when collaboration enabled",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "{ collaborationEnabled, inviteUrl }" },
          "400": { description: "Collaboration disabled" },
        },
      },
    },
    "/api/project/{projectId}/leave": {
      post: {
        tags: ["Collaboration"],
        summary: "Editor leaves shared project (removes self from members)",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "{ ok: true }" } },
      },
    },
    "/api/join/{token}": {
      post: {
        tags: ["Collaboration"],
        summary: "Accept invite and join as editor",
        parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "{ projectId, role, alreadyMember }",
          },
          "404": { description: "Invalid or expired token" },
        },
      },
    },
    "/api/uploadthing": {
      post: {
        tags: ["Projects"],
        security: [{ sessionCookie: [] }],
        summary: "UploadThing route handler (profileImg, inspectionImg, projectCoverImg)",
        description:
          "Not a simple REST upload; used by @uploadthing/react client. Requires session per slug.",
        responses: { "200": { description: "UploadThing protocol responses" } },
      },
    },
  },
} as const;
