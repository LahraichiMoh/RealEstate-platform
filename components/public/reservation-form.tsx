"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Apartment {
  id: string;
  number: string;
}

interface ReservationFormProps {
  apartment: Apartment;
  projectId: string;
  onSuccess: () => void;
}

export default function ReservationForm({
  apartment,
  projectId,
  onSuccess,
}: ReservationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectId,
          apartmentId: apartment.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit reservation");

      toast({
        title: "Success",
        description: "Your reservation request has been submitted. We'll contact you soon!",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit reservation request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          required
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          required
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your interest in this apartment..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={isSubmitting}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Reservation Request"}
      </Button>
    </form>
  );
}
