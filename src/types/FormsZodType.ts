import * as z from "zod"

export const usernameType = z.string().min(4, "Tem que ter mais de 4 caracteres!").max(24, "O máximo é de 24 caracteres!").regex(/^[a-zA-Z0-9À-ÿ\s._-]+$/, "É permitido apenas acentos e os caracteres '-', '_' e '.'")

export const passwordType = z.string().min(8, "A senha deve ter pelo menos 8 caracteres")
            .max(16, "A senha deve ter no máximo 16 caracteres")
            .regex(/[A-Z]/, "A senha deve ter pelo menos uma letra maiúscula")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "A senha tem que ter pelo menos um caractere especial.")

export const emailType = z.email("E-mail inválido")