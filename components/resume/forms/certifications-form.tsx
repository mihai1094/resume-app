"use client";

import { useState, useMemo } from "react";
import { Certification } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MonthPicker } from "@/components/ui/month-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Award,
  BookOpen,
  Building2,
  Calendar,
  Link as LinkIcon,
  KeyRound,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SECTION_GUIDANCE } from "@/lib/constants/section-guidance";

interface CertificationsFormProps {
  certifications: Certification[];
  onAddCertification: () => void;
  onAddCourse: () => void;
  onUpdate: (id: string, updates: Partial<Certification>) => void;
  onRemove: (id: string) => void;
}

export function CertificationsForm({
  certifications,
  onAddCertification,
  onAddCourse,
  onUpdate,
  onRemove,
}: CertificationsFormProps) {
  const [activeTab, setActiveTab] = useState<"all" | "certifications" | "courses">("all");

  // Filter items based on active tab
  const filteredItems = useMemo(() => {
    if (activeTab === "all") return certifications;
    if (activeTab === "certifications") {
      return certifications.filter((c) => c.type !== "course");
    }
    return certifications.filter((c) => c.type === "course");
  }, [certifications, activeTab]);

  // Count items by type
  const certCount = certifications.filter((c) => c.type !== "course").length;
  const courseCount = certifications.filter((c) => c.type === "course").length;

  const handleAdd = () => {
    if (activeTab === "courses") {
      onAddCourse();
    } else {
      onAddCertification();
    }
  };

  const renderEmptyState = () => {
    const isCourseTab = activeTab === "courses";
    const Icon = isCourseTab ? BookOpen : Award;
    const title = isCourseTab ? "Add Your Courses" : "Add Your Certifications";
    const description = isCourseTab
      ? "Online courses and training programs show your commitment to continuous learning"
      : "Certifications validate your expertise and can boost your resume's impact by up to 23%";
    const examples = isCourseTab
      ? "Popular: Coursera, Udemy, LinkedIn Learning, edX"
      : "Popular: AWS, Google Cloud, PMP, Scrum Master, CompTIA";
    const buttonText = isCourseTab ? "Add Course" : "Add Certification";
    const onAddAction = isCourseTab ? onAddCourse : onAddCertification;

    return (
      <EmptyState
        icon={Icon}
        title={title}
        description={`${description} ${examples}`}
        actionLabel={buttonText}
        onAction={onAddAction}
        tips={SECTION_GUIDANCE.certifications?.tips}
      />
    );
  };

  const renderItem = (item: Certification, index: number) => {
    const isCourse = item.type === "course";
    const Icon = isCourse ? BookOpen : Award;
    const nameLabel = isCourse ? "Course Name" : "Certification Name";
    const namePlaceholder = isCourse ? "Complete React Developer" : "AWS Solutions Architect";
    const issuerLabel = isCourse ? "Platform / Institution" : "Issuer";
    const issuerPlaceholder = isCourse ? "Coursera, Udemy, etc." : "Amazon Web Services";

    return (
      <Card
        key={item.id}
        className="border-border/50 relative card-hover-lift animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Type badge */}
            <div className="flex items-center justify-between">
              <Badge variant={isCourse ? "secondary" : "default"} className="text-xs">
                {isCourse ? (
                  <>
                    <BookOpen className="w-3 h-3 mr-1" />
                    Course
                  </>
                ) : (
                  <>
                    <Award className="w-3 h-3 mr-1" />
                    Certification
                  </>
                )}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="text-destructive hover:text-destructive h-8 w-8"
                aria-label={`Remove ${isCourse ? "course" : "certification"}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`item-name-${item.id}`} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {nameLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`item-name-${item.id}`}
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                  placeholder={namePlaceholder}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`item-issuer-${item.id}`} className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {issuerLabel}
                  </Label>
                  <Input
                    id={`item-issuer-${item.id}`}
                    value={item.issuer}
                    onChange={(e) => onUpdate(item.id, { issuer: e.target.value })}
                    placeholder={issuerPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`item-date-${item.id}`} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {isCourse ? "Completion Date" : "Issue Date"}
                  </Label>
                  <MonthPicker
                    value={item.date}
                    onChange={(value) => onUpdate(item.id, { date: value })}
                    placeholder={isCourse ? "Select completion date" : "Select issue date"}
                    maxDate={!isCourse && item.expiryDate ? item.expiryDate : undefined}
                  />
                </div>
              </div>

              {/* Expiry date only for certifications */}
              {!isCourse && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`item-expiry-${item.id}`} className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Expiry Date (Optional)
                    </Label>
                    <MonthPicker
                      value={item.expiryDate || ""}
                      onChange={(value) => onUpdate(item.id, { expiryDate: value })}
                      placeholder="Select expiry date"
                      minDate={item.date || undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-credential-${item.id}`} className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Credential ID (Optional)
                    </Label>
                    <Input
                      id={`item-credential-${item.id}`}
                      value={item.credentialId || ""}
                      onChange={(e) => onUpdate(item.id, { credentialId: e.target.value })}
                      placeholder="Credential ID"
                    />
                  </div>
                </div>
              )}

              {/* Credential ID for courses (simplified) */}
              {isCourse && (
                <div className="space-y-2">
                  <Label htmlFor={`item-credential-${item.id}`} className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Certificate ID (Optional)
                  </Label>
                  <Input
                    id={`item-credential-${item.id}`}
                    value={item.credentialId || ""}
                    onChange={(e) => onUpdate(item.id, { credentialId: e.target.value })}
                    placeholder="Certificate ID"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={`item-url-${item.id}`} className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Verification URL (Optional)
                </Label>
                <Input
                  id={`item-url-${item.id}`}
                  type="url"
                  value={item.url || ""}
                  onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              All
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {certifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Certs
              {certCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {certCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Courses
              {courseCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {courseCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

        </div>

        <TabsContent value="all" className="mt-6">
          {certifications.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {certifications.map((item, index) => renderItem(item, index))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          {filteredItems.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, index) => renderItem(item, index))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          {filteredItems.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, index) => renderItem(item, index))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick add button at bottom when items exist */}
      {certifications.length > 0 && (
        <Button
          onClick={handleAdd}
          variant="outline"
          className="w-full btn-press border-dashed hover:border-solid hover:border-primary/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another {activeTab === "courses" ? "Course" : activeTab === "certifications" ? "Certification" : "Item"}
        </Button>
      )}
    </div>
  );
}
