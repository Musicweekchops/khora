async function testMercadoPago() {
  const token = "APP_USR-5701696776662406-053118-31458b7c2388633408f9ff38904fa876-1523520508"
  console.log("Testeando credencial de Mercado Pago:", token.slice(0, 15) + "...")

  const payload = {
    items: [
      {
        id: "TRIAL",
        title: "Clase de Prueba de Batería (Musicweekchops)",
        quantity: 1,
        currency_id: "CLP",
        unit_price: 25000
      }
    ],
    back_urls: {
      success: "https://khora.cl/dashboard/clases?payment=success",
      failure: "https://khora.cl/dashboard/clases?payment=failure",
      pending: "https://khora.cl/dashboard/clases?payment=pending"
    },
    auto_return: "approved"
  }

  try {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    console.log("STATUS CODE:", res.status)
    console.log("RESPONSE DATA:", JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Error connecting to Mercado Pago:", err)
  }
}

testMercadoPago()
