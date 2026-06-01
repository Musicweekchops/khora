async function createTestUser() {
  const token = "APP_USR-5701696776662406-053118-31458b7c2388633408f9ff38904fa876-1523520508"
  console.log("Creando usuario comprador de prueba...")

  try {
    const res = await fetch("https://api.mercadopago.com/users/test_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        site_id: "MLC" // Mercado Libre Chile
      })
    })

    const data = await res.json()
    console.log("STATUS CODE:", res.status)
    console.log("USUARIO CREADO:")
    console.log(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Error al crear usuario de prueba:", err)
  }
}

createTestUser()
