"use client";

import { Certification } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Plus,
  Trash2,
  Award,
  Building2,
  Calendar,
  Link as LinkIcon,
  KeyRound,
} from "lucide-react";

interface CertificationsFormProps {
  certifications: Certification[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Certification>) => void;
  onRemove: (id: string) => void;
}

export function CertificationsForm({
  certifications,
  onAdd,
  onUpdate,
  onRemove,
}: CertificationsFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Badge variant="secondary">{certifications.length} certifications</Badge>
      </div>
      {certifications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
          {/* Ghost preview of what certs look like */}
          <div className="flex justify-center gap-2 mb-4 opacity-40">
            <div className="bg-muted rounded-md px-3 py-1.5 text-xs font-medium">AWS Certified</div>
            <div className="bg-muted rounded-md px-3 py-1.5 text-xs font-medium">PMP</div>
            <div className="bg-muted rounded-md px-3 py-1.5 text-xs font-medium">Google Cloud</div>
          </div>
          <Award className="w-12 h-12 mx-auto text-primary/60 mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Add Your Certifications</h3>
          <p className="text-muted-foreground text-sm mb-2 max-w-sm mx-auto">
            Certifications validate your expertise and can boost your resume's impact by up to 23%
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Popular: AWS, Google Cloud, PMP, Scrum Master, CompTIA
          </p>
          <Button onClick={onAdd} className="btn-press">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Certification
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <Card
                key={cert.id}
                className="border-border/50 relative card-hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="sm:flex sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-4 sm:pr-12">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`cert-name-${cert.id}`}
                            className="flex items-center gap-2"
                          >
                            <Award className="w-4 h-4" />
                            Certification Name{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`cert-name-${cert.id}`}
                            value={cert.name}
                            onChange={(e) =>
                              onUpdate(cert.id, { name: e.target.value })
                            }
                            placeholder="AWS Solutions Architect"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`cert-issuer-${cert.id}`}
                              className="flex items-center gap-2"
                            >
                              <Building2 className="w-4 h-4" />
                              Issuer
                            </Label>
                            <Input
                              id={`cert-issuer-${cert.id}`}
                              value={cert.issuer}
                              onChange={(e) =>
                                onUpdate(cert.id, { issuer: e.target.value })
                              }
                              placeholder="Amazon Web Services"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`cert-date-${cert.id}`}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Issue Date
                            </Label>
                            <MonthPicker
                              value={cert.date}
                              onChange={(value) =>
                                onUpdate(cert.id, { date: value })
                              }
                              placeholder="Select issue date"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`cert-expiry-${cert.id}`}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Expiry Date (Optional)
                            </Label>
                            <MonthPicker
                              value={cert.expiryDate || ""}
                              onChange={(value) =>
                                onUpdate(cert.id, { expiryDate: value })
                              }
                              placeholder="Select expiry date"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`cert-credential-${cert.id}`}
                              className="flex items-center gap-2"
                            >
                              <KeyRound className="w-4 h-4" />
                              Credential ID (Optional)
                            </Label>
                            <Input
                              id={`cert-credential-${cert.id}`}
                              value={cert.credentialId || ""}
                              onChange={(e) =>
                                onUpdate(cert.id, { credentialId: e.target.value })
                              }
                              placeholder="Credential ID"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`cert-url-${cert.id}`}
                            className="flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Verification URL (Optional)
                          </Label>
                          <Input
                            id={`cert-url-${cert.id}`}
                            type="url"
                            value={cert.url || ""}
                            onChange={(e) =>
                              onUpdate(cert.id, { url: e.target.value })
                            }
                            placeholder="https://"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(cert.id)}
                        className="text-destructive hover:text-destructive absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:ml-4"
                        aria-label="Remove certification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={onAdd} variant="outline" className="w-full btn-press border-dashed hover:border-solid hover:border-primary/50">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Certification
          </Button>
        </>
      )}
    </div>
  );
}






