"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useFileUpload } from "@/hooks/use-file-upload";
import { CameraIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useProfileStore } from "@/store/useProfileStore";

// Sports options for JUNTO
const SPORTS_OPTIONS = [
  { id: "basketball", label: "Basketball" },
  { id: "tennis", label: "Tennis" },
  { id: "pickleball", label: "Pickleball" },
  { id: "volleyball", label: "Volleyball" },
  { id: "soccer", label: "Soccer" },
  { id: "climbing", label: "Climbing" },
] as const;

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters."
    })
    .max(50, {
      message: "Name must not be longer than 50 characters."
    }),
  bio: z.string().max(160).min(4),
  photo: z.string().optional(),
  sports: z.array(z.string()).optional(),
  socialLinks: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." })
      })
    )
    .optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Default values for the form
const defaultValues: Partial<ProfileFormValues> = {
  name: "",
  bio: "Passionate athlete looking to connect with other players for exciting games and events.",
  photo: "",
  sports: [],
  socialLinks: [{ value: "" }]
};

export default function Page() {
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [sportsDropdownOpen, setSportsDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { profile, updateProfile, fetchProfile, saving, error, clearError } = useProfileStore();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange"
  });

  const { fields, append, remove } = useFieldArray({
    name: "socialLinks",
    control: form.control
  });

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*",
    multiple: false,
    onFilesChange: (files) => {
      if (files.length > 0 && files[0].preview) {
        setProfilePhotoPreview(files[0].preview);
        form.setValue("photo", files[0].preview);
      } else {
        setProfilePhotoPreview("");
        form.setValue("photo", "");
      }
    }
  });

  // Load profile data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      const socialLinksArray = Array.isArray(profile.social_links) 
        ? profile.social_links.map((link: any) => ({ value: link.value || link }))
        : [{ value: "" }];

      form.reset({
        name: profile.full_name || "",
        bio: profile.bio || "Passionate athlete looking to connect with other players for exciting games and events.",
        photo: profile.avatar_url || "",
        sports: profile.sports || [],
        socialLinks: socialLinksArray.length > 0 ? socialLinksArray : [{ value: "" }]
      });

      if (profile.avatar_url) {
        setProfilePhotoPreview(profile.avatar_url);
      }
    }
  }, [profile, form]);

  // Clear errors when form values change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [form.watch(), error, clearError]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.id) {
      toast.error("User not found. Please try logging in again.");
      return;
    }

    console.log("🔍 Profile form submission:", { userId: user.id, formData: data });

    try {
      await updateProfile(user.id, data);
      console.log("✅ Profile update successful");
      toast.success("Profile updated successfully!", {
        description: "Your sports profile and preferences have been saved.",
      });
    } catch (error) {
      console.error("❌ Profile update failed:", error);
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  }

  const getNameInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const hasPhoto = profilePhotoPreview || form.watch("photo");

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center space-y-4">
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profilePhotoPreview || field.value} />
                        <AvatarFallback className="text-lg">
                          {form.watch("name") ? getNameInitials(form.watch("name") || "") : <CameraIcon className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <FormControl>
                      <div>
                        <input
                          {...fileActions.getInputProps()}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={fileActions.openFileDialog}
                        >
                          {hasPhoto ? "Update Profile Photo" : "Upload Profile Photo"}
                        </Button>
                      </div>
                    </FormControl>
                    {fileState.errors.length > 0 && (
                      <div className="text-sm text-red-500">
                        {fileState.errors[0]}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is how other players will see you. It can be your real name or a nickname.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself as a player"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share your sports experience, preferred playing style, or what you&apos;re looking for in events.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sports Selection */}
            <FormField
              control={form.control}
              name="sports"
              render={({ field }) => {
                const selectedSports = field.value || [];
                const selectedSportsLabels = selectedSports.map(
                  (sportId) => SPORTS_OPTIONS.find((sport) => sport.id === sportId)?.label
                ).filter(Boolean);

                return (
                  <FormItem>
                    <FormLabel className="text-base">Sports You Play</FormLabel>
                    <FormDescription>
                      Select all the sports you&apos;re interested in playing or would like to join events for.
                    </FormDescription>
                    <FormControl>
                      <Popover open={sportsDropdownOpen} onOpenChange={setSportsDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={sportsDropdownOpen}
                            className="w-full justify-between min-h-10 h-auto"
                          >
                            <div className="flex flex-wrap gap-1">
                              {selectedSportsLabels.length > 0 ? (
                                selectedSportsLabels.map((sport) => (
                                  <Badge
                                    key={sport}
                                    variant="secondary"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const sportId = SPORTS_OPTIONS.find(s => s.label === sport)?.id;
                                      if (sportId) {
                                        field.onChange(
                                          selectedSports.filter((id) => id !== sportId)
                                        );
                                      }
                                    }}
                                  >
                                    {sport}
                                    <XIcon className="ml-1 h-3 w-3 cursor-pointer" />
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground">Select sports...</span>
                              )}
                            </div>
                            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search sports..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No sports found.</CommandEmpty>
                              <CommandGroup>
                                {SPORTS_OPTIONS.map((sport) => (
                                  <CommandItem
                                    key={sport.id}
                                    value={sport.label}
                                    onSelect={() => {
                                      const isSelected = selectedSports.includes(sport.id);
                                      if (isSelected) {
                                        field.onChange(
                                          selectedSports.filter((id) => id !== sport.id)
                                        );
                                      } else {
                                        field.onChange([...selectedSports, sport.id]);
                                      }
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={selectedSports.includes(sport.id)}
                                      />
                                      <span>{sport.label}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Social Links */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base">Social Links</FormLabel>
                <FormDescription>
                  Add links to your sports-related social media and fitness profiles.
                </FormDescription>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`socialLinks.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input 
                              placeholder="https://instagram.com/yourprofile" 
                              {...field} 
                            />
                          </FormControl>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                >
                  Add Another Link
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}