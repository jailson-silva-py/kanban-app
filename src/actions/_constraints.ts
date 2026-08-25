export const emailHtml = (code:string|number) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; max-width: 480px; width: 100%; padding: 40px; box-sizing: border-box;">
          <tr>
            <td>
              <p style="color: #52525b; font-size: 15px; line-height: 24px; margin: 0 0 16px 0;">
                Seu código de verificação é:
              </p>

              <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0;">
                <h1 style="color: #09090b; font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 0;">${code}</h1>
              </div>

              <p style="color: #71717a; font-size: 14px; line-height: 22px; margin: 0 0 12px 0;">
                Caso tenha problemas com esse código, tente gerar outro. Também vale verificar se esse é o código mais recente.
              </p>

              <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 32px 0;" />

              <p style="color: #a1a1aa; font-size: 13px; line-height: 20px; margin: 0;">
                Muito obrigado pela utilização dos nossos serviços.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`


export const textEmail = (code:number|string) => `
---------------Kaboom-----------------
Seu código de verificação é: ${code}, caso tenha problemas com esse código tente clicar em "Reenviar" para que outro seja gerado.
______________________________________
Muito obrigado por utilizar nossos serviços!
`
