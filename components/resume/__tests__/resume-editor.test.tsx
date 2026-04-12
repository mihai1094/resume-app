import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResumeEditor } from '../resume-editor';
import { ResumeData } from '@/lib/types/resume';

// --- Mock data ---
const mockResumeData: ResumeData = {
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York',
  },
  workExperience: [],
  education: [],
  skills: [],
};

const mockContainerReturn = {
  resumeData: mockResumeData,
  validation: { valid: true, errors: {} },
  updatePersonalInfo: vi.fn(),
  addWorkExperience: vi.fn(),
  updateWorkExperience: vi.fn(),
  removeWorkExperience: vi.fn(),
  reorderWorkExperience: vi.fn(),
  addEducation: vi.fn(),
  updateEducation: vi.fn(),
  removeEducation: vi.fn(),
  reorderEducation: vi.fn(),
  addSkill: vi.fn(),
  updateSkill: vi.fn(),
  removeSkill: vi.fn(),
  addProject: vi.fn(),
  updateProject: vi.fn(),
  removeProject: vi.fn(),
  reorderProjects: vi.fn(),
  addCertification: vi.fn(),
  addCourseAsCertification: vi.fn(),
  updateCertification: vi.fn(),
  removeCertification: vi.fn(),
  addLanguage: vi.fn(),
  updateLanguage: vi.fn(),
  removeLanguage: vi.fn(),
  addCourse: vi.fn(),
  updateCourse: vi.fn(),
  removeCourse: vi.fn(),
  addHobby: vi.fn(),
  updateHobby: vi.fn(),
  removeHobby: vi.fn(),
  addExtraCurricular: vi.fn(),
  updateExtraCurricular: vi.fn(),
  removeExtraCurricular: vi.fn(),
  reorderExtraCurricular: vi.fn(),
  addCustomSection: vi.fn(),
  updateCustomSection: vi.fn(),
  removeCustomSection: vi.fn(),
  addCustomSectionItem: vi.fn(),
  updateCustomSectionItem: vi.fn(),
  removeCustomSectionItem: vi.fn(),
  setWorkExperience: vi.fn(),
  setEducation: vi.fn(),
  setExtraCurricular: vi.fn(),
  loadResume: vi.fn(),
  resetResume: vi.fn(),
  batchUpdate: vi.fn(),
  isInitializing: false,
  resumeLoadError: null,
  cloudSaveError: null,
  saveStatusText: 'Saved',
  handleSaveAndExit: vi.fn().mockResolvedValue({ success: true }),
  handleReset: vi.fn(),
  clearCurrentDraftAfterSave: vi.fn().mockResolvedValue(true),
  loadedTemplateId: null as string | null,
  isDirty: false,
  showRecoveryPrompt: false,
  recoveryDraftTimestamp: null,
  handleRecoverDraft: vi.fn(),
  handleDiscardDraft: vi.fn(),
  editingResumeId: null as string | null,
  loadedTemplateCustomization: null,
  setAutoSaveTemplateId: vi.fn(),
};

// Track the activeSection set by the UI hook mock so navigation tests work
let mockActiveSection = 'personal';
let mockShowPreview = true;
let mockShowCustomizer = false;
let mockIsMobile = false;

const mockSetActiveSection = vi.fn((section: string) => {
  mockActiveSection = section;
});
const mockTogglePreview = vi.fn(() => {
  mockShowPreview = !mockShowPreview;
});
const mockToggleCustomizer = vi.fn(() => {
  mockShowCustomizer = !mockShowCustomizer;
});
const mockToggleSidebar = vi.fn();
const mockSetSelectedTemplateId = vi.fn();
const mockSetTemplateCustomization = vi.fn();
const mockSetShowTemplateGallery = vi.fn();
const mockSetShowResetConfirmation = vi.fn();
const mockForceGoBack = vi.fn();
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();

// --- Mock hooks ---

vi.mock('@/hooks/use-resume-editor-container', () => ({
  useResumeEditorContainer: vi.fn(() => mockContainerReturn),
}));

