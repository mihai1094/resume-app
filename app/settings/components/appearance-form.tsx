"use client";

import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Moon, Sun, Monitor } from "lucide-react";

export function AppearanceForm() {
    const { theme, setTheme } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize how the application looks on your device.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    defaultValue={theme}
                    onValueChange={setTheme}
                    className="grid grid-cols-3 gap-4"
                >
                    <div>
                        <RadioGroupItem value="light" id="light" className="peer sr-only" />
                        <Label
                            htmlFor="light"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                            <Sun className="mb-3 h-6 w-6" />
                            Light
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                        <Label
                            htmlFor="dark"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                            <Moon className="mb-3 h-6 w-6" />
                            Dark
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="system" id="system" className="peer sr-only" />
                        <Label
                            htmlFor="system"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                            <Monitor className="mb-3 h-6 w-6" />
                            System
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
