import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CoverLetterEditor } from "../cover-letter-editor";
import type { CoverLetterData } from "@/lib/types/cover-letter";

const {
  mockPush,
  mockPrefetch,
  mockSearchParamGet,
  mockLoadCoverLetter,
  mockSaveDraft,
  mockClearSavedData,
  mockGetDoc,
  mockDoc,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockPrefetch: vi.fn(),
  mockSearchParamGet: vi.fn(),
  mockLoadCoverLetter: vi.fn(),
  mockSaveDraft: vi.fn(),
  mockClearSavedData: vi.fn(),
  mockGetDoc: vi.fn(),
  mockDoc: vi.fn(() => ({ id: "doc-ref" })),
}));

const baseCoverLetterData: CoverLetterData = {
  id: "cl-1",
  jobTitle: "",
  jobReference: "",
  date: "2026-04-11",
  recipient: {
    name: "",
    title: "",
    company: "",
    department: "",
    address: "",
  },
  senderName: "Jane Doe",
  senderEmail: "jane@example.com",
  senderPhone: "1234567890",
  senderLocation: "Madrid",
  senderLinkedin: "",
  senderWebsite: "",
  salutation: "Dear Hiring Manager,",
  openingParagraph: "",
  bodyParagraphs: ["", ""],
  closingParagraph: "",
  signOff: "Sincerely,",
  templateId: "modern",
  tone: "professional",
  createdAt: "2026-04-11T12:00:00.000Z",
  updatedAt: "2026-04-11T12:00:00.000Z",
};

const mockUser = { id: "user-1", email: "jane@example.com", name: "Jane" };
const mockResumeData = {
  personalInfo: {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "1234567890",
    location: "Madrid",
  },
};

let mockCoverLetterData = { ...baseCoverLetterData };
let mockIsDirty = false;
let mockSavedData: CoverLetterData | null = null;
let mockHasLoadedSavedData = true;
let mockLastSaved: Date | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    prefetch: mockPrefetch,
  }),
  useSearchParams: () => ({
    get: mockSearchParamGet,
  }),
}));

vi.mock("firebase/firestore", () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
}));

vi.mock("@/lib/firebase/config", () => ({
  db: {},
}));

vi.mock("@/hooks/use-resume", () => ({
  useResume: () => ({
    resumeData: mockResumeData,
  }),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({
    user: mockUser,
  }),
}));

vi.mock("@/hooks/use-saved-resumes", () => ({
  useSavedResumes: () => ({
    resumes: [],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-saved-cover-letters", () => ({
  useSavedCoverLetters: () => ({
    coverLetters: [],
    isLoading: false,
    saveCoverLetter: vi.fn(),
    updateCoverLetter: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-cover-letter", () => ({
  useCoverLetter: () => ({
    coverLetterData: mockCoverLetterData,
    updateJobInfo: vi.fn(),
    updateRecipient: vi.fn(),
    updateSenderInfo: vi.fn(),
    syncFromPersonalInfo: vi.fn(),
    updateSalutation: vi.fn(),
    updateOpeningParagraph: vi.fn(),
    updateBodyParagraph: vi.fn(),
    addBodyParagraph: vi.fn(),
    removeBodyParagraph: vi.fn(),
    updateClosingParagraph: vi.fn(),
    updateSignOff: vi.fn(),
    updateTemplate: vi.fn(),
    resetCoverLetter: vi.fn(),
    loadCoverLetter: mockLoadCoverLetter,
    validateCoverLetter: () => ({ valid: true, errors: [] }),
    completionPercentage: () => 25,
    isDirty: mockIsDirty,
  }),
}));

vi.mock("@/hooks/use-local-storage", () => ({
  useLocalStorage: () => ({
    value: mockSavedData,
    setValue: mockSaveDraft,
    clearValue: mockClearSavedData,
    hasLoaded: mockHasLoadedSavedData,
    isSaving: false,
    lastSaved: mockLastSaved,
  }),
  getSaveStatus: () => "Saved just now",
}));

vi.mock("../forms/cover-letter-form", () => ({
  CoverLetterForm: ({ activeSection }: { activeSection: string }) => (
    <div data-testid="cover-letter-form">{activeSection}</div>
  ),
}));

vi.mock("../templates", () => ({
  CoverLetterRenderer: () => <div data-testid="cover-letter-preview" />,
}));

vi.mock("../generate-cover-letter-dialog", () => ({
  GenerateCoverLetterDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}));

vi.mock("@/components/resume/mobile-section-tabs", () => ({
  MobileSectionTabs: () => <div data-testid="mobile-tabs" />,
}));

vi.mock("@/lib/utils/download", () => ({
  downloadBlob: vi.fn(),
  downloadJSON: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    child: () => ({
      error: vi.fn(),
      warn: vi.fn(),
    }),
  },
}));

describe("CoverLetterEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCoverLetterData = { ...baseCoverLetterData };
    mockIsDirty = false;
    mockSavedData = null;
    mockHasLoadedSavedData = true;
    mockLastSaved = null;
    mockSearchParamGet.mockImplementation((key: string) => {
      if (key === "id") return null;
      if (key === "fresh") return null;
      if (key === "preview") return null;
      return null;
    });
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
    });
    Object.defineProperty(window, "innerWidth", {
      value: 1280,
      writable: true,
      configurable: true,
    });
  });

  it("loads an existing cover letter when the route has ?id=", async () => {
    const firestoreLetter = {
      data: {
        ...baseCoverLetterData,
        id: "remote-letter",
        templateId: "executive",
        openingParagraph: "Loaded from Firestore.",
      },
    };

    mockSearchParamGet.mockImplementation((key: string) => {
      if (key === "id") return "remote-letter";
      return null;
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => firestoreLetter,
    });

    render(<CoverLetterEditor />);

    await waitFor(() =>
      expect(mockLoadCoverLetter).toHaveBeenCalledWith(firestoreLetter.data)
    );
    expect(mockDoc).toHaveBeenCalledWith(
      {},
      "users",
      "user-1",
      "savedCoverLetters",
      "remote-letter"
    );
  });

  it("loads the local draft when creating a new letter without ?id=", async () => {
    mockSavedData = {
      ...baseCoverLetterData,
      id: "local-draft",
      openingParagraph: "Loaded from local draft.",
    };
    mockLastSaved = new Date("2026-04-11T12:10:00.000Z");

    render(<CoverLetterEditor />);

    await waitFor(() =>
      expect(mockLoadCoverLetter).toHaveBeenCalledWith(mockSavedData)
    );
    expect(screen.getByText("Saved just now")).toBeInTheDocument();
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it("auto-saves dirty new drafts to localStorage after initialization", async () => {
    mockIsDirty = true;

    render(<CoverLetterEditor />);

    await waitFor(() =>
      expect(mockSaveDraft).toHaveBeenCalledWith(mockCoverLetterData)
    );
  });
});
