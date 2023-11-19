export async function GET() {
  const res = await fetch(
    "https://v6.db.transport.rest/locations?poi=false&addresses=false&query=hauptbanhof",
  );
  const data = await res.json();
  return Response.json(data);
}
