"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: data.get("First Name"),
      lastName: data.get("Last Name"),
      email: data.get("Email"),
      message: data.get("Message"),
    };

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <p className="form-success">
        Thanks for reaching out — your message is in, I&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="form-field">
        <label htmlFor="cf-first">First Name</label>
        <input type="text" id="cf-first" name="First Name" required disabled={status === "sending"} />
      </div>
      <div className="form-field">
        <label htmlFor="cf-last">Last Name</label>
        <input type="text" id="cf-last" name="Last Name" required disabled={status === "sending"} />
      </div>
      <div className="form-field">
        <label htmlFor="cf-email">Email</label>
        <input type="email" id="cf-email" name="Email" required disabled={status === "sending"} />
      </div>
      <div className="form-field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="Message" rows={5} required disabled={status === "sending"}></textarea>
      </div>
      <button type="submit" className="btn-primary form-submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "error" && (
        <p className="form-error">
          Something went wrong sending that — try again, or email{" "}
          <a href="mailto:contact@seifmoaz.com">contact@seifmoaz.com</a> directly.
        </p>
      )}
    </form>
  );
}
