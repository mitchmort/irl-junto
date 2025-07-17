"use client";

import React, { useState, useEffect, useCallback } from "react";
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
        value: z.string().refine((val) => {
          if (!val.trim()) return true; // Allow empty values
          // Allow URLs with or without protocol
          const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          return urlPattern.test(val);
        }, { message: "Please enter a valid URL or domain." })
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

// Helper function to check if a URL is a blob URL
function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}

// Helper function to check if a URL is valid (not blob and not empty)
function isValidImageUrl(url: string | null | undefined): boolean {
  return !!(url && !isBlobUrl(url) && url.trim() !== '');
}

export default function Page() {
  // Separate states for preview and actual avatar file
  const [newImagePreview, setNewImagePreview] = useState<string>("");  // Only for new uploads
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
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

  // Handle file selection for avatar upload
  const handleFilesChange = useCallback((files: any[]) => {
    if (files.length > 0 && files[0].preview && files[0].file) {
      console.log("📷 New avatar file selected:", files[0].file.name);
      // Store the blob URL for preview only (never save this to database)
      setNewImagePreview(files[0].preview);
      // Store the actual File object for upload
      setSelectedAvatarFile(files[0].file);
    } else {
      console.log("🗑️ Avatar selection cleared");
      setNewImagePreview("");
      setSelectedAvatarFile(null);
    }
  }, []);

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*",
    multiple: false,
    onFilesChange: handleFilesChange
  });

  // Load profile data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Update form when profile data is loaded (only on initial load)
  useEffect(() => {
    if (profile && !form.formState.isDirty) {
      const socialLinksArray = Array.isArray(profile.social_links) 
        ? profile.social_links.map((link: any) => ({ value: link.value || link }))
        : [{ value: "" }];

      // Clean the avatar URL - if it's a blob URL, ignore it
      const cleanAvatarUrl = isValidImageUrl(profile.avatar_url) ? (profile.avatar_url || "") : "";
      
      form.reset({
        name: profile.full_name || "",
        bio: profile.bio || "Passionate athlete looking to connect with other players for exciting games and events.",
        photo: cleanAvatarUrl,
        sports: profile.sports || [],
        socialLinks: socialLinksArray.length > 0 ? socialLinksArray : [{ value: "" }]
      });

      console.log("📝 Profile form reset with data:", {
        name: profile.full_name,
        avatarUrl: cleanAvatarUrl,
        bio: profile.bio?.substring(0, 50) + '...'
      });
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

    console.log("🚀 Starting profile update...", { 
      userId: user.id, 
      hasNewAvatar: !!selectedAvatarFile,
      formDataPhoto: data.photo?.substring(0, 50) + '...'
    });

    try {
      // Prepare submission data - never include blob URLs
      const submissionData = {
        name: data.name,
        bio: data.bio,
        photo: selectedAvatarFile ? undefined : (data.photo || undefined), // Clear if uploading new file
        sports: data.sports,
        socialLinks: data.socialLinks
      };

      await updateProfile(user.id, submissionData, selectedAvatarFile || undefined);
      
      console.log("✅ Profile updated successfully");
      
      // Clear the file selection and preview
      setSelectedAvatarFile(null);
      setNewImagePreview("");
      
      // Reset form to current state (this will update with new avatar URL from database)
      form.reset(form.getValues());
      
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

  // Determine what to show in avatar - priority: new preview > existing valid URL > fallback
  const getAvatarSrc = () => {
    // If user selected a new file, show the preview
    if (newImagePreview) {
      return newImagePreview;
    }
    
    // Otherwise, show the saved avatar if it's valid (not a blob URL)
    const savedAvatar = form.watch("photo");
    if (isValidImageUrl(savedAvatar)) {
      return savedAvatar;
    }
    
    // No valid image to show
    return "";
  };

  const avatarSrc = getAvatarSrc();
  const hasPhoto = !!avatarSrc;

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
                        <AvatarImage src={avatarSrc} />
                        <AvatarFallback className="text-lg">
                          {form.watch("name") ? getNameInitials(form.watch("name") || "") : <CameraIcon className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      {selectedAvatarFile && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          New
                        </div>
                      )}
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
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name. It can be your real name or a pseudonym.
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
                      placeholder="Tell others about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can @mention other users and organizations to link to them.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sports Field */}
            <FormField
              control={form.control}
              name="sports"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sports & Activities</FormLabel>
                  <Popover open={sportsDropdownOpen} onOpenChange={setSportsDropdownOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && field.value.length > 0
                            ? `${field.value.length} sport${field.value.length > 1 ? 's' : ''} selected`
                            : "Select sports you play"}
                          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search sports..." />
                        <CommandEmpty>No sport found.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {SPORTS_OPTIONS.map((sport) => (
                                                            <CommandItem
                                value={sport.label}
                                key={sport.id}
                                onSelect={() => {
                                  const currentValue = field.value || [];
                                  const newValue = currentValue.includes(sport.id)
                                    ? currentValue.filter((value) => value !== sport.id)
                                    : [...currentValue, sport.id];
                                  field.onChange(newValue);
                                }}
                              >
                                <Checkbox
                                  checked={field.value?.includes(sport.id) || false}
                                  className="mr-2"
                                />
                                {sport.label}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((sportId) => {
                        const sport = SPORTS_OPTIONS.find(s => s.id === sportId);
                        return sport ? (
                          <Badge key={sportId} variant="secondary" className="flex items-center gap-1">
                            {sport.label}
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = field.value?.filter((value) => value !== sportId) || [];
                                field.onChange(newValue);
                              }}
                              className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                  <FormDescription>
                    Select the sports and activities you enjoy playing.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Links */}
            <div>
              <div className="space-y-2">
                <FormLabel>Social Links</FormLabel>
                <FormDescription>
                  Add links to your social media profiles.
                </FormDescription>
              </div>
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`socialLinks.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(index !== 0 && "sr-only")}>
                        Social Links
                      </FormLabel>
                      <FormDescription className={cn(index !== 0 && "sr-only")}>
                        Add links to your website, blog, or social media profiles.
                      </FormDescription>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} placeholder="https://example.com" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
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
                className="mt-2"
                onClick={() => append({ value: "" })}
              >
                Add Social Link
              </Button>
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