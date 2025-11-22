"use client";

import { useEffect, useState, useRef } from "react";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PerfTestPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const runBenchmark = async () => {
        setIsRunning(true);
        setResults([]);
        setProgress(0);

        try {
            // Wait for editor to load
            await new Promise(r => setTimeout(r, 2000));

            // Test 1: Typing Latency
            addResult("--- Test 1: Typing Latency (Summary Field) ---");
            // The ID is generated from the label "Professional Summary"
            const summaryInput = document.getElementById('textarea-professional-summary') as HTMLTextAreaElement;

            if (summaryInput) {
                // Focus the input
                summaryInput.focus();

                let totalTime = 0;
                const chars = "This is a performance test string for typing latency.";
                const iterations = chars.length;

                for (let i = 0; i < iterations; i++) {
                    const start = performance.now();

                    // Simulate React change event
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                    nativeInputValueSetter?.call(summaryInput, summaryInput.value + chars[i]);

                    const event = new Event('input', { bubbles: true });
                    summaryInput.dispatchEvent(event);

                    // Wait for paint
                    await new Promise<void>(resolve => {
                        requestAnimationFrame(() => {
                            setTimeout(resolve, 0);
                        });
                    });

                    const end = performance.now();
                    totalTime += (end - start);
                    setProgress((i / iterations) * 50);
                }

                const avgLatency = totalTime / iterations;
                addResult(`Average Latency per Char: ${avgLatency.toFixed(2)}ms`);
                addResult(`Status: ${avgLatency < 16 ? "✅ Excellent (<16ms)" : avgLatency < 50 ? "⚠️ Acceptable (<50ms)" : "❌ Poor (>50ms)"}`);
            } else {
                addResult("❌ Error: Summary input not found. ID 'textarea-professional-summary' missing.");
            }

            // Test 2: Section Switching
            addResult("\n--- Test 2: Section Switching ---");
            // Find buttons that switch sections (this relies on the DOM structure of SectionNavigation)
            // We'll look for buttons with specific text content OR title attribute (when collapsed)
            const findButtonByText = (text: string) => {
                return Array.from(document.querySelectorAll('button')).find(b =>
                    b.textContent?.trim() === text ||
                    b.textContent?.includes(text) ||
                    b.getAttribute('title') === text
                );
            };

            const expButton = findButtonByText("Experience");
            const personalButton = findButtonByText("Personal");

            if (expButton && personalButton) {
                const startSwitch = performance.now();
                expButton.click();

                await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));

                const endSwitch = performance.now();
                addResult(`Switch to Experience: ${(endSwitch - startSwitch).toFixed(2)}ms`);

                // Switch back
                const startBack = performance.now();
                personalButton.click();
                await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
                const endBack = performance.now();
                addResult(`Switch to Personal: ${(endBack - startBack).toFixed(2)}ms`);

            } else {
                addResult("❌ Error: Navigation buttons not found. Looked for 'Experience' and 'Personal'.");
            }
            setProgress(100);
            addResult("\n✅ Benchmark Complete");

        } catch (e) {
            addResult(`❌ Error: ${e}`);
        } finally {
            setIsRunning(false);
        }
    };

    const addResult = (msg: string) => {
        setResults(prev => [...prev, msg]);
    };

    return (
        <div className="relative min-h-screen">
            {/* Control Panel Overlay */}
            <div className="fixed top-4 right-4 z-[100] w-80">
                <Card className="p-4 shadow-xl border-2 border-primary/20 bg-background/95 backdrop-blur">
                    <h2 className="font-bold mb-2">Performance Benchmark</h2>

                    {!isRunning ? (
                        <Button onClick={runBenchmark} className="w-full mb-4">
                            Run Benchmark
                        </Button>
                    ) : (
                        <div className="space-y-2 mb-4">
                            <div className="text-xs text-muted-foreground">Running tests...</div>
                            <Progress value={progress} />
                        </div>
                    )}

                    <div className="bg-muted p-2 rounded text-xs font-mono h-48 overflow-y-auto whitespace-pre-wrap">
                        {results.length === 0 ? "Ready to start..." : results.join("\n")}
                    </div>
                </Card>
            </div>

            {/* The Editor App */}
            <ResumeEditor />
        </div>
    );
}
