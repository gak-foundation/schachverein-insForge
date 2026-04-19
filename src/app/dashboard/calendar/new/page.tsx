import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createEvent } from "@/lib/actions/events";
import EventForm from "@/components/calendar/EventForm";

export const metadata = {
  title: "Neues Event",
};

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <EventForm 
      action={createEvent} 
      title="Neues Event" 
      submitLabel="Event anlegen" 
    />
  );
}