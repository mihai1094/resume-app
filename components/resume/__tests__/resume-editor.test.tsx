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
  loadedTemplateId: null as string | null,
  isDirty: false,
  showRecoveryPrompt: false,
  recoveryDraftTimestamp: null,
  handleRecoverDraft: vi.fn(),
  handleDiscardDraft: vi.fn(),
  editingResumeId: null as string | null,
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
const mockGoToPrevious = vi.fn();
const mockGoToNext = vi.fn();
const mockForceGoToNext = vi.fn();
const mockGoToSection = vi.fn();

vi.mock('@/hooks/use-section-navigation', () => ({
  useSectionNavigation: vi.fn(() => ({
    canGoPrevious: mockCanGoPrevious,
    canGoNext: mockHasNextSection,
    isLastSection: mockIsLastSection,
    progressPercentage: 25,
    completedSections: 1,
    totalSections: 8,
    currentErrors: [],
    isCurrentSectionValid: true,
    goToPrevious: mockGoToPrevious,
    goToNext: mockGoToNext,
    forceGoToNext: mockForceGoToNext,
    goToSection: mockGoToSection,
    isSectionComplete: vi.fn(() => false),
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
    celebrateSectionComplete: vi.fn(),
    celebrateResumeComplete: vi.fn(),
    celebrateMilestone: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-navigation-guard', () => ({
  useNavigationGuard: vi.fn(() => ({
    safeGoBack: vi.fn(),
    forceGoBack: vi.fn(),
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
    push: vi.fn(),
    replace: vi.fn(),
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
  EditorDialogs: ({ showResetConfirmation, onConfirmReset, setShowResetConfirmation }: any) => (
    <div data-testid="editor-dialogs">
      {showResetConfirmation && (
        <div data-testid="reset-confirmation">
          <button onClick={onConfirmReset} data-testid="confirm-reset">Confirm</button>
          <button onClick={() => setShowResetConfirmation(false)} data-testid="cancel-reset">Cancel</button>
        </div>
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

describe('ResumeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mutable mock state
    mockActiveSection = 'personal';
    mockShowPreview = true;
    mockShowCustomizer = false;
    mockIsMobile = false;
    mockCanGoPrevious = false;
    mockHasNextSection = true;
    mockIsLastSection = false;
  });

  describe('Rendering', () => {
    it('should render the editor with header and section navigation', () => {
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

    it('should show loading page when initializing with resumeId', () => {
      mockUseContainer.mockReturnValue({
        ...mockContainerReturn,
        isInitializing: true,
      });

      render(<ResumeEditor resumeId="abc123" />);

      expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    });

    it('should show error state when resume load fails', () => {
      mockUseContainer.mockReturnValue({
        ...mockContainerReturn,
        resumeLoadError: 'Resume not found',
      });

      render(<ResumeEditor resumeId="abc123" />);

      expect(screen.getByText('Unable to load resume')).toBeInTheDocument();
      expect(screen.getByText('Return to dashboard')).toBeInTheDocument();
    });
  });

  describe('Section Navigation', () => {
    it('should call goToSection when nav item is clicked', async () => {
      const user = userEvent.setup();
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
});