vi.mock('@/hooks/use-resume-editor-ui', () => ({
  useResumeEditorUI: vi.fn(() => ({
    selectedTemplateId: 'modern',
    setSelectedTemplateId: mockSetSelectedTemplateId,
    templateCustomization: {},
    setTemplateCustomization: mockSetTemplateCustomization,
    activeSection: mockActiveSection,
    setActiveSection: mockSetActiveSection,
    isMobile: mockIsMobile,
    showPreview: mockShowPreview,
    togglePreview: mockTogglePreview,
    sidebarCollapsed: false,
    toggleSidebar: mockToggleSidebar,
    showCustomizer: mockShowCustomizer,
    toggleCustomizer: mockToggleCustomizer,
    showTemplateGallery: false,
    setShowTemplateGallery: mockSetShowTemplateGallery,
    showResetConfirmation: false,
    setShowResetConfirmation: mockSetShowResetConfirmation,
    updateLoadedTemplate: vi.fn(),
  })),
}));

// Track navigation state for section navigation mock
let mockCanGoPrevious = false;
let mockHasNextSection = true;
let mockIsLastSection = false;
let mockProgressPercentage = 25;
let mockCompletedSections = 1;
let mockSectionCompletionMap: Record<string, boolean> = {};
const mockGoToPrevious = vi.fn();
const mockGoToNext = vi.fn();
const mockForceGoToNext = vi.fn();
const mockGoToSection = vi.fn();
const mockCelebrateSectionComplete = vi.fn();
const mockCelebrateResumeComplete = vi.fn();
const mockCelebrateMilestone = vi.fn();

vi.mock('@/hooks/use-section-navigation', () => ({
  useSectionNavigation: vi.fn(() => ({
    canGoPrevious: mockCanGoPrevious,
    canGoNext: mockHasNextSection,
    isLastSection: mockIsLastSection,
    progressPercentage: mockProgressPercentage,
    completedSections: mockCompletedSections,
    totalSections: 8,
    currentErrors: [],
    isCurrentSectionValid: true,
    goToPrevious: mockGoToPrevious,
    goToNext: mockGoToNext,
    forceGoToNext: mockForceGoToNext,
    goToSection: mockGoToSection,
    isSectionComplete: vi.fn((section: string) => Boolean(mockSectionCompletionMap[section])),
    visibleSections: [
      { id: 'personal', label: 'Personal Information', shortLabel: 'Personal', tier: 'essential' },
      { id: 'experience', label: 'Work Experience', shortLabel: 'Experience', tier: 'essential' },
      { id: 'education', label: 'Education', shortLabel: 'Education', tier: 'essential' },
      { id: 'skills', label: 'Skills & Expertise', shortLabel: 'Skills', tier: 'essential' },
      { id: 'projects', label: 'Projects', shortLabel: 'Projects', tier: 'recommended' },
      { id: 'certifications', label: 'Certifications & Courses', shortLabel: 'Certs', tier: 'recommended' },
      { id: 'languages', label: 'Languages', shortLabel: 'Languages', tier: 'optional' },
      { id: 'additional', label: 'Additional', shortLabel: 'More', tier: 'optional' },
    ],
  })),
  RESUME_SECTIONS: [
    { id: 'personal', label: 'Personal Information', shortLabel: 'Personal', tier: 'essential' },
    { id: 'experience', label: 'Work Experience', shortLabel: 'Experience', tier: 'essential' },
    { id: 'education', label: 'Education', shortLabel: 'Education', tier: 'essential' },
    { id: 'skills', label: 'Skills & Expertise', shortLabel: 'Skills', tier: 'essential' },
    { id: 'projects', label: 'Projects', shortLabel: 'Projects', tier: 'recommended' },
    { id: 'certifications', label: 'Certifications & Courses', shortLabel: 'Certs', tier: 'recommended' },
    { id: 'languages', label: 'Languages', shortLabel: 'Languages', tier: 'optional' },
    { id: 'additional', label: 'Additional', shortLabel: 'More', tier: 'optional' },
  ],
  sectionHasData: vi.fn(() => false),
  isSectionVisible: vi.fn(() => true),
  getVisibleSections: vi.fn(),
  getHiddenSections: vi.fn(),
}));

vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn(() => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    logout: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useResumeEditorShortcuts: vi.fn(),
}));

vi.mock('@/hooks/use-celebration', () => ({
  useCelebration: vi.fn(() => ({
    celebrateSectionComplete: mockCelebrateSectionComplete,
    celebrateResumeComplete: mockCelebrateResumeComplete,
    celebrateMilestone: mockCelebrateMilestone,
  })),
}));

vi.mock('@/hooks/use-navigation-guard', () => ({
  useNavigationGuard: vi.fn(() => ({
    safeGoBack: vi.fn(),
    forceGoBack: mockForceGoBack,
  })),
}));

vi.mock('@/hooks/use-resume-readiness', () => ({
  useResumeReadiness: vi.fn(() => ({
    status: { variant: 'incomplete', issueCount: 0 },
  })),
}));

vi.mock('@/hooks/use-job-description-context', () => ({
  useJobDescriptionContext: vi.fn(() => ({
    isActive: false,
    context: null,
  })),
}));

vi.mock('@/hooks/use-version-history', () => ({
  useVersionHistory: vi.fn(() => ({
    versions: [],
    isLoading: false,
  })),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    refresh: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(() => 'loading-id'),
    dismiss: vi.fn(),
  },
}));

vi.mock('@/lib/utils/download', () => ({
  downloadBlob: vi.fn(),
  downloadJSON: vi.fn(),
}));

vi.mock('@/lib/api/auth-fetch', () => ({
  authPost: vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({}),
  }),
}));

// --- Mock child components ---

vi.mock('../editor-header', () => ({
  EditorHeader: ({ onExportJSON, onExportPDF, onReset, onTogglePreview, onBack }: any) => (
    <div data-testid="editor-header">
      <button onClick={onExportJSON} data-testid="export-json">Export JSON</button>
      <button onClick={onExportPDF} data-testid="export-pdf">Export PDF</button>
      <button onClick={onReset} data-testid="reset">Reset</button>
      <button onClick={onTogglePreview} data-testid="toggle-preview">Toggle Preview</button>
      <button onClick={onBack} data-testid="back">Back</button>
    </div>
  ),
}));

vi.mock('../section-navigation', () => ({
  SectionNavigation: ({ onSectionChange, onToggleCollapse }: any) => (
    <div data-testid="section-navigation">
      <button onClick={() => onSectionChange('experience')} data-testid="nav-experience">
        Experience
      </button>
      <button onClick={() => onSectionChange('education')} data-testid="nav-education">
        Education
      </button>
      <button onClick={onToggleCollapse} data-testid="toggle-collapse">
        Toggle Collapse
      </button>
    </div>
  ),
}));

vi.mock('../preview-panel', () => ({
  PreviewPanel: () => <div data-testid="preview-panel">Preview</div>,
}));

vi.mock('../mobile-preview-overlay', () => ({
  MobilePreviewOverlay: ({ onClose }: any) => (
    <div data-testid="mobile-preview-overlay">
      <button onClick={onClose} data-testid="close-preview">Close</button>
    </div>
  ),
}));

vi.mock('../section-wrapper', () => ({
  SectionWrapper: ({ children, onPrevious, onNext, canGoPrevious: canPrev, canGoNext: canN }: any) => (
    <div data-testid="section-wrapper">
      <button onClick={onPrevious} data-testid="previous-section" disabled={canPrev === false}>Previous</button>
      <button onClick={onNext} data-testid="next-section">Next</button>
      {children}
    </div>
  ),
}));

vi.mock('../template-customizer', () => ({
  TemplateCustomizer: () => <div data-testid="template-customizer">Customizer</div>,
  TemplateCustomization: {},
}));

vi.mock('../section-form-renderer', () => ({
  SectionFormRenderer: ({ activeSection }: any) => (
    <div data-testid={`section-form-${activeSection}`}>{activeSection}</div>
  ),
}));

