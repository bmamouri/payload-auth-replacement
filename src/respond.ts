export function respond(body: any, status: number = 200) {
  return new Response(JSON.stringify(body), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}
