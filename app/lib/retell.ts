export async function hacerLlamadaBromaIA(phone: string, prompt: string, voice: string) {
  try {
    const res = await fetch("https://api.retellai.com/v1/calls", {
      method: "POST",
      headers: {
        Authorization: "Bearer key_dbc895c5689c86663ea27f687795",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phone,
        agent_id: "agent_5ffdec4ca98d47828bb7426b8e",
        voice: voice,
        username: "retelluser",
        password: "Retelluser123",
        params: {
          mensaje: prompt,
        },
      }),
    });

    if (!res.ok) {
      console.error("Error HTTP", await res.text());
      return { success: false };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error al llamar a Retell:", err);
    return { success: false };
  }
}
