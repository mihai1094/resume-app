import { useState, useCallback } from "react";
import { TemplateId } from "@/lib/constants/templates";
import {
    TemplateCustomizationDefaults,
    DEFAULT_TEMPLATE_CUSTOMIZATION,
    type SectionId,
} from "@/lib/constants/defaults";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useResumeEditorState(initialTemplateId: TemplateId = "modern") {
    const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(initialTemplateId);
    const [activeSection, setActiveSection] = useState<SectionId>("personal");
    const [isMobile, setIsMobile] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const { value: sidebarCollapsed, setValue: setSidebarCollapsed } = useLocalStorage("editor-sidebar-collapsed", true);
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [showTemplateGallery, setShowTemplateGallery] = useState(false);
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [templateCustomization, setTemplateCustomization] = useState<TemplateCustomizationDefaults>({
        ...DEFAULT_TEMPLATE_CUSTOMIZATION,
    });

    const togglePreview = useCallback(() => setShowPreview(prev => !prev), []);
    const toggleCustomizer = useCallback(() => setShowCustomizer(prev => !prev), []);
    const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), [setSidebarCollapsed]);

    return {
        // Template state
        selectedTemplateId,
        setSelectedTemplateId,
        templateCustomization,
        setTemplateCustomization,

        // Section state
        activeSection,
        setActiveSection,

        // UI state
        isMobile,
        setIsMobile,
        showPreview,
        setShowPreview,
        togglePreview,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        showCustomizer,
        setShowCustomizer,
        toggleCustomizer,
        showTemplateGallery,
        setShowTemplateGallery,
        showResetConfirmation,
        setShowResetConfirmation,
    };
}
