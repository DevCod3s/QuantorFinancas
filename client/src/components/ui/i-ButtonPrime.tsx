import React from 'react';
import { cn } from "@/lib/utils";

/**
 * i-ButtonPrime
 * 
 * Componente de botão premium e minimalista.
 * Exibe apenas o ícone sem fundo (exceto no hover) e sem bordas.
 * 
 * @param icon - O ícone (Lucide) a ser renderizado
 * @param variant - 'blue' para ações positivas/salvar, 'red' para fechar/sair
 */
interface IButtonPrimeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    variant?: 'gold' | 'red';
}

export function IButtonPrime({
    icon,
    variant = 'gold',
    className,
    ...props
}: IButtonPrimeProps) {
    const variantClasses = {
        gold: "text-[#B59363] hover:bg-[#B59363]/10",
        red: "text-red-600 hover:bg-red-50/50"
    };

    return (
        <button
            className={cn(
                "bg-transparent !rounded-full transition-all duration-200 font-medium p-3 flex items-center justify-center hover:scale-110 active:scale-90",
                variantClasses[variant],
                className
            )}
            {...props}
        >
            <div className="flex items-center justify-center w-6 h-6">
                {icon}
            </div>
        </button>
    );
}
