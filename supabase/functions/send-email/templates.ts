export type EmailType = 'CLASS_CONFIRMATION' | 'CLASS_REMINDER' | 'PAYMENT_REMINDER' | 'NEW_TASK';

interface TemplateParams {
  studentName: string;
  [key: string]: any;
}

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #0f0f13; font-family: 'Inter', sans-serif; color: #ffffff; }
  .wrapper { width: 100%; background-color: #0f0f13; padding: 40px 0; }
  .main { background-color: #1a1a24; margin: 0 auto; max-width: 600px; border-radius: 24px; border: 1px solid #2d2d3d; }
  .header { text-align: center; padding: 40px 0 20px 0; }
  .header h1 { margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; }
  .header span { color: #8b5cf6; }
  .content { padding: 0 40px 40px 40px; text-align: center; }
  .title { font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #ffffff; }
  .subtitle { font-size: 15px; color: #a1a1aa; margin-bottom: 32px; }
  .card { background-color: #13131a; border: 1px solid #2d2d3d; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: left; }
  .card-item { margin-bottom: 12px; font-size: 14px; color: #d4d4d8; display: flex; justify-content: space-between; }
  .card-item strong { color: #ffffff; }
  .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff !important; text-decoration: none; font-weight: 800; padding: 16px 32px; border-radius: 100px; }
  .footer { padding: 30px; text-align: center; background-color: #13131a; border-top: 1px solid #2d2d3d; }
  .footer-text { font-size: 12px; color: #71717a; margin: 0; }
`;

function getLayout(contentHtml: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div class="header"><h1>Khora<span>.</span></h1></div>
              ${contentHtml}
              <div class="footer">
                <p class="footer-text">© 2026 Khora Ltd. Todos los derechos reservados.</p>
              </div>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
}

export function getTemplate(type: EmailType, params: TemplateParams): string {
  if (type === 'CLASS_CONFIRMATION') {
    return getLayout(`
      <div class="content">
        <div class="title">Tu Clase Está Confirmada</div>
        <div class="subtitle">¡Hola ${params.studentName}! Tu clase de música está lista.</div>
        <div class="card">
          <div class="card-item"><span>Modalidad:</span> <strong>${params.modalidad || 'Online'}</strong></div>
          <div class="card-item"><span>Fecha:</span> <strong>${params.date}</strong></div>
          <div class="card-item" style="margin-bottom:0;"><span>Hora:</span> <strong>${params.time}</strong></div>
        </div>
        <a href="${params.link || '#'}" class="button">Ver Detalles</a>
      </div>
    `);
  }

  if (type === 'CLASS_REMINDER') {
    return getLayout(`
      <div class="content">
        <div class="title">¡Clase Mañana!</div>
        <div class="subtitle">¡Hola ${params.studentName}! Te recordamos que tienes una clase de música programada para mañana.</div>
        <div class="card">
          <div class="card-item"><span>Profesor:</span> <strong>${params.teacherName}</strong></div>
          <div class="card-item"><span>Fecha:</span> <strong>${params.date}</strong></div>
          <div class="card-item" style="margin-bottom:0;"><span>Hora:</span> <strong>${params.time}</strong></div>
        </div>
        <a href="${params.link || '#'}" class="button">Ver Mi Dashboard</a>
      </div>
    `);
  }
  
  if (type === 'PAYMENT_REMINDER') {
    return getLayout(`
      <div class="content">
        <div class="title">Recordatorio de Pago</div>
        <div class="subtitle">Hola ${params.studentName}, tu pago para las clases de música está próximo.</div>
        <div class="card">
          <div style="text-align:center; font-size:12px; color:#a1a1aa; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Monto a Pagar</div>
          <div style="text-align:center; font-size:36px; font-weight:900; color:#ffffff; margin-bottom:24px;">$${params.amount}</div>
          <div class="card-item"><span>Vencimiento:</span> <strong>${params.dueDate}</strong></div>
          <div class="card-item" style="margin-bottom:0; padding-top:12px; border-top:1px solid #2d2d3d;"><span>Servicio:</span> <strong>${params.service || 'Mensualidad'}</strong></div>
        </div>
        <a href="${params.paymentLink || '#'}" class="button">Pagar Ahora</a>
      </div>
    `);
  }

  if (type === 'NEW_TASK') {
    return getLayout(`
      <div class="content">
        <div class="title">Nueva Tarea Asignada</div>
        <div class="subtitle">¡Hola ${params.studentName}! Tienes una nueva tarea en tu plan de estudios.</div>
        <div class="card" style="border-left: 4px solid #8b5cf6;">
          <div style="font-size:18px; font-weight:800; color:#ffffff; margin-bottom:16px;">${params.taskTitle}</div>
          ${params.taskDescription ? `<div style="font-size:14px; color:#d4d4d8; margin-bottom:16px; line-height:1.5;">${params.taskDescription}</div>` : ''}
          <div class="card-item" style="margin-bottom:0;"><span>Fecha de asignación:</span> <strong>${params.assignedDate}</strong></div>
        </div>
        <a href="${params.link || '#'}" class="button">Ir a mi Dashboard</a>
      </div>
    `);
  }

  return '';
}
