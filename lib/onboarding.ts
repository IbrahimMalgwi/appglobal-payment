import { IdType, SignupFormState, SignupStep, UserType } from "./types";

export interface IdentityDetails {
  firstName: string;
  lastName: string;
}

/**
 * Placeholder identity lookup used by the sign-up wizard's KYC step.
 *
 * TODO: replace with real BVN/NIN verification API call. Response should pre-fill
 * personal info once the backend exists — no separate "Personal Information" step is
 * shown to the user in the meantime.
 */
export function mockFetchIdentityDetails(
  idType: IdType,
  idNumber: string
): Promise<IdentityDetails> {
  return new Promise((resolve) => {
    // idType/idNumber will be forwarded to the verification provider once it exists.
    void idType;
    void idNumber;
    setTimeout(() => resolve({ firstName: "Jane", lastName: "Doe" }), 900);
  });
}

/** Where a freshly signed-up (or logged-in) user lands, mirroring the login buttons. */
export function dashboardPathForRole(role: UserType): string {
  if (role === "business") return "/select-account";
  if (role === "aro") return "/aro/overview";
  return "/dashboard";
}

/**
 * The ordered steps for a given role. Personal users skip the Business/Corporate
 * Information (KYB) step entirely — it is backend-managed and invisible to them for now.
 */
export function stepsForRole(role: UserType | null): SignupStep[] {
  if (role === "business" || role === "aro") {
    return ["role", "identity", "business-info", "security"];
  }
  return ["role", "identity", "security"];
}

/** Fresh wizard state, starting the Board of Directors list with one empty row. */
export function createInitialSignupState(): SignupFormState {
  return {
    role: null,
    idType: null,
    idNumber: "",
    businessInfo: {
      businessName: "",
      registeredAddress: "",
      cacNumber: "",
      directors: [{ name: "", designation: "" }],
      certificateOfIncorporation: null,
      boardResolution: null,
    },
    passcode: "",
    transactionPin: "",
  };
}