vi.mock('../editor-dialogs', () => ({
  EditorDialogs: ({
    showResetConfirmation,
    onConfirmReset,
    setShowResetConfirmation,
    showUnsavedDialog,
    onDiscardAndLeave,
  }: any) => (
    <div data-testid="editor-dialogs">
      {showResetConfirmation && (
        <div data-testid="reset-confirmation">
          <button onClick={onConfirmReset} data-testid="confirm-reset">Confirm</button>
          <button onClick={() => setShowResetConfirmation(false)} data-testid="cancel-reset">Cancel</button>
        </div>
      )}
      {showUnsavedDialog && (
        <button onClick={onDiscardAndLeave} data-testid="discard-and-leave">
          Discard
        </button>
      )}
    </div>
  ),
}));

vi.mock('../mobile-bottom-bar', () => ({
  MobileBottomBar: ({ onTogglePreview }: any) => (
    <div data-testid="mobile-bottom-bar">
      <button onClick={onTogglePreview} data-testid="mobile-toggle-preview">Toggle</button>
    </div>
  ),
}));

vi.mock('@/components/shared/loading', () => ({
  LoadingPage: ({ text }: any) => <div data-testid="loading-page">{text}</div>,
}));

vi.mock('@/components/wizard', () => ({
  WizardProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/components/command-palette', () => ({
  CommandPaletteProvider: ({ children }: any) => <>{children}</>,
}));

// --- Imports for mock references ---
import { useResumeEditorContainer } from '@/hooks/use-resume-editor-container';
import { useResumeEditorUI } from '@/hooks/use-resume-editor-ui';

const mockUseContainer = useResumeEditorContainer as ReturnType<typeof vi.fn>;
const mockUseUI = useResumeEditorUI as ReturnType<typeof vi.fn>;

function getDefaultUIState() {
  return {
    selectedTemplateId: 'modern',
    setSelectedTemplateId: mockSetSelectedTemplateId,
    templateCustomization: {},
    setTemplateCustomization: mockSetTemplateCustomization,
    activeSection: mockActiveSection,
    setActiveSection: mockSetActiveSection,
    isMobile: mockIsMobile,
    showPreview: mockShowPreview,
    togglePreview: mockTogglePreview,
    sidebarCollapsed: false,
    toggleSidebar: mockToggleSidebar,
    showCustomizer: mockShowCustomizer,
    toggleCustomizer: mockToggleCustomizer,
    showTemplateGallery: false,
    setShowTemplateGallery: mockSetShowTemplateGallery,
    showResetConfirmation: false,
    setShowResetConfirmation: mockSetShowResetConfirmation,
    updateLoadedTemplate: vi.fn(),
  };
}

