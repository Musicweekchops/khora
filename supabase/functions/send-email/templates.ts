export type EmailType = 'WELCOME' | 'CLASS_CONFIRMATION' | 'CLASS_REMINDER' | 'TEACHER_CLASS_CONFIRMED';

interface TemplateParams {
  studentName: string;
  [key: string]: any;
}

export function getLayout(contentHtml: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Khora</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f0f13; padding: 40px 0; width: 100%;">
        <tr>
          <td align="center">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #1a1a24; border: 1px solid #2d2d3d; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.35);">
              <tr>
                <td>
                  <!-- HEADER -->
                  <div style="text-align: center; padding: 40px 0 20px 0;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Khora<span style="color: #5b4fcf;">.</span>
                    </h1>
                  </div>
                  
                  <!-- CONTENT -->
                  ${contentHtml}
                  
                  <!-- FOOTER -->
                  <div style="padding: 24px; text-align: center; background-color: #13131a; border-top: 1px solid #2d2d3d;">
                    <p style="font-size: 12px; color: #71717a; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      © 2026 Khora. Hecho con ♥ en Chile.
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getTemplate(type: EmailType, params: TemplateParams): string {
  if (type === 'WELCOME') {
    const teacherPhrase = params.teacherName 
      ? `<br>Felicidades por tomar clases con ${params.teacherName}` 
      : '';
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          ¡Bienvenido a KHORA! 🎵
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! Tu cuenta ha sido creada.${teacherPhrase}
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: #5b4fcf; margin-bottom: 20px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            TUS DATOS DE ACCESO
          </div>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Email:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.email}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Contraseña:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.tempPassword || 'Definida al registrarte'}</td>
            </tr>
          </table>
          
          <div style="margin: 16px 0; border-top: 1px dashed #2d2d3d;"></div>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Portal Web:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">https://khora.cl</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/login" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ingresar a mi Portal
        </a>
      </div>
    `);
  }

  if (type === 'CLASS_CONFIRMATION') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Confirmación de clases 🎵
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! ¿Todo OK para hoy?.
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Modalidad:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.modalidad || 'Presencial'}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Fecha:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.date}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time}</td>
            </tr>
          </table>
        </div>
        
        <a href="${params.link || 'https://khora.cl/dashboard'}" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Confirmar clase
        </a>
      </div>
    `);
  }

  if (type === 'CLASS_REMINDER') {
    const dayText = params.isToday ? "hoy" : "mañana";
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Clase Programada
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Te recordamos tu clase de ${dayText}.
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Profesor:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.teacherName}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Fecha:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.date}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time}</td>
            </tr>
          </table>
        </div>
        
        <a href="${params.link || 'https://khora.cl/dashboard'}" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Confirmar clase
        </a>
      </div>
    `);
  }

  if (type === 'TEACHER_CLASS_CONFIRMED') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          ¡Clase Confirmada! 🥁
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.teacherName}! Tu alumno ${params.studentName} ha confirmado su asistencia para la clase programada.
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Alumno:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.studentName}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Fecha:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.date}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time}</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard/agenda" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ver mi Agenda
        </a>
      </div>
    `);
  }

  return '';
}
