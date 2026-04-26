import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getEventById, updateEvent } from "@/lib/actions/events";
import EventForm from "@/features/calendar/components/EventForm";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Event bearbeiten",
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const updateEventWithId = updateEvent.bind(null, id);

  return (
    <EventForm 
      initialData={event}
      action={updateEventWithId} 
      title="Event bearbeiten" 
      submitLabel="Änderungen speichern" 
    />
  );
}