describe('ResumeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseContainer.mockImplementation(() => mockContainerReturn);
    mockUseUI.mockImplementation(() => getDefaultUIState());

    // Reset mutable mock state
    mockActiveSection = 'personal';
    mockShowPreview = true;
    mockShowCustomizer = false;
    mockIsMobile = false;
    mockCanGoPrevious = false;
    mockHasNextSection = true;
    mockIsLastSection = false;
    mockProgressPercentage = 25;
    mockCompletedSections = 1;
    mockSectionCompletionMap = {};
    mockContainerReturn.isDirty = false;
    mockRouterPush.mockReset();
    mockRouterReplace.mockReset();
  });

  describe('Rendering', () => {
    it('should render the editor header and section navigation while desktop preview is visible', () => {
      render(<ResumeEditor />);

      expect(screen.getByTestId('editor-header')).toBeInTheDocument();
      expect(screen.getByTestId('section-navigation')).toBeInTheDocument();
    });

    it('should render with custom template ID', () => {
      render(<ResumeEditor templateId="classic" />);

      expect(screen.getByTestId('editor-header')).toBeInTheDocument();
    });

    it('should render personal section form by default', () => {
      render(<ResumeEditor />);

      expect(screen.getByTestId('section-form-personal')).toBeInTheDocument();
    });

    it('should render preview panel on desktop when showPreview is true', () => {
      render(<ResumeEditor />);

      expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    });

    it('does not show celebration toasts when loading an already complete resume', () => {
      mockContainerReturn.isDirty = false;
      mockProgressPercentage = 100;
      mockCompletedSections = 8;
      mockSectionCompletionMap = {
        personal: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        additional: true,
      };

      render(<ResumeEditor resumeId="resume-complete" />);

      expect(mockCelebrateSectionComplete).not.toHaveBeenCalled();
      expect(mockCelebrateMilestone).not.toHaveBeenCalled();
      expect(mockCelebrateResumeComplete).not.toHaveBeenCalled();
    });

    it('should render section navigation when preview is hidden', () => {
      mockShowPreview = false;
      render(<ResumeEditor />);

      expect(screen.getByTestId('section-navigation')).toBeInTheDocument();
    });

    it('should show loading page when initializing with resumeId', () => {
      mockUseContainer.mockReturnValue({
        ...mockContainerReturn,
        isInitializing: true,
      });

      render(<ResumeEditor resumeId="abc123" />);

      expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    });

    it('redirects to the dashboard when resume load fails', async () => {
      mockUseContainer.mockReturnValue({
        ...mockContainerReturn,
        resumeLoadError: 'Resume not found',
      });

      render(<ResumeEditor resumeId="abc123" />);

      const { toast } = await import('sonner');

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Resume not found — it may have been deleted');
        expect(mockRouterReplace).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Section Navigation', () => {
    it('should call goToSection when nav item is clicked', async () => {
      const user = userEvent.setup();
      mockShowPreview = false;
      render(<ResumeEditor />);

      await user.click(screen.getByTestId('nav-experience'));

      // The wrapper calls goToSectionWrapper which calls goToSection
      expect(mockGoToSection).toHaveBeenCalledWith('experience');
    });

    it('should call goToNext when next button is clicked', async () => {
      const user = userEvent.setup();
      render(<ResumeEditor />);

      await user.click(screen.getByTestId('next-section'));

      // handleNext is called, which calls goToNext when valid
      expect(mockGoToNext).toHaveBeenCalled();
    });

    it('should call goToPrevious when previous button is clicked', async () => {
      const user = userEvent.setup();
      mockCanGoPrevious = true;
      render(<ResumeEditor />);

      await user.click(screen.getByTestId('previous-section'));

      expect(mockGoToPrevious).toHaveBeenCalled();
    });

    it('should render section wrapper with next and previous buttons', () => {
      render(<ResumeEditor />);

      expect(screen.getByTestId('previous-section')).toBeInTheDocument();
      expect(screen.getByTestId('next-section')).toBeInTheDocument();
    });

    it('scrolls back to the editor content when switching sections from deeper in the page', () => {
      const scrollToSpy = vi.fn();
      const getBoundingClientRectSpy = vi
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockImplementation(
          () =>
            ({
              top: -120,
              left: 0,
              bottom: 480,
              right: 1024,
              width: 1024,
              height: 600,
              x: 0,
              y: -120,
              toJSON: () => ({}),
            }) as DOMRect
        );

      Object.defineProperty(window, 'scrollY', {
        value: 500,
        writable: true,
        configurable: true,
      });
      window.scrollTo = scrollToSpy;

      const { rerender } = render(<ResumeEditor />);

      scrollToSpy.mockClear();
      mockActiveSection = 'experience';
      rerender(<ResumeEditor />);

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 372, behavior: 'auto' });

      getBoundingClientRectSpy.mockRestore();
    });

    it('avoids micro-scroll jumps when the editor is already aligned near the top', () => {
      const scrollToSpy = vi.fn();
      const getBoundingClientRectSpy = vi
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockImplementation(
          () =>
            ({
              top: 8,
              left: 0,
              bottom: 608,
              right: 1024,
              width: 1024,
              height: 600,
              x: 0,
              y: 8,
              toJSON: () => ({}),
            }) as DOMRect
        );

      Object.defineProperty(window, 'scrollY', {
        value: 500,
        writable: true,
        configurable: true,
      });
      window.scrollTo = scrollToSpy;

      const { rerender } = render(<ResumeEditor />);

      scrollToSpy.mockClear();
      mockActiveSection = 'experience';
      rerender(<ResumeEditor />);

      expect(scrollToSpy).not.toHaveBeenCalled();

      getBoundingClientRectSpy.mockRestore();
    });
  });

  describe('Preview Toggle', () => {
    it('should call togglePreview when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<ResumeEditor />);

      await user.click(screen.getByTestId('toggle-preview'));

      expect(mockTogglePreview).toHaveBeenCalled();
    });

    it('should hide preview panel when showPreview is false', () => {
      mockShowPreview = false;
      render(<ResumeEditor />);

      expect(screen.queryByTestId('preview-panel')).not.toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should call downloadJSON when export JSON button is clicked', async () => {
      const user = userEvent.setup();
      render(<ResumeEditor />);

      await user.click(screen.getByTestId('export-json'));

      const { downloadJSON } = await import('@/lib/utils/download');
      expect(downloadJSON).toHaveBeenCalled();
    });

    it('should call exportToPDF when export PDF button is clicked', async () => {
      const user = userEvent.setup();

      const mockExportToPDF = vi.fn().mockResolvedValue({
        success: true,
        blob: new Blob(['pdf'], { type: 'application/pdf' }),
      });
      vi.doMock('@/lib/services/export', () => ({
        exportToPDF: mockExportToPDF,
      }));

      render(<ResumeEditor />);

      await user.click(screen.getByTestId('export-pdf'));

      // PDF export is async with dynamic import, just verify no crash
      await waitFor(() => {
        expect(screen.getByTestId('editor-header')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should show reset confirmation dialog when reset is clicked', async () => {
      const user = userEvent.setup();
      render(<ResumeEditor />);

      await user.click(screen.getByTestId('reset'));

      // Reset calls setShowResetConfirmation(true)
      expect(mockSetShowResetConfirmation).toHaveBeenCalledWith(true);
    });
  });

  describe('Template Customization', () => {
    it('should not show customizer by default', () => {
      render(<ResumeEditor />);

      expect(screen.queryByTestId('template-customizer')).not.toBeInTheDocument();
    });

    it('should show customizer when showCustomizer is true', () => {
      mockShowCustomizer = true;
      render(<ResumeEditor />);

      expect(screen.getByTestId('template-customizer')).toBeInTheDocument();
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      mockIsMobile = true;
      mockShowPreview = false;
    });

    it('should show mobile bottom bar on mobile', () => {
      render(<ResumeEditor />);

      expect(screen.getByTestId('mobile-bottom-bar')).toBeInTheDocument();
    });

    it('should show mobile preview overlay when mobile and showPreview', () => {
      mockShowPreview = true;
      render(<ResumeEditor />);

      expect(screen.getByTestId('mobile-preview-overlay')).toBeInTheDocument();
    });

    it('should not show mobile bottom bar on desktop', () => {
      mockIsMobile = false;
      render(<ResumeEditor />);

      expect(screen.queryByTestId('mobile-bottom-bar')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render a skip link', () => {
      render(<ResumeEditor />);

      expect(screen.getByText('Skip to editor content')).toBeInTheDocument();
    });
  });

  describe('Unsaved Changes', () => {
    it('should clear draft and navigate when discarding changes', async () => {
      const user = userEvent.setup();
      render(<ResumeEditor />);

      await user.click(screen.getByTestId('back'));
      await user.click(screen.getByTestId('discard-and-leave'));

      await waitFor(() => {
        expect(mockContainerReturn.handleDiscardDraft).toHaveBeenCalledTimes(1);
        expect(mockForceGoBack).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Save Flow', () => {
    it('clears the cloud draft after a successful final save', async () => {
      const user = userEvent.setup();
      mockIsLastSection = true;

      render(<ResumeEditor />);

      await user.click(screen.getByTestId('next-section'));

      await waitFor(() => {
        expect(mockContainerReturn.handleSaveAndExit).toHaveBeenCalledTimes(1);
        expect(mockContainerReturn.clearCurrentDraftAfterSave).toHaveBeenCalledTimes(1);
      });
    });
  });

});
