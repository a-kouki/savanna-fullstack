import { NextRequest, NextResponse } from "next/server";
import { resetPasswordRateLimit, redis } from "@/app/utils/redis";
import { createClient } from "@/app/utils/supabase/server";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,15}$/;

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

    /*
    const isBlacklisted = await redis.get(`blacklist:${ip}`);
    if (isBlacklisted) {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    */

    const { newPassword, confirmPassword, honeypot } = await req.json();

    if (honeypot) {
        await redis.set(`blacklist:${ip}`, 'bot', { ex: 86400 });
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    // 3. Rate limiting
    const { success } = await resetPasswordRateLimit.limit(ip)
    if (!success) {
        return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })
    }

    // 4. Campos vazios
    if (!newPassword || !confirmPassword) {
        return NextResponse.json(
            { error: 'Preencha todos os campos.' },
            { status: 400 }
        );
    }

    // 5. Senhas diferentes
    if (newPassword !== confirmPassword) {
        return NextResponse.json(
            { error: 'As senhas estão diferentes.' },
            { status: 400 }
        );
    }

    // 6. Força da senha
    if (!passwordRegex.test(newPassword)) {
        return NextResponse.json(
            { error: 'A senha deve ter entre 8 e 15 caracteres, com letras maiúsculas, minúsculas e números.' },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    // 7. Verifica sessão ativa
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json(
            { error: 'Sessão inválida ou expirada. Atualize a página.' },
            { status: 401 }
        );
    }

    // 8. Atualiza senha
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        console.error('Erro ao atualizar senha:', error.message);
        return NextResponse.json(
            { error: 'Erro ao atualizar a senha. Tente novamente.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
}