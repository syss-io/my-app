"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowUp, Loader2, Mic, Paperclip } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { tones, type NamingResponse, type NamingSuggestion } from "@/lib/schemas";

const formSchema = z.object({
  ideaSummary: z.string().min(10, "Share at least a sentence about the idea."),
  targetAudience: z.string().optional(),
  keywords: z.string().optional(),
  tone: z.enum(tones),
  lengthRange: z.tuple([z.number(), z.number()]),
  tldPreferences: z.array(z.string()).min(1, "Pick at least one domain ending."),
  requireExactDomain: z.boolean(),
  preferInternational: z.boolean(),
  seoFocus: z.boolean(),
  location: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

async function postNamingRequest(values: FormValues): Promise<NamingResponse> {
  const payload = {
    ...values,
    keywords: values.keywords
      ? values.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean)
      : [],
    registrar: "dnsimple.com",
  };

  const response = await fetch("/api/naming", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(errorBody.message ?? "Failed to generate names");
  }

  return response.json();
}

export function IdeaWorkbench() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ideaSummary: "",
      targetAudience: "",
      keywords: "",
      tone: "approachable",
      lengthRange: [5, 12],
      tldPreferences: ["com", "io", "ai"],
      requireExactDomain: false,
      preferInternational: true,
      seoFocus: true,
      location: "us",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: postNamingRequest,
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const suggestions = mutation.data?.suggestions ?? [];
  const isPending = mutation.isPending;
  const isError = mutation.isError;
  const hasSuggestions = suggestions.length > 0;
  const ideaSummary = form.watch("ideaSummary");
  const characterCount = ideaSummary.length;
  const maxCharacters = 1000;
  const usagePercentage = Math.round((characterCount / maxCharacters) * 100);
  const isValid = form.formState.isValid && ideaSummary.trim().length >= 10;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
          {!hasSuggestions && !isPending && !ideaSummary ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="mx-auto max-w-3xl space-y-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Name Sprint Workspace
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                  Translate raw ideas into brand-ready names and domains.
                </p>
                <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                  Drop your concept, dial in tone and reach, and receive curated naming territories with live domain
                  availability checks.
                </p>
              </div>
            </div>
          ) : null}

          {isPending ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight">Naming directions</h2>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  Generating
                </Badge>
              </div>
              <div role="status" className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="space-y-3 p-5">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {!isPending && hasSuggestions ? (
            <div className="space-y-6" aria-live="polite">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight">Naming directions</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.name} suggestion={suggestion} />
                ))}
              </div>

              {mutation.data?.nextSteps?.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">Next steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <ul className="space-y-2">
                      {mutation.data.nextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}

              {mutation.data?.positioningNotes?.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">Positioning notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {mutation.data.positioningNotes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          ) : null}

          {isError ? (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="py-3 text-sm text-destructive">
                {(mutation.error as Error).message || "Something went wrong. Try again."}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Fixed input bar at bottom */}
      <div className="border-t border-border/60 bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="ideaSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Describe your idea</FormLabel>
                    <Card className="border-border/60 shadow-sm">
                      <CardContent className="">
                        <div className="space-y-3">
                          <FormControl>
                            <Textarea
                              placeholder="Describe your idea…"
                              className="min-h-[60px] max-h-[200px] resize-none border-0 p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                              rows={1}
                              maxLength={maxCharacters}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  if (isValid) {
                                    form.handleSubmit(onSubmit)();
                                  }
                                }
                              }}
                              {...field}
                            />
                          </FormControl>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Attach reference">
                                <Paperclip className="h-4 w-4" aria-hidden="true" />
                              </Button>
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Record voice note">
                                <Mic className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-wide">
                                Auto
                              </Badge>
                              <span className={`text-xs ${usagePercentage >= 90 ? "text-destructive" : "text-muted-foreground"}`}>
                                {usagePercentage}% used
                              </span>
                              <Button
                                type="submit"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                disabled={isPending || !isValid}
                                aria-label="Send brief"
                              >
                                {isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: NamingSuggestion }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">{suggestion.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {suggestion.tagline ? (
          <p className="font-medium text-foreground/90">{suggestion.tagline}</p>
        ) : null}
        
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Story</p>
          <p className="text-muted-foreground leading-6 italic">{suggestion.story}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Strategic fit</p>
          <p className="text-muted-foreground leading-6">{suggestion.rationale}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Available domains</p>
          <div className="flex flex-wrap gap-2">
            {suggestion.domains.map((domain) => (
              <Badge key={domain.domain} variant={badgeVariant(domain.status)}>
                {domain.domain}
                {domain.info ? ` · ${domain.info}` : ""}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function badgeVariant(status: "available" | "unavailable" | "unknown") {
  switch (status) {
    case "available":
      return "default" as const;
    case "unavailable":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}
