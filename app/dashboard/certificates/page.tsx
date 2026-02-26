"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

// shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// react-icons
import {
  TbQrcode,
  TbUserPlus,
  TbCheck,
  TbChevronDown,
  TbAlertCircle,
  TbLoader2,
  TbEdit,
  TbPlus,
  TbLink,
  TbDownload,
  TbCopy,
  TbExternalLink,
  TbCircleCheck,
  TbX,
} from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  _id: string;
  firstName: string;
  email: string;
}

interface Certificate {
  _id: string;
  userId: string | null;
  userName: string;
  email: string;
  googleDriveUrl: string;
  qrCode: string;
  qrToken: string;
  createdAt: string;
}

interface GeneratedResult {
  userName: string;
  email: string;
  qrCode: string; // base64 PNG from API response
  qrUrl: string; // permanent link from API response
}

interface AddFormValues {
  selectedUserId: string;
  guestName: string;
  guestEmail: string;
  googleDriveUrl: string;
}

interface EditFormValues {
  certificateId: string;
  googleDriveUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidDriveUrl = (url: string) =>
  url.startsWith("https://drive.google.com") ||
  url.startsWith("https://docs.google.com");

const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() ?? "?";

// ─── QR Result Card ───────────────────────────────────────────────────────────

function QRResultCard({
  result,
  onDismiss,
}: {
  result: GeneratedResult;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.qrUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = result.qrCode;
    a.download = `QR_${result.userName.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  return (
    <div
      className="rounded-2xl border p-4 space-y-4"
      style={{
        background: "rgba(196,160,100,0.03)",
        borderColor: "rgba(196,160,100,0.2)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <TbCircleCheck
            size={16}
            className="text-green-500 flex-shrink-0 mt-px"
          />
          <div>
            <p className="text-sm font-semibold leading-tight">
              Certificate QR Generated
            </p>
            <p className="text-[11px] opacity-40 mt-0.5">
              {result.userName} · {result.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0"
        >
          <TbX size={14} className="opacity-30 hover:opacity-60" />
        </button>
      </div>

      <Separator />

      {/* ── QR + actions ── */}
      <div className="flex gap-4">
        {/* QR image */}
        <div
          className="flex-shrink-0 rounded-xl p-2 bg-white"
          style={{
            border: "1px solid rgba(196,160,100,0.15)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <img
            src={result.qrCode}
            alt={`QR code for ${result.userName}`}
            className="w-[88px] h-[88px] block"
          />
        </div>

        {/* Right side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          {/* Permanent link row */}
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-40">
              Permanent QR Link
            </p>
            <div
              className="flex items-center gap-2 rounded-lg px-2.5 py-2"
              style={{
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <TbLink size={12} className="opacity-25 flex-shrink-0" />
              <span className="text-[11px] font-mono truncate flex-1 opacity-50 select-all">
                {result.qrUrl}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 px-3 text-[11px] gap-1.5 flex-1"
            >
              {copied ? (
                <>
                  <TbCheck size={13} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <TbCopy size={13} />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-8 px-3 text-[11px] gap-1.5 flex-1"
            >
              <TbDownload size={13} />
              Download QR
            </Button>

            <a href={result.qrUrl} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
              >
                <TbExternalLink size={13} />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Tab ──────────────────────────────────────────────────────────────────

function AddTab({
  users,
  usersLoading,
  existingUserIds,
  onGenerated,
}: {
  users: User[];
  usersLoading: boolean;
  existingUserIds: Set<string>;
  onGenerated: () => void;
}) {
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddFormValues>({
    defaultValues: {
      selectedUserId: "",
      guestName: "",
      guestEmail: "",
      googleDriveUrl: "",
    },
  });

  const selectedUserId = watch("selectedUserId");
  const isGuest = selectedUserId === "guest";
  const selectedUser = users.find((u) => u._id === selectedUserId);
  const availableUsers = users.filter((u) => !existingUserIds.has(u._id));

  const onSubmit = async (data: AddFormValues) => {
    try {
      const payload = {
        userId: isGuest ? null : data.selectedUserId,
        guestName: isGuest ? data.guestName.trim() : null,
        guestEmail: isGuest ? data.guestEmail.trim() : null,
        googleDriveUrl: data.googleDriveUrl.trim(),
      };

      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      if (response.statusCode !== 201) throw new Error(response.message);

      const cert = response.data.certificate;

      // Show QR result card with data from API response
      setResult({
        userName: cert.userName,
        email: cert.email,
        qrCode: cert.qrCode,
        qrUrl: cert.qrUrl,
      });

      toast.success("Certificate QR generated successfully!");
      reset();
      onGenerated();
    } catch (error) {
      toast.error((error as Error).message || "Failed to generate certificate");
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Result card — appears after successful generation ── */}
      {result && (
        <QRResultCard result={result} onDismiss={() => setResult(null)} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── User Selector ── */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium uppercase tracking-wider">
            Investor <span className="text-red-400">*</span>
          </Label>

          <Controller
            name="selectedUserId"
            control={control}
            rules={{ required: "Please select an investor" }}
            render={({ field }) => (
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={usersLoading}
                    className="w-full justify-between font-normal focus-visible:ring-[#C4A06440]"
                    style={{ color: field.value ? undefined : "#2E3340" }}
                  >
                    <div className="flex items-center gap-2 min-w-0 text-sm">
                      {field.value &&
                      field.value !== "guest" &&
                      selectedUser ? (
                        <>
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                            style={{
                              background: "rgba(196,160,100,0.15)",
                              color: "#C4A064",
                            }}
                          >
                            {getInitial(selectedUser.firstName)}
                          </div>
                          <span className="truncate">
                            {selectedUser.firstName}
                          </span>
                          <span className="text-xs truncate hidden sm:inline opacity-50">
                            — {selectedUser.email}
                          </span>
                        </>
                      ) : field.value === "guest" ? (
                        <>
                          <TbUserPlus
                            size={14}
                            className="text-[#4A5060] flex-shrink-0"
                          />
                          <span className="text-[#8090A0]">
                            Not in system (manual entry)
                          </span>
                        </>
                      ) : (
                        <span>
                          {usersLoading
                            ? "Loading investors…"
                            : "Select an investor…"}
                        </span>
                      )}
                    </div>
                    <TbChevronDown
                      size={14}
                      className="opacity-40 flex-shrink-0 ml-2"
                    />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="p-0 shadow-2xl"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput
                      placeholder="Search by name or email…"
                      className="h-10"
                    />
                    <CommandList>
                      <CommandEmpty className="text-sm py-4 text-center opacity-50">
                        No investors found
                      </CommandEmpty>

                      <CommandGroup className="overflow-y-auto max-h-[208px]">
                        {availableUsers.length === 0 && !usersLoading ? (
                          <div className="px-3 py-4 text-center text-sm opacity-40">
                            All investors already have certificates
                          </div>
                        ) : (
                          availableUsers.map((user) => (
                            <CommandItem
                              key={user._id}
                              value={`${user.firstName} ${user.email}`}
                              onSelect={() => {
                                field.onChange(user._id);
                                setUserPopoverOpen(false);
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                style={{
                                  background: "rgba(196,160,100,0.12)",
                                  color: "#C4A064",
                                }}
                              >
                                {getInitial(user.firstName)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm leading-tight truncate">
                                  {user.firstName}
                                </p>
                                <p className="text-[11px] opacity-50 truncate">
                                  {user.email}
                                </p>
                              </div>
                              {field.value === user._id && (
                                <TbCheck
                                  size={15}
                                  className="text-[#C4A064] flex-shrink-0"
                                />
                              )}
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>

                      <CommandSeparator />

                      <CommandGroup>
                        <CommandItem
                          value="__guest__ not in system manual entry"
                          onSelect={() => {
                            field.onChange("guest");
                            setUserPopoverOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
                            <TbUserPlus size={13} className="opacity-40" />
                          </div>
                          <div>
                            <p className="text-sm opacity-60">Not in system</p>
                            <p className="text-[11px] opacity-30">
                              Enter name & email manually
                            </p>
                          </div>
                          {field.value === "guest" && (
                            <TbCheck
                              size={15}
                              className="text-[#C4A064] ml-auto flex-shrink-0"
                            />
                          )}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />

          {errors.selectedUserId && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <TbAlertCircle size={12} /> {errors.selectedUserId.message}
            </p>
          )}
        </div>

        {/* ── Guest fields ── */}
        {isGuest && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium opacity-60 uppercase tracking-wider">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                {...register("guestName", {
                  required: isGuest ? "Name is required" : false,
                })}
                placeholder="John Smith"
                className="focus-visible:ring-[#C4A06440] focus-visible:border-[#C4A06450]"
              />
              {errors.guestName && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <TbAlertCircle size={12} /> {errors.guestName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium opacity-60 uppercase tracking-wider">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                {...register("guestEmail", {
                  required: isGuest ? "Email is required" : false,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="john@example.com"
                className="focus-visible:ring-[#C4A06440] focus-visible:border-[#C4A06450]"
              />
              {errors.guestEmail && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <TbAlertCircle size={12} /> {errors.guestEmail.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Drive URL ── */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium opacity-60 uppercase tracking-wider">
            Google Drive Document URL <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <HiOutlineDocumentText
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            />
            <Input
              {...register("googleDriveUrl", {
                required: "Google Drive URL is required",
                validate: (v) =>
                  isValidDriveUrl(v) ||
                  "Must be a valid Google Drive or Google Docs URL",
              })}
              type="url"
              placeholder="https://drive.google.com/file/d/…"
              className="pl-9 focus-visible:ring-[#C4A06440] focus-visible:border-[#C4A06450]"
            />
          </div>
          {errors.googleDriveUrl && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <TbAlertCircle size={12} /> {errors.googleDriveUrl.message}
            </p>
          )}
        </div>

        {/* ── Submit ── */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-sm font-semibold transition-all active:scale-[0.99] bg-primaryBG hover:bg-primaryBG/90 focus-visible:ring-primaryBG/50"
        >
          {isSubmitting ? (
            <>
              <TbLoader2 className="animate-spin mr-2" size={16} /> Generating
              QR Code…
            </>
          ) : (
            <>
              <TbQrcode className="mr-2" size={16} /> Generate Certificate QR
              Code
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// ─── Edit QR Card — shown when a cert is selected in Edit tab ─────────────────

function EditQRCard({ cert }: { cert: Certificate }) {
  const [copied, setCopied] = useState(false);

  const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}docs/${cert.qrToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = cert.qrCode;
    a.download = `QR_${cert.userName.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        background: "rgba(196,160,100,0.03)",
        borderColor: "rgba(196,160,100,0.2)",
      }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider opacity-40">
        Current QR Code
      </p>

      <div className="flex gap-4">
        {/* QR image */}
        <div
          className="flex-shrink-0 rounded-xl p-2 bg-white"
          style={{
            border: "1px solid rgba(196,160,100,0.15)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <img
            src={cert.qrCode}
            alt={`QR code for ${cert.userName}`}
            className="w-[88px] h-[88px] block"
          />
        </div>

        {/* Right side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          {/* Permanent link */}
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-40">
              Permanent QR Link
            </p>
            <div
              className="flex items-center gap-2 rounded-lg px-2.5 py-2"
              style={{
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <TbLink size={12} className="opacity-25 flex-shrink-0" />
              <span className="text-[11px] font-mono truncate flex-1 opacity-50 select-all">
                {qrUrl}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 px-3 text-[11px] gap-1.5 flex-1"
            >
              {copied ? (
                <>
                  <TbCheck size={13} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <TbCopy size={13} />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-8 px-3 text-[11px] gap-1.5 flex-1"
            >
              <TbDownload size={13} />
              Download QR
            </Button>

            <a href={qrUrl} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
              >
                <TbExternalLink size={13} />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Tab ─────────────────────────────────────────────────────────────────

function EditTab({
  certificates,
  certsLoading,
}: {
  certificates: Certificate[];
  certsLoading: boolean;
}) {
  const [certPopoverOpen, setCertPopoverOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditFormValues>({
    defaultValues: { certificateId: "", googleDriveUrl: "" },
  });

  const handleSelectCert = (cert: Certificate) => {
    setSelectedCert(cert);
    setValue("certificateId", cert._id, { shouldDirty: false });
    setValue("googleDriveUrl", cert.googleDriveUrl, { shouldDirty: false });
    setCertPopoverOpen(false);
  };

  const onSubmit = async (data: EditFormValues) => {
    try {
      const res = await fetch(`/api/certificates/${data.certificateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleDriveUrl: data.googleDriveUrl.trim() }),
      });

      const response = await res.json();
      if (response.statusCode !== 200) throw new Error(response.message);

      toast.success("Document link updated successfully!");
      setSelectedCert((prev) =>
        prev ? { ...prev, googleDriveUrl: data.googleDriveUrl.trim() } : prev,
      );
      reset({
        certificateId: data.certificateId,
        googleDriveUrl: data.googleDriveUrl.trim(),
      });
    } catch (error) {
      toast.error((error as Error).message || "Failed to update certificate");
    }
  };

  if (certsLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3">
        <TbLoader2 className="animate-spin opacity-30" size={20} />
        <span className="text-sm opacity-40">Loading certificates…</span>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <TbQrcode size={32} className="opacity-20" />
        <p className="text-sm opacity-40">No certificates yet</p>
        <p className="text-[11px] opacity-25">
          Switch to the Add tab to generate your first one
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Certificate selector ── */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider">
          Select Investor <span className="text-red-400">*</span>
        </Label>

        <Popover open={certPopoverOpen} onOpenChange={setCertPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal focus-visible:ring-[#C4A06440]"
              style={{ color: selectedCert ? undefined : "#2E3340" }}
            >
              <div className="flex items-center gap-2 min-w-0 text-sm">
                {selectedCert ? (
                  <>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                      style={{
                        background: "rgba(196,160,100,0.15)",
                        color: "#C4A064",
                      }}
                    >
                      {getInitial(selectedCert.userName)}
                    </div>
                    <span className="truncate">{selectedCert.userName}</span>
                    <span className="text-xs truncate hidden sm:inline opacity-50">
                      — {selectedCert.email}
                    </span>
                  </>
                ) : (
                  <span>Select an investor to edit…</span>
                )}
              </div>
              <TbChevronDown
                size={14}
                className="opacity-40 flex-shrink-0 ml-2"
              />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="p-0 shadow-2xl"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command>
              <CommandInput
                placeholder="Search by name or email…"
                className="h-10"
              />
              <CommandList>
                <CommandEmpty className="text-sm py-4 text-center opacity-50">
                  No certificates found
                </CommandEmpty>
                <CommandGroup className="overflow-y-auto max-h-[208px]">
                  {certificates.map((cert) => (
                    <CommandItem
                      key={cert._id}
                      value={`${cert.userName} ${cert.email}`}
                      onSelect={() => handleSelectCert(cert)}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{
                          background: "rgba(196,160,100,0.12)",
                          color: "#C4A064",
                        }}
                      >
                        {getInitial(cert.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-tight truncate">
                          {cert.userName}
                        </p>
                        <p className="text-[11px] opacity-50 truncate">
                          {cert.email}
                        </p>
                      </div>
                      {selectedCert?._id === cert._id && (
                        <TbCheck
                          size={15}
                          className="text-[#C4A064] flex-shrink-0"
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* ── QR preview — shown as soon as a cert is selected ── */}
      {selectedCert && <EditQRCard cert={selectedCert} />}

      {/* ── Drive URL — shown after selecting a cert ── */}
      {selectedCert && (
        <>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium opacity-60 uppercase tracking-wider">
              Google Drive Document URL <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <TbLink
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
              />
              <Input
                {...register("googleDriveUrl", {
                  required: "Google Drive URL is required",
                  validate: (v) =>
                    isValidDriveUrl(v) ||
                    "Must be a valid Google Drive or Google Docs URL",
                })}
                type="url"
                placeholder="https://drive.google.com/file/d/…"
                className="pl-9 focus-visible:ring-[#C4A06440] focus-visible:border-[#C4A06450]"
              />
            </div>
            {errors.googleDriveUrl && (
              <p className="text-[11px] text-red-400 flex items-center gap-1">
                <TbAlertCircle size={12} /> {errors.googleDriveUrl.message}
              </p>
            )}
            <p className="text-[11px] opacity-30 flex items-center gap-1 mt-1">
              <TbQrcode size={11} />
              The QR code URL stays the same — only the linked document updates.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full h-11 text-sm font-semibold transition-all active:scale-[0.99] bg-primaryBG hover:bg-primaryBG/90 focus-visible:ring-primaryBG/50"
          >
            {isSubmitting ? (
              <>
                <TbLoader2 className="animate-spin mr-2" size={16} /> Updating…
              </>
            ) : (
              <>
                <TbEdit className="mr-2" size={16} /> Update Document Link
              </>
            )}
          </Button>
        </>
      )}
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Certificates = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  const existingUserIds = new Set(
    certificates.map((c) => c.userId).filter(Boolean) as string[],
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?all=true");
        const response = await res.json();
        if (response.statusCode !== 200) {
          toast.error(response.message);
          throw new Error(response.message);
        }
        setUsers(response.data.users);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchCertificates = useCallback(async () => {
    try {
      const res = await fetch("/api/certificates");
      const response = await res.json();
      if (response.statusCode !== 200) throw new Error(response.message);
      setCertificates(response.data.certificates);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setCertsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return (
    <TooltipProvider>
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C4A06415] border border-[#C4A06425] flex items-center justify-center">
                  <TbQrcode size={18} className="text-[#C4A064]" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    Certificate QR Management
                  </CardTitle>
                  <CardDescription className="text-[12px] mt-0.5">
                    Generate new certificates or update existing document links
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-5">
              <Tabs defaultValue="add">
                <TabsList className="w-full mb-5">
                  <TabsTrigger value="add" className="flex-1 gap-1.5">
                    <TbPlus size={14} />
                    Add
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex-1 gap-1.5">
                    <TbEdit size={14} />
                    Edit
                    {certificates.length > 0 && (
                      <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-medium">
                        {certificates.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add">
                  <AddTab
                    users={users}
                    usersLoading={usersLoading}
                    existingUserIds={existingUserIds}
                    onGenerated={fetchCertificates}
                  />
                </TabsContent>

                <TabsContent value="edit">
                  <EditTab
                    certificates={certificates}
                    certsLoading={certsLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Certificates;
