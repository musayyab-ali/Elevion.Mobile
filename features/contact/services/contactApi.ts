import { isAxiosError } from "axios";
import apiClient from "../../../services/api/apiClient";
import { ContactValues } from "../utils/contactForm";

/** Sends the customer's message to the shop (it is kept in the admin under Contact messages and e-mailed to the shop). */
export async function sendContactMessage(values: ContactValues): Promise<string> {
  const response = await apiClient.post("/TenantLanding/contact-us", {
    Name: values.name.trim(),
    Phone: values.phone.trim(),
    Email: values.email.trim(),
    Message: values.message.trim(),
    Type: values.type,
  });
  return (response.data as { Message?: string } | undefined)?.Message?.trim() || "Your message has been sent successfully.";
}

/** A message the customer can read: what the server said, or a plain explanation. */
export function contactErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return "Unable to connect. Please check your internet and try again.";
    const data = error.response.data as { Message?: string; Errors?: { Message?: string }[] } | undefined;
    const first = data?.Errors?.find((e) => e?.Message)?.Message;
    if (first) return first;
    if (data?.Message && data.Message !== "Validation Failed") return data.Message;
  }
  return "We could not send your message. Please try again.";
}
