export type EmailType = 'WELCOME' | 'CLASS_CONFIRMATION' | 'CLASS_REMINDER' | 'TEACHER_CLASS_CONFIRMED' | 'TEACHER_NEW_STUDENT' | 'PAYMENT_CONFIRMATION' | 'STUDENT_CLASS_CONFIRMED' | 'TEACHER_CLASS_RESCHEDULED' | 'STUDENT_CLASS_CANCELLED' | 'TEACHER_NEW_BOOKING' | 'STUDENT_BOOKING_REJECTED' | 'STUDENT_CLASS_RESCHEDULED' | 'STUDENT_BOOKING_REQUEST' | 'STUDENT_CLASS_DELETED';


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
          Clase Confirmada
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.teacherName}! La clase de tu alumno ${params.studentName} ha sido confirmada.
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

  if (type === 'STUDENT_CLASS_CONFIRMED') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          ¡Clase Confirmada! 🎸
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! Tu profesor ${params.teacherName} ha confirmado tu asistencia para la próxima clase.
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
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time} hs</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ir a mi Portal
        </a>
      </div>
    `);
  }

  if (type === 'STUDENT_CLASS_CANCELLED') {
    const isPendingAuth = params.status === 'PENDING_AUTHORIZATION';
    const headerColor = isPendingAuth ? '#f59e0b' : '#ef4444';
    const btnBg = isPendingAuth 
      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: ${headerColor}; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          ${isPendingAuth ? '⏳' : '✕'}
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          ${isPendingAuth ? 'Cancelación Pendiente de Autorización ⏳' : 'Clase Cancelada ✕'}
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! ${
            isPendingAuth 
              ? `Tu solicitud de cancelación para la clase con tu profesor <strong>${params.teacherName}</strong> está pendiente de autorización por parte del administrador, ya que fue realizada con menos de 24 horas de anticipación.`
              : `Tu clase con tu profesor <strong>${params.teacherName}</strong> ha sido cancelada.`
          }
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
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time} hs</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard" style="display: inline-block; background: ${btnBg}; background-color: ${headerColor}; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ir a mi Portal
        </a>
      </div>
    `);
  }

  if (type === 'STUDENT_CLASS_DELETED') {
    const headerColor = '#ef4444';
    const btnBg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: ${headerColor}; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          ✕
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Clase Eliminada ✕
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! Tu clase con tu profesor <strong>${params.teacherName}</strong> ha sido eliminada.
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
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time} hs</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard" style="display: inline-block; background: ${btnBg}; background-color: ${headerColor}; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ir a mi Portal
        </a>
      </div>
    `);
  }

  if (type === 'TEACHER_NEW_STUDENT') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #5b4fcf; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          👥
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          ¡Nuevo Alumno Inscrito! 🎉
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.teacherName}! Un nuevo estudiante se ha registrado en tu academia Khora a través de tu enlace de invitación.
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: #5b4fcf; margin-bottom: 20px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            DATOS DEL ALUMNO
          </div>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Nombre:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.studentName}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Email:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.email}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">WhatsApp:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.phone || 'No especificado'}</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard/alumnos" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ver Lista de Alumnos
        </a>
      </div>
    `);
  }

  if (type === 'PAYMENT_CONFIRMATION') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          ✓
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          ¡Pago Confirmado! 🎉
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! Hemos recibido el pago de tu clase o mensualidad correctamente.
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: #10b981; margin-bottom: 20px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            DETALLE DEL RECIBO
          </div>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Concepto:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.itemName}</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Monto pagado:</td>
              <td align="right" style="font-size: 16px; color: #10b981; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">$${Number(params.amount).toLocaleString("es-CL")} CLP</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Orden de Pago:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">#${params.paymentId}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Medio de Pago:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Mercado Pago</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); background-color: #10b981; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ir a mi Panel de Estudio
        </a>
      </div>
    `);
  }

  if (type === 'TEACHER_CLASS_RESCHEDULED') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #5b4fcf; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          🔄
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Clase Reagendada 🔄
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.teacherName}! Tu alumno <strong>${params.studentName}</strong> ha reagendado su clase.
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: #ff9f43; margin-bottom: 15px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            HORARIO ANTERIOR
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Fecha:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.originalDate}</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.originalTime} hs</td>
            </tr>
          </table>

          <div style="margin: 16px 0; border-top: 1px dashed #2d2d3d;"></div>

          <div style="font-size: 11px; font-weight: 800; color: #10b981; margin-bottom: 15px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            NUEVO HORARIO
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Fecha:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.newDate}</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.newTime} hs</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Modalidad:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: capitalize;">${params.modalidad}</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard/agenda" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ver mi Agenda
        </a>
      </div>
    `);
  }

  if (type === 'TEACHER_NEW_BOOKING') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #5b4fcf; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          🔔
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Nueva Solicitud de Reserva 🔔
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.teacherName}! Tu alumno <strong>${params.studentName}</strong> ha solicitado reservar un horario.
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
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time} hs</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Servicio:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.classType}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ingresa a tu agenda para confirmar o rechazar esta solicitud de reserva.
        </p>

        <a href="https://khora.cl/dashboard/agenda" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ver Agenda y Responder
        </a>
      </div>
    `);
  }

  if (type === 'STUDENT_BOOKING_REJECTED') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #ef4444; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          ✕
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Reserva no disponible ✕
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! Tu solicitud de reserva de clase con <strong>${params.teacherName}</strong> no ha podido ser confirmada en esta ocasión.
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
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Fecha solicitada:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.date}</td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora solicitada:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time} hs</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Por favor, intenta solicitar otro horario que se acomode a la disponibilidad de tu profesor ingresando a tu portal.
        </p>

        <a href="https://khora.cl/dashboard/agendar" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Reagendar Clase
        </a>
      </div>
    `);
  }

  if (type === 'STUDENT_CLASS_RESCHEDULED') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #5b4fcf; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          🔄
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Clase Reprogramada 🔄
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! Tu clase con tu profesor <strong>${params.teacherName}</strong> ha sido reprogramada con éxito.
        </p>
        
        <div style="background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: #10b981; margin-bottom: 15px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            NUEVOS DETALLES
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Profesor:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.teacherName}</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Fecha:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.date}</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time} hs</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 13px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Modalidad:</td>
              <td align="right" style="font-size: 13px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: capitalize;">${params.modalidad || 'online'}</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ir a mi Portal
        </a>
      </div>
    `);
  }

  if (type === 'STUDENT_BOOKING_REQUEST') {
    return getLayout(`
      <div style="padding: 0 40px 40px 40px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #5b4fcf; border-radius: 50%; font-size: 24px; color: #ffffff; display: inline-block; text-align: center; margin: 0 auto 24px auto; line-height: 60px;">
          ⏳
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
          Solicitud de Reserva Recibida ⏳
        </h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 32px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ¡Hola ${params.studentName}! Hemos recibido tu solicitud de reserva de clase con tu profesor <strong>${params.teacherName}</strong>. La clase quedará agendada una vez que tu profesor la confirme.
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
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hora:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.time} hs</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Servicio:</td>
              <td align="right" style="font-size: 14px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${params.classType}</td>
            </tr>
          </table>
        </div>
        
        <a href="https://khora.cl/dashboard" style="display: inline-block; background: linear-gradient(135deg, #5b4fcf 0%, #3d2fa8 100%); background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 100px; box-shadow: 0 4px 15px rgba(91, 79, 207, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Ir a mi Portal
        </a>
      </div>
    `);
  }

  return '';
}
