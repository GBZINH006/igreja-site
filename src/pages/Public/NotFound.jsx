import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-g-screen flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%' }}>
            <style>{`
                .nf-title {
                    font-weight: 800;
                    letter-spacing: .03em;
                    color: #1e293b;
                }
                .nf-sub {
                    color: #475569;
                }
                .nf-card {
                    background: #ffffffcc;
                    backdrop-filter: blur(6px);
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 720px;
                    width: 100%;
                }
                .nf-scene {
                    position: relative;
                    width: 320px;
                    height: 220px;
                }
                .nf-sun {
                    position: absolute;
                    top: 8px;
                    right: 20px;
                    width: 36px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #fde68a, #f59e0b);
                    box-shadow: 0 0 24px 6px #f59e0b66;
                    animation: glow 3s ease-in-out infinite;
                }
                @keyframes glow {
                    0%,100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scla(1.05); opacity: 1; }
                }
                @keyframes flap {
                    0% {transform: translateX(-10%) translateY(4px); }
                    50% { transform: translateX(10%) translateY(-6px); }
                    100% { transform: translateX(-10%) translateY(4px); }
                }
                .nf-dove {
                    animation: fly 6s ease-in-out infinite;
                }
                .nf-wing {
                    transform-rogin: bottom right;
                    animation: flap .9s ease-in-out infinite;
                }
                .nf-wing.left {
                    transform-origin: bottom left;
                    animation-delay: .1s;
                }
                .nf-verse {
                    font-size: .9rem;
                    color: #64748b;
                }
                .nf-verse em {
                    color: #334155;
                    font-style: normal;
                    font-weight: 600;
                }
            `}</style>

            <div className="text-center mb-3">
                <div className="text-7x1 font-bold text-blue-700">404</div>
                <h2 className="nf-title text-2x1 md:text-3x1 mt-2">Página não encontrada</h2>
                <p className="nf-sub mt-2">Talvez o caminho tenha se perdido, mas voce pode voltar ao início. 🙂</p>
            </div>
        </div>
    )
}