import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export const LojaEBD = () => {
    const [visible, setVisible] = useState(false);
    const handleComprovante = () => window.open(`wa.me{encodeURIComponent("Olá Secretaria, segue o comprovante da minha revista.")}`);
    return (
        <div className="p-4 text-center">
            <Card title="Adquirir Revista do Trimestre">
                {/* ... (código da loja e botão PIX) ... */}
                 <Button label="Pagar com PIX" icon="pi pi-qrcode" onClick={() => setVisible(true)} />
                <Dialog header="Pagamento PIX" visible={visible} onHide={() => setVisible(false)} style={{ width: '350px' }}>
                    <div className="text-center">
                        <p>Escaneie o código abaixo ou use o Copia e Cola:</p>
                        <div className="bg-gray-200 p-4 mb-3"> [QR CODE AQUI] </div>
                        <Button label="Já paguei, enviar comprovante" severity="success" icon="pi pi-whatsapp" onClick={handleComprovante} />
                    </div>
                </Dialog>
            </Card>
        </div>
    );
};
