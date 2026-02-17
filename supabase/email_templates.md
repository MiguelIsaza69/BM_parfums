# Plantillas de Correo para Supabase

Copia y pega este código en tu panel de Supabase:
**Authentication > Email Templates**

---

## 1. Confirmar Registro (Confirm Your Signup)

**Asunto:** Confirma tu cuenta - BM Parfums

```html
<div style="background-color: #000000; font-family: sans-serif; padding: 40px 20px; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333333; border-radius: 4px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #000000; padding: 30px; text-align: center; border-bottom: 1px solid #D4AF37;">
      <h1 style="color: #D4AF37; margin: 0; font-family: serif; letter-spacing: 2px;">BM PARFUMS</h1>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">Bienvenido a la Exclusividad</h2>
      <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
        Para completar tu registro y acceder a nuestra colección exclusiva, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón.
      </p>

      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #D4AF37; color: #000000; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; border-radius: 2px;">
        Confirmar Correo
      </a>

      <p style="margin-top: 30px; font-size: 12px; color: #666666;">
        Si no has creado una cuenta en BM Parfums, puedes ignorar este mensaje.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #333333;">
      <p style="color: #444444; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">BM Parfums &copy; 2026</p>
    </div>

  </div>
</div>
```

---

## 2. Restablecer Contraseña (Reset Password)

**Asunto:** Restablece tu contraseña - BM Parfums

```html
<div style="background-color: #000000; font-family: sans-serif; padding: 40px 20px; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333333; border-radius: 4px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #000000; padding: 30px; text-align: center; border-bottom: 1px solid #D4AF37;">
      <h1 style="color: #D4AF37; margin: 0; font-family: serif; letter-spacing: 2px;">BM PARFUMS</h1>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">Recuperación de Cuenta</h2>
      <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña.
      </p>

      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #D4AF37; color: #000000; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; border-radius: 2px;">
        Restablecer Contraseña
      </a>

      <p style="margin-top: 30px; font-size: 12px; color: #666666;">
        Si no solicitaste este cambio, tu cuenta está segura y no necesitas realizar ninguna acción.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #333333;">
      <p style="color: #444444; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">BM Parfums &copy; 2026</p>
    </div>

  </div>
</div>
```
