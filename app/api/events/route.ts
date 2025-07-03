// src/api/events.ts
export async function createEvent(data: any) {
  const res = await fetch("https://fastapi-gorillatix-production.up.railway.app/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create event");
  }

  return res.json();
}
